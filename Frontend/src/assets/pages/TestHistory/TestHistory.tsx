import React from 'react';
import { useEffect, useState } from 'react';
import styles from './TestHistory.module.scss';
import { useNavigate } from 'react-router-dom';

interface TestRecord {
  _id: string; // ID de Mongo
  date_created: string;
  start_time: string;
  distance: number;
  target_cycles: number;
  current_cycle: number;
  status: string;
  end_time?: string;
}

const TestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<TestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Peticion para tener los datos del back /  de la base de datos de mongo 
        const response = await fetch('http://localhost:5000/history');
        const data = await response.json();
        const sortedData = await response.json();
        setHistoryData(sortedData);

      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4caf50'; // Verde
      case 'Running': return '#2196f3';   // Azul
      case 'Stopped': return '#f44336';   // Rojo de parada
      case 'Cancelled': return '#ff9800'; // Naranja de advertencia
      case 'Interrupted': return '#9e9e9e'; // Gris, mas bien se refiere a que no es valida 
      default: return '#fff';
    }
  };

  return (
    <div className={styles.historyContainer}>
      <header className={styles.header}>
        <h1>Historial de Pruebas</h1>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          Volver al Menú
        </button>
      </header>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loadingText}>Cargando datos...</p>
        ) : historyData.length === 0 ? (
          <p className={styles.emptyText}>No hay pruebas registradas aún.</p>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Distancia</th>
                <th>Ciclos Realizados</th>
                <th>Estado</th>
                <th>Hora Fin</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((test) => (
                <tr key={test._id}>
                  <td>{test.date_created}</td>
                  <td>{test.start_time}</td>
                  {/* Conversion a centimetros desde metros */}
                  <td>{(test.distance / 100).toFixed(2)} m</td> 
                  <td>
                    {test.current_cycle} / {test.target_cycles}
                  </td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(test.status) }}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td>{test.end_time || '--:--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TestHistory;