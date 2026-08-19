import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Sparkles, Target, Zap, ArrowRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from '../UI/CountUp';
import { usePrivacy } from '../../context/PrivacyContext';

export const FinancialHealthCard = ({ healthData }) => {
  const { isPrivacyMaskActive } = usePrivacy();

  if (!healthData) return null;

  const { score = 75, tier = 'Optimized', tierBadge = '💎 Wealth Optimizer', tierDescription = '', pillars = {}, actionableLevers = [] } = healthData;

  // Compute SVG Circle properties
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Determine score color theme
  let scoreColor = '#00FF87';
  if (score >= 85) scoreColor = '#FFD700'; // Sovereign Gold
  else if (score >= 65) scoreColor = '#00FF87'; // Optimized Mint
  else if (score >= 40) scoreColor = '#00F0FF'; // Builder Cyan
  else scoreColor = '#FB7185'; // Novice Coral

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card glass-card-hover-border"
      style={{
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: scoreColor,
                background: `${scoreColor}15`,
                border: `1px solid ${scoreColor}35`,
                padding: '2px 8px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              FHI Index
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>5-Pillar Financial Health</span>
          </div>
          <h2 className="heading-lg" style={{ margin: 0 }}>
            Financial Health Index
          </h2>
          <p style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '2px', maxWidth: '520px' }}>
            {tierDescription}
          </p>
        </div>

        {/* Tier Badge Pill */}
        <div
          style={{
            padding: '6px 12px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#F8FAFC',
          }}
        >
          <Award size={14} color={scoreColor} />
          <span>{tierBadge}</span>
        </div>
      </div>

      {/* Center Layout: Radial Meter & 5 Pillar Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'center' }}>
        {/* Radial SVG Dial */}
        <div style={{ position: 'relative', width: '116px', height: '116px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="116" height="116" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="58"
              cy="58"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="8"
            />
            <motion.circle
              cx="58"
              cy="58"
              r={radius}
              fill="transparent"
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Score with Spring CountUp */}
          <div style={{ position: 'absolute', textAlign: 'center' }} className={isPrivacyMaskActive ? 'privacy-masked' : ''}>
            <div className="font-display tabular-nums" style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
              <CountUp value={score} />
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
              / 100
            </div>
          </div>
        </div>

        {/* 5-Pillar Score Meters with Staggered Sequence Delays */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(pillars).map(([key, p], idx) => {
            const pct = Math.round((p.score / p.max) * 100);
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ fontWeight: 600, color: '#E2E8F0' }}>{p.label}</span>
                  <span className="tabular-nums" style={{ fontWeight: 700, color: pct >= 80 ? '#00FF87' : pct >= 50 ? '#00F0FF' : '#FB7185' }}>
                    <CountUp value={p.score} />/{p.max} pts ({pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '5px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.85, delay: 0.1 + idx * 0.1, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: pct >= 80 ? '#00FF87' : pct >= 50 ? '#00F0FF' : '#F43F5E',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Wealth Levers */}
      {actionableLevers.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={13} /> High-Impact Wealth Levers
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {actionableLevers.map((lever, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9' }}>{lever.title}</span>
                  <span className="tabular-nums" style={{ fontSize: '10.5px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: 'rgba(0, 255, 135, 0.12)', color: '#00FF87' }}>
                    +{lever.potentialGain} pts
                  </span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, lineHeight: 1.35 }}>
                  {lever.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
