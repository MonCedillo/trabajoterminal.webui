import asyncio
import uvicorn
import socketio

from fastapi import FastAPI
from datetime import datetime
from robot_hardware import run_physical_cycle
from fastapi.middleware.cors import CORSMiddleware


from database import create_new_test, update_test_status, get_all_tests, cancel_all_active_tests

# --- CONFIGURACIÓN DEL SERVIDOR ---

# Creacion de servidor Socket.IO (Async)
cors_allowed_origins='*' #permite que cualquier IP se conecte
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Creacion de aplicación FastAPI (REST + Socket)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_cleanup():
    print("🧹 Ejecutando protocolo de limpieza de base de datos...")
    count = await cancel_all_active_tests()
    if count > 0:
        print(f"⚠️ Se encontraron {count} pruebas 'Zombies' y fueron marcadas como Interrumpidas.")
    else:
        print("✅ Base de datos limpia. No hay pruebas pendientes.")

    # Aseguramos que la memoria RAM empiece vacía
    global current_test_id, active_test_config
    current_test_id = None
    active_test_config = None


# Montar Socket.IO sobre FastAPI
socket_app = socketio.ASGIApp(sio, app)

# --- ESTADO GLOBAL (MEMORIA RAM) ---
# current_test_id: Guarda el ID de Mongo de la prueba actual
# active_test_config: Guarda los detalles (distancia, hora) para recuperarlos si se refresca la pagina
current_test_id = None
active_test_config = None
robot_task = None

# --- EVENTOS DE CONEXIÓN ---

@sio.event
async def connect(sid, environ):
    print(f"✅ Cliente conectado: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Cliente desconectado: {sid}")

# --- LÓGICA DE CONTROL DE PRUEBAS ---

@sio.event
async def start_test_request(sid, data):
    """
    Inicia una nueva prueba.
    Data esperada: { 'distance': 150, 'cycles': 50000 }
    """
    global current_test_id, active_test_config, robot_task
    print(f"📩 Solicitud de INICIO recibida: {data}")

    # Si ya hay una prueba corriendo, se hace un cierre forzado antes
    if current_test_id:
        print(f"⚠️ Cerrando prueba anterior inconclusa ({current_test_id})...")
        await update_test_status(current_test_id, {
            "status": "Cancelled",
            "end_time": datetime.now().strftime("%H:%M:%S")
        })
    
    # Preparacion de datos para la nueva prueba
    now_date = datetime.now().strftime("%Y-%m-%d")   
    now_time = datetime.now().strftime("%H:%M:%S")   
    
    new_record = {
        "distance": float(data.get("distance", 0)),
        "target_cycles": int(data.get("cycles", 0)),
        "current_cycle": 0,
        "status": "Running",
        "date_created": now_date,
        "start_time": now_time
    }

    # Guardar la nueva prueba en la base de datos
    try:
        current_test_id = await create_new_test(new_record)
        print(f"💾 Nueva prueba guardada en DB. ID: {current_test_id}")
    except Exception as e:
        print(f"❌ Error guardando en DB: {e}")
        return # Salimos si falla la base de datos, no se inicia la prueba

    # Actualizacion de la memoria RAM (Para persistencia de estado)
    active_test_config = {
        'test_id': current_test_id,
        'distance': new_record['distance'],
        'target_cycles': new_record['target_cycles'],
        'start_time': new_record['start_time'],
        'date_created': new_record['date_created'],
        'status': 'Running'
    }

    # Envio de los datos completos para que la UI los muestre al usuario
    await sio.emit('test_started_confirmation', active_test_config)
    
    # --- INICIAR EL PROCESO FÍSICO EN SEGUNDO PLANO ---
    print("🤖 Iniciando proceso físico del robot...")
    # Cancelar tarea anterior si existiera por error
    if robot_task and not robot_task.done():
        robot_task.cancel()

    # Lanzar el proceso en segundo plano sin bloquear el servidor
    robot_task = asyncio.create_task(
        run_physical_cycle(
            test_id=current_test_id, 
            target_cycles=new_record['target_cycles'], 
            socket_manager=sio, 
            update_db_callback=update_test_status
        )
    )


@sio.event
async def stop_test_request(sid, data):
    """
    Detiene la prueba actual.
    """
    global current_test_id, active_test_config
    print("🛑 Solicitud de STOP recibida")
    
    # --- DETENER EL PROCESO FÍSICO --- 
    if robot_task and not robot_task.done():
        robot_task.cancel()
        try:
            await robot_task
        except asyncio.CancelledError:
            print("Robot detenido correctamente.")

    if current_test_id:
        # Actualizacion de la base de datos con hora de fin
        await update_test_status(current_test_id, {
            "status": "Stopped",
            "end_time": datetime.now().strftime("%H:%M:%S")
        })
        print(f"💾 Prueba {current_test_id} finalizada en DB.")
    
    # Limpiar Memoria RAM
    active_test_config = None
    current_test_id = None
    
    # Confirmar al Frontend el nuevo estado de la prueba
    await sio.emit('test_stopped_confirmation', {'status': 'Stopped'})
    
    # AQUI DETENDREMOS EL ROBOT FÍSICO (Próximamente)
    # await robot_controller.emergency_stop()


@sio.event
async def check_current_status(sid):
    """
    El Frontend pregunta: '¿Hay algo corriendo?' al cargar la página.
    """
    global active_test_config
    print(f"🧐 Cliente {sid} verificando estado...")
    
    if active_test_config:
        # SI: Se envia lo que ya esta guardado en memoria
        await sio.emit('current_status_response', {
            'active': True,
            'data': active_test_config
        })
    else:
        # NO: Le decimos que está libre
        await sio.emit('current_status_response', {
            'active': False
        })

# --- API REST (HISTORIAL) ---

@app.get("/history")
async def get_history_endpoint():
    """Ruta para obtener el historial completo en JSON"""
    return await get_all_tests()

# --- ARRANQUE DEL SERVIDOR ---

if __name__ == "__main__":
    # host="0.0.0.0" hace visible el servidor en toda tu red local
    print("🚀 Servidor Robot Backend Iniciando en puerto 5000...")
    uvicorn.run("server:socket_app", host="0.0.0.0", port=5000, reload=True)