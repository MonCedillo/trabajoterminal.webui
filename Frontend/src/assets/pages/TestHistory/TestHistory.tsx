import React from 'react';
import styles from './TestHistory.module.scss';

// Definimos la estructura de los datos del historial
interface TestRecord {
  id: number;
  date: string;
  distance: string;
  startTime: string;
  endTime: string;
  interruptions: number;
  status: 'Completada' | 'Cancelada' | 'Fallida';
}

// Datos de prueba dummy
const mockHistory: TestRecord[] = [
  { id: 1, date: '2023-10-25', distance: '0.15 m', startTime: '10:00 AM', endTime: '10:45 AM', interruptions: 0, status: 'Completada' },
  { id: 2, date: '2023-10-26', distance: '0.20 m', startTime: '11:15 AM', endTime: '11:30 AM', interruptions: 2, status: 'Cancelada' },
  { id: 3, date: '2023-10-27', distance: '0.15 m', startTime: '09:00 AM', endTime: '09:50 AM', interruptions: 1, status: 'Completada' },
  { id: 4, date: '2023-10-28', distance: '0.20 m', startTime: '14:20 PM', endTime: '15:10 PM', interruptions: 0, status: 'Completada' },
  { id: 5, date: '2023-10-29', distance: '0.15 m', startTime: '16:00 PM', endTime: '16:05 PM', interruptions: 0, status: 'Fallida' },
];

interface TestHistoryProps {
  onBack: () => void; // Función para regresar al menú anterior
}

const TestHistory: React.FC<TestHistoryProps> = ({ onBack }) => {
  return (
    <div className={styles.historyContainer}>
      
      {/* Contenedor de la Tabla (Area Rosa en tu mock) */}
      <div className={styles.tableWrapper}>
        <h2 className={styles.title}>Historial de Pruebas</h2>
        
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Distancia</th>
              <th>Hora Inicio</th>
              <th>Hora Fin</th>
              <th>Interrupciones</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((row) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón Go Back (Amarillo) */}
      <div className={styles.buttonContainer}>
        <button className={styles.goBackButton} onClick={onBack}>
          Go Back
        </button>
      </div>

    </div>
  );
};

export default TestHistory;