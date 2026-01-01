import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

# Importamos nuestro simulador
from simulation import run_hardware_simulation

# 1. Configuración de Socket.IO (Gestor de Tiempo Real)
# cors_allowed_origins='*' permite que React se conecte sin problemas
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# 2. Configuración de FastAPI (Servidor Web)
app = FastAPI()

# Configurar CORS en FastAPI también (Doble seguridad)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Unir Socket.IO con FastAPI
socket_app = socketio.ASGIApp(sio, app)

# --- EVENTOS DEL SOCKET ---

@sio.event
async def connect(sid, environ):
    print(f"✅ Cliente conectado: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Cliente desconectado: {sid}")

# Evento para recibir comandos desde la UI (Botones)
@sio.event
async def send_command(sid, command):
    print(f"📥 Comando recibido desde UI: {command}")
    # AQUI AGREGAREMOS LA LÓGICA PARA DETENER/INICIAR EL ROBOT REAL
    # Por ahora solo lo reenviamos a todos para confirmar
    await sio.emit('command_received', command)

# --- INICIO DEL SERVIDOR ---

# Este evento se dispara cuando el servidor arranca
@app.on_event("startup")
async def startup_event():
    # Iniciamos la simulación en segundo plano
    # Cuando tengas la RPi real, aquí iniciarás el loop de lectura real
    asyncio.create_task(run_hardware_simulation(sio))

if __name__ == '__main__':
    # Ejecutar uvicorn en el puerto 5000
    uvicorn.run("server:socket_app", host="0.0.0.0", port=5000, reload=True)