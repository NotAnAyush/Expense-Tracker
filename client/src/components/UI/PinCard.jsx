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
  const cardId = useId().replace(/:/g, '_');

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
  const validProgress = typeof radialProgress === 'number' && !isNaN(radialProgress) ? radialProgress : null;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
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
        {trendPercent !== undefined && (
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

        {amount !== undefined && (
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
              {currency}{typeof amount === 'number' ? amount.toLocaleString() : amount}
            </span>
          </div>
        )}
      </div>

      {/* Continuously Animated Moving Sparkline Chart */}
      {sparklineData && Array.isArray(sparklineData) && sparklineData.length > 1 && (
        <div style={{ width: '100%', height: '42px', margin: '6px 0', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sparkGrad-${cardId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={badgeStyle.text} stopOpacity={0.35} />
                <stop offset="100%" stopColor={badgeStyle.text} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`lineGlow-${cardId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={badgeStyle.text} stopOpacity={0.4} />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity={1} />
                <stop offset="100%" stopColor={badgeStyle.text} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            {/* Area path */}
            <path
              d={`M 0 40 ${sparklineData.map((d, i) => `L ${(i / (sparklineData.length - 1)) * 200} ${40 - d}`).join(' ')} L 200 40 Z`}
              fill={`url(#sparkGrad-${cardId})`}
            />
            {/* Base stroke line */}
            <path
              d={`M 0 ${40 - sparklineData[0]} ${sparklineData.map((d, i) => `L ${(i / (sparklineData.length - 1)) * 200} ${40 - d}`).join(' ')}`}
              fill="none"
              stroke={badgeStyle.text}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Constantly Moving Light Pulse Line */}
            <motion.path
              d={`M 0 ${40 - sparklineData[0]} ${sparklineData.map((d, i) => `L ${(i / (sparklineData.length - 1)) * 200} ${40 - d}`).join(' ')}`}
              fill="none"
              stroke={`url(#lineGlow-${cardId})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60 140"
              animate={{ strokeDashoffset: [200, -200] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
            />
          </svg>
        </div>
      )}

      {/* Animated Radial / Meter Progress Bar */}
      {validProgress !== null && (
        <div style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>
            <span>Utilization Rate</span>
            <span style={{ color: badgeStyle.text }}>{validProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(validProgress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: validProgress > 85 ? 'linear-gradient(90deg, #FF9900, #F43F5E)' : `linear-gradient(90deg, ${badgeStyle.text}, #00FF87)`,
                borderRadius: '999px',
                boxShadow: `0 0 10px ${badgeStyle.text}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Continuous Light Shimmer Animation across line */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '50%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
                }}
              />
            </motion.div>
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
