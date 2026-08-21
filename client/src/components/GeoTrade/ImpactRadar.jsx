import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';

const ASSET_SENSITIVITIES = [
  {
    symbol: 'XAUUSD',
    name: 'Spot Gold',
    category: 'Precious Metals',
    gti_beta: +0.84,
    direction: 'BULLISH ON GTI SPIKE',
    primary_driver: 'Military conflict, nuclear threats, sanctions, sovereign de-dollarization',
    avg_24h_return: '+4.6%',
    confidence: 'HIGH',
  },
  {
    symbol: 'USOIL',
    name: 'WTI Crude Oil',
    category: 'Energy',
    gti_beta: +0.78,
    direction: 'BULLISH ON GTI SPIKE',
    primary_driver: 'Middle East flare-ups, OPEC+ quota cuts, Hormuz/Malacca chokepoint transit risks',
    avg_24h_return: '+5.2%',
    confidence: 'HIGH',
  },
  {
    symbol: 'NATGAS',
    name: 'Natural Gas',
    category: 'Energy',
    gti_beta: +0.72,
    direction: 'BULLISH ON GTI SPIKE',
    primary_driver: 'European pipeline maintenance shutdowns, Baltic sea cable alerts, LNG carrier rerouting',
    avg_24h_return: '+6.1%',
    confidence: 'HIGH',
  },
  {
    symbol: 'LMT',
    name: 'Lockheed Martin',
    category: 'Defense Stock',
    gti_beta: +0.81,
    direction: 'BULLISH ON GTI SPIKE',
    primary_driver: 'NATO budget expansion, PAC-3 / THAAD missile replenishments, emergency defense aid',
    avg_24h_return: '+3.4%',
    confidence: 'VERY HIGH',
  },
  {
    symbol: 'SPX',
    name: 'S&P 500 Index',
    category: 'Equity Index',
    gti_beta: -0.68,
    direction: 'BEARISH ON GTI SPIKE',
    primary_driver: 'Risk-off liquidation, stagflation concerns, margin compression from energy input spikes',
    avg_24h_return: '-2.1%',
    confidence: 'HIGH',
  },
  {
    symbol: 'EURUSD',
    name: 'EUR / USD',
    category: 'Forex Major',
    gti_beta: -0.61,
    direction: 'BEARISH ON GTI SPIKE',
    primary_driver: 'European energy import costs rising, industrial manufacturing deceleration',
    avg_24h_return: '-1.2%',
    confidence: 'MEDIUM',
  },
  {
    symbol: 'NIFTY50',
    name: 'NSE Nifty 50 (India)',
    category: 'Domestic Equity',
    gti_beta: -0.35,
    direction: 'MILD BEARISH / DEFENSIVE',
    primary_driver: 'Crude oil import inflation bill vs strong domestic capital capex buffer',
    avg_24h_return: '-0.8%',
    confidence: 'MEDIUM',
  },
  {
    symbol: 'BTCUSD',
    name: 'Bitcoin',
    category: 'Digital Assets',
    gti_beta: +0.40,
    direction: 'VOLATILE / ASYMMETRIC',
    primary_driver: 'Banking sanction evasion, emergency capital flight vs speculative leverage flushes',
    avg_24h_return: '+4.8%',
    confidence: 'MEDIUM',
  }
];

export const ImpactRadar = ({ onSelectAsset }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Energy', 'Precious Metals', 'Defense Stock', 'Equity Index', 'Forex Major', 'Digital Assets'];

  const filteredAssets = ASSET_SENSITIVITIES.filter((a) => {
    if (selectedCategory === 'ALL') return true;
    return a.category === selectedCategory;
  });

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        background: '#03060f',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        userSelect: 'none'
      }}
      className="custom-scrollbar"
    >
      {/* Header Banner */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: '16px',
          background: 'rgba(7, 9, 26, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radar size={16} style={{ color: '#00f0ff' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00f0ff' }}>
            Cross-Asset Macroeconomic Sensitivity Matrix
          </span>
        </div>
        <h1 style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 900, color: '#ffffff', margin: 0 }}>
          GTI Correlation & Asset Transmission Radar
        </h1>
        <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '720px', lineHeight: '1.5', margin: 0 }}>
          Empirical asset beta (&beta;<sub>geo</sub>) measured against Global Tension Index (GTI) spikes. Shows the direction and typical 24-hour return magnitude when geopolitical crisis thresholds (GTI &ge; 70) are breached.
        </p>

        {/* Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                background: selectedCategory === cat ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#00f0ff' : '#94a3b8',
                border: selectedCategory === cat ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: selectedCategory === cat ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sensitivity Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {filteredAssets.map((asset) => {
          const isPositive = asset.gti_beta > 0;
          const absBeta = Math.abs(asset.gti_beta);

          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: 'rgba(7, 9, 26, 0.88)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Asset Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      {asset.symbol}
                    </h3>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' }}>
                      ({asset.name})
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748b' }}>{asset.category}</span>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: isPositive ? '#4ade80' : '#f87171',
                    border: isPositive ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)'
                  }}
                >
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{asset.direction}</span>
                </div>
              </div>

              {/* Beta Meter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#94a3b8' }}>Geopolitical Shock Beta (&beta;<sub>geo</sub>):</span>
                  <span style={{ fontWeight: 800, color: isPositive ? '#4ade80' : '#f87171' }}>
                    {asset.gti_beta > 0 ? '+' : ''}{asset.gti_beta.toFixed(2)}
                  </span>
                </div>
                <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                  <div 
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: isPositive ? 'linear-gradient(90deg, #10b981 0%, #4ade80 100%)' : 'linear-gradient(90deg, #f43f5e 0%, #f87171 100%)',
                      width: `${absBeta * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Avg 24h Shock Return</span>
                  <span style={{ fontWeight: 800, color: isPositive ? '#4ade80' : '#f87171' }}>
                    {asset.avg_24h_return}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Historical Conviction</span>
                  <span style={{ fontWeight: 800, color: '#00f0ff' }}>{asset.confidence}</span>
                </div>
              </div>

              {/* Primary Geopolitical Transmission Driver */}
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
                <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: '10px', display: 'block', marginBottom: '2px' }}>Key Transmission Channels:</strong>
                {asset.primary_driver}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
