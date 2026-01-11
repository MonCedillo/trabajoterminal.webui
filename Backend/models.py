from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

def get_now_str() -> str:
    """Devuelve la fecha y hora actual en formato string"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Creacion del esquema de prueba a guardar en la base de datos
class TestRecord(BaseModel):
    """
    Estructura de la ficha de la prueba a guardar en MongoDB.
    """
    id: Optional[str] = Field(None, alias="_id")
    
    # Configuración de la prueba
    distance: float
    target_cycles: int
    
    # Estado del sistema
    current_cycle: int = 0
    status: str = "Initialized"  # Estados: Running, Paused, Stopped, Completed
    
    # Tiempos
    date_created: str = Field(default_factory=get_now_str)
    start_time: Optional[str] = None
    end_time: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "distance": 20,
                "target_cycles": 50000,
                "status": "Running"
            }
        }