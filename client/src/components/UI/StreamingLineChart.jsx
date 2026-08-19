import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * Real-Time Streaming Line Chart for Dark-Mode Dashboards
 *
 * Features:
 * - Continuous X-axis linear shift as new data arrives.
 * - Y-axis height changes powered by Spring Physics (stiffness: 100, damping: 15).
 * - Smooth cubic bezier spline generation.
 * - Neon green gradient stroke with SVG feDropShadow glow filter.
 * - Pulsating glowing leading indicator on the latest active point.
 */
export const StreamingLineChart = ({
  height = 140,
  minVal = 1000,
  maxVal = 8000,
  initialVal = 4200,
  strokeColor = '#00FF87',
  strokeGradientEnd = '#00F0FF',
  glowColor = '#00FF87',
  onValueChange,
}) => {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(500);

  // Number of visible segments
  const pointCount = 26;
  const tickDuration = 900; // ms per new data point

  // Spring physics for latest Y value
  const springY = useSpring(initialVal, { stiffness: 100, damping: 15 });

  // Data buffer of points (normalized 0 to 1)
  const [dataPoints, setDataPoints] = useState(() => {
    const pts = [];
    let current = (initialVal - minVal) / (maxVal - minVal);
    for (let i = 0; i < pointCount + 4; i++) {
      current = Math.max(0.15, Math.min(0.85, current + (Math.random() - 0.48) * 0.16));
      pts.push(current);
    }
    return pts;
  });

  const [currentVal, setCurrentVal] = useState(initialVal);
  const [leadingY, setLeadingY] = useState(0);
  const animOffsetRef = useRef(0);
  const [animOffset, setAnimOffset] = useState(0);

  // Resize observer for responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth || 500);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Listen to spring changes for the latest value
  useEffect(() => {
    const unsubscribe = springY.on('change', (latest) => {
      const clamped = Math.max(minVal, Math.min(maxVal, latest));
      setCurrentVal(clamped);
      if (onValueChange) onValueChange(clamped);
    });
    return () => unsubscribe();
  }, [springY, minVal, maxVal, onValueChange]);

  // Main ticker interval that adds new data points
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick next target value with organic momentum
      const delta = (Math.random() - 0.48) * 1600;
      const nextRaw = Math.max(minVal + 300, Math.min(maxVal - 300, currentVal + delta));
      springY.set(nextRaw);

      const nextNorm = (nextRaw - minVal) / (maxVal - minVal);

      setDataPoints((prev) => {
        const next = [...prev.slice(1), nextNorm];
        return next;
      });
    }, tickDuration);

    return () => clearInterval(interval);
  }, [currentVal, minVal, maxVal, springY]);

  // High-performance requestAnimationFrame loop for continuous linear X shift
  useEffect(() => {
    let startTime = performance.now();
    let frameId;

    const renderLoop = (time) => {
      const elapsed = time - startTime;
      const progress = (elapsed % tickDuration) / tickDuration; // 0 -> 1 linear
      animOffsetRef.current = progress;
      setAnimOffset(progress);
      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, [tickDuration]);

  // Generate smooth cubic bezier SVG paths
  const paddingY = 18;
  const effectiveHeight = height - paddingY * 2;
  const dx = width / (pointCount - 1);

  // Map dataPoints to (x, y) coordinates
  const coords = dataPoints.map((val, idx) => {
    const x = idx * dx;
    const y = height - paddingY - val * effectiveHeight;
    return { x, y };
  });

  // Calculate position of latest point at the right boundary
  const targetX = width;
  const latestNorm = (currentVal - minVal) / (maxVal - minVal);
  const targetY = height - paddingY - latestNorm * effectiveHeight;

  // Build cubic bezier curve string
  const buildSmoothPath = (points) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      // Catmull-Rom to Cubic Bezier control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePathD = buildSmoothPath(coords);
  const areaPathD = coords.length > 0 
    ? `${linePathD} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`
    : '';

  // Shift offset in pixels
  const shiftX = -animOffset * dx;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'hidden' }}
      >
        <defs>
          {/* Neon Glow Filter using feDropShadow & Gaussian Blur */}
          <filter id="stream-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={glowColor} floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="0.4" />
          </filter>

          {/* Stroke Gradient */}
          <linearGradient id="stream-stroke-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.6" />
            <stop offset="70%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={strokeGradientEnd} stopOpacity="1" />
          </linearGradient>

          {/* Area Fill Gradient */}
          <linearGradient id="stream-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
            <stop offset="60%" stopColor={strokeColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Grid Guides */}
        <line x1="0" y1={paddingY} x2={width} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
        <line x1="0" y1={height - paddingY} x2={width} y2={height - paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

        {/* Streaming Path with Linear Continuous X-Shift */}
        <g transform={`translate(${shiftX.toFixed(2)}, 0)`}>
          {/* Gradient Fill Area */}
          <path d={areaPathD} fill="url(#stream-area-grad)" />

          {/* Neon Glow & Main Stroke */}
          <path
            d={linePathD}
            fill="none"
            stroke="url(#stream-stroke-grad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#stream-neon-glow)"
          />
        </g>

        {/* Leading Indicator: Pulsating Glowing Dot at latest rightmost point */}
        <g transform={`translate(${targetX - 4}, ${targetY})`}>
          {/* Animated Pulsating Radar Ring */}
          <motion.circle
            cx="0"
            cy="0"
            animate={{
              r: [4, 15],
              opacity: [0.9, 0],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
          />

          {/* Secondary Pulse */}
          <motion.circle
            cx="0"
            cy="0"
            animate={{
              r: [3, 10],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 1.4,
              delay: 0.3,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            fill="none"
            stroke="#00F0FF"
            strokeWidth="1.5"
          />

          {/* Outer Glowing Dot */}
          <circle
            cx="0"
            cy="0"
            r="4.5"
            fill={strokeColor}
            filter="url(#stream-neon-glow)"
          />

          {/* Center White Nucleus */}
          <circle
            cx="0"
            cy="0"
            r="2"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
};

export default StreamingLineChart;
