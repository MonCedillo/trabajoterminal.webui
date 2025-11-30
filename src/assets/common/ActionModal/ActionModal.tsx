import React from 'react';
import styles from './ActionModal.module.scss';

// Reutilizamos los tipos
type ButtonVariant = 'stop' | 'pause' | 'play' | 'reset';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: ButtonVariant | null; // Puede ser null si no hay ninguno seleccionado
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, variant }) => {
  if (!isOpen || !variant) return null;

  // Helper para obtener el ícono (mismos paths que ControlButton)
  const getIcon = () => {
    switch (variant) {
      case 'play': return <path d="M8 5v14l11-7z" />;
      case 'pause': return <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />;
      case 'stop': return <path d="M6 6h12v12H6z" />;
      case 'reset': return <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />;
    }
  };

  // Construimos la clase dinámica: styles.modal + styles.stop (por ejemplo)
  const modalClass = `${styles.modal} ${styles[variant]}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.iconContainer}>
          <svg viewBox="0 0 24 24">{getIcon()}</svg>
        </div>

        <h2 className={styles.title}>{variant}</h2>
        
        <p className={styles.message}>
          El comando <strong>{variant.toUpperCase()}</strong> ha sido enviado.
        </p>

        <button className={styles.closeButton} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default ActionModal;