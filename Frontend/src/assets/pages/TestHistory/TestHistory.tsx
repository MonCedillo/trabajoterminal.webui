import React from 'react';
import { useEffect, useState } from 'react';
import styles from './TestHistory.module.scss';
import { useNavigate } from 'react-router-dom';

interface TestRecord {
  id: string; // MongoDB devuelve IDs como strings, creo, hay q revisar
  date: string;
  distance: string;
  startTime: string;
  endTime: string;
  interruptions: number;
  status: 'Completada' | 'Cancelada' | 'Fallida';
}


const TestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<TestRecord[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Peticion para tener los datos del back /  de la base de datos de mongo 
        const response = await fetch('http://localhost:5000/history');
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error cargando historial:", error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className={styles.historyContainer}>
      <div className={styles.tableWrapper}>
        <h2 className={styles.title}>Historial de Pruebas</h2>
        
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Distancia</th>
              <th>Hora de Inicio</th>
              <th>Hora de Fin</th>
              <th>Interrupciones</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {historyData.length > 0 ? (
              historyData.map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>{row.distance}</td>
                  <td>{row.startTime}</td>
                  <td>{row.endTime}</td>
                  <td style={{ textAlign: 'center' }}>{row.interruptions}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[row.status.toLowerCase()]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>
                  No hay registros en la base de datos aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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