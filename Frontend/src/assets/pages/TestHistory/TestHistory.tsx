import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TestHistory.module.scss';

// Interfaz exacta (Coincide con database.py)
interface TestRecord {
  id: string;
  date_created: string; 
  start_time: string;
  end_time?: string;
  distance: number;
  current_cycle: number;
  target_cycles: number;
  status: string;
}

const TestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:5000/history');
        const data = await response.json();
        
        // --- AQUÍ ESTÁ EL CAMBIO MÁGICO ---
        // Invertimos el array para que los más recientes queden primero
        const sortedData = data.reverse(); 
        setHistoryData(sortedData);
        // ----------------------------------

      } catch (error) {
        console.error("❌ Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className={styles.historyContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historial de Pruebas</h1>
      </header>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Cargando datos...</p>
          </div>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Distancia</th>
                <th>Progreso (Ciclos)</th>
                <th>Estado</th>
                <th>Hora Fin</th>
              </tr>
            </thead>
            <tbody>
              {historyData.length > 0 ? (
                historyData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date_created}</td>
                    <td>{row.start_time}</td>
                    {/* Visualizamos en metros */}
                    <td>{(row.distance / 1000).toFixed(2)} m</td>
                    <td style={{ fontWeight: 'bold' }}>
                        {row.current_cycle.toLocaleString()} / {row.target_cycles.toLocaleString()}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[row.status.toLowerCase()]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.end_time || '--:--'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>
                    No hay registros en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.goBackButton} onClick={() => navigate('/')}>
          Volver al Menú
        </button>
      </div>
    </div>
  );
};

export default TestHistory;