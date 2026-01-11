import React from 'react';
import styles from './NewTest.module.scss';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { socketConnection } from '../../../socket_client';

import Graph from '../../common/Graph/main';
import Counter from '../../common/Counter/main';
import InfoCard from '../../common/InfoCard/main';
import ControlPanel from '../../common/ControlPanel/ControlPanel';
import DownloadButton from '../../common/DownloadButton/DownloadButton';




const NewTest: React.FC = () => {
  const location = useLocation();

  // Estado local para almacenar la informacion de la prueba
  const [testInfo, setTestInfo] = useState({
    distance: location.state?.distance || 0,
    startTime: new Date().toLocaleTimeString(), // Valor inicial
    date: new Date().toLocaleDateString(),
    interruptions: 0,
    duration: "0"
  });

  useEffect(() => {
    // En caso de entrar por navegacion, aqui actualizamos la info
    if (location.state) {
      setTestInfo(prev => ({
        ...prev,
        distance: location.state.distance,
        // TODO: Agregar la hora de inicio que envia el backend
      }));
    }

    // TODO: Escuchar datos en tiempo real del backend para actualizar la info -- TELEMETRIA
    // socketConnection.on('telemetry_data', (data) => {
    //    setTestInfo(prev => ({ ...prev, interruptions: data.interruptions }));
    // });

  }, [location.state]);

  return (
    <div className={styles.newTestContainer}>
      <div className={styles.graphicsArea}>
        <Graph />
      </div>

      <div className={styles.counterArea}>
        <h2>Contador de ciclos</h2>
        <Counter count={currentCount} /> 
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