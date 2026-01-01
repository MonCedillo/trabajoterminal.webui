import React, { useState } from 'react';
import styles from './NavigationBar.module.scss';
import MenuButton from '../MenuButton/main';

// 1. Añadimos una prop para navegar
interface NavigationBarProps {
  onNavigate: (page: string) => void;
}

// 2. Recibimos la prop en el componente
const NavigationBar: React.FC<NavigationBarProps> = ({ onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función helper para navegar y cerrar el menú
  const handleLinkClick = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.NavigationBar}>
      <div className={styles.Title}>
        Certificación Laboratorio e Importaciones S.C.
      </div>

      <div className={styles.MenuContainer}>
        <MenuButton onClick={handleMenuClick} />
      </div>

      {isMenuOpen && (
        <nav className={styles.DropdownMenu}>
          {/* 3. Actualizamos los enlaces para usar onNavigate */}
          
          {/* 'Inicio' nos lleva al Menú de selección de distancia */}
          <a href="#" onClick={() => handleLinkClick('menu')}>Inicio</a>
          
          {/* 'Historial' nos lleva a la nueva pantalla */}
          <a href="#" onClick={() => handleLinkClick('history')}>Historial</a>
        </nav>
      )}
    </header>
  );
};

export default NavigationBar;