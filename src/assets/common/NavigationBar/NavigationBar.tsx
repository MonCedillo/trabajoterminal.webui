import React from "react";
import { useState } from "react";
import styles from "./NavigationBar.module.scss";

// Importar componentes que se usarán en la barra de navegación
import MenuButton from "../MenuButton/main";

// Componente de la barra de navegación como componente funcional
const NavigationBar: React.FC = () => {
  // Estado para controlar la visibilidad del menú desplegable abierto/cerrado  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para manejar el clic en el botón del menú
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen); // Invierte el estado
  };

    // Renderizado del componente
    return (
    // Estructura de la barra de navegación, se establece como header para que use ese espacio en la página
    <header className={styles.NavigationBar}>
      {/* Título de la barra de navegación, incluye el nombre de la empresa/cliente*/}
      <div className={styles.Title}>
        Certificación Laboratorio e Importaciones S.C.
      </div>

      {/* Contenedor del botón del menú */}
      <div className={styles.MenuContainer}>
        <MenuButton onClick={handleMenuClick} />
      </div>
      {isMenuOpen && (
        <nav className={styles.DropdownMenu}>
          {/* No se agregan por ahora enlaces a las paginas de redireccionamiento */}
          <a href="#">Nueva Prueba</a>
          <a href="#">Historial</a>
        </nav>
      )}
    </header>
  );
};

export default NavigationBar;