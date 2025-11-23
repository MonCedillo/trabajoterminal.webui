import React from 'react';
import styles from './NewTest.module.scss'; 


import Counter from '../../common/Counter/main';

const NewTest: React.FC = () => {
  // Aquí sew va a manejar la logica de esta pagina, incluye datos de las graficas y del contador.
 

  // Por ahora, el contador sigue usando el estado de App.tsx para simular.
  // En una aplicación real, probablemente pasarías 'count' como prop a NewTest,
  // o NewTest tendría su propia lógica de conteo o recibiría los datos de la RPi.

  const simulatedCount = 12345; // Se utiliza un número fijo por ahora, posteriormente se conecta fuera del estado de mock de la pagina.

  return (
    <div className={styles.newTestContainer}>
      {/* Área de Gráficas */}
      <div className={styles.graphicsArea}>
        Gráficas de trayectoria de robot/sistema embebido
      </div>

      {/* Área del Contador */}
      <div className={styles.counterArea}>
        {/* Aquí insertamos tu componente Counter */}
        <Counter count={simulatedCount} /> 
      </div>

      {/* Área de Información de la Prueba */}
      <div className={styles.infoArea}>
        Información de la prueba
      </div>

      {/* Área de Botones de Pausa/Reinicio */}
      <div className={styles.controlArea}>
        CONTROLADOR EMBEBIDO: BOTONES PAUSA/REINICIO
      </div>

      {/* Área del Botón de Descarga */}
      <div className={styles.downloadButtonArea}>
        Botón de descarga de resultados
      </div>
    </div>
  );
};

export default NewTest;