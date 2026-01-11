import React, { useState, useEffect } from 'react';
import styles from './InfoCard.module.scss';

// Definimos qué datos necesita esta tarjeta para funcionar
interface InfoCardProps {
  testId?: string;
  distanceMm?: number;    // Recibimos 150 o 200
  startTime?: string;     // Hora de inicio "HH:MM:SS"
  date?: string;          // Fecha "YYYY-MM-DD"
  interruptions?: number; // Contador de interrupciones
  duration?: string;      // Duración formateada o minutos
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  testId, 
  distanceMm = 0, 
  startTime = "--:--", 
  date, 
  interruptions = 0, 
  duration = "0" 
}) => {

  // Formatear fecha actual si no viene de la DB
  const displayDate = date || new Date().toLocaleDateString();
  
  // Convertir milímetros a metros para mostrar (150mm -> 0.15m)
  const displayDistance = (distanceMm / 1000).toFixed(2);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Información de la Prueba</h3>
        {/* Mostramos el ID pequeñito por si sirve de referencia */}
        {testId && <span style={{fontSize: '0.8rem', color: '#666'}}>ID: {testId}</span>}
      </div>
      
      <div className={styles.body}>
        
        {/* Campo: Fecha y Hora */}
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Fecha</label>
            <input 
              type="text" 
              className={styles.input} 
              value={displayDate} 
              readOnly 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Hora Inicio</label>
            <input 
              type="text" 
              className={styles.input} 
              value={startTime} 
              readOnly 
            />
          </div>
        </div>

        {/* Campo: Distancia Intramaneral */}
        <div className={styles.inputGroup}>
          <label>Distancia Intramaneral (m)</label>
          <input 
            type="text" 
            className={styles.input}
            value={`${displayDistance} m`} // Agregamos la "m" visualmente
            readOnly 
          />
        </div>

        {/* Campo: Interrupciones */}
        <div className={styles.inputGroup}>
          <label>Interrupciones de la prueba</label>
          <input 
            type="number" 
            className={styles.input} 
            value={interruptions}
            readOnly
          />
        </div>

        {/* Campo: Duración */}
        <div className={styles.inputGroup}>
          <label>Duración (min)</label>
          <input 
            type="text" 
            className={styles.input} 
            value={duration} 
            readOnly
          />
        </div>

      </div>
    </div>
  );
};

export default InfoCard;