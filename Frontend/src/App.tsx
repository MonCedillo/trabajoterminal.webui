import React, { useState, useEffect } from 'react';
import NavigationBar from './assets/common/NavigationBar/main';
import NewTest from './assets/pages/NewTest/main';
import Menu from './assets/pages/Menu/main';
// 1. Importa la nueva página de Historial
import TestHistory from './assets/pages/TestHistory/main';
import './App.css';

// Definimos las páginas posibles
type PageType = 'menu' | 'test' | 'history';

function App() {
  // Estado para controlar en qué página estamos
  const [currentPage, setCurrentPage] = useState<PageType>('menu');
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCycleCount(c => (c + 1 > 50000 ? 0 : c + 1));
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  const handleDistanceSelection = (distance: string) => {
    console.log("Iniciando prueba con distancia:", distance);
    setCurrentPage('test');
  };

  // Función para manejar la navegación desde el Navbar
  const handleNavigation = (page: string) => {
    if (page === 'menu' || page === 'history') {
      setCurrentPage(page as PageType);
    }
  };

  return (
    <div className="App">
      {/* Pasamos la función de navegación al Navbar */}
      <NavigationBar onNavigate={handleNavigation} />

      <main>
        {/* Lógica de enrutamiento simple */}
        
        {currentPage === 'menu' && (
          <Menu onOptionSelect={handleDistanceSelection} />
        )}

        {currentPage === 'test' && (
          <NewTest currentCount={cycleCount} />
        )}

        {currentPage === 'history' && (
          <TestHistory onBack={() => setCurrentPage('menu')} />
        )}
        
      </main>
    </div>
  );
}

export default App;