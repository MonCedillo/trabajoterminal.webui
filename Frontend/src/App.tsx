import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Menu from './assets/pages/Menu/main';
import NewTest from './assets/pages/NewTest/main';
import NavigationBar from './assets/common/NavigationBar/main';
import TestHistory from './assets/pages/TestHistory/TestHistory';

function App() {
  return (
    <div className="App">
      <NavigationBar />

      {/* Manejo de runtas: El contenido cambia según la URL */}
      <main>
        <Routes>
          {/* Ruta del Menú (Página de inicio) */}
          <Route path="/" element={<Menu />} />
          
          {/* Ruta de la Prueba */}
          <Route path="/new-test" element={<NewTest />} />
          
          {/* Ruta del Historial */}
          <Route path="/history" element={<TestHistory />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;