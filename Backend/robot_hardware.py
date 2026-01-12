import asyncio
from gpiozero import AngularServo
from gpiozero.pins.lgpio import LGPIOFactory

# Configuración para Raspberry Pi 5
factory = LGPIOFactory()

# --- CONFIGURACIÓN DE PINES ---
# Usamos GPIO 17 y 18 para los dos motores
PIN_SERVO_1 = 18    # Se utiliza GPIO18 (Pin físico 12) para el brazo derecho
PIN_SERVO_2 = 17    # Se utiliza GPIO17 (Pin físico 11) para el brazo izquierdo

# Configuración física de los MG996R
# El rango físico del motor va de 0-180 grados para la calibración de pulsos
servo_config = {
    "min_angle": 0,
    "max_angle": 180,
    "min_pulse_width": 0.0005,
    "max_pulse_width": 0.0025,
    "pin_factory": factory
}

# Inicializacion de los servomotores
servo1 = AngularServo(PIN_SERVO_1, **servo_config)
servo2 = AngularServo(PIN_SERVO_2, **servo_config)

async def run_physical_cycle(test_id, target_cycles, socket_manager, update_db_callback):
    """
    Ciclo operativo: 0° -> 90° -> 0°
    Ciclos objetivo: 50,000 ciclos.
    """
    print(f"🤖 ROBOT: Iniciando prueba {test_id} (0°-90°) para grifo duomando")
    
    current_cycle = 0
    
    try:
        # 1. Posición Inicial (CASA - 0 Grados)
        servo1.angle = 0
        servo2.angle = 0
        
        # Se envia el dato inicial para la graficación, en este caso 0 grados
        await socket_manager.emit('telemetry_data', {'angle': 0, 'test_id': test_id})
        await asyncio.sleep(1) # Tiempo para alinearse al inicio antes de comenzar

        while current_cycle < target_cycles:
            # --- MOVIMIENTO 1: MOVER A 90 GRADOS ---
            servo1.angle = 90
            servo2.angle = 90
            
            # Envia dato para graficar el movimiento a 90 grados de acuerdo con la programacion del ciclo
            await socket_manager.emit('telemetry_data', {'angle': 90})
            
            # Se espera a que el motor llegue físicamente y se da un margen de seguridad en forma de un retardo
            await asyncio.sleep(1) 
            
            # --- MOVIMIENTO 2: VOLVER A 0 GRADOS ---
            servo1.angle = 0
            servo2.angle = 0
            
            # Envia dato para graficar el movimiento de regreso a 0 grados de acuerdo con la programacion del ciclo
            await socket_manager.emit('telemetry_data', {'angle': 0})
            
            await asyncio.sleep(1)
            
            # --- FINAL: FIN DE CICLO, INCREMENTAR CURRENT CYCLE ---
            current_cycle += 1
            
            # Enviamos el contador actualizado (+1 ciclo)
            await socket_manager.emit('telemetry_data', {
                'cycleCount': current_cycle,
                'status': 'Running',
                'test_id': test_id
            })

            # Guardado periódico en DB (cada 50 ciclos para optimizar)
            if current_cycle % 50 == 0:
                await update_db_callback(test_id, {"current_cycle": current_cycle})
        
        print("✅ ROBOT: 50,000 Ciclos completados.")
        
    except asyncio.CancelledError:
        print("🛑 ROBOT: Detenido manualmente.")
        servo1.detach()
        servo2.detach()
        raise
        
    except Exception as e:
        print(f"❌ ERROR HARDWARE: {e}")
    
    finally:
        # Apagar motores y guardar estado final
        servo1.angle = 0
        servo2.angle = 0
        await asyncio.sleep(0.5)
        servo1.detach()
        servo2.detach()
        
        status = 'Completed' if current_cycle >= target_cycles else 'Stopped'
        await update_db_callback(test_id, {
            "current_cycle": current_cycle,
            "status": status
        })
        await socket_manager.emit('status_update', {'status': status})