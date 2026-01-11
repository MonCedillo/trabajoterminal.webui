import React, { useState } from 'react';
import styles from './ControlPanel.module.scss';
import ControlButton from '../ControlButton/main';
import ActionModal from '../ActionModal/main';
import { socketConnection } from '../../../socket_client';

type ButtonVariant = 'stop' | 'pause' | 'play' | 'reset';

const ControlPanel: React.FC = () => {
  const [activeVariant, setActiveVariant] = useState<ButtonVariant | null>(null);

  const sendCommand = (command: string) => {
    console.log(`[Socket] Enviando comando: ${command}`);

    switch (command) {
      case 'STOP':
        // 2. EVENTO ACTUALIZADO (Coincide con server.py)
        socketConnection.emit('stop_test_request', {});
        break;

      case 'PAUSE':
        // Por implementar en server.py
        console.log("Pausa solicitada (Falta implementar en backend)");
        // socketConnection.emit('pause_test_request', {});
        break;
      
      case 'RESTART': // Botón Play
        // Por implementar en server.py
        console.log("Reanudar solicitado (Falta implementar en backend)");
        // socketConnection.emit('resume_test_request', {});
        break;

      case 'RESET':
        // Generalmente Reset es un Stop forzado + Limpieza
        socketConnection.emit('stop_test_request', {}); 
        break;
        
      default:
        console.warn("Comando desconocido:", command);
    }
  };

  const handleAction = (variant: ButtonVariant, commandString: string) => {
    sendCommand(commandString);
    setActiveVariant(variant);
  };

  const closeModal = () => {
    setActiveVariant(null);
  };

  return (
    <>
      <div className={styles.panel}>
        
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
          onClick={() => handleAction('play', 'RESTART')} 
        />
        
        <ControlButton 
          variant="reset" 
          onClick={() => handleAction('reset', 'RESET')} 
        />
      </div>

      <ActionModal 
        isOpen={!!activeVariant} 
        variant={activeVariant}
        onClose={closeModal}
      />
    </>
  );
};

export default ControlPanel;