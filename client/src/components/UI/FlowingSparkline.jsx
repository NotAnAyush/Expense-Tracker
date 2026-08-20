import React, { useEffect, useRef, useState, useId } from 'react';
import { motion } from 'framer-motion';

/**
 * FlowingSparkline: Continuously flowing, real-time undulating sparkline chart
 * with continuous leftward running waves, neon gradient strokes, feDropShadow glow,
 * flowing energy laser dashes, and a pulsating leading indicator dot.
 */
export const FlowingSparkline = ({
  data = [14, 18, 16, 24, 20, 28, 25, 32, 29, 36],
  color = '#00FF87',
  glowColor = 'rgba(0, 255, 135, 0.4)',
  height = 36,
  width = 200,
}) => {
  const chartId = useId().replace(/:/g, '_');
  const [phase, setPhase] = useState(0);
  const [leadingY, setLeadingY] = useState(0);
  const animFrameRef = useRef(null);

  // Normalize data points to fit within height viewBox (0 to 40)
  const basePoints = data && data.length > 1 ? data : [15, 20, 18, 25, 22, 30, 28, 35];
  const pointCount = basePoints.length;

  useEffect(() => {
    let start = performance.now();

    const loop = (time) => {
      const elapsed = (time - start) / 1000;
      setPhase(elapsed);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute undulating wave points with continuous running phase
  const coords = basePoints.map((val, i) => {
    const x = (i / (pointCount - 1)) * width;
    // Base Y inverted for SVG (0 at top, 40 at bottom)
    const rawY = 40 - Math.min(36, Math.max(4, val));
    // Continuous flowing wave undulation
    const wave = Math.sin(phase * 3.2 - i * 0.75) * 2.8 + Math.cos(phase * 2.1 + i * 0.4) * 1.2;
    const y = Math.max(3, Math.min(37, rawY + wave));
    return { x, y };
  });

  // Calculate smooth cubic bezier path
  const buildSmoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(coords);
  const areaPath = coords.length > 0
    ? `${linePath} L ${width} 40 L 0 40 Z`
    : '';

  const latestPoint = coords[coords.length - 1] || { x: width, y: 20 };

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} 40`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Subtle Glow Filter */}
          <filter id={`sparkGlow-${chartId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={color} floodOpacity="0.8" />
          </filter>

          {/* Area Fill Gradient */}
          <linearGradient id={`flowingGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="60%" stopColor={color} stopOpacity={0.08} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>

          {/* Stroke Gradient */}
          <linearGradient id={`flowingStrokeGrad-${chartId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="70%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity={1} />
          </linearGradient>
        </defs>

        {/* Dynamic Wave Area Fill */}
        <path d={areaPath} fill={`url(#flowingGrad-${chartId})`} />

        {/* Ambient Glow Base Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#sparkGlow-${chartId})`}
          opacity={0.85}
        />

        {/* Crisp Foreground Line */}
        <path
          d={linePath}
          fill="none"
          stroke={`url(#flowingStrokeGrad-${chartId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Continuous Flowing Laser Energy Stream along the path */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="24 80"
          animate={{ strokeDashoffset: [208, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'linear',
          }}
          opacity={0.9}
        />

        {/* Leading Indicator: Pulsating Glowing Dot at right end */}
        <g transform={`translate(${latestPoint.x - 2}, ${latestPoint.y})`}>
          {/* Outer Pulsating Ring */}
          <motion.circle
            cx="0"
            cy="0"
            animate={{
              r: [2.5, 7.5],
              opacity: [0.9, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />

          {/* Solid Glowing Core */}
          <circle
            cx="0"
            cy="0"
            r="3"
            fill={color}
            filter={`url(#sparkGlow-${chartId})`}
          />

          {/* White Center Spec */}
          <circle
            cx="0"
            cy="0"
            r="1.4"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
};

export default FlowingSparkline;
