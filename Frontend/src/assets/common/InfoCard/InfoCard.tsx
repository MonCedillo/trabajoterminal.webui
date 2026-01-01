import React from 'react';
import styles from './InfoCard.module.scss';

const InfoCard: React.FC = () => {


  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Información de la Prueba</h3>
      </div>
      
      <div className={styles.body}>
        
        {/* Campo: Fecha y Hora */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Fecha</label>
            <input type="date" className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label>Hora</label>
            <input type="time" className={styles.input} />
          </div>
        </div>

        {/* Campo: Distancia Intramaneral */}
        <div className={styles.inputGroup}>
          <label>Distancia Intramaneral (m)</label>
          <input type="number" placeholder="0.00" className={styles.input} />
        </div>

        {/* Campo: Interrupciones */}
        <div className={styles.inputGroup}>
          <label>Interrupciones de la prueba</label>
          <input type="number" placeholder="0" className={styles.input} />
        </div>

        {/* Campo: Duración */}
        <div className={styles.inputGroup}>
          <label>Duración de la prueba (min)</label>
          <input type="number" placeholder="0" className={styles.input} />
        </div>

      </div>
    </div>
  );
};

export default InfoCard;