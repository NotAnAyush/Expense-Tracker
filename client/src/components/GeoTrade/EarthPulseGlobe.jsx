import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_COUNTRIES } from '../../data/worldCountries';
import { 
  ShieldAlert, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  Activity, 
  ChevronRight
} from 'lucide-react';

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

function rotatePoint(p, rotX, rotY) {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const x1 = p.x * cosY + p.z * sinY;
  const y1 = p.y;
  const z1 = -p.x * sinY + p.z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const x2 = x1;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  return { x: x2, y: y2, z: z2 };
}

function getGtiColor(score, alpha = 1) {
  if (score >= 80) return `rgba(239, 68, 68, ${alpha})`;
  if (score >= 60) return `rgba(245, 158, 11, ${alpha})`;
  if (score >= 35) return `rgba(14, 165, 233, ${alpha})`;
  return `rgba(34, 197, 94, ${alpha})`;
}

export const EarthPulseGlobe = ({
  countryTensions = {},
  hotspots = [],
  arcs = [],
  onSelectCountry,
  selectedCountryIso,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0.25, y: -0.8 });
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [animTime, setAnimTime] = useState(0);

  useEffect(() => {
    let animationId;
    let lastTime = performance.now();

    const loop = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setAnimTime((prev) => prev + delta);

      if (autoRotate && !isDragging) {
        setRotation((prev) => ({
          x: prev.x,
          y: prev.y + 0.003,
        }));
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [autoRotate, isDragging]);

  // Main Canvas Rendering Function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.38 * zoom;

    // 1. Draw Starfield Background
    ctx.save();
    const starCount = 65;
    for (let i = 0; i < starCount; i++) {
      const sx = (Math.sin(i * 99.7) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 33.3) * 0.5 + 0.5) * height;
      const sRadius = (Math.sin(i + animTime * 2) * 0.5 + 0.5) * 1.5 + 0.5;
      const sAlpha = 0.2 + (Math.sin(i * 12 + animTime * 3) * 0.5 + 0.5) * 0.6;
      ctx.fillStyle = `rgba(255, 255, 255, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Draw Outer Atmospheric Glow
    const atmosGrad = ctx.createRadialGradient(
      centerX, centerY, baseRadius * 0.85,
      centerX, centerY, baseRadius * 1.35
    );
    atmosGrad.addColorStop(0, 'rgba(0, 212, 255, 0.22)');
    atmosGrad.addColorStop(0.4, 'rgba(0, 150, 255, 0.10)');
    atmosGrad.addColorStop(0.8, 'rgba(0, 50, 150, 0.03)');
    atmosGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = atmosGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Globe Sphere Base
    const sphereGrad = ctx.createRadialGradient(
      centerX - baseRadius * 0.35, centerY - baseRadius * 0.35, baseRadius * 0.1,
      centerX, centerY, baseRadius
    );
    sphereGrad.addColorStop(0, '#0d1d3a');
    sphereGrad.addColorStop(0.6, '#060c1d');
    sphereGrad.addColorStop(1, '#02040a');
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // 4. Draw Wireframe Grids
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = 'rgba(0, 212, 255, 0.07)';
    ctx.lineWidth = 1;

    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let started = false;
      for (let lng = -180; lng <= 180; lng += 10) {
        const v = latLngToVector3(lat, lng, baseRadius);
        const r = rotatePoint(v, rotation.x, rotation.y);
        if (r.z > 0) {
          const px = centerX + r.x;
          const py = centerY - r.y;
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    for (let lng = -180; lng < 180; lng += 30) {
      ctx.beginPath();
      let started = false;
      for (let lat = -80; lat <= 80; lat += 5) {
        const v = latLngToVector3(lat, lng, baseRadius);
        const r = rotatePoint(v, rotation.x, rotation.y);
        if (r.z > 0) {
          const px = centerX + r.x;
          const py = centerY - r.y;
          if (!started) {
            ctx.moveTo(px, py);
            started = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // 5. Draw Sovereign Country Polygons
    WORLD_COUNTRIES.features.forEach((feat) => {
      const iso = feat.properties.ISO_A2;
      const gti = countryTensions[iso]?.gti_score ?? feat.properties.GTI_BASELINE ?? 25;
      const isSelected = iso === selectedCountryIso;
      const isHovered = hoveredCountry?.iso === iso;

      const coordsList = feat.geometry.coordinates;

      coordsList.forEach((ring) => {
        ctx.beginPath();
        let visibleCount = 0;

        ring.forEach(([lng, lat], idx) => {
          const v = latLngToVector3(lat, lng, baseRadius);
          const r = rotatePoint(v, rotation.x, rotation.y);

          if (r.z > -baseRadius * 0.1) {
            visibleCount++;
            const px = centerX + r.x;
            const py = centerY - r.y;
            if (idx === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
        });

        if (visibleCount > 2) {
          ctx.closePath();
          const fillAlpha = isSelected ? 0.75 : isHovered ? 0.65 : 0.35;
          ctx.fillStyle = getGtiColor(gti, fillAlpha);
          ctx.fill();

          ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;
          ctx.strokeStyle = isSelected
            ? '#00ffff'
            : isHovered
            ? '#ffffff'
            : getGtiColor(gti, 0.85);
          ctx.stroke();
        }
      });
    });

    // 6. Draw 3D Conflict Arcs
    arcs.forEach((arc) => {
      const p1 = latLngToVector3(arc.startLat, arc.startLng, baseRadius);
      const p2 = latLngToVector3(arc.endLat, arc.endLng, baseRadius);

      const r1 = rotatePoint(p1, rotation.x, rotation.y);
      const r2 = rotatePoint(p2, rotation.x, rotation.y);

      if (r1.z > -baseRadius * 0.3 || r2.z > -baseRadius * 0.3) {
        const midLat = (arc.startLat + arc.endLat) / 2;
        const midLng = (arc.startLng + arc.endLng) / 2;
        const arcAltitude = baseRadius * (1 + arc.severity * 0.28);
        const pMid = latLngToVector3(midLat, midLng, arcAltitude);
        const rMid = rotatePoint(pMid, rotation.x, rotation.y);

        const sx = centerX + r1.x;
        const sy = centerY - r1.y;
        const mx = centerX + rMid.x;
        const my = centerY - rMid.y;
        const ex = centerX + r2.x;
        const ey = centerY - r2.y;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.strokeStyle = arc.color[0] || 'rgba(239, 68, 68, 0.8)';
        ctx.lineWidth = arc.severity * 2.2 + 0.8;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const t = (animTime * 0.8 + arc.severity) % 1;
        const bx = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * mx + t * t * ex;
        const by = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * my + t * t * ey;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = arc.color[0] || '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });

    // 7. Draw Flashpoint Hotspots
    hotspots.forEach((h) => {
      const v = latLngToVector3(h.lat, h.lng, baseRadius);
      const r = rotatePoint(v, rotation.x, rotation.y);

      if (r.z > 0) {
        const px = centerX + r.x;
        const py = centerY - r.y;

        ctx.fillStyle = h.severity >= 0.85 ? '#ef4444' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        for (let ringIdx = 0; ringIdx < 2; ringIdx++) {
          const ringProgress = (animTime * 1.2 + ringIdx * 0.5) % 1;
          const ringRadius = 4 + ringProgress * 18 * h.severity;
          const ringAlpha = (1 - ringProgress) * 0.8;

          ctx.strokeStyle = h.severity >= 0.85 
            ? `rgba(239, 68, 68, ${ringAlpha})`
            : `rgba(245, 158, 11, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(h.title.split(' ')[0], px + 8, py - 4);
      }
    });

    ctx.restore();

    // 8. Outer Rim Vignette Glow
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

  }, [rotation, zoom, countryTensions, hotspots, arcs, selectedCountryIso, hoveredCountry, animTime]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) * 0.006;
      const deltaY = (e.clientY - dragStart.y) * 0.006;

      setRotation((prev) => ({
        x: Math.max(-1.4, Math.min(1.4, prev.x - deltaY)),
        y: prev.y + deltaX,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.38 * zoom;

      let found = null;
      WORLD_COUNTRIES.features.forEach((feat) => {
        const ring = feat.geometry.coordinates[0];
        if (!ring) return;

        const avgLng = ring.reduce((a, b) => a + b[0], 0) / ring.length;
        const avgLat = ring.reduce((a, b) => a + b[1], 0) / ring.length;

        const v = latLngToVector3(avgLat, avgLng, baseRadius);
        const r = rotatePoint(v, rotation.x, rotation.y);

        if (r.z > 0) {
          const px = centerX + r.x;
          const py = centerY - r.y;
          const dist = Math.hypot(mouseX - px, mouseY - py);
          if (dist < 40) {
            found = {
              iso: feat.properties.ISO_A2,
              name: feat.properties.NAME,
              admin: feat.properties.ADMIN,
              region: feat.properties.REGION,
              gti: countryTensions[feat.properties.ISO_A2]?.gti_score ?? feat.properties.GTI_BASELINE ?? 30,
              status: countryTensions[feat.properties.ISO_A2]?.status ?? 'STABLE'
            };
          }
        }
      });

      setHoveredCountry(found);
      setHoverPosition({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (hoveredCountry && onSelectCountry) {
      onSelectCountry(hoveredCountry.iso, hoveredCountry.name);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.7, Math.min(1.8, prev - e.deltaY * 0.001)));
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#03060f',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />

      {/* Floating HUD Controls */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: 'rgba(7, 9, 26, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00FF87',
              boxShadow: '0 0 10px #00FF87'
            }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#ffffff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Earth Pulse · 3D Recon
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'rgba(7, 9, 26, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: '#94a3b8',
            backdropFilter: 'blur(8px)'
          }}
        >
          <ShieldAlert size={14} style={{ color: '#fbbf24' }} />
          <span>OFFICIAL SURVEY OF INDIA BOUNDARIES APPLIED</span>
        </div>
      </div>

      {/* Quick Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(7, 9, 26, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '14px',
          padding: '6px 8px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)'
        }}
      >
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            cursor: 'pointer',
            background: autoRotate ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: autoRotate ? '#00f0ff' : '#94a3b8',
            border: autoRotate ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: autoRotate ? '0 0 12px rgba(0, 240, 255, 0.25)' : 'none'
          }}
          title="Toggle Earth Auto-Rotation"
        >
          <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
          <span>{autoRotate ? 'Orbit On' : 'Orbit Off'}</span>
        </button>

        <div style={{ height: '16px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
          style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>

        <button
          onClick={() => {
            setRotation({ x: 0.25, y: -0.8 });
            setZoom(1.0);
          }}
          style={{
            padding: '6px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
          title="Reset Camera Orientation"
        >
          <Compass size={14} />
        </button>
      </div>

      {/* Tension Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '12px 16px',
          borderRadius: '14px',
          background: 'rgba(7, 9, 26, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        <span style={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          GTI Threat Matrix
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <span style={{ color: '#fca5a5', fontWeight: 700 }}>Critical (&ge; 80)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
          <span style={{ color: '#fcd34d', fontWeight: 700 }}>High (60 - 79)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0ea5e9', boxShadow: '0 0 8px #0ea5e9' }} />
          <span style={{ color: '#7dd3fc', fontWeight: 700 }}>Elevated (35 - 59)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
          <span style={{ color: '#86efac', fontWeight: 700 }}>Stable (&lt; 35)</span>
        </div>
      </div>

      {/* Interactive Country Hover Tooltip Card */}
      <AnimatePresence>
        {hoveredCountry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: Math.min(window.innerWidth - 240, hoverPosition.x + 15),
              top: Math.min(window.innerHeight - 180, hoverPosition.y + 15),
              zIndex: 50,
              pointerEvents: 'none',
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(7, 9, 26, 0.96)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              minWidth: '200px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px', marginBottom: '8px' }}>
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
                <span style={{ color: '#94a3b8' }}>Status:</span>
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
              <span>Click to view market impact</span>
              <ChevronRight size={12} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
