import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountUp } from './CountUp';

/**
 * Animated SVG Donut Chart with progressive clockwise stroke-dasharray animations,
 * elastic bounce transitions, hover micro-interactions, and center spring CountUp.
 */
export const AnimatedDonut = ({
  data = [],
  totalSpend = 0,
  isPrivacyMaskActive = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative rotation offset for clockwise progressive placement
  let accumulatedPercent = 0;
  const segments = data.map((item, idx) => {
    const startAngle = accumulatedPercent * 3.6 - 90; // Start at top (-90deg)
    const arcLength = (item.percentage / 100) * circumference;
    const gap = data.length > 1 ? 4 : 0;
    const visibleLength = Math.max(0, arcLength - gap);
    accumulatedPercent += item.percentage;

    return {
      ...item,
      index: idx,
      startAngle,
      arcLength: visibleLength,
    };
  });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Animated progressive clockwise segments */}
        {segments.map((seg, idx) => {
          const isHovered = hoveredIndex === idx;

          return (
            <motion.circle
              key={seg.name || idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeLinecap="round"
              transform={`rotate(${seg.startAngle} ${size / 2} ${size / 2})`}
              initial={{
                strokeDasharray: `0 ${circumference}`,
                opacity: 0,
              }}
              animate={{
                strokeDasharray: `${seg.arcLength} ${circumference}`,
                opacity: 1,
              }}
              transition={{
                delay: 0.15 + idx * 0.14,
                duration: 1.1,
                // Slight elastic bounce curve
                ease: [0.34, 1.4, 0.64, 1],
              }}
              style={{
                cursor: 'pointer',
                filter: isHovered ? `drop-shadow(0 0 8px ${seg.color}80)` : 'none',
                transition: 'stroke-width 0.2s ease, filter 0.2s ease',
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
            />
          );
        })}
      </svg>

      {/* Center Stat Overlay with Spring CountUp */}
      <div
        style={{
          position: 'absolute',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        className={isPrivacyMaskActive ? 'privacy-masked' : ''}
      >
        <div
          style={{
            fontSize: '9.5px',
            color: '#64748B',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '2px',
          }}
        >
          {hoveredIndex !== null ? segments[hoveredIndex]?.name : 'Total Spend'}
        </div>
        <div
          className="font-display tabular-nums"
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: hoveredIndex !== null ? segments[hoveredIndex]?.color : '#00FF87',
            lineHeight: 1.1,
            transition: 'color 0.2s ease',
          }}
        >
          {hoveredIndex !== null ? (
            `₹${segments[hoveredIndex]?.value?.toLocaleString()}`
          ) : (
            <CountUp value={totalSpend} prefix="₹" />
          )}
        </div>
        {hoveredIndex !== null && (
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
            {segments[hoveredIndex]?.percentage}% of spend
          </div>
        )}
      </div>

      {/* Dynamic Floating Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && segments[hoveredIndex] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: Math.max(10, Math.min(size - 60, mousePos.y - 45)),
              left: Math.max(10, Math.min(size - 100, mousePos.x - 50)),
              background: 'rgba(12, 16, 26, 0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${segments[hoveredIndex].color}`,
              borderRadius: '10px',
              padding: '6px 10px',
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 12px ${segments[hoveredIndex].color}40`,
              color: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '16px' }}>{segments[hoveredIndex].emoji}</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>
                {segments[hoveredIndex].name}
              </div>
              <div className="font-display tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: segments[hoveredIndex].color }}>
                ₹{segments[hoveredIndex].value.toLocaleString()} ({segments[hoveredIndex].percentage}%)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDonut;
