import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Menu.module.scss';
import { socketConnection } from '../../../socket_client';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado para guardar la prueba encontrada (si es que existe)
  const [activeTest, setActiveTest] = useState<any>(null);

  useEffect(() => {
    // Preguntar al cargar: "¿Hay alguna prueba en proceso?"
    socketConnection.emit('check_current_status');

    // Recibir respuesta del estado
    const handleStatus = (response: any) => {
      if (response.active && response.data) {
        console.log("⚠️ Prueba en curso detectada:", response.data);
        setActiveTest(response.data);
      } else {
        setActiveTest(null);
      }
    };

    // Recibir confirmación de inicio (para la creación de la nueva prueba)
    const handleStart = (data: any) => {
      navigate('/new-test', { 
        state: { 
          testId: data.test_id,
          distance: data.distance,
          cycles: data.target_cycles,
          startTime: data.start_time
        } 
      });
    };

    socketConnection.on('current_status_response', handleStatus);
    socketConnection.on('test_started_confirmation', handleStart);

    return () => {
      socketConnection.off('current_status_response', handleStatus);
      socketConnection.off('test_started_confirmation', handleStart);
    };
  }, [navigate]);

  // Función para volver a la prueba existente
  const handleResume = () => {
    if (activeTest) {
      console.log("🔄 Retomando prueba existente...");
      navigate('/new-test', { 
        state: { 
          testId: activeTest.test_id,
          distance: activeTest.distance,
          cycles: activeTest.target_cycles,
          startTime: activeTest.start_time,
          date: activeTest.date_created
        } 
      });
    }
  };

  // Función para iniciar nueva (Solo si no hay activa, o forzando)
  const handleSelect = (distanceLabel: string) => {
    const numericDistance = distanceLabel === '0.15m' ? 150 : 200;
    // Siempre 50,000 ciclos debido a solicitud de la norma
    socketConnection.emit('start_test_request', { distance: numericDistance, cycles: 50000 });
  };

  // --- RENDERIZADO ---

  // CASO A: SI HAY PRUEBA CORRIENDO -> Mostrar Botón de "Volver"
  if (activeTest) {
    return (
      <div className={styles.menuContainer}>
        <h2 className={styles.title} style={{ color: '#ffcc00' }}>
          ⚠️ ¡Prueba en Progreso!
        </h2>
        
        <div style={{ margin: '20px 0', fontSize: '1.2rem', color: 'white' }}>
          <p>ID: <span style={{opacity:0.7}}>{activeTest.test_id}</span></p>
          <p>Distancia: <strong>{activeTest.distance / 1000} m</strong></p>
          <p>Inicio: {activeTest.start_time}</p>
        </div>

        {/* Botón Grande para Volver */}
        <button 
          className={`${styles.selectionButton} ${styles.orange}`}
          style={{ width: '100%', maxWidth: '400px', fontSize: '1.5rem' }}
          onClick={handleResume}
        >
          VOLVER AL MONITOREO ↻
        </button>

        <p style={{ marginTop: '30px', color: '#aaa', fontSize: '0.9rem' }}>
          * Si se desea iniciar una prueba nueva, primero es necesariodetener la actual desde el panel de monitoreo.
        </p>
      </div>
    );
  }

  // CASO B: NO HAY PRUEBA -> Mostrar Menú Normal  de selección de distancia  
  return (
    <div className={styles.menuContainer}>
      <h2 className={styles.title}>
        Seleccione la distancia intramaneral del objeto de prueba:
      </h2>

      <div className={styles.buttonContainer}>
        <button 
          className={`${styles.selectionButton} ${styles.cyan}`}
          onClick={() => handleSelect('0.15m')}
        >
          0.15 m
        </button>

        <button 
          className={`${styles.selectionButton} ${styles.orange}`}
          onClick={() => handleSelect('0.20m')}
        >
          0.20 m
        </button>
      </div>
    </div>
  );
};

export default Menu;