import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * Rolling Currency & Metric Counter using Framer Motion useSpring & useTransform.
 *
 * Features:
 * - Smooth rolling spring dynamics starting from 0 upon view load.
 * - Extracts and rolls numbers from numeric inputs or formatted strings (e.g. 66465, "₹66,465", "+₹135,900 Surplus", "79/100").
 * - Supports custom prefix, suffix, decimals, and Indian Rupee locale formatting (`en-IN`).
 */
export const CountUp = ({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  stiffness = 75,
  damping = 18,
  className = '',
  style = {},
  formatter,
}) => {
  let targetNum = 0;
  let detectedPrefix = prefix;
  let detectedSuffix = suffix;

  if (typeof value === 'number') {
    targetNum = isNaN(value) ? 0 : value;
  } else if (typeof value === 'string') {
    const match = value.match(/(-?\d[\d,]*(?:\.\d+)?)/);
    if (match) {
      const cleanNumStr = match[0].replace(/,/g, '');
      targetNum = parseFloat(cleanNumStr) || 0;
      if (!prefix && !suffix) {
        const parts = value.split(match[0]);
        detectedPrefix = parts[0] || '';
        detectedSuffix = parts[1] || '';
      }
    } else {
      targetNum = 0;
      detectedPrefix = value;
    }
  }

  // Framer Motion Spring Value initialized to 0
  const springValue = useSpring(0, { stiffness, damping });

  // Transform numeric spring value to formatted string with INR locale formatting
  const displayTransform = useTransform(springValue, (current) => {
    if (formatter) return formatter(current);
    const num = isNaN(current) ? 0 : current;
    const rounded = decimals > 0 ? num.toFixed(decimals) : Math.round(num);
    return rounded.toLocaleString('en-IN');
  });

  useEffect(() => {
    springValue.set(targetNum);
  }, [targetNum, springValue]);

  return (
    <span
      className={`tabular-nums ${className}`}
      style={{ display: 'inline-flex', alignItems: 'baseline', ...style }}
    >
      {detectedPrefix}
      <motion.span>{displayTransform}</motion.span>
      {detectedSuffix}
    </span>
  );
};

export default CountUp;
