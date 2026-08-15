import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

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

  // Determine badge styling based on dark theme tokens
  const getBadgeStyle = () => {
    switch (pillColor) {
      case 'gold':
      case 'amber':
        return { 
          bg: 'rgba(245, 158, 11, 0.15)', 
          border: 'rgba(245, 158, 11, 0.35)', 
          text: '#FBBF24',
          sparkLine: '#F59E0B',
          sparkFill: '#F59E0B'
        };
      case 'violet':
        return { 
          bg: 'rgba(139, 92, 246, 0.15)', 
          border: 'rgba(139, 92, 246, 0.35)', 
          text: '#A78BFA',
          sparkLine: '#8B5CF6',
          sparkFill: '#8B5CF6'
        };
      case 'emerald':
        return { 
          bg: 'rgba(16, 185, 129, 0.15)', 
          border: 'rgba(16, 185, 129, 0.35)', 
          text: '#34D399',
          sparkLine: '#10B981',
          sparkFill: '#10B981'
        };
      case 'cyan':
        return { 
          bg: 'rgba(6, 182, 212, 0.15)', 
          border: 'rgba(6, 182, 212, 0.35)', 
          text: '#22D3EE',
          sparkLine: '#06B6D4',
          sparkFill: '#06B6D4'
        };
      case 'rose':
        return { 
          bg: 'rgba(244, 63, 94, 0.15)', 
          border: 'rgba(244, 63, 94, 0.35)', 
          text: '#FB7185',
          sparkLine: '#F43F5E',
          sparkFill: '#F43F5E'
        };
      case 'mint':
      default:
        return { 
          bg: 'rgba(0, 255, 135, 0.12)', 
          border: 'rgba(0, 255, 135, 0.3)', 
          text: '#00FF87',
          sparkLine: '#00FF87',
          sparkFill: '#00FF87'
        };
    }
  };

  const badgeStyle = getBadgeStyle();
  const validProgress = typeof radialProgress === 'number' && !isNaN(radialProgress) ? radialProgress : null;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
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
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: badgeStyle.sparkLine, boxShadow: `0 0 8px ${badgeStyle.sparkLine}` }} />
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
              color: trendDirection === 'down' ? '#34D399' : '#FBBF24',
              background: trendDirection === 'down' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              border: `1px solid ${trendDirection === 'down' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              padding: '3px 8px',
              borderRadius: '8px',
            }}
          >
            {trendDirection === 'down' ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {trendPercent}%
          </div>
        )}
      </div>

      {/* Main Title & Numeric Value */}
      <div style={{ marginBottom: '10px' }}>
        {title && (
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
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
                color: 'var(--color-text-main)',
                letterSpacing: '-0.5px',
                lineHeight: 1.15,
              }}
            >
              {currency}{typeof amount === 'number' ? amount.toLocaleString() : amount}
            </span>
          </div>
        )}
      </div>

      {/* Sleek Glowing Sparkline Chart */}
      {sparklineData && Array.isArray(sparklineData) && sparklineData.length > 1 && (
        <div style={{ width: '100%', height: '40px', margin: '8px 0', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sparkGrad-${cardId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={badgeStyle.sparkLine} stopOpacity={0.3} />
                <stop offset="100%" stopColor={badgeStyle.sparkLine} stopOpacity={0.0} />
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
              stroke={badgeStyle.sparkLine}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Rounded Progress Bar */}
      {validProgress !== null && (
        <div style={{ margin: '10px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '5px' }}>
            <span>Utilization Rate</span>
            <span style={{ color: badgeStyle.text, fontWeight: 700 }}>{validProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', position: 'relative' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(validProgress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: validProgress > 90 ? 'linear-gradient(90deg, #F59E0B, #F43F5E)' : `linear-gradient(90deg, ${badgeStyle.sparkLine}, #06B6D4)`,
                borderRadius: '999px',
                boxShadow: `0 0 8px ${badgeStyle.sparkLine}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Subtitle / Footer Description */}
      {subtitle && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
          {subtitle}
        </p>
      )}

      {children}

      {/* Bottom Date & Action trigger */}
      {date && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>{new Date(date).toLocaleDateString()}</span>
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
