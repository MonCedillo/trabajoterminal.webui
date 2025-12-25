import React from 'react';
import styles from './Menu.module.scss';

// Definimos props por si quieres manejar la acción de clic desde fuera
interface MenuProps {
  onOptionSelect?: (distance: string) => void;
}

const Menu: React.FC<MenuProps> = ({ onOptionSelect }) => {
  
  const handleSelect = (distance: string) => {
    console.log(`Distancia seleccionada: ${distance}`);
    if (onOptionSelect) {
      onOptionSelect(distance);
    }
  };

  return (
    <div className={styles.menuContainer}>
      
      <h2 className={styles.title}>
        Seleccione la distancia intramaneral del objeto de prueba:
      </h2>

      <div className={styles.buttonContainer}>
        {/* Botón Izquierdo (Cyan) */}
        <button 
          className={`${styles.selectionButton} ${styles.cyan}`}
          onClick={() => handleSelect('0.15m')}
        >
          0.15 m
        </button>

        {/* Botón Derecho (Naranja) */}
        <button 
          className={`${styles.selectionButton} ${styles.orange}`}
          onClick={() => handleSelect('0.20m')}
        >
          0.20 m
        </button>
      </div>

    </div>
  );
};

export default Menu;