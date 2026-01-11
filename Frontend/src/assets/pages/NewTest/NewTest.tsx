import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { socketConnection } from '../../../socket_client';

import Graph from '../../common/Graph/main';
import Counter from '../../common/Counter/main';
import InfoCard from '../../common/InfoCard/main';
import ControlPanel from '../../common/ControlPanel/ControlPanel';
import DownloadButton from '../../common/DownloadButton/DownloadButton';

import styles from './NewTest.module.scss';

const NewTest: React.FC = () => {
  const location = useLocation();

  // Estado para el contador de ciclos actual
  const [cycleCount, setCycleCount] = useState<number>(0);
  // Estado para la graficacion de la posicion de los motores
  const [currentAngle, setCurrentAngle] = useState<number>(0);

  // Estado para la informacion general de la prueba
  const [testInfo, setTestInfo] = useState({
    distance: location.state?.distance || 0,
    startTime: location.state?.startTime || "--:--",
    date: location.state?.date || new Date().toLocaleDateString(),
    interruptions: 0,
    duration: "0",
    testId: location.state?.testId || ""
  });

  // Recuperacion de los datos de la prueba al cargar (refresh//navegacion)
  useEffect(() => {
    // Se revisa cual prueba es la que esta corriendo actualmente, si es que hay alguna
    socketConnection.emit('check_current_status');
    
    // Se hace el manejo de la respuesta
    const handleStatusResponse = (res: any) => {
      if (res.active && res.data) {
        console.log("🔄 Datos recuperados:", res.data);
        
        // Actualizacion de la informacion de la prueba
        setTestInfo(prev => ({
          ...prev,
          distance: res.data.distance,
          startTime: res.data.start_time,
          testId: res.data.test_id,
          // TODO: interrupciones y duracion si se guardan en DB
        }));

        // Actualizacion del Contador con el dato de la DB
        if (res.data.current_cycle !== undefined) {
          setCycleCount(res.data.current_cycle);
        }
      }
    };

    // Escucha de actualizaciones en tiempo real 
    // TODO: agregar la telemetria completa, manejar el estatus de la prueba
    const handleTelemetry = (data: any) => {
       // Actualizar Contador
       if (data.cycleCount !== undefined) setCycleCount(data.cycleCount);
       
       // Actualizar Ángulo para la Gráfica (0 o 90)
       if (data.angle !== undefined) setCurrentAngle(data.angle);
    };

    socketConnection.on('current_status_response', handleStatusResponse);
    socketConnection.on('telemetry_data', handleTelemetry);

    return () => {
      socketConnection.off('current_status_response', handleStatusResponse);
      socketConnection.off('telemetry_data', handleTelemetry);
    };
  }, []);

  return (
    <div className={styles.newTestContainer}>
      <div className={styles.graphicsArea}>
        <Graph currentData={currentAngle} />
      </div>

      <div className={styles.counterArea}>
        <h2>Contador de ciclos</h2>
        <Counter count={cycleCount} /> 
      </div>

      <div className={styles.infoArea}>
        <InfoCard 
        testId={location.state?.testId}
        distanceMm={testInfo.distance}
        startTime={testInfo.startTime}
        date={testInfo.date}
        interruptions={testInfo.interruptions}
        duration={testInfo.duration}
        />
      </div>

      <div className={styles.controlArea}>
        <ControlPanel />
      </div>

      <div className={styles.downloadButtonArea}>
        <DownloadButton />
      </div>
    </div>
  );
};

export default NewTest;