import React from 'react';
import styles from './MenuButton.module.scss';

// Definimos 'onClick' en las props para hacerlo funcional, en este primer caso, la funcion determinada para onClick es un void
// en un futuro se cambiara a una funcion de menu lateral para acceder al historial de pruebas de certificacion realizadas
interface MenuButtonProps {
  onClick: () => void;
}

// Componente funcional de React que representa el boton de menu del tipo "hamburguesa"
const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => {
  return (
    <button className={styles.MenuButton} onClick={onClick}>
      {/*se crean tres divs para representar las lineas del icono de menu hamburguesa */}
      <div className={styles.line}></div>
      <div className={styles.line}></div>
      <div className={styles.line}></div>
    </button>
  );
};

export default MenuButton;