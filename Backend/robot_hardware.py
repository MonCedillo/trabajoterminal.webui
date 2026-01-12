import asyncio
from gpiozero import AngularServo
from gpiozero.pins.lgpio import LGPIOFactory

# Configuración para Raspberry Pi 5
factory = LGPIOFactory()

# --- CONFIGURACIÓN DE PINES ---
PIN_SERVO_1 = 18
PIN_SERVO_2 = 17

servo_config = {
    "min_angle": 0,
    "max_angle": 180,
    "min_pulse_width": 0.0005,
    "max_pulse_width": 0.0025,
    "pin_factory": factory
}

servo1 = AngularServo(PIN_SERVO_1, **servo_config)
servo2 = AngularServo(PIN_SERVO_2, **servo_config)

# AÑADIMOS EL PARAMETRO pause_event
async def run_physical_cycle(test_id, target_cycles, socket_manager, update_db_callback, pause_event):
    """
    Ciclo operativo con capacidad de PAUSA.
    """
    print(f"🤖 ROBOT: Iniciando prueba {test_id} (0°-90°)")
    
    current_cycle = 0
    
    try:
        # 1. Posición Inicial (CASA)
        servo1.angle = 0
        servo2.angle = 0
        await socket_manager.emit('telemetry_data', {'angle': 0, 'test_id': test_id})
        await asyncio.sleep(1)

        while current_cycle < target_cycles:
            # --- PUNTO DE CONTROL DE PAUSA ---
            # Si pause_event está clear(), el código se detiene aquí hasta que sea set()
            if not pause_event.is_set():
                print("⏸️ ROBOT: Pausado, esperando reanudación...")
                await socket_manager.emit('status_update', {'status': 'Paused'})
                await pause_event.wait() # AQUI SE QUEDA CONGELADO HASTA EL RESUME
                print("▶️ ROBOT: Reanudando...")
                await socket_manager.emit('status_update', {'status': 'Running'})

            # --- MOVIMIENTO 1: 90 GRADOS ---
            servo1.angle = 90
            servo2.angle = 90
            await socket_manager.emit('telemetry_data', {'angle': 90})
            await asyncio.sleep(1) 
            
            # --- MOVIMIENTO 2: 0 GRADOS ---
            servo1.angle = 0
            servo2.angle = 0
            await socket_manager.emit('telemetry_data', {'angle': 0})
            await asyncio.sleep(1)
            
            # --- FINAL DE CICLO ---
            current_cycle += 1
            
            await socket_manager.emit('telemetry_data', {
                'cycleCount': current_cycle,
                'status': 'Running',
                'test_id': test_id
            })

            if current_cycle % 50 == 0:
                await update_db_callback(test_id, {"current_cycle": current_cycle})
        
        print("✅ ROBOT: Ciclos completados.")
        
    except asyncio.CancelledError:
        print("🛑 ROBOT: Detenido/Reiniciado manualmente.")
        # No ponemos raise aquí para permitir que el finally limpie todo tranquilamente
        
    except Exception as e:
        print(f"❌ ERROR HARDWARE: {e}")
    
    finally:
        # Asegurar que vuelve a 0 y se apaga
        servo1.angle = 0
        servo2.angle = 0
        await asyncio.sleep(0.5)
        servo1.detach()
        servo2.detach()
        
        # Solo actualizamos a 'Completed' si realmente acabó, si fue cancelado se maneja fuera
        if current_cycle >= target_cycles:
            await update_db_callback(test_id, {
                "current_cycle": current_cycle,
                "status": "Completed"
            })
            await socket_manager.emit('status_update', {'status': 'Completed'})
