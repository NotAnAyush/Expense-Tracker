import React from 'react';
import { Cpu, Zap, HardDrive, Battery, Gauge, RefreshCw, CheckCircle2, Sparkles, ShieldAlert, Laptop, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDeviceCapability } from '../../context/DeviceCapabilityContext';

export const DevicePerformanceCard = () => {
  const {
    profile,
    isProfiling,
    effectiveTier,
    manualOverrideTier,
    setTierOverride,
    refreshProfiler,
  } = useDeviceCapability();

  const tiers = [
    {
      id: 0,
      title: 'Eco Mode',
      icon: '🌱',
      badge: 'Low Resource',
      color: 'amber',
      desc: 'Optimized for mobile or low-power hardware. Employs lightweight cloud processing and simplified visuals.',
      features: ['Solid CSS transitions', 'Cloud Vision OCR fallback', '100 FIRE iterations', '0MB on-device model cache'],
    },
    {
      id: 1,
      title: 'Balanced',
      icon: '⚖️',
      badge: 'Standard Modern',
      color: 'cyan',
      desc: 'Full-featured luxury experience. Runs smooth glassmorphism, instant local RAG heuristics, and parallel workers.',
      features: ['Obsidian glassmorphism', 'Deterministic RAG router', '500 FIRE iterations', 'Opt-in local SLM caching'],
    },
    {
      id: 2,
      title: 'Sovereign Pro',
      icon: '🚀',
      badge: 'Ultra Performance',
      color: 'mint',
      desc: 'Maximum compute capability. Activates local Unlimited-OCR, in-browser WebGPU LLMs, and high-frequency simulations.',
      features: ['Local Unlimited-OCR sidecar', 'In-browser WebGPU 1.5B model', '2,000 Monte Carlo runs', '60fps visual physics'],
    },
  ];

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        background: 'linear-gradient(145deg, rgba(13, 17, 28, 0.85) 0%, rgba(8, 11, 17, 0.95) 100%)',
      }}
    >
      {/* 1. Header with Live Status & Re-Scan */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F0FF',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
            }}
          >
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                Device Hardware & Capability Scanner
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: effectiveTier === 2 ? 'rgba(0, 255, 135, 0.12)' : effectiveTier === 1 ? 'rgba(0, 240, 255, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: effectiveTier === 2 ? '#00FF87' : effectiveTier === 1 ? '#00F0FF' : '#F59E0B',
                  border: `1px solid ${effectiveTier === 2 ? 'rgba(0, 255, 135, 0.3)' : effectiveTier === 1 ? 'rgba(0, 240, 255, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={11} />
                Tier {effectiveTier}: {effectiveTier === 2 ? 'Sovereign Pro' : effectiveTier === 1 ? 'Balanced' : 'Eco Mode'}
              </span>
            </div>
            <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
              Non-invasive hardware inspection calibrating local AI models, OCR sidecars, and physics animations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshProfiler}
          disabled={isProfiling}
          className="btn-glass-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '12px',
            height: '34px',
            color: '#00F0FF',
            borderColor: 'rgba(0, 240, 255, 0.3)',
          }}
        >
          <RefreshCw size={13} className={isProfiling ? 'animate-spin' : ''} />
          <span>{isProfiling ? 'Benchmarking...' : 'Re-Scan Hardware'}</span>
        </button>
      </div>

      {/* 2. Hardware Metrics Matrix (6-Card Bento Grid) */}
      {profile && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginBottom: '22px',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              <Cpu size={13} color="#00F0FF" />
              <span>CPU Cores</span>
            </div>
            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
              {profile.cpuCores || 8} Threads
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              <Zap size={13} color="#00FF87" />
              <span>System RAM</span>
            </div>
            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#00FF87' }}>
              ~{profile.ramGb || 8} GB
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              <Sparkles size={13} color="#A78BFA" />
              <span>WebGPU</span>
            </div>
            <div className="font-display" style={{ fontSize: '14px', fontWeight: 800, color: profile.gpu?.supported ? '#A78BFA' : '#94A3B8' }}>
              {profile.gpu?.supported ? 'Hardware 🚀' : 'WebGL Fallback'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              <HardDrive size={13} color="#FFD700" />
              <span>Free Storage</span>
            </div>
            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#FFD700' }}>
              {profile.diskStorage?.freeGb || 10} GB
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              <Battery size={13} color="#00FF87" />
              <span>Battery Status</span>
            </div>
            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
              {profile.battery?.level ?? 100}% {profile.battery?.charging ? '⚡' : ''}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
              <Gauge size={13} color="#F43F5E" />
              <span>WASM Compute</span>
            </div>
            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: (profile.benchmarkDurationMs || 0) < 5 ? '#00FF87' : '#F59E0B' }}>
              {profile.benchmarkDurationMs || 2.4} ms
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Tier Selection Cards */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Performance Profile Calibration
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {tiers.map((t) => {
            const isSelected = effectiveTier === t.id;
            const isCustom = manualOverrideTier === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setTierOverride(t.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(145deg, rgba(0, 240, 255, 0.08) 0%, rgba(13, 17, 28, 0.95) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected
                    ? '1px solid rgba(0, 240, 255, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 240, 255, 0.15)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{t.icon}</span>
                    <div>
                      <h4 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                        {t.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#00F0FF', fontFamily: 'var(--font-mono)' }}>
                        {t.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #00F0FF' : '2px solid rgba(255, 255, 255, 0.2)',
                      background: isSelected ? '#00F0FF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#050810' }} />}
                  </div>
                </div>

                <p className="body-sm" style={{ margin: '0 0 12px 0', color: '#94A3B8', fontSize: '12px', lineHeight: 1.4 }}>
                  {t.desc}
                </p>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {t.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: isSelected ? '#E2E8F0' : '#64748B' }}>
                      <CheckCircle2 size={12} color={isSelected ? '#00FF87' : '#64748B'} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Manual Override Status Notification */}
      {manualOverrideTier !== null && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '12.5px',
            color: '#FDE68A',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={15} color="#F59E0B" />
            <span>Manual performance tier override is currently active.</span>
          </div>
          <button
            type="button"
            onClick={() => setTierOverride(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00F0FF',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Reset to Auto-Detect
          </button>
        </div>
      )}
    </div>
  );
};

export default DevicePerformanceCard;
