import time
import asyncio
import socketio
from dataclasses import dataclass


# Importamos librerías de RPi, revisar su funcionamiento
try:
    from smbus2 import SMBus
    import RPi.GPIO as GPIO
    import lgpio
except ImportError:
    print("⚠️ Librerías de RPi no encontradas. El código fallará al ejecutar.")

# ================= CONSTANTES =================
X_STEP, X_DIR = 17, 27
Y_STEP, Y_DIR = 22, 23
Z_STEP, Z_DIR = 24, 25
EN_PIN = 5
SERVO1, SERVO2 = 18, 19
STEPS_PER_MM = 100
DIST_ZA_MM = 30.0
DIR_XY_IDA, DIR_Z_IDA = 0, 1
AS5600_ADDR, MUX_ADDR = 0x36, 0x70

# ================= ESTADO GLOBAL DEL ROBOT =================
@dataclass
class RobotState:
    running: bool = False
    paused: bool = False
    stop_requested: bool = False
    current_cycle: int = 0

# Instancia global que el servidor podrá modificar
global_robot_state = RobotState()

# ================= CLASES DE HARDWARE =================
class ServoSystem:
    def __init__(self):
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup([SERVO1, SERVO2], GPIO.OUT)
        self.p1 = GPIO.PWM(SERVO1, 50)
        self.p2 = GPIO.PWM(SERVO2, 50)
        self.p1.start(0); self.p2.start(0)
        self.bus = SMBus(1)

    def close(self):
        self.p1.stop(); self.p2.stop(); self.bus.close(); GPIO.cleanup()

    def read_angle(self, ch):
        try:
            self.bus.write_byte(MUX_ADDR, 1 << ch)
            d = self.bus.read_i2c_block_data(AS5600_ADDR, 0x0C, 2)
            return ((d[0] << 8) | d[1]) * 360.0 / 4096.0
        except: return 0.0

    def move(self, angle):
        d = 2.5 + (angle / 180.0) * 9.5
        self.p1.ChangeDutyCycle(d); self.p2.ChangeDutyCycle(d)

class StepperSystem:
    def __init__(self):
        self.h = lgpio.gpiochip_open(0)
        for p in [X_STEP, X_DIR, Y_STEP, Y_DIR, Z_STEP, Z_DIR, EN_PIN]:
            lgpio.gpio_claim_output(self.h, p)
        self.disable()
        self.pos = {"x": 0, "z": 0}

    def close(self): self.disable(); lgpio.gpiochip_close(self.h)
    def enable(self): lgpio.gpio_write(self.h, EN_PIN, 0)
    def disable(self): lgpio.gpio_write(self.h, EN_PIN, 1)

    async def move_axis(self, axis, pin, dpin, steps, d, delay=2500):
        lgpio.gpio_write(self.h, dpin, 1 if d else 0)
        sign = 1 if d else -1
        for _ in range(steps):
            lgpio.gpio_write(self.h, pin, 1)
            time.sleep(80/1e6)
            lgpio.gpio_write(self.h, pin, 0)
            self.pos[axis] += sign
            await asyncio.sleep((delay-80)/1e6) # Async sleep para permitir interrupciones

    async def return_origin(self):
        if self.pos["z"] != 0:
            await self.move_axis("z", Z_STEP, Z_DIR, abs(self.pos["z"]), 0 if self.pos["z"]>0 else 1)
        if self.pos["x"] != 0:
            await self.move_axis("x", X_STEP, X_DIR, abs(self.pos["x"]), 0 if self.pos["x"]>0 else 1)
        self.pos = {"x":0, "z":0}

async def perform_reset(sio):
    state = global_robot_state

    if state.running:
        state.stop_requested = True
        await asyncio.sleep(1.0)
    
    state.running = False
    state.paused = False
    state.stop_requested = False
    state.current_cycle = 0
    
    try:
        print("🔄 Ejecutando secuencia de RESET...")
        servos = ServoSystem()
        
        # Mover Servos a 0° (Posición segura)
        servos.move(0)
        await asyncio.sleep(0.5)
        
        # Leer sensores para confirmar
        a1 = servos.read_angle(0)
        a2 = servos.read_angle(1)
        
        servos.close()
        
        print("✅ Reset completado: Contadores a 0 y Servos a 0°")

        await sio.emit('telemetry_data', {
            'cycleCount': 0,
            'status': 'Ready',
            'leftArmPosition': a1,
            'rightArmPosition': a2
        })
        
        await sio.emit('status_update', {'status': 'Ready'})

    except Exception as e:
        print(f"⚠️ Error durante reset: {e}")

async def position_mechanics(sio, dist_mm):

    state = global_robot_state
    steppers = StepperSystem()
    
    try:
        print(f"⚙️ Iniciando mecánica para {dist_mm}mm ...")
        state.running = True # Bloqueamos el sistema
        
        # CÁLCULOS (Tu lógica original)
        dist_xy = dist_mm / 2.0
        pasos_x = int(round(dist_xy * STEPS_PER_MM))
        pasos_z = int(round(DIST_ZA_MM * STEPS_PER_MM))
        
        steppers.enable()
        
        await sio.emit('status_update', {'status': 'Positioning X/Y'})
        await steppers.move_axis("x", X_STEP, X_DIR, pasos_x, 0)
        
        # Mover Z (Bajar hacia la llave)
        await sio.emit('status_update', {'status': 'Positioning Z'})
        await steppers.move_axis("z", Z_STEP, Z_DIR, pasos_z, 1)
        
        steppers.disable()
        
        print(f"✅ Posicionamiento listo. Esperando operario.")
        await sio.emit('status_update', {'status': 'ReadyForKeys'})

    except Exception as e:
        print(f"⚠️ Error posicionando: {e}")
        await sio.emit('status_update', {'status': 'Error'})
    finally:
        state.running = False
        steppers.close()

async def run_robot_logic(sio, dist_mm, ciclos_obj):
    servos = ServoSystem()
    steppers = StepperSystem()
    state = global_robot_state
    
    state.running = True
    state.current_cycle = 0
    state.stop_requested = False

    try:
        print(f"🚀 Iniciando Robot: {ciclos_obj} ciclos, {dist_mm}mm")
        
        # Inicia posicionamiento
        steppers.enable()
        pasos_x = int(round((dist_mm/2)*STEPS_PER_MM))
        pasos_z = int(round(DIST_ZA_MM*STEPS_PER_MM))
        
        # Movemos X y Z (Esperamos a que termine)
        await steppers.move_axis("x", X_STEP, X_DIR, pasos_x, 0)
        await steppers.move_axis("z", Z_STEP, Z_DIR, pasos_z, 1)
        steppers.disable()

        # Bucle
        while state.current_cycle < ciclos_obj:
            
            # --- CHEQUEO DE PAUSA/STOP ---
            if state.stop_requested: break
            
            while state.paused:
                await sio.emit('status_update', {'status': 'Paused'})
                await asyncio.sleep(0.5)
                if state.stop_requested: break
            # -----------------------------

            if state.stop_requested: break

            # Mueve Servos 90°
            servos.move(90)
            await asyncio.sleep(0.5)

            # Mueve Servos 0°
            servos.move(0)
            await asyncio.sleep(0.5)

            # Actualiza Contador
            state.current_cycle += 1
            
            # Lee angulos reales para graficacion
            a1 = servos.read_angle(0)
            a2 = servos.read_angle(1)

            # ENVIAR A WEB (Contador + Gráficas)
            await sio.emit('telemetry_data', {
                'cycleCount': state.current_cycle,
                'status': 'Running',
                'leftArmPosition': a1,
                'rightArmPosition': a2
            })
            print(f"Ciclo {state.current_cycle}/{ciclos_obj}")

        # Finaliza
        steppers.enable()
        await steppers.return_origin()
        steppers.disable()
        
        status = "Stopped" if state.stop_requested else "Completed"
        await sio.emit('status_update', {'status': status})
        print(f"Fin del proceso: {status}")

    except Exception as e:
        print(f"Error crítico: {e}")
    finally:
        state.running = False
        servos.close()
        steppers.close()