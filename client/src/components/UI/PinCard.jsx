import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, ArrowUpRight } from 'lucide-react';
import { CountUp } from './CountUp';
import { FlowingSparkline } from './FlowingSparkline';

export const PinCard = ({
  title,
  subtitle,
  amount,
  currency = '₹',
  category,
  date,
  overlayPill,
  pillColor = 'mint', // 'mint' | 'gold' | 'amber' | 'violet' | 'emerald' | 'cyan' | 'rose'
  sparklineData,
  radialProgress,
  trendDirection,
  trendPercent,
  actionLabel,
  onAction,
  children,
}) => {
  const cardId = useId().replace(/:/g, '_');

  const getBadgeStyle = () => {
    switch (pillColor) {
      case 'gold':
        return { bg: 'rgba(255, 215, 0, 0.1)', border: 'rgba(255, 215, 0, 0.25)', text: '#FFD700', glow: 'rgba(255, 215, 0, 0.15)' };
      case 'amber':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)', text: '#F59E0B', glow: 'rgba(245, 158, 11, 0.15)' };
      case 'violet':
        return { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)', text: '#A78BFA', glow: 'rgba(139, 92, 246, 0.18)' };
      case 'emerald':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', text: '#10B981', glow: 'rgba(16, 185, 129, 0.15)' };
      case 'cyan':
        return { bg: 'rgba(0, 240, 255, 0.1)', border: 'rgba(0, 240, 255, 0.25)', text: '#00F0FF', glow: 'rgba(0, 240, 255, 0.15)' };
      case 'rose':
        return { bg: 'rgba(244, 63, 94, 0.1)', border: 'rgba(244, 63, 94, 0.25)', text: '#FB7185', glow: 'rgba(244, 63, 94, 0.15)' };
      case 'mint':
      default:
        return { bg: 'rgba(0, 255, 135, 0.1)', border: 'rgba(0, 255, 135, 0.25)', text: '#00FF87', glow: 'rgba(0, 255, 135, 0.15)' };
    }
  };

  const badgeStyle = getBadgeStyle();
  const validProgress = typeof radialProgress === 'number' && !isNaN(radialProgress) ? radialProgress : null;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card glass-card-hover-border"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background shimmer glow behind metrics */}
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${badgeStyle.glow} 0%, transparent 70%)`,
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div className="ambient-card-glow-shimmer" />

      {/* Top Header Row with Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94A3B8' }}>
          {title}
        </span>

        {(overlayPill || category) && (
          <div
            style={{
              padding: '2px 8px',
              borderRadius: '999px',
              background: badgeStyle.bg,
              border: `1px solid ${badgeStyle.border}`,
              color: badgeStyle.text,
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {overlayPill || category}
          </div>
        )}
      </div>

      {/* Main Numeric Value & Trend */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
        {amount !== undefined && (
          <div
            className="font-display tabular-nums"
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
            }}
          >
            <CountUp value={amount} prefix={currency} />
          </div>
        )}

        {/* Trend Indicator */}
        {trendPercent !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11.5px',
              fontWeight: 700,
              color: trendDirection === 'down' ? '#10B981' : '#F59E0B',
              background: trendDirection === 'down' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            {trendDirection === 'down' ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {trendPercent}%
          </div>
        )}
      </div>

      {/* Continuously Flowing Running Sparkline Chart */}
      {sparklineData && Array.isArray(sparklineData) && sparklineData.length > 1 && (
        <div style={{ width: '100%', height: '34px', margin: '4px 0', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
          <FlowingSparkline
            data={sparklineData}
            color={badgeStyle.text}
            height={34}
            width={200}
          />
        </div>
      )}

      {/* Progress Bar with Staggered Width Animation */}
      {validProgress !== null && (
        <div style={{ margin: '6px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(validProgress, 100)}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: validProgress > 90 ? '#F43F5E' : validProgress > 75 ? '#F59E0B' : '#00FF87',
                borderRadius: '999px',
              }}
            />
          </div>
        </div>
      )}

      {/* Subtitle Footer */}
      {subtitle && (
        <p style={{ fontSize: '11.5px', color: '#64748B', marginTop: '4px', lineHeight: 1.35, position: 'relative', zIndex: 1 }}>
          {subtitle}
        </p>
      )}

      {children}

      {/* Date & Action */}
      {date && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: '11.5px', color: '#64748B' }}>{new Date(date).toLocaleDateString()}</span>
          {actionLabel && (
            <button
              onClick={onAction}
              className="btn-glass-secondary"
              style={{ height: '28px', padding: '2px 10px', fontSize: '11.5px', gap: '3px' }}
            >
              {actionLabel}
              <ArrowUpRight size={13} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
