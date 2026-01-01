import React, { useEffect, useState } from 'react';
import styles from './Graph.module.scss';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ... (Las opciones "options" siguen igual que antes para el tema oscuro) ...
const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 },
  scales: {
    y: {
      min: 0, max: 90,
      title: { display: true, text: 'Grados (°)', color: '#ffffff' },
      ticks: { color: '#ffffff', font: { size: 12 } },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    x: { display: false, grid: { display: false } }
  },
  plugins: { legend: { display: false } }
};


const Graph: React.FC = () => {
  const initialLabels = Array.from({ length: 20 }, (_, i) => i.toString());
  const initialData = Array.from({ length: 20 }, () => 0);

  const [leftArmData, setLeftArmData] = useState<number[]>(initialData);
  const [rightArmData, setRightArmData] = useState<number[]>(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLeftVal = Math.floor(Math.random() * 90);
      const newRightVal = Math.floor(Math.random() * 90);
      setLeftArmData(prev => [...prev.slice(1), newLeftVal]);
      setRightArmData(prev => [...prev.slice(1), newRightVal]);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // 1. Configuración de datos Brazo Izquierdo (Color CYAN #8CE4FF)
  const dataLeft: ChartData<'line'> = {
    labels: initialLabels,
    datasets: [
      {
        label: 'Posición Efector',
        data: leftArmData,
        // --- CAMBIO AQUÍ ---
        borderColor: '#8CE4FF', // El nuevo color Cyan
        // Opcional: ajusté el relleno para que combine (cyan transparente)
        backgroundColor: 'rgba(140, 228, 255, 0.2)', 
        // -------------------
        borderWidth: 4,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  // 2. Configuración de datos Brazo Derecho (Color ROSA/MAGENTA #E83C91)
  const dataRight: ChartData<'line'> = {
    labels: initialLabels,
    datasets: [
      {
        label: 'Posición Efector',
        data: rightArmData,
        // --- CAMBIO AQUÍ ---
        borderColor: '#E83C91', // El nuevo color Rosa Magenta
        // Opcional: ajusté el relleno para que combine (rosa transparente)
        backgroundColor: 'rgba(232, 60, 145, 0.2)',
        // -------------------
        borderWidth: 4,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className={styles.graphContainer}>
      <div className={styles.chartWrapper}>
        <h4>Brazo Izquierdo (0-90°)</h4>
        <Line options={options} data={dataLeft} />
      </div>

      <div className={styles.chartWrapper}>
        <h4>Brazo Derecho (0-90°)</h4>
        <Line options={options} data={dataRight} />
      </div>
    </div>
  );
};

export default Graph;