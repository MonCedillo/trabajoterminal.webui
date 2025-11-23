import React from 'react';
import styles from './NewTest.module.scss';
import Counter from '../../common/Counter/main';


interface NewTestProps {
  currentCount: number; 
}

const NewTest: React.FC<NewTestProps> = ({ currentCount }) => {

  return (
    <div className={styles.newTestContainer}>
      <div className={styles.graphicsArea}>
        Gráficas de trayectoria de robot/sistema embebido
      </div>

      <div className={styles.counterArea}>
        <h2>Contador de ciclos</h2>
        <Counter count={currentCount} /> 
      </div>

      <div className={styles.infoArea}>
        Información de la prueba
      </div>

      <div className={styles.controlArea}>
        CONTROLADOR EMBEBIDO: BOTONES PAUSA/REINICIO
      </div>

      <div className={styles.downloadButtonArea}>
        Botón de descarga de resultados
      </div>
    </div>
  );
};

export default NewTest;