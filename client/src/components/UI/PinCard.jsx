import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, ArrowUpRight } from 'lucide-react';

export const PinCard = ({
  title,
  subtitle,
  amount,
  currency = '₹',
  category,
  date,
  overlayPill,
  pillColor = 'mint', // 'mint' | 'gold' | 'amber' | 'violet' | 'emerald' | 'cyan'
  sparklineData,
  radialProgress,
  trendDirection,
  trendPercent,
  actionLabel,
  onAction,
  children,
}) => {
  const rawId = useId();
  const gradientId = 'spark_' + rawId.replace(/[^a-zA-Z0-9]/g, '');

  // Determine badge styling based on pillColor token
  const getBadgeStyle = () => {
    switch (pillColor) {
      case 'gold':
        return { bg: 'rgba(255, 215, 0, 0.15)', border: 'rgba(255, 215, 0, 0.4)', text: '#FFD700' };
      case 'amber':
        return { bg: 'rgba(255, 153, 0, 0.15)', border: 'rgba(255, 153, 0, 0.4)', text: '#FF9900' };
      case 'violet':
        return { bg: 'rgba(121, 40, 202, 0.2)', border: 'rgba(121, 40, 202, 0.4)', text: '#9D4EDD' };
      case 'emerald':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#10B981' };
      case 'cyan':
        return { bg: 'rgba(0, 240, 255, 0.15)', border: 'rgba(0, 240, 255, 0.4)', text: '#00F0FF' };
      case 'mint':
      default:
        return { bg: 'rgba(0, 255, 135, 0.15)', border: 'rgba(0, 255, 135, 0.4)', text: '#00FF87' };
    }
  };

  const badgeStyle = getBadgeStyle();

  // Helper to generate seamless repeating wave paths for smooth 60fps horizontal motion
  const generateWavePaths = (data) => {
    if (!data || !Array.isArray(data) || data.length < 2) return null;
    
    // Duplicate data array for seamless repeating waveform
    const dataRepeated = [...data, ...data];
    const totalPoints = dataRepeated.length;
    const maxIdx = Math.max(totalPoints - 1, 1);
    
    const p = dataRepeated.map((val, i) => {
      const x = (i / maxIdx) * 400;
      const safeVal = typeof val === 'number' && !isNaN(val) ? val : 20;
      const y = 40 - Math.min(Math.max(safeVal, 4), 36);
      return [x, y];
    });

    const strokeD = `M 0 ${p[0][1]} ${p.map(pt => `L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ')}`;
    const fillD = `M 0 40 ${p.map(pt => `L ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' ')} L 400 40 Z`;

    return { strokeD, fillD };
  };

  const wavePaths = generateWavePaths(sparklineData);

  // Validate radial progress percentage to avoid NaN
  const validRadialProgress = (radialProgress === undefined || radialProgress === null || isNaN(radialProgress))
    ? null
    : Math.min(Math.max(Math.round(radialProgress), 0), 100);

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 14px 36px rgba(0,0,0,0.6)' }}
      className="glass-card"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      {/* Top Header Row with Badge & Amount */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        {(overlayPill || category) && (
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              background: badgeStyle.bg,
              border: `1px solid ${badgeStyle.border}`,
              color: badgeStyle.text,
              fontSize: '12px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <Zap size={12} />
            {overlayPill || category}
          </div>
        )}

        {/* Dynamic Trend Indicator if available */}
        {trendPercent !== undefined && !isNaN(trendPercent) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              color: trendDirection === 'down' ? '#10B981' : '#FF9900',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '3px 8px',
              borderRadius: '8px',
            }}
          >
            {trendDirection === 'down' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            {trendPercent}%
          </div>
        )}
      </div>

      {/* Main Title & Numeric Value */}
      <div style={{ marginBottom: '10px' }}>
        {title && (
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
            {title}
          </span>
        )}

        {amount !== undefined && amount !== null && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span
              className="font-display"
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#F1F5F9',
                letterSpacing: '-1px',
                lineHeight: 1.1,
              }}
            >
              {currency}{typeof amount === 'number' && !isNaN(amount) ? amount.toLocaleString() : amount}
            </span>
          </div>
        )}
      </div>

      {/* Continuously Animated Sparkline Line Chart (Seamless GPU Wave Motion) */}
      {wavePaths && (
        <div style={{ width: '100%', height: '42px', margin: '6px 0', overflow: 'hidden', position: 'relative' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id={`sparkGrad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={badgeStyle.text} stopOpacity={0.45} />
                <stop offset="100%" stopColor={badgeStyle.text} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Seamless 60fps Horizontal Wave Motion */}
            <motion.g
              animate={{ x: [0, -100] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            >
              <path d={wavePaths.fillD} fill={`url(#sparkGrad-${gradientId})`} />
              <path
                d={wavePaths.strokeD}
                fill="none"
                stroke={badgeStyle.text}
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${badgeStyle.text})`,
                }}
              />
            </motion.g>
          </svg>
        </div>
      )}

      {/* Radial Progress Ring / Animated Meter Bar if requested */}
      {validRadialProgress !== null && (
        <div style={{ margin: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginBottom: '5px' }}>
            <span>Utilization Rate</span>
            <span style={{ color: badgeStyle.text }}>{validRadialProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${validRadialProgress}%`,
                opacity: [0.85, 1, 0.85],
              }}
              transition={{
                width: { duration: 1, ease: 'easeOut' },
                opacity: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
              }}
              style={{
                height: '100%',
                background: validRadialProgress > 85
                  ? 'linear-gradient(90deg, #FF9900, #F43F5E)'
                  : `linear-gradient(90deg, ${badgeStyle.text}, #00FF87)`,
                borderRadius: '999px',
                boxShadow: `0 0 10px ${badgeStyle.text}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Subtitle / Footer Description */}
      {subtitle && (
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.4 }}>
          {subtitle}
        </p>
      )}

      {children}

      {/* Bottom Date & Action trigger */}
      {date && (
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748B' }}>{new Date(date).toLocaleDateString()}</span>
          {actionLabel && (
            <button
              onClick={onAction}
              className="btn-glass-secondary"
              style={{ height: '32px', padding: '4px 12px', fontSize: '12px', gap: '4px' }}
            >
              {actionLabel}
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
