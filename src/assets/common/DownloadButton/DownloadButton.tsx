import React, { useState } from 'react';
import styles from './DownloadButton.module.scss';
import DownloadModal from '../DownloadModal/DownloadModal';

const DownloadButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleDownload = () => {
    // Aquí iría tu lógica real de descarga (generar PDF, CSV, etc.)
    console.log("Descargando archivos...");
    
    // Simulamos un pequeño retraso y mostramos el éxito
    setTimeout(() => {
        setShowModal(true);
    }, 500);
  };

  return (
    <>
      <button className={styles.btnDownload} onClick={handleDownload}>
        {/* Un ícono sencillo de descarga SVG inline */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Descargar Resultados
      </button>

      {/* Renderizamos el modal, controlado por el estado showModal */}
      <DownloadModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        message="Descarga Exitosa"
      />
    </>
  );
};

export default DownloadButton;