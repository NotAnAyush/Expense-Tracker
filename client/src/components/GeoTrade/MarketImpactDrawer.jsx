import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BarChart3, 
  ShieldAlert, 
  ChevronRight
} from 'lucide-react';

const FinancialCandlestickCanvas = ({ data = [], symbol, changePct = 0 }) => {
  const canvasRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [crosshairPos, setCrosshairPos] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 400;
    const height = canvas.clientHeight || 200;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padTop = 24;
    const padBottom = 24;
    const padRight = 50;
    const padLeft = 8;
    const chartWidth = width - padLeft - padRight;
    const chartHeight = height - padTop - padBottom;
    const volumeHeight = chartHeight * 0.22;
    const priceHeight = chartHeight * 0.75;

    const allHighs = data.map((d) => d.high);
    const allLows = data.map((d) => d.low);
    const minPrice = Math.min(...allLows) * 0.995;
    const maxPrice = Math.max(...allHighs) * 1.005;
    const priceRange = maxPrice - minPrice || 1;
    const maxVol = Math.max(...data.map((d) => d.volume || 1000));

    // Horizontal Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = padTop + (priceHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      const priceVal = maxPrice - (priceRange / gridSteps) * i;
      ctx.fillStyle = '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(priceVal.toFixed(2), width - padRight + 4, y + 3);
    }

    const barCount = data.length;
    const barSpacing = chartWidth / barCount;
    const candleWidth = Math.max(2, barSpacing * 0.65);

    data.forEach((d, idx) => {
      const x = padLeft + idx * barSpacing + barSpacing / 2;
      const isUp = d.close >= d.open;
      const candleColor = isUp ? '#22c55e' : '#ef4444';

      const openY = padTop + priceHeight - ((d.open - minPrice) / priceRange) * priceHeight;
      const closeY = padTop + priceHeight - ((d.close - minPrice) / priceRange) * priceHeight;
      const highY = padTop + priceHeight - ((d.high - minPrice) / priceRange) * priceHeight;
      const lowY = padTop + priceHeight - ((d.low - minPrice) / priceRange) * priceHeight;

      // 1. Wick Line
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // 2. Candle Body
      ctx.fillStyle = candleColor;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // 3. Volume Bar
      const volH = ((d.volume || 1000) / maxVol) * volumeHeight;
      const volY = height - padBottom - volH;
      ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volH);
    });

    // Crosshair
    if (crosshairPos) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(crosshairPos.x, padTop);
      ctx.lineTo(crosshairPos.x, height - padBottom);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padLeft, crosshairPos.y);
      ctx.lineTo(width - padRight, crosshairPos.y);
      ctx.stroke();
      ctx.restore();
    }
  }, [data, crosshairPos]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padLeft = 8;
    const padRight = 50;
    const chartWidth = canvas.clientWidth - padLeft - padRight;
    const barSpacing = chartWidth / data.length;

    const idx = Math.floor((x - padLeft) / barSpacing);
    if (idx >= 0 && idx < data.length) {
      setHoveredBar(data[idx]);
      setCrosshairPos({ x: padLeft + idx * barSpacing + barSpacing / 2, y });
    }
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
    setCrosshairPos(null);
  };

  const isPositive = changePct >= 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'rgba(7, 9, 26, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '14px',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Chart Top Header & OHLC Stats */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.4)',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>{symbol}</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '6px',
              background: isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isPositive ? '#4ade80' : '#f87171',
              border: isPositive ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)'
            }}
          >
            {isPositive ? '▲ +' : '▼ '}{changePct.toFixed(2)}%
          </span>
        </div>

        {hoveredBar ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8' }}>
            <span>O: <strong style={{ color: '#ffffff' }}>{hoveredBar.open.toFixed(2)}</strong></span>
            <span>H: <strong style={{ color: '#ffffff' }}>{hoveredBar.high.toFixed(2)}</strong></span>
            <span>L: <strong style={{ color: '#ffffff' }}>{hoveredBar.low.toFixed(2)}</strong></span>
            <span>C: <strong style={{ color: '#00f0ff' }}>{hoveredBar.close.toFixed(2)}</strong></span>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748b' }}>
            Hover over candles to inspect OHLC
          </div>
        )}
      </div>

      {/* Main Canvas Viewport */}
      <div style={{ position: 'relative', flex: 1, minHeight: '180px' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        />
      </div>
    </div>
  );
};

export const MarketImpactDrawer = ({
  countryIso,
  impactData,
  loading,
  onClose,
  onViewSignalsForAsset
}) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const quotes = impactData?.quotes || [];
  const charts = impactData?.charts || {};
  const sectorExposure = impactData?.sector_exposure || {};

  useEffect(() => {
    if (quotes.length > 0 && !selectedAsset) {
      setSelectedAsset(quotes[0].symbol);
    }
  }, [quotes, selectedAsset]);

  const activeQuote = quotes.find((q) => q.symbol === selectedAsset) || quotes[0];
  const activeCandles = charts[selectedAsset] || [];

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '520px',
        zIndex: 50,
        background: 'rgba(7, 9, 26, 0.96)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f0ff',
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '13px'
            }}
          >
            {countryIso || 'IN'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '15px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {impactData?.name || countryIso}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
              <span>GTI:</span>
              <span style={{ fontWeight: 800, color: (impactData?.gti_score ?? 0) >= 80 ? '#ef4444' : (impactData?.gti_score ?? 0) >= 60 ? '#f59e0b' : '#22c55e' }}>
                {(impactData?.gti_score ?? 0).toFixed(1)} / 100
              </span>
              <span>·</span>
              <span>{impactData?.status}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close Drawer"
        >
          <X size={16} />
        </button>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #00f0ff', borderTopColor: 'transparent' }} className="animate-spin" />
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
            Fetching macroeconomic asset impact...
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }} className="custom-scrollbar">
          {/* Primary Threat / Risk Banner */}
          {impactData?.primary_risk && (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <ShieldAlert size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: '#fcd34d', display: 'block', marginBottom: '2px' }}>
                  Primary Geopolitical Threat Driver
                </span>
                <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', margin: 0 }}>
                  {impactData.primary_risk}
                </p>
              </div>
            </div>
          )}

          {/* Correlated Financial Instruments Selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8' }}>
                Correlated Financial Assets
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                Select to view candlestick chart
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {quotes.map((q) => {
                const isSelected = q.symbol === selectedAsset;
                const isUp = q.change_pct >= 0;

                return (
                  <button
                    key={q.symbol}
                    onClick={() => setSelectedAsset(q.symbol)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: isSelected ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid rgba(0, 240, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: isSelected ? '0 0 14px rgba(0, 240, 255, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: '#ffffff' }}>
                        {q.symbol}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#64748b' }}>
                        {q.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f8fafc', fontWeight: 700 }}>
                        ${q.price.toFixed(q.symbol === 'NATGAS' || q.symbol === 'COPPER' ? 3 : 2)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 800, color: isUp ? '#4ade80' : '#f87171' }}>
                        {isUp ? '+' : ''}{q.change_pct.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Candlestick Financial Chart */}
          <div style={{ height: '240px' }}>
            {activeQuote && (
              <FinancialCandlestickCanvas
                data={activeCandles}
                symbol={activeQuote.symbol}
                changePct={activeQuote.change_pct}
              />
            )}
          </div>

          {/* Sector Exposure Breakdown */}
          {Object.keys(sectorExposure).length > 0 && (
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={14} style={{ color: '#00f0ff' }} />
                Sovereign Sector Risk Sensitivity
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(sectorExposure).map(([secName, weight]) => {
                  const pct = Math.round(weight * 100);
                  return (
                    <div key={secName} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#cbd5e1' }}>{secName}</span>
                        <span style={{ color: '#ffffff', fontWeight: 800 }}>{pct}% Exposure</span>
                      </div>
                      <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #00f0ff 0%, #00ff87 100%)' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action CTA to Jump into AI Signal */}
          <div style={{ paddingTop: '8px' }}>
            <button
              onClick={() => onViewSignalsForAsset && onViewSignalsForAsset(selectedAsset)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(0, 240, 255, 0.25)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span>View AI Trade Setups for {selectedAsset}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
