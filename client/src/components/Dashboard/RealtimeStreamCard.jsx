import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp, Radio, ArrowUpRight } from 'lucide-react';
import { StreamingLineChart } from '../UI/StreamingLineChart';
import { CountUp } from '../UI/CountUp';

/**
 * RealtimeStreamCard: Dark-mode dashboard card showcasing continuous real-time
 * streaming telemetry with neon green glow and spring dynamics.
 */
export const RealtimeStreamCard = ({
  title = 'Live Cashflow & Velocity Stream',
  subtitle = 'Real-time high-frequency ledger pacing and liquidity telemetry',
}) => {
  const [liveValue, setLiveValue] = useState(4200);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card glass-card-hover-border"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%)',
              border: '1px solid rgba(0, 255, 135, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 255, 135, 0.2)',
            }}
          >
            <Activity size={20} color="#00FF87" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                {title}
              </h3>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(0, 255, 135, 0.12)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  color: '#00FF87',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                }}
              >
                <span className="animate-live-dot" />
                Live 60fps
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>{subtitle}</span>
          </div>
        </div>

        {/* Live Metric Display */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Instantaneous Burn Pace
          </div>
          <div className="font-display tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#00FF87', lineHeight: 1.1 }}>
            <CountUp value={Math.round(liveValue)} prefix="₹" suffix="/day" duration={0.8} />
          </div>
        </div>
      </div>

      {/* Streaming Real-Time Line Chart */}
      <div style={{ position: 'relative', width: '100%', margin: '4px 0' }}>
        <StreamingLineChart
          height={130}
          minVal={1000}
          maxVal={8000}
          initialVal={4200}
          strokeColor="#00FF87"
          strokeGradientEnd="#00F0FF"
          glowColor="#00FF87"
          onValueChange={setLiveValue}
        />
      </div>

      {/* Bottom Telemetry Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Stream Frequency</span>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-mono)' }}>
            900ms / Tick
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Pacing Stability</span>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#00FF87' }}>
            Optimal (99.4%)
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Smoothing Physics</span>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#00F0FF', fontFamily: 'var(--font-mono)' }}>
            k=100, c=15
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RealtimeStreamCard;
