import React, { useState, useEffect } from 'react';
import NavigationBar from './assets/common/NavigationBar/main';
import NewTest from './assets/pages/NewTest/main';
import './App.css'; 

function App() {
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCycleCount(currentCount => {
        const nextCount = currentCount + 1;
        return nextCount > 50001 ? 0 : nextCount;
      });
    }, 100); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <NavigationBar />
      <main>
        <NewTest currentCount={cycleCount} />
      </main>
    </div>
  );
}

export default App;