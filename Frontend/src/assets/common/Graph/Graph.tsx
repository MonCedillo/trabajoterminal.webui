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
import { socketConnection } from '../../../socket_client'; // <--- 1. IMPORTAMOS EL SOCKET

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// --- OPCIONES DEL GRÁFICO ---
const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 0 }, // Sin animación para que sea tiempo real fluido
  scales: {
    y: {
      min: 0, 
      max: 180, // <--- 2. CAMBIO A 180° (El rango real del MG995)
      title: { display: true, text: 'Grados (°)', color: '#ffffff' },
      ticks: { color: '#ffffff', font: { size: 12 } },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    x: { display: false, grid: { display: false } }
  },
  plugins: { legend: { display: false } }
};

const Graph: React.FC = () => {
  // Inicializamos con 20 puntos en 0
  const initialLabels = Array.from({ length: 20 }, (_, i) => i.toString());
  const initialData = Array.from({ length: 20 }, () => 0);

  const [leftArmData, setLeftArmData] = useState<number[]>(initialData);
  const [rightArmData, setRightArmData] = useState<number[]>(initialData);

  useEffect(() => {
    // 3. FUNCIÓN PARA RECIBIR DATOS REALES
    const handleTelemetry = (data: any) => {
      // Leemos los ángulos del paquete de datos. 
      // Si el backend aun no manda 'angles', usamos 0 por seguridad.
      const newLeftVal = data.left_angle !== undefined ? data.left_angle : 0;
      const newRightVal = data.right_angle !== undefined ? data.right_angle : 0;

      // Actualizamos Brazo Izquierdo (Shift register: saca el primero, mete el nuevo)
      setLeftArmData(prev => {
        const newData = [...prev.slice(1), newLeftVal];
        return newData;
      });

      // Actualizamos Brazo Derecho
      setRightArmData(prev => {
        const newData = [...prev.slice(1), newRightVal];
        return newData;
      });
    };

    // Nos suscribimos al evento
    socketConnection.on('telemetry_data', handleTelemetry);

    // Limpieza al desmontar componente
    return () => {
      socketConnection.off('telemetry_data', handleTelemetry);
    };
  }, []);

  // 4. CONFIGURACIÓN VISUAL (Tus estilos originales)
  
  // -- Brazo Izquierdo (Cyan) --
  const dataLeft: ChartData<'line'> = {
    labels: initialLabels,
    datasets: [
      {
        label: 'Posición Izquierda',
        data: leftArmData,
        borderColor: '#8CE4FF', // Cyan Neon
        backgroundColor: 'rgba(140, 228, 255, 0.2)', 
        borderWidth: 3,
        tension: 0.4, // Curva suave
        pointRadius: 0, // Sin puntos para que parezca osciloscopio
      },
    ],
  };

  // -- Brazo Derecho (Magenta) --
  const dataRight: ChartData<'line'> = {
    labels: initialLabels,
    datasets: [
      {
        label: 'Posición Derecha',
        data: rightArmData,
        borderColor: '#E83C91', // Magenta Neon
        backgroundColor: 'rgba(232, 60, 145, 0.2)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className={styles.graphContainer}>
      <div className={styles.chartWrapper}>
        <h4>Brazo Izquierdo (0-180°)</h4>
        <Line options={options} data={dataLeft} />
      </div>

      <div className={styles.chartWrapper}>
        <h4>Brazo Derecho (0-180°)</h4>
        <Line options={options} data={dataRight} />
      </div>
    </div>
  );
};

export default Graph;