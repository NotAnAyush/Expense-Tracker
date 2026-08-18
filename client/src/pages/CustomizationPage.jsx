import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Palette,
  LayoutGrid,
  Globe,
  ShieldCheck,
  Check,
  RotateCcw,
  Bot,
  Receipt,
  Flame,
  TrendingDown,
  Users,
  Plane,
  Activity,
  Mic,
  FileSpreadsheet,
  Coins,
  Cpu,
  Layers,
  HardDrive,
  Download,
  Upload,
  Clock,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomization } from '../context/CustomizationContext';
import DevicePerformanceCard from '../components/Settings/DevicePerformanceCard';

export const CustomizationPage = () => {
  const {
    activeConfig,
    stagedConfig,
    isDirty,
    snapshots,
    themesMetadata,
    stageModuleToggle,
    stageThemeChange,
    stageDashboardLayoutChange,
    stageRegionalChange,
    restoreSnapshot,
    createManualSnapshot,
  } = useCustomization();

  const [activeTab, setActiveTab] = useState('modules');
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const MODULE_REGISTRY = [
    {
      key: 'aiCopilot',
      title: 'AI Financial Copilot',
      desc: 'Multimodal conversational assistant with deterministic RAG grounding.',
      icon: Bot,
      color: 'cyan',
      tag: 'AI Intelligence',
      core: false,
    },
    {
      key: 'receiptOcr',
      title: 'Vision Receipt Scanner',
      desc: 'Multimodal camera & gallery receipt parsing with instant field structuring.',
      icon: Receipt,
      color: 'emerald',
      tag: 'Vision OCR',
      core: false,
    },
    {
      key: 'fireSimulator',
      title: 'FIRE & Wealth Simulator',
      desc: '1,000-run Monte Carlo simulation and Rule-of-25 retirement milestones.',
      icon: Flame,
      color: 'amber',
      tag: 'Wealth Math',
      core: false,
    },
    {
      key: 'debtOptimizer',
      title: 'Debt Payoff Optimizer',
      desc: 'Snowball vs Avalanche debt freedom schedules and interest calculators.',
      icon: TrendingDown,
      color: 'rose',
      tag: 'Debt Freedom',
      core: false,
    },
    {
      key: 'groupSplitting',
      title: 'Social Group Bill Splitting',
      desc: 'Greedy Minimum Cash Flow graph reducer with dynamic NPCI UPI QR codes.',
      icon: Users,
      color: 'violet',
      tag: 'Social Ledgers',
      core: false,
    },
    {
      key: 'travelFxVaults',
      title: 'Multi-Currency Travel Vaults',
      desc: 'Real-time foreign exchange conversion and destination travel budgeting.',
      icon: Plane,
      color: 'cyan',
      tag: 'Global FX',
      core: false,
    },
    {
      key: 'lifestyleHabits',
      title: 'Lifestyle & Habit Engine',
      desc: 'On-device behavioral profiling, payday euphoria decay, and lifestyle inflation.',
      icon: Activity,
      color: 'emerald',
      tag: 'On-Device AI',
      core: false,
    },
    {
      key: 'voiceLogging',
      title: 'Voice Quick-Log Transcription',
      desc: 'Speech-to-text natural language expense and income logging.',
      icon: Mic,
      color: 'violet',
      tag: 'Voice Engine',
      core: false,
    },
    {
      key: 'bankCsvImport',
      title: 'Bank Statement CSV Importer',
      desc: 'SHA-256 duplicate hashing and automatic category rule matching.',
      icon: FileSpreadsheet,
      color: 'cyan',
      tag: 'Data Ingestion',
      core: false,
    },
    {
      key: 'advancedTax',
      title: 'Advanced GST & 80C/80D Tax Breakdown',
      desc: 'Tax deductible slabs and annual fiscal savings summaries.',
      icon: Coins,
      color: 'amber',
      tag: 'Tax Engine',
      core: false,
    },
    {
      key: 'deluxeVisuals',
      title: 'Deluxe 60fps Visual FX',
      desc: 'Deep glassmorphism blur filters and smooth particle animations.',
      icon: Sparkles,
      color: 'emerald',
      tag: 'Visual Tier',
      core: false,
    },
  ];

  const ACCENT_PRESETS = [
    { name: 'Mint Neon', hex: '#00FF87' },
    { name: 'Cyber Gold', hex: '#FFD700' },
    { name: 'Emerald Gem', hex: '#10B981' },
    { name: 'Cyan Flux', hex: '#00F0FF' },
    { name: 'Synth Violet', hex: '#8B5CF6' },
    { name: 'Rose Flame', hex: '#F43F5E' },
    { name: 'Warm Amber', hex: '#F59E0B' },
  ];

  const CURRENCIES = [
    { code: '₹', name: 'INR (₹) — Indian Rupee', region: 'India' },
    { code: '$', name: 'USD ($) — US Dollar', region: 'United States' },
    { code: '€', name: 'EUR (€) — Euro', region: 'European Union' },
    { code: '£', name: 'GBP (£) — British Pound', region: 'United Kingdom' },
    { code: 'AED', name: 'AED (د.إ) — UAE Dirham', region: 'United Arab Emirates' },
    { code: '¥', name: 'JPY (¥) — Japanese Yen', region: 'Japan' },
    { code: 'CAD', name: 'CAD ($) — Canadian Dollar', region: 'Canada' },
    { code: 'AUD', name: 'AUD ($) — Australian Dollar', region: 'Australia' },
    { code: 'SGD', name: 'SGD ($) — Singapore Dollar', region: 'Singapore' },
    { code: 'CHF', name: 'CHF (Fr) — Swiss Franc', region: 'Switzerland' },
  ];

  // Move dashboard layout card up/down
  const moveLayoutItem = (index, direction) => {
    const layout = [...(stagedConfig.dashboardLayout || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layout.length) return;
    const temp = layout[index];
    layout[index] = layout[targetIndex];
    layout[targetIndex] = temp;
    stageDashboardLayoutChange(layout);
  };

  // Toggle dashboard layout card visibility
  const toggleLayoutItem = (index) => {
    const layout = [...(stagedConfig.dashboardLayout || [])];
    layout[index] = { ...layout[index], visible: !layout[index].visible };
    stageDashboardLayoutChange(layout);
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const data = {
      version: '3.1.0',
      exportedAt: new Date().toISOString(),
      config: stagedConfig,
      snapshots: snapshots.slice(0, 5),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `richy_customization_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.config) {
          if (parsed.config.modules) stageModuleToggle('__BULK__'); // Trigger dirty state
          stageThemeChange(parsed.config.theme || {});
          stageRegionalChange(parsed.config.regional || {});
          if (parsed.config.dashboardLayout) stageDashboardLayoutChange(parsed.config.dashboardLayout);
          setImportStatus('Backup loaded into staging! Click "Confirm Changes" to apply.');
          setTimeout(() => setImportStatus(''), 5000);
        }
      } catch (err) {
        setImportStatus('Failed to parse backup file.');
        setTimeout(() => setImportStatus(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Sovereign Customization & Studio Hub
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Granularly toggle modular features, design visual themes, calibrate device hardware, and manage backups.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Unapplied Staged Changes Active</span>
          </div>
        )}
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-xl overflow-x-auto scrollbar-none">
        {[
          { id: 'modules', label: '🧩 Feature Modules', icon: Layers },
          { id: 'theme', label: '🎨 Theme Studio', icon: Palette },
          { id: 'dashboard', label: '📊 Dashboard Studio', icon: LayoutGrid },
          { id: 'regional', label: '🌍 Currency & Regional', icon: Globe },
          { id: 'device', label: '⚡ Hardware Profiler', icon: Cpu },
          { id: 'snapshots', label: '🛡️ Backup Vault', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 🧩 Feature Modules Suite */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Core Features Baseline Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Fundamental Core Systems (Always Active)</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard Double-Entry Ledger, Category Management, Net Cash Flow Summary, and Dual-Token JWT Security are locked on by default to guarantee absolute mathematical accounting stability.
            </p>
          </div>

          {/* Modular Extensions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULE_REGISTRY.map((mod) => {
              const Icon = mod.icon;
              const isEnabled = !!stagedConfig.modules?.[mod.key];
              return (
                <div
                  key={mod.key}
                  className={`bg-slate-900/60 border rounded-2xl p-5 backdrop-blur-xl transition-all flex flex-col justify-between ${
                    isEnabled
                      ? 'border-slate-800 hover:border-emerald-500/40 shadow-lg shadow-slate-950/50'
                      : 'border-slate-800/40 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-white">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => stageModuleToggle(mod.key)}
                        className={`w-12 h-6.5 rounded-full transition-all relative p-1 cursor-pointer ${
                          isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      >
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-4.5 h-4.5 rounded-full bg-slate-950 shadow-md ${
                            isEnabled ? 'ml-auto bg-white' : ''
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {mod.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">Module Status:</span>
                    <span className={isEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500 font-medium'}>
                      {isEnabled ? '● Active' : '○ Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: 🎨 Theme & Visual Studio */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Curated Themes Grid */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Curated Sovereign Themes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(themesMetadata).map(([id, t]) => {
                const isSelected = stagedConfig.theme?.themeId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => stageThemeChange({ themeId: id, accentColor: t.accent })}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">{t.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: t.accent }}
                        />
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
              Custom Semantic Accent Color
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {ACCENT_PRESETS.map((preset) => {
                const isCurrent = stagedConfig.theme?.accentColor?.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => stageThemeChange({ accentColor: preset.hex })}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-800 border-white text-white shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glassmorphism & Font Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white">Glassmorphism Card Opacity</label>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {Math.round((stagedConfig.theme?.glassmorphismOpacity ?? 0.72) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.4"
                max="0.95"
                step="0.05"
                value={stagedConfig.theme?.glassmorphismOpacity ?? 0.72}
                onChange={(e) => stageThemeChange({ glassmorphismOpacity: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-mono">
                <span>40% (Frosted Glass)</span>
                <span>72% (Default)</span>
                <span>95% (Solid)</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white">Typography Scaling</label>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {stagedConfig.theme?.fontScale ?? 100}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[90, 100, 110].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => stageThemeChange({ fontScale: scale })}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      stagedConfig.theme?.fontScale === scale
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {scale === 90 ? 'Compact (90%)' : scale === 100 ? 'Normal (100%)' : 'Comfort (110%)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 📊 Dashboard Layout Studio */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl mb-4">
            <p className="text-xs text-slate-400">
              Customize dashboard card visibility and visual flow. Hidden widgets automatically trigger a smooth CSS Grid dense re-flow.
            </p>
          </div>

          <div className="space-y-2">
            {(stagedConfig.dashboardLayout || []).map((card, idx) => (
              <div
                key={card.id}
                className={`bg-slate-900/60 border rounded-xl p-4 backdrop-blur-xl flex items-center justify-between gap-4 transition-all ${
                  card.visible ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-xs font-mono text-slate-500 font-bold">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{card.label}</h4>
                    <span className="text-[10px] font-mono text-slate-400">ID: {card.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveLayoutItem(idx, -1)}
                    disabled={idx === 0}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveLayoutItem(idx, 1)}
                    disabled={idx === (stagedConfig.dashboardLayout?.length || 1) - 1}
                    className="p-2 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLayoutItem(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      card.visible
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {card.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{card.visible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: 🌍 Currency & Regional Engine */}
      {activeTab === 'regional' && (
        <div className="space-y-6">
          {/* Primary Currency Grid */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-3">Default Primary Ledger Currency</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CURRENCIES.map((curr) => {
                const isSelected = stagedConfig.regional?.currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => stageRegionalChange({ currency: curr.code })}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{curr.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500">{curr.region}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number Formatting & Fiscal Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
              <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
                Number Notation System
              </h4>
              <div className="space-y-2.5">
                {[
                  {
                    id: 'INDIAN_LAKHS_CRORES',
                    title: 'Indian Numbering (Lakhs & Crores)',
                    example: '₹1,50,000.00 / ₹12,45,000.00',
                  },
                  {
                    id: 'INTERNATIONAL_MILLIONS',
                    title: 'International Standard (Millions & Billions)',
                    example: '$150,000.00 / $1,245,000.00',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => stageRegionalChange({ numberFormat: item.id })}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      stagedConfig.regional?.numberFormat === item.id
                        ? 'bg-slate-800/90 border-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">{item.title}</div>
                    <div className="text-[11px] font-mono text-cyan-400/80">{item.example}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
              <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-slate-400">
                Fiscal Year Start Month
              </h4>
              <div className="space-y-2.5">
                {[
                  { id: 'april', title: 'April 1st (Indian Financial Year - FY)', desc: 'Standard for Indian taxation & 80C computation.' },
                  { id: 'january', title: 'January 1st (Calendar Year - CY)', desc: 'Standard international accounting cycle.' },
                ].map((fy) => (
                  <button
                    key={fy.id}
                    type="button"
                    onClick={() => stageRegionalChange({ fiscalYearStart: fy.id })}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      stagedConfig.regional?.fiscalYearStart === fy.id
                        ? 'bg-slate-800/90 border-emerald-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">{fy.title}</div>
                    <div className="text-[11px] text-slate-400">{fy.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: ⚡ Hardware Profiler */}
      {activeTab === 'device' && (
        <DevicePerformanceCard />
      )}

      {/* Tab 6: 🛡️ Backup Vault */}
      {activeTab === 'snapshots' && (
        <div className="space-y-6">
          {/* Manual Snapshot Creation Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h3 className="text-sm font-bold text-white mb-1">Create Manual Checkpoint</h3>
              <p className="text-xs text-slate-400">
                Save an instant encrypted snapshot of current feature flags and layout preferences.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Snapshot label (optional)..."
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 flex-1 sm:w-60"
              />
              <button
                type="button"
                onClick={() => {
                  createManualSnapshot(snapshotLabel || 'Manual Snapshot');
                  setSnapshotLabel('');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Snapshot Now
              </button>
            </div>
          </div>

          {/* Import / Export Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Export Customization JSON
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Download a secure JSON archive containing all feature flags, themes, and snapshot logs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Backup File
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Import Customization JSON
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Re-hydrate preferences from a previously saved JSON configuration file.
                </p>
              </div>
              <label className="w-full py-2.5 rounded-xl border border-dashed border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Stage Backup</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
              {importStatus && (
                <div className="text-[11px] text-emerald-400 font-semibold mt-2 text-center">
                  {importStatus}
                </div>
              )}
            </div>
          </div>

          {/* Historical Snapshots Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white mb-3">Saved State Checkpoints ({snapshots.length})</h3>
            {snapshots.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No checkpoints logged yet. Snapshots are created automatically before every confirmed sync.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {snapshots.map((snap) => (
                  <div
                    key={snap.snapshotId}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {snap.label || (snap.triggerReason === 'FEATURE_FLAG_CHANGE' ? 'Pre-Sync Auto-Backup' : 'Manual Snapshot')}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {snap.triggerReason}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(snap.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => restoreSnapshot(snap.snapshotId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationPage;
