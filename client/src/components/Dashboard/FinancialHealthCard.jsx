import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Sparkles, Target, Zap, ArrowRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePrivacy } from '../../context/PrivacyContext';

export const FinancialHealthCard = ({ healthData }) => {
  const { isPrivacyMaskActive } = usePrivacy();

  if (!healthData) return null;

  const { score = 75, tier = 'Optimized', tierBadge = '💎 Wealth Optimizer', tierDescription = '', pillars = {}, actionableLevers = [] } = healthData;

  // Compute SVG Circle properties
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Determine score color theme
  let scoreColor = '#00FF87';
  if (score >= 85) scoreColor = '#FFD700'; // Sovereign Gold
  else if (score >= 65) scoreColor = '#00FF87'; // Optimized Mint
  else if (score >= 40) scoreColor = '#00F0FF'; // Builder Cyan
  else scoreColor = '#FF7D7D'; // Novice Coral

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '24px 28px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(16, 24, 40, 0.95) 0%, rgba(10, 14, 26, 0.98) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.09)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '220px',
          height: '220px',
          borderRadius: '999px',
          background: `radial-gradient(circle, ${scoreColor}25, transparent 70%)`,
          filter: 'blur(35px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: scoreColor,
                background: `${scoreColor}18`,
                border: `1px solid ${scoreColor}40`,
                padding: '3px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              FHI Wealth Index
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Deterministic 5-Pillar Score</span>
          </div>
          <h2 className="heading-xl" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Financial Health Index
          </h2>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', marginTop: '4px', maxWidth: '540px' }}>
            {tierDescription}
          </p>
        </div>

        {/* Tier Badge Pill */}
        <div
          style={{
            padding: '8px 16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 800,
            color: '#F8FAFC',
          }}
        >
          <Award size={16} color={scoreColor} />
          <span>{tierBadge}</span>
        </div>
      </div>

      {/* Center Layout: Radial Meter & 5 Pillar Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'center' }}>
        {/* Radial SVG Dial */}
        <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="10"
            />
            {/* Animated Progress Arc */}
            <motion.circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke={scoreColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${scoreColor}80)` }}
            />
          </svg>

          {/* Center Score Text */}
          <div style={{ position: 'absolute', textAlign: 'center' }} className={isPrivacyMaskActive ? 'privacy-masked' : ''}>
            <div style={{ fontSize: '34px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>
              Out of 100
            </div>
          </div>
        </div>

        {/* 5-Pillar Score Meters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(pillars).map(([key, p]) => {
            const pct = Math.round((p.score / p.max) * 100);
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#94A3B8' }}>
                  <span style={{ fontWeight: 600, color: '#E2E8F0' }}>{p.label}</span>
                  <span style={{ fontWeight: 700, color: pct >= 80 ? '#00FF87' : pct >= 50 ? '#00F0FF' : '#FF7D7D' }}>
                    {p.score} / {p.max} pts ({pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: pct >= 80 ? 'linear-gradient(90deg, #00FF87, #60EFFF)' : pct >= 50 ? 'linear-gradient(90deg, #00F0FF, #7000FF)' : 'linear-gradient(90deg, #FF416C, #FF4B2B)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Wealth Levers Strip */}
      {actionableLevers.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} /> Actionable High-Impact Levers
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {actionableLevers.map((lever, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>{lever.title}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', border: '1px solid rgba(0, 255, 135, 0.3)' }}>
                    +{lever.potentialGain} pts
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                  {lever.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
