import React, { useState } from 'react';
import styles from './ControlPanel.module.scss';
import ControlButton from '../ControlButton/main';
// 1. Importar el nuevo Modal
import ActionModal from '../ActionModal/main';

// Definir el tipo aquí o importarlo si lo tienes en un archivo de tipos compartido
type ButtonVariant = 'stop' | 'pause' | 'play' | 'reset';

const ControlPanel: React.FC = () => {
  // 2. Estado para saber qué modal está activo (null = ninguno)
  const [activeVariant, setActiveVariant] = useState<ButtonVariant | null>(null);

  // Lógica para comunicarse con la RPi4
  const sendCommand = (command: string) => {
    // --- API REAL COMENTADA ---
    // console.log(`[RPi4 Command Sent]: ${command}`);
    // fetch('/api/rpi/control', { method: 'POST', body: JSON.stringify({ action: command }) })
    // --------------------------
  };

  // 3. Nuevo manejador: abre el modal y llama (comentado) a la API
  const handleAction = (variant: ButtonVariant, commandString: string) => {
    // a) "Enviamos" el comando (ahora comentado dentro de la función)
    sendCommand(commandString);

    // b) Abrimos el modal correspondiente
    setActiveVariant(variant);
  };

  // 4. Función para cerrar el modal
  const closeModal = () => {
    setActiveVariant(null);
  };

  return (
    <>
      <div className={styles.panel}>
        {/* Actualizamos los onClick para usar handleAction */}
        
        <ControlButton 
          variant="stop" 
          onClick={() => handleAction('stop', 'STOP')} 
        />

        <ControlButton 
          variant="pause" 
          onClick={() => handleAction('pause', 'PAUSE')} 
        />

        <ControlButton 
          variant="play" 
          onClick={() => handleAction('play', 'START')} 
        />
        
        <ControlButton 
          variant="reset" 
          onClick={() => handleAction('reset', 'RESET')} 
        />
      </div>

      {/* 5. Renderizamos el Modal */}
      {/* Se mostrará automáticamente cuando activeVariant tenga un valor */}
      <ActionModal 
        isOpen={!!activeVariant} // Es true si activeVariant no es null
        variant={activeVariant}
        onClose={closeModal}
      />
    </>
  );
};

export default ControlPanel;