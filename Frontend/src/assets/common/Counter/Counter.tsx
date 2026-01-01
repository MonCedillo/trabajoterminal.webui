import React from 'react';
import SevenSegmentDigit from '../SevenSegmentDigit/main';
import styles from './Counter.module.scss';

interface CounterProps {
  count: number;
}

const Counter: React.FC<CounterProps> = ({ count }) => {
  // Se asegura de que el número esté en el rango
  const safeCount = Math.max(0, Math.min(count, 99999));

  // Constante para formatar el número a 5 dígitos con ceros a la izquierda
  const formattedCount = String(safeCount).padStart(5, '0');

  // Constante para separar la cadena en un array de dígitos
  const digits = formattedCount.split(''); // ej: ["0", "0", "1", "2", "3"]

  return (
    <div className={styles.counter}>
      {digits.map((digit, index) => (
        // Esto renderiza un componente por cada dígito
        <SevenSegmentDigit key={index} digit={Number(digit)} />
      ))}
    </div>
  );
};

export default Counter;