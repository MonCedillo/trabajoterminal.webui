import React from 'react';
import styles from './DownloadModal.module.scss';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, message = "Operación Exitosa" }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* stopPropagation evita que el modal se cierre si clicas DENTRO de la caja */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Ícono de Check SVG */}
        <div className={styles.iconContainer}>
          <svg viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>

        <div className={styles.message}>
          {message}
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default DownloadModal;