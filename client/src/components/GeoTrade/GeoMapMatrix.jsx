import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_COUNTRIES } from '../../data/worldCountries';
import { 
  Filter, 
  Search, 
  ChevronRight
} from 'lucide-react';

function project2D(lng, lat, width, height) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

function polygonToPath(coordinates, width, height) {
  return coordinates
    .map((ring) => {
      return ring
        .map(([lng, lat], idx) => {
          const [x, y] = project2D(lng, lat, width, height);
          return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ') + ' Z';
    })
    .join(' ');
}

function getGtiColor(score, alpha = 1) {
  if (score >= 80) return `rgba(239, 68, 68, ${alpha})`;
  if (score >= 60) return `rgba(245, 158, 11, ${alpha})`;
  if (score >= 35) return `rgba(14, 165, 233, ${alpha})`;
  return `rgba(34, 197, 94, ${alpha})`;
}

export const GeoMapMatrix = ({
  countryTensions = {},
  onSelectCountry,
  selectedCountryIso
}) => {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const mapWidth = 960;
  const mapHeight = 520;

  const filteredFeatures = useMemo(() => {
    return WORLD_COUNTRIES.features.filter((feat) => {
      const regionMatch = selectedRegion === 'ALL' || feat.properties.REGION === selectedRegion;
      const searchMatch = !searchQuery || 
        feat.properties.NAME.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.properties.ISO_A2.toLowerCase().includes(searchQuery.toLowerCase());
      return regionMatch && searchMatch;
    });
  }, [selectedRegion, searchQuery]);

  const regions = ['ALL', 'Middle East', 'Asia-Pacific', 'Eastern Europe', 'Western Europe', 'Americas'];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#03060f',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top Filter Bar & Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(7, 9, 26, 0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 10
        }}
      >
        {/* Region Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', textTransform: 'uppercase', marginRight: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={12} /> Region:
          </span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                background: selectedRegion === reg ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedRegion === reg ? '#00f0ff' : '#94a3b8',
                border: selectedRegion === reg ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: selectedRegion === reg ? '0 0 10px rgba(0, 240, 255, 0.2)' : 'none'
              }}
            >
              {reg}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={14} style={{ color: '#64748b', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search country or ISO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#0a1020',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              paddingLeft: '32px',
              paddingRight: '12px',
              paddingTop: '6px',
              paddingBottom: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: '#ffffff',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main 2D Vector Map Canvas */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflow: 'hidden'
        }}
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '75vh',
            filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.8))'
          }}
        >
          <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" strokeDasharray="3 3">
            {[-60, -30, 0, 30, 60].map((lat) => {
              const [, y] = project2D(0, lat, mapWidth, mapHeight);
              return <line key={`lat-${lat}`} x1={0} y1={y} x2={mapWidth} y2={y} />;
            })}
            {[-120, -60, 0, 60, 120].map((lng) => {
              const [x] = project2D(lng, 0, mapWidth, mapHeight);
              return <line key={`lng-${lng}`} x1={x} y1={0} x2={x} y2={mapHeight} />;
            })}
          </g>

          {filteredFeatures.map((feat) => {
            const iso = feat.properties.ISO_A2;
            const gti = countryTensions[iso]?.gti_score ?? feat.properties.GTI_BASELINE ?? 25;
            const isSelected = iso === selectedCountryIso;
            const isHovered = hoveredCountry?.iso === iso;
            const pathData = polygonToPath(feat.geometry.coordinates, mapWidth, mapHeight);

            return (
              <path
                key={iso}
                d={pathData}
                fill={getGtiColor(gti, isSelected ? 0.8 : isHovered ? 0.65 : 0.35)}
                stroke={isSelected ? '#00ffff' : isHovered ? '#ffffff' : getGtiColor(gti, 0.85)}
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() =>
                  setHoveredCountry({
                    iso,
                    name: feat.properties.NAME,
                    admin: feat.properties.ADMIN,
                    region: feat.properties.REGION,
                    gti,
                    status: countryTensions[iso]?.status || 'STABLE'
                  })
                }
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => onSelectCountry && onSelectCountry(iso, feat.properties.NAME)}
              />
            );
          })}
        </svg>

        {/* Hover Floating Card */}
        <AnimatePresence>
          {hoveredCountry && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                zIndex: 20,
                padding: '14px',
                borderRadius: '14px',
                background: 'rgba(7, 9, 26, 0.96)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                minWidth: '220px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>
                  {hoveredCountry.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: '#00f0ff', fontWeight: 800 }}>
                  {hoveredCountry.iso}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>GTI Score:</span>
                  <span style={{ fontWeight: 800, color: '#ffffff' }}>{hoveredCountry.gti.toFixed(1)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Threat Level:</span>
                  <span style={{
                    fontWeight: 800,
                    color: hoveredCountry.gti >= 80 ? '#ef4444' : hoveredCountry.gti >= 60 ? '#f59e0b' : hoveredCountry.gti >= 35 ? '#0ea5e9' : '#22c55e'
                  }}>
                    {hoveredCountry.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Region:</span>
                  <span style={{ color: '#cbd5e1' }}>{hoveredCountry.region}</span>
                </div>
              </div>

              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>
                <span>Click to open Market Impact</span>
                <ChevronRight size={12} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
