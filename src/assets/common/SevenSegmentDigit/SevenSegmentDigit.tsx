import React from 'react';
import styles from './SevenSegmentDigit.module.scss';

// Constante que define que segmentos están encendidos para cada dígito del 0 al 9
const DIGIT_MAP = [
  { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 0 }, // 0
  { a: 0, b: 1, c: 1, d: 0, e: 0, f: 0, g: 0 }, // 1
  { a: 1, b: 1, c: 0, d: 1, e: 1, f: 0, g: 1 }, // 2
  { a: 1, b: 1, c: 1, d: 1, e: 0, f: 0, g: 1 }, // 3
  { a: 0, b: 1, c: 1, d: 0, e: 0, f: 1, g: 1 }, // 4
  { a: 1, b: 0, c: 1, d: 1, e: 0, f: 1, g: 1 }, // 5
  { a: 1, b: 0, c: 1, d: 1, e: 1, f: 1, g: 1 }, // 6
  { a: 1, b: 1, c: 1, d: 0, e: 0, f: 0, g: 0 }, // 7
  { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1 }, // 8
  { a: 1, b: 1, c: 1, d: 1, e: 0, f: 1, g: 1 }, // 9
];

// Función de apoyo para construir las clases de CSS
function cx(base: string, ...args: (string | boolean | number)[]) {
  let result = base;
  for (const arg of args) {
    if (arg) {
      result += ' ' + arg;
    }
  }
  return result;
}

interface SevenSegmentDigitProps {
  digit: number; // numero del 0n al nueve, representa el dígito a mostrar
}

const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({ digit }) => {
  // Obtenemos el mapa de segmentos para el dígito actual
  const segments = DIGIT_MAP[digit] || DIGIT_MAP[0]; // Muestra un 0 en caso de que el dígito sea inválido

  return (
    <div className={styles.digit}>
      <div className={cx(styles.segment, styles.a, segments.a && styles.on)}></div>
      <div className={cx(styles.segment, styles.b, segments.b && styles.on)}></div>
      <div className={cx(styles.segment, styles.c, segments.c && styles.on)}></div>
      <div className={cx(styles.segment, styles.d, segments.d && styles.on)}></div>
      <div className={cx(styles.segment, styles.e, segments.e && styles.on)}></div>
      <div className={cx(styles.segment, styles.f, segments.f && styles.on)}></div>
      <div className={cx(styles.segment, styles.g, segments.g && styles.on)}></div>
    </div>
  );
};

export default SevenSegmentDigit;