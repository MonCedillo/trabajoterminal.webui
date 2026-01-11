import React, { useState } from 'react';
import MenuButton from '../MenuButton/main';
import { useNavigate } from 'react-router-dom';

import styles from './NavigationBar.module.scss';


const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (page: string) => {
    if (page === 'menu') {
      navigate('/');
    } else if (page === 'history') {
      navigate('/history');
    }
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
          
          {/* Esto nos lleva al menú de selección de distancia y al inicio de nueva prueba */}
          <a href="#" onClick={() => handleLinkClick('menu')}>Nueva Prueba</a>
          
          {/* 'Historial' nos lleva al display de la base de datos */}
          <a href="#" onClick={() => handleLinkClick('history')}>Historial</a>
        </nav>
      )}
    </header>
  );
};

export default NavigationBar;