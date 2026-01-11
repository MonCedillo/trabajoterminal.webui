import motor.motor_asyncio
from bson.objectid import ObjectId

# Se realiza conexion local a MongoDB, esto se hace para simplificar codigo
MONGO_URL = "mongodb://localhost:27017"

# Conexion a la base de datos y coleccion
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.robot_system_db
collection = db.tests

# --- HELPERS ---
def document_to_dict(doc) -> dict:
    """Convierte el objeto crudo de Mongo a un diccionario limpio para el Frontend"""
    if not doc: return {}
    return {
        "id": str(doc["_id"]),
        "distance": doc.get("distance"),
        "target_cycles": doc.get("target_cycles"),
        "current_cycle": doc.get("current_cycle"),
        "status": doc.get("status"),
        "date_created": doc.get("date_created"),
        "start_time": doc.get("start_time"),
        "end_time": doc.get("end_time")
    }

# Funciones CRUD

async def create_new_test(test_data: dict) -> str:
    """Inserta una nueva prueba y devuelve su ID"""
    result = await collection.insert_one(test_data)
    return str(result.inserted_id)

async def update_test_status(test_id: str, updates: dict):
    """Actualiza campos específicos de una prueba"""
    if not test_id: return
    try:
        await collection.update_one(
            {"_id": ObjectId(test_id)},
            {"$set": updates}
        )
    except Exception as e:
        print(f"⚠️ Error actualizando DataBase: {e}")

async def get_all_tests():
    """Recupera todo el historial ordenado por fecha (el más nuevo prioritario)"""
    tests = []
    cursor = collection.find({}).sort("date_created", -1)
    async for document in cursor:
        tests.append(document_to_dict(document))
    return tests

async def cancel_all_active_tests():
    """
    Busca todas las pruebas que se quedaron en 'Running' y las marca como 'Interrupted'.
    Se usa al reiniciar el servidor para limpiar inconsistencias.
    """
    result = await collection.update_many(
        {"status": "Running"},
        {
            "$set": {
                "status": "Interrupted",
                "end_time": "Server Restart"
            }
        }
    )
    return result.modified_count