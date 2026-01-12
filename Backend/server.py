import asyncio
import uvicorn
import socketio
from fastapi import FastAPI
from datetime import datetime
from robot_hardware import run_physical_cycle # Asegúrate de que importas la versión nueva
from fastapi.middleware.cors import CORSMiddleware
from database import create_new_test, update_test_status, get_all_tests, cancel_all_active_tests

# --- CONFIGURACIÓN ---
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_app = socketio.ASGIApp(sio, app)

# --- ESTADO GLOBAL ---
current_test_id = None
active_test_config = None
robot_task = None
# NUEVO: Evento de control de pausa
robot_pause_event = asyncio.Event() 

# --- STARTUP ---
@app.on_event("startup")
async def startup_db_cleanup():
    print("🧹 Ejecutando protocolo de limpieza de base de datos...")
    # Aquí busca cualquier prueba que haya quedado como "Running"
    count = await cancel_all_active_tests() 
    
    if count > 0:
        # Aquí confirma que encontró "Zombies" y las limpió
        print(f"⚠️ Se encontraron {count} pruebas 'Zombies' y fueron marcadas como Interrumpidas.")
    else:
        print("✅ Base de datos limpia. No hay pruebas pendientes.")
# --- EVENTOS ---
@sio.event
async def connect(sid, environ):
    print(f"✅ Cliente conectado: {sid}")

# --- START (MODIFICADO) ---
@sio.event
async def start_test_request(sid, data):
    global current_test_id, active_test_config, robot_task, robot_pause_event
    print(f"📩 INICIO recibido: {data}")

    if current_test_id:
        await update_test_status(current_test_id, {"status": "Cancelled", "end_time": datetime.now().strftime("%H:%M:%S")})
    
    # 1. Resetear el evento de pausa a True (corriendo) por si se quedó pausado antes
    robot_pause_event.set() 

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

    try:
        current_test_id = await create_new_test(new_record)
    except Exception:
        return

    active_test_config = {
        'test_id': current_test_id,
        'distance': new_record['distance'],
        'target_cycles': new_record['target_cycles'],
        'start_time': new_record['start_time'],
        'date_created': new_record['date_created'],
        'status': 'Running'
    }

    await sio.emit('test_started_confirmation', active_test_config)
    
    if robot_task and not robot_task.done():
        robot_task.cancel()

    # PASAMOS EL EVENTO DE PAUSA AQUI vvv
    robot_task = asyncio.create_task(
        run_physical_cycle(
            test_id=current_test_id, 
            target_cycles=new_record['target_cycles'], 
            socket_manager=sio, 
            update_db_callback=update_test_status,
            pause_event=robot_pause_event 
        )
    )

# --- NUEVO: PAUSE ---
@sio.event
async def pause_test_request(sid):
    global current_test_id
    if robot_task and not robot_task.done() and current_test_id:
        print("⏸️ Solicitud de PAUSA recibida")
        robot_pause_event.clear() # Esto pone el semáforo en ROJO
        
        # Actualizamos DB para persistencia
        await update_test_status(current_test_id, {"status": "Paused"})
        # Notificamos UI (Aunque el hardware también lo hace, es bueno confirmar)
        await sio.emit('status_update', {'status': 'Paused'})

# --- NUEVO: RESUME ---
@sio.event
async def resume_test_request(sid):
    global current_test_id
    # Solo reanudamos si estaba pausado (flag en false)
    if not robot_pause_event.is_set() and current_test_id:
        print("▶️ Solicitud de RESUME recibida")
        robot_pause_event.set() # Esto pone el semáforo en VERDE
        
        await update_test_status(current_test_id, {"status": "Running"})
        await sio.emit('status_update', {'status': 'Running'})

# --- NUEVO: RESTART ---
@sio.event
async def restart_test_request(sid):
    """
    Reinicia la prueba actual:
    1. Detiene la actual.
    2. Crea una NUEVA entrada en DB con la misma configuración (distancia/ciclos).
    3. Pone contadores a 0 y hora nueva.
    """
    global current_test_id, active_test_config, robot_task
    print("🔄 Solicitud de RESTART recibida")
    
    if not active_test_config:
        print("❌ No hay configuración activa para reiniciar.")
        return

    # 1. Guardar la configuración vieja antes de matar todo
    prev_distance = active_test_config['distance']
    prev_cycles = active_test_config['target_cycles']

    # 2. Detener proceso físico actual
    if robot_task and not robot_task.done():
        robot_task.cancel()
        try:
            await robot_task
        except asyncio.CancelledError:
            pass # Esperamos a que termine de limpiarse
    
    # 3. Marcar la prueba vieja como 'Restarted' o 'Cancelled' en DB
    if current_test_id:
        await update_test_status(current_test_id, {
            "status": "Cancelled", 
            "end_time": datetime.now().strftime("%H:%M:%S")
        })

    # 4. Llamar internamente a la lógica de Start con los datos guardados
    # Simulamos que vino del cliente { 'distance': ..., 'cycles': ... }
    restart_data = {
        'distance': prev_distance,
        'cycles': prev_cycles
    }
    
    # Llamamos a la función start_test_request directamente
    await start_test_request(sid, restart_data)


# --- STOP (IGUAL QUE ANTES) ---
@sio.event
async def stop_test_request(sid, data):
    global current_test_id, active_test_config, robot_task
    print("🛑 Solicitud de STOP")
    
    robot_pause_event.set() # Importante: Desbloquear por si estaba pausado para que pueda cancelarse bien
    
    if robot_task and not robot_task.done():
        robot_task.cancel()
        try:
            await robot_task
        except asyncio.CancelledError:
            pass

    if current_test_id:
        await update_test_status(current_test_id, {
            "status": "Stopped",
            "end_time": datetime.now().strftime("%H:%M:%S")
        })
    
    active_test_config = None
    current_test_id = None
    await sio.emit('test_stopped_confirmation', {'status': 'Stopped'})

@sio.event
async def check_current_status(sid):
    # Logica existente...
    global active_test_config
    if active_test_config:
        # Añadimos el estado de pausa actual a la respuesta
        is_paused = not robot_pause_event.is_set()
        status_str = "Paused" if is_paused else active_test_config.get('status', 'Running')
        
        # Actualizamos el diccionario temporalmente para enviarlo
        response_data = active_test_config.copy()
        response_data['status'] = status_str
        
        await sio.emit('current_status_response', {'active': True, 'data': response_data})
    else:
        await sio.emit('current_status_response', {'active': False})

@app.get("/history")
async def get_history_endpoint():
    return await get_all_tests()

if __name__ == "__main__":
    uvicorn.run("server:socket_app", host="0.0.0.0", port=5000, reload=True)
