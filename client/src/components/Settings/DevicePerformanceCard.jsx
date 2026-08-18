import React from 'react';
import { Cpu, Zap, HardDrive, Battery, Gauge, RefreshCw, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
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
      title: '🌱 Eco Mode',
      subtitle: 'Low Resource',
      desc: 'Solid CSS, Cloud OCR, 100 FIRE runs, 0MB model cache.',
    },
    {
      id: 1,
      title: '⚖️ Balanced',
      subtitle: 'Standard Modern',
      desc: 'Standard glassmorphism, 500 FIRE runs, opt-in local SLMs.',
    },
    {
      id: 2,
      title: '🚀 Sovereign Pro',
      subtitle: 'Ultra Performance',
      desc: 'Local Unlimited-OCR, In-Browser 1.5B WebLLM, 2,000 FIRE runs, 60fps visual effects.',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 backdrop-blur-xl transition-all shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Device Hardware & AI Capability Scanner
              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border ${
                effectiveTier === 2
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : effectiveTier === 1
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Tier {effectiveTier}: {effectiveTier === 2 ? 'Sovereign Pro' : effectiveTier === 1 ? 'Balanced' : 'Eco Mode'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Non-invasive hardware inspection calibrating local AI models and animation performance.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshProfiler}
          disabled={isProfiling}
          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isProfiling ? 'animate-spin text-cyan-400' : ''}`} />
          {isProfiling ? 'Scanning...' : 'Re-Scan Hardware'}
        </button>
      </div>

      {/* Hardware Metrics Matrix */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU Cores</span>
            </div>
            <div className="text-sm font-bold text-white">{profile.cpuCores} Threads</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>System RAM</span>
            </div>
            <div className="text-sm font-bold text-white">~{profile.ramGb} GB</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>WebGPU</span>
            </div>
            <div className="text-sm font-bold text-white truncate">
              {profile.gpu?.supported ? 'Supported 🚀' : 'WebGL Fallback'}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Storage</span>
            </div>
            <div className="text-sm font-bold text-white">{profile.diskStorage?.freeGb || 10} GB</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>Battery Status</span>
            </div>
            <div className="text-sm font-bold text-white">
              {profile.battery?.level}% {profile.battery?.charging ? '⚡' : ''}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
              <Gauge className="w-3.5 h-3.5 text-rose-400" />
              <span>WASM Compute</span>
            </div>
            <div className="text-sm font-bold text-white">{profile.benchmarkDurationMs} ms</div>
          </div>
        </div>
      )}

      {/* Manual Tier Override Controls */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-300 block mb-2.5">
          Performance Profile Calibration:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiers.map((t) => {
            const isSelected = effectiveTier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTierOverride(t.id)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white">{t.title}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="text-[11px] text-cyan-400/80 font-mono mb-1">{t.subtitle}</div>
                <p className="text-xs text-slate-400 line-clamp-2">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {manualOverrideTier !== null && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 px-3.5 py-2 rounded-xl border border-slate-800">
          <span>Manual performance override is active.</span>
          <button
            type="button"
            onClick={() => setTierOverride(null)}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline ml-2 cursor-pointer"
          >
            Reset to Auto-Detect
          </button>
        </div>
      )}
    </div>
  );
};

export default DevicePerformanceCard;
