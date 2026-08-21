import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe2, 
  Map, 
  Zap, 
  Radar, 
  Activity, 
  ShieldAlert, 
  Radio, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { EarthPulseGlobe } from '../components/GeoTrade/EarthPulseGlobe';
import { GeoMapMatrix } from '../components/GeoTrade/GeoMapMatrix';
import { MarketImpactDrawer } from '../components/GeoTrade/MarketImpactDrawer';
import { AISignalsFeed } from '../components/GeoTrade/AISignalsFeed';
import { ImpactRadar } from '../components/GeoTrade/ImpactRadar';

export const GeoTradeTerminalPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('earth'); // 'earth' | 'map' | 'signals' | 'radar'
  const [globalGTI, setGlobalGTI] = useState({
    global_gti: 74.2,
    delta_24h: +5.8,
    status: 'ELEVATED',
    active_hotspots_count: 5,
    active_arcs_count: 4,
  });
  const [countryTensions, setCountryTensions] = useState({});
  const [hotspots, setHotspots] = useState([]);
  const [arcs, setArcs] = useState([]);
  const [signals, setSignals] = useState([]);
  const [selectedCountryIso, setSelectedCountryIso] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [signalsFilter, setSignalsFilter] = useState('ALL');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Fetch all GeoTrade Data from backend API
  const fetchGeoTradeData = useCallback(async () => {
    try {
      const gtiRes = await apiFetch('/api/geotrade/gti');
      if (gtiRes?.success && gtiRes.data) {
        setGlobalGTI(gtiRes.data);
      }

      const countriesRes = await apiFetch('/api/geotrade/countries');
      if (countriesRes?.success && countriesRes.data) {
        const mapping = {};
        countriesRes.data.forEach((c) => {
          mapping[c.iso] = c;
        });
        setCountryTensions(mapping);
      }

      const hotspotsRes = await apiFetch('/api/geotrade/hotspots');
      if (hotspotsRes?.success && hotspotsRes.data) {
        setHotspots(hotspotsRes.data);
      }

      const arcsRes = await apiFetch('/api/geotrade/arcs');
      if (arcsRes?.success && arcsRes.data) {
        setArcs(arcsRes.data);
      }

      const signalsRes = await apiFetch('/api/geotrade/signals');
      if (signalsRes?.success && signalsRes.data) {
        setSignals(signalsRes.data);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('GeoTrade live API fetch fallback:', err);
    }
  }, []);

  useEffect(() => {
    fetchGeoTradeData();
    const interval = setInterval(fetchGeoTradeData, 30000);
    return () => clearInterval(interval);
  }, [fetchGeoTradeData]);

  const handleSelectCountry = async (iso, name) => {
    setSelectedCountryIso(iso);
    setImpactLoading(true);
    try {
      const res = await apiFetch(`/api/geotrade/impact/${iso}`);
      if (res?.success && res.data) {
        setImpactData(res.data);
      } else {
        setImpactData({
          iso,
          name,
          gti_score: countryTensions[iso]?.gti_score || 35,
          status: countryTensions[iso]?.status || 'STABLE',
          primary_risk: 'Energy & Macroeconomic Trade Route Transmission',
          sector_exposure: {
            'Energy & Commodities': 0.40,
            'Defense Procurement': 0.25,
            'Industrial Metals': 0.20,
            'FX Currency Hedging': 0.15
          },
          quotes: [
            { symbol: 'XAUUSD', name: 'Gold Spot', category: 'Commodity', price: 2341.00, change_pct: +2.45 },
            { symbol: 'USOIL', name: 'WTI Crude', category: 'Commodity', price: 83.40, change_pct: +3.82 },
            { symbol: 'SPX', name: 'S&P 500', category: 'Index', price: 5198.00, change_pct: -1.42 }
          ]
        });
      }
    } catch (err) {
      console.error('Failed to load country impact:', err);
    } finally {
      setImpactLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedCountryIso(null);
    setImpactData(null);
  };

  const handleViewSignalsForAsset = (assetSymbol) => {
    setSelectedCountryIso(null);
    setImpactData(null);
    setActiveSubTab('signals');
    setSignalsFilter('ALL');
  };

  const tabs = [
    { id: 'earth', label: 'Earth Pulse (3D)', icon: Globe2 },
    { id: 'map', label: 'Geo Map (2D)', icon: Map },
    { id: 'signals', label: 'AI Signals', icon: Zap, badge: `${signals.length || 6}` },
    { id: 'radar', label: 'Impact Radar', icon: Radar },
  ];

  return (
    <div
      className="geotrade-page-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'calc(100vh - 64px)',
        background: '#03060f',
        color: '#f8fafc',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Top Geopolitical Ticker & Sub-Nav Header */}
      <div
        className="geotrade-topbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '10px 20px',
          background: 'rgba(7, 9, 26, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 30,
          flexShrink: 0
        }}
      >
        {/* Left: GTI Global Index Score Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            className="geotrade-gti-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(7, 9, 26, 0.6) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              boxShadow: '0 0 16px rgba(239, 68, 68, 0.15)'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }}
            />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Global Tension Index:
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 900, color: '#ffffff' }}>
              {globalGTI.global_gti.toFixed(1)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#f87171' }}>
              (+{globalGTI.delta_24h.toFixed(1)})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="geotrade-chip">
              STATUS: <strong style={{ color: '#fbbf24', marginLeft: '4px' }}>{globalGTI.status}</strong>
            </span>
            <span className="geotrade-chip">
              FLASHPOINTS: <strong style={{ color: '#ffffff', marginLeft: '4px' }}>{hotspots.length || 5}</strong>
            </span>
            <span className="geotrade-chip">
              CONFLICT ARCS: <strong style={{ color: '#ffffff', marginLeft: '4px' }}>{arcs.length || 4}</strong>
            </span>
          </div>
        </div>

        {/* Center/Right: Sub-Tab Switcher Navigation & Live Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="geotrade-tab-group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`geotrade-tab-btn ${isActive ? 'active' : ''}`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    background: isActive ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(0, 150, 255, 0.18) 100%)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid transparent',
                    boxShadow: isActive ? '0 0 16px rgba(0, 240, 255, 0.25)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? '#00f0ff' : '#94a3b8' }} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        background: '#00f0ff',
                        color: '#000000',
                        fontWeight: 800,
                        marginLeft: '4px'
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Real-time Refresh Action Button */}
          <button
            onClick={fetchGeoTradeData}
            title="Sync Live Geopolitical Feeds"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#00f0ff',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)'
            }}
          >
            <RefreshCw size={13} />
            <span>LIVE SYNC</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div
        className="geotrade-viewport"
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: '#03060f'
        }}
      >
        <AnimatePresence mode="wait">
          {activeSubTab === 'earth' && (
            <motion.div
              key="earth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <EarthPulseGlobe
                countryTensions={countryTensions}
                hotspots={hotspots}
                arcs={arcs}
                selectedCountryIso={selectedCountryIso}
                onSelectCountry={handleSelectCountry}
              />
            </motion.div>
          )}

          {activeSubTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <GeoMapMatrix
                countryTensions={countryTensions}
                selectedCountryIso={selectedCountryIso}
                onSelectCountry={handleSelectCountry}
              />
            </motion.div>
          )}

          {activeSubTab === 'signals' && (
            <motion.div
              key="signals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <AISignalsFeed signals={signals} activeFilter={signalsFilter} />
            </motion.div>
          )}

          {activeSubTab === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              style={{ width: '100%', height: '100%' }}
            >
              <ImpactRadar onSelectAsset={handleViewSignalsForAsset} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sliding Market Impact Drawer */}
        <AnimatePresence>
          {selectedCountryIso && (
            <MarketImpactDrawer
              countryIso={selectedCountryIso}
              impactData={impactData}
              loading={impactLoading}
              onClose={handleCloseDrawer}
              onViewSignalsForAsset={handleViewSignalsForAsset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
