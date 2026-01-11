import asyncio
import random

# Esta función simula el comportamiento de la Raspberry Pi
async def run_hardware_simulation(sio):
    print("Simulación de Hardware Iniciada...")
    
    while True:
        # 1. Simular lectura de sensores (0 a 90 grados)
        left_arm_pos = random.randint(0, 90)
        right_arm_pos = random.randint(0, 90)
        
        # Simular contador de ciclos
        # (En la vida real, leerías esto de una variable global o sensor)
        cycle_count = random.randint(0, 50000)

        # 2. Empaquetar los datos
        data = {
            "leftArmPosition": left_arm_pos,
            "rightArmPosition": right_arm_pos,
            "cycleCount": cycle_count,
            "status": "Running" # Podrías cambiar esto dinámicamente
        }

        # 3. Enviar datos a la UI a través del socket
        # El evento se llama 'telemetry_data'
        await sio.emit('telemetry_data', data)

        # 4. Esperar 100ms antes de la siguiente lectura (10Hz)
        await asyncio.sleep(0.1)