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
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomization } from '../context/CustomizationContext';
import DevicePerformanceCard from '../components/Settings/DevicePerformanceCard';
import LocalAiModelStudio from '../components/Customization/LocalAiModelStudio';

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
      desc: 'Multimodal conversational assistant with deterministic RAG grounding and multi-model tool routing.',
      icon: Bot,
      color: '#00F0FF',
      tag: 'AI Intelligence',
      core: false,
    },
    {
      key: 'receiptOcr',
      title: 'Vision Receipt Scanner',
      desc: 'Multimodal camera & gallery receipt parsing with local Baidu Unlimited-OCR and PaddleOCR fallback.',
      icon: Receipt,
      color: '#00FF87',
      tag: 'Vision OCR',
      core: false,
    },
    {
      key: 'fireSimulator',
      title: 'FIRE & Wealth Simulator',
      desc: '1,000-run Monte Carlo simulation, Rule-of-25 retirement milestones, and What-If scenario projections.',
      icon: Flame,
      color: '#FFD700',
      tag: 'Wealth Math',
      core: false,
    },
    {
      key: 'debtOptimizer',
      title: 'Debt Payoff Optimizer',
      desc: 'Snowball vs. Avalanche debt freedom schedules, interest rate calculators, and ledger synchronization.',
      icon: TrendingDown,
      color: '#F43F5E',
      tag: 'Debt Freedom',
      core: false,
    },
    {
      key: 'groupSplitting',
      title: 'Social Group Bill Splitting',
      desc: 'Greedy Minimum Cash Flow graph reducer with dynamic NPCI UPI QR codes and settlement ledgers.',
      icon: Users,
      color: '#8B5CF6',
      tag: 'Social Ledgers',
      core: false,
    },
    {
      key: 'travelFxVaults',
      title: 'Multi-Currency Travel Vaults',
      desc: 'Real-time foreign exchange conversion, destination travel budgeting, and offline expenditure logging.',
      icon: Plane,
      color: '#00F0FF',
      tag: 'Global FX',
      core: false,
    },
    {
      key: 'lifestyleHabits',
      title: 'Lifestyle & Habit Engine',
      desc: 'On-device behavioral profiling, payday euphoria decay, late-night impulse score, and lifestyle inflation.',
      icon: Activity,
      color: '#00FF87',
      tag: 'On-Device AI',
      core: false,
    },
    {
      key: 'voiceLogging',
      title: 'Voice Quick-Log Transcription',
      desc: 'Speech-to-text natural language expense and income logging with zero cloud latency.',
      icon: Mic,
      color: '#A78BFA',
      tag: 'Voice Engine',
      core: false,
    },
    {
      key: 'bankCsvImport',
      title: 'Bank Statement & SMS Parser',
      desc: 'SHA-256 duplicate hashing and regex parsing for HDFC, SBI, ICICI, Axis, Kotak, PayTM, and UPI.',
      icon: FileSpreadsheet,
      color: '#00F0FF',
      tag: 'Data Ingestion',
      core: false,
    },
    {
      key: 'advancedTax',
      title: 'Advanced GST & Tax Breakdown',
      desc: 'Deductible 80C/80D tax slabs and annual fiscal savings summaries.',
      icon: Coins,
      color: '#FFD700',
      tag: 'Tax Engine',
      core: false,
    },
    {
      key: 'geotradeTerminal',
      title: 'GeoTrade Geopolitical Alpha Terminal',
      desc: '3D WebGL Earth Pulse, 2D Geo Matrix, Survey of India boundaries, and AI macro trading signals with Kelly sizing.',
      icon: Globe,
      color: '#00F0FF',
      tag: 'Macro Recon',
      core: false,
    },
    {
      key: 'deluxeVisuals',
      title: 'Deluxe 60fps Visual FX',
      desc: 'Deep glassmorphism blur filters, ambient glow particles, and responsive Framer Motion physics.',
      icon: Sparkles,
      color: '#8B5CF6',
      tag: 'Visual Engine',
      core: false,
    },
    {
      key: 'hardwareProfiling',
      title: 'Hardware & Resource Scanner',
      desc: 'Non-invasive device capability profiling calibrating compute load and local models dynamically.',
      icon: Cpu,
      color: '#00F0FF',
      tag: 'Performance',
      core: false,
    },
  ];

  const THEMES_CATALOG = [
    {
      id: 'obsidian-luxury',
      name: 'Midnight Obsidian',
      accent: '#00FF87',
      secondary: '#FFD700',
      bg: '#080B11',
      badge: 'Default Flagship',
      gradient: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
    },
    {
      id: 'matrix-emerald',
      name: 'Emerald Matrix',
      accent: '#10B981',
      secondary: '#00F0FF',
      bg: '#040D0A',
      badge: 'High Contrast',
      gradient: 'linear-gradient(135deg, #10B981 0%, #00F0FF 100%)',
    },
    {
      id: 'cyberpunk-neon',
      name: 'Cyberpunk Neon',
      accent: '#00F0FF',
      secondary: '#EC4899',
      bg: '#0B0A14',
      badge: 'Vibrant Synth',
      gradient: 'linear-gradient(135deg, #00F0FF 0%, #EC4899 100%)',
    },
    {
      id: 'royal-amethyst',
      name: 'Royal Amethyst',
      accent: '#8B5CF6',
      secondary: '#00FF87',
      bg: '#0C0A17',
      badge: 'Deep Violet',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #00FF87 100%)',
    },
    {
      id: 'solar-flare',
      name: 'Solar Flare Gold',
      accent: '#FFB800',
      secondary: '#F43F5E',
      bg: '#0F0B08',
      badge: 'Warm Wealth',
      gradient: 'linear-gradient(135deg, #FFB800 0%, #F43F5E 100%)',
    },
    {
      id: 'monolith-dark',
      name: 'Monolith Stealth',
      accent: '#E2E8F0',
      secondary: '#64748B',
      bg: '#000000',
      badge: 'Zero Glow OLED',
      gradient: 'linear-gradient(135deg, #E2E8F0 0%, #64748B 100%)',
    },
  ];

  const CURRENCIES = [
    { code: '₹', name: 'INR (₹)', region: 'India (Default)' },
    { code: '$', name: 'USD ($)', region: 'United States / Global' },
    { code: '€', name: 'EUR (€)', region: 'European Union' },
    { code: '£', name: 'GBP (£)', region: 'United Kingdom' },
    { code: '¥', name: 'JPY (¥)', region: 'Japan' },
    { code: 'AED ', name: 'AED (د.إ)', region: 'United Arab Emirates' },
    { code: 'C$', name: 'CAD (C$)', region: 'Canada' },
    { code: 'A$', name: 'AUD (A$)', region: 'Australia' },
    { code: 'S$', name: 'SGD (S$)', region: 'Singapore' },
  ];

  const handleExportBackup = () => {
    const data = {
      version: '3.5.0',
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

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.config) {
          if (parsed.config.modules) stageModuleToggle('__BULK__');
          stageThemeChange(parsed.config.theme || {});
          stageRegionalChange(parsed.config.regional || {});
          if (parsed.config.dashboardLayout) stageDashboardLayoutChange(parsed.config.dashboardLayout);
          setImportStatus('Backup loaded into staging! Click "Confirm Changes" in the bottom bar to apply.');
          setTimeout(() => setImportStatus(''), 5000);
        }
      } catch (err) {
        setImportStatus('Failed to parse backup file.');
        setTimeout(() => setImportStatus(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  const moveLayoutItem = (index, direction) => {
    const layout = [...(stagedConfig.dashboardLayout || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= layout.length) return;
    const temp = layout[index];
    layout[index] = layout[targetIndex];
    layout[targetIndex] = temp;
    stageDashboardLayoutChange(layout);
  };

  const toggleLayoutItem = (index) => {
    const layout = [...(stagedConfig.dashboardLayout || [])];
    layout[index] = { ...layout[index], visible: !layout[index].visible };
    stageDashboardLayoutChange(layout);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '90px' }}>
      {/* 1. HERO HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="animate-live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Studio Control Hub • v3.5
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>
            Sovereign Customization & Studio Hub
          </h1>
          <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
            Granularly toggle modular features, design visual themes, calibrate device hardware, and manage backups.
          </p>
        </div>

        {isDirty && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#FDE68A',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} className="animate-pulse" />
            <span>Unapplied Staged Changes Active</span>
          </div>
        )}
      </div>

      {/* 2. STUDIO NAVIGATION FILTER CHIPS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { id: 'modules', label: 'Feature Modules', icon: Layers },
          { id: 'models', label: 'AI Models & Voice', icon: Bot },
          { id: 'theme', label: 'Theme Studio', icon: Palette },
          { id: 'dashboard', label: 'Dashboard Studio', icon: LayoutGrid },
          { id: 'regional', label: 'Currency & Regional', icon: Globe },
          { id: 'device', label: 'Hardware Profiler', icon: Cpu },
          { id: 'snapshots', label: 'Backup Vault', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`filter-chip ${isActive ? 'filter-chip-active' : ''}`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. STUDIO VIEWS */}
      <AnimatePresence mode="wait">
        {/* TAB 1: FEATURE MODULES */}
        {activeTab === 'modules' && (
          <motion.div
            key="modules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {/* Fundamental Baseline Notice */}
            <div
              className="glass-card"
              style={{
                padding: '16px 20px',
                border: '1px solid rgba(0, 255, 135, 0.2)',
                background: 'linear-gradient(145deg, rgba(0, 255, 135, 0.04) 0%, rgba(13, 17, 28, 0.8) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <ShieldCheck size={18} color="#00FF87" />
                <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                  Fundamental Core Systems (Always Active)
                </h3>
              </div>
              <p className="body-sm" style={{ margin: 0, color: '#94A3B8', fontSize: '12.5px' }}>
                Standard Double-Entry Ledger, Category Management, Net Cash Flow Summary, and Dual-Token JWT Security are locked on by default to guarantee absolute mathematical accounting stability.
              </p>
            </div>

            {/* 12 Modular Extension Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '14px',
              }}
            >
              {MODULE_REGISTRY.map((mod) => {
                const Icon = mod.icon;
                const isEnabled = !!stagedConfig.modules?.[mod.key];
                return (
                  <div
                    key={mod.key}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: isEnabled ? `1px solid ${mod.color}40` : '1px solid rgba(255, 255, 255, 0.06)',
                      background: isEnabled ? `linear-gradient(145deg, ${mod.color}0A 0%, rgba(13, 17, 28, 0.85) 100%)` : 'rgba(13, 17, 28, 0.5)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isEnabled ? `0 0 20px ${mod.color}15` : 'none',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: `${mod.color}15`,
                            border: `1px solid ${mod.color}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: mod.color,
                            boxShadow: `0 0 12px ${mod.color}25`,
                          }}
                        >
                          <Icon size={20} />
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div
                          onClick={() => stageModuleToggle(mod.key)}
                          style={{
                            width: '48px',
                            height: '26px',
                            borderRadius: '999px',
                            background: isEnabled ? 'linear-gradient(135deg, #00FF87, #FFD700)' : 'rgba(255, 255, 255, 0.1)',
                            border: isEnabled ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '3px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <motion.div
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: isEnabled ? '#050810' : '#94A3B8',
                              marginLeft: isEnabled ? 'auto' : '0',
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h4 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                          {mod.title}
                        </h4>
                      </div>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: `${mod.color}15`,
                          color: mod.color,
                          border: `1px solid ${mod.color}30`,
                          display: 'inline-block',
                          marginBottom: '10px',
                        }}
                      >
                        {mod.tag}
                      </span>

                      <p className="body-sm" style={{ margin: 0, color: '#94A3B8', fontSize: '12px', lineHeight: 1.45 }}>
                        {mod.desc}
                      </p>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11.5px', color: isEnabled ? '#00FF87' : '#64748B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isEnabled ? '#00FF87' : '#64748B' }} />
                        {isEnabled ? 'Module Active' : 'Disabled'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                        ID: {mod.key}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 2: THEME STUDIO */}
        {activeTab === 'theme' && (
          <motion.div
            key="theme"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 className="heading-lg" style={{ margin: '0 0 4px 0', color: '#F8FAFC' }}>
                  Luxury Visual Palette Engine
                </h3>
                <p className="body-sm" style={{ margin: 0, color: '#94A3B8' }}>
                  Select curated obsidian color schemes, tailored glow accents, and dynamic glass gradients.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {THEMES_CATALOG.map((th) => {
                  const isSelected = stagedConfig.theme?.palette === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => stageThemeChange({ palette: th.id, accentColor: th.accent })}
                      className="glass-card-interactive"
                      style={{
                        padding: '18px',
                        border: isSelected ? `2px solid ${th.accent}` : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                        boxShadow: isSelected ? `0 0 24px ${th.accent}30` : 'none',
                      }}
                    >
                      <div style={{ height: '48px', borderRadius: '10px', background: th.gradient, marginBottom: '14px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 0, 0, 0.2)' }} />
                        <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', fontWeight: 800, background: 'rgba(0, 0, 0, 0.6)', padding: '2px 8px', borderRadius: '4px', color: '#FFFFFF' }}>
                          {th.badge}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>{th.name}</h4>
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>Accent: {th.accent}</span>
                        </div>
                        {isSelected && <CheckCircle2 size={18} color={th.accent} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: DASHBOARD STUDIO */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 className="heading-lg" style={{ margin: '0 0 4px 0', color: '#F8FAFC' }}>
                  Bento Dashboard Card Layout & Order
                </h3>
                <p className="body-sm" style={{ margin: 0, color: '#94A3B8' }}>
                  Reorder and toggle individual widget cards rendered on the primary Financial Overview dashboard.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(stagedConfig.dashboardLayout || []).map((card, idx) => (
                  <div
                    key={card.id}
                    className="glass-card"
                    style={{
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: card.visible ? 1 : 0.45,
                      border: card.visible ? '1px solid rgba(255, 255, 255, 0.08)' : '1px dashed rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: '#00FF87' }}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>{card.label}</h4>
                        <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>Widget ID: {card.id}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => moveLayoutItem(idx, -1)}
                        disabled={idx === 0}
                        className="btn-icon-soft"
                        style={{ opacity: idx === 0 ? 0.3 : 1 }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLayoutItem(idx, 1)}
                        disabled={idx === (stagedConfig.dashboardLayout?.length || 1) - 1}
                        className="btn-icon-soft"
                        style={{ opacity: idx === (stagedConfig.dashboardLayout?.length || 1) - 1 ? 0.3 : 1 }}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleLayoutItem(idx)}
                        className="btn-glass-secondary"
                        style={{
                          height: '32px',
                          padding: '4px 12px',
                          fontSize: '11.5px',
                          color: card.visible ? '#00FF87' : '#94A3B8',
                          borderColor: card.visible ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {card.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{card.visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CURRENCY & REGIONAL */}
        {activeTab === 'regional' && (
          <motion.div
            key="regional"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 className="heading-lg" style={{ margin: '0 0 4px 0', color: '#F8FAFC' }}>
                  Default Primary Ledger Currency
                </h3>
                <p className="body-sm" style={{ margin: 0, color: '#94A3B8' }}>
                  Select the sovereign fiat currency for all accounting summaries and budget targets.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {CURRENCIES.map((curr) => {
                  const isSelected = stagedConfig.regional?.currency === curr.code;
                  return (
                    <div
                      key={curr.code}
                      onClick={() => stageRegionalChange({ currency: curr.code })}
                      className="glass-card-interactive"
                      style={{
                        padding: '14px 16px',
                        border: isSelected ? '1px solid #00FF87' : '1px solid rgba(255, 255, 255, 0.07)',
                        background: isSelected ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        boxShadow: isSelected ? '0 0 16px rgba(0, 255, 135, 0.2)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="font-display" style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>{curr.name}</span>
                        {isSelected && <CheckCircle2 size={16} color="#00FF87" />}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{curr.region}</span>
                    </div>
                  );
                })}
              </div>

              {/* Number Format System */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '18px' }}>
                  <h4 className="heading-md" style={{ margin: '0 0 10px 0', color: '#F8FAFC' }}>Number Notation Format</h4>
                  {[
                    { id: 'INDIAN_LAKHS_CRORES', title: 'Indian System (Lakhs & Crores)', example: '₹1,50,000.00 / ₹12,45,000.00' },
                    { id: 'INTERNATIONAL_MILLIONS', title: 'International (Millions & Billions)', example: '$150,000.00 / $1,245,000.00' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => stageRegionalChange({ numberFormat: item.id })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        background: stagedConfig.regional?.numberFormat === item.id ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: stagedConfig.regional?.numberFormat === item.id ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F8FAFC' }}>{item.title}</div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '11px', color: '#00F0FF' }}>{item.example}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '18px' }}>
                  <h4 className="heading-md" style={{ margin: '0 0 10px 0', color: '#F8FAFC' }}>Fiscal Tax Year Start</h4>
                  {[
                    { id: 'april', title: 'April 1st (Indian Fiscal Year - FY)', desc: 'Standard for Indian taxation & 80C computation.' },
                    { id: 'january', title: 'January 1st (Calendar Year - CY)', desc: 'Standard international accounting cycle.' },
                  ].map((fy) => (
                    <div
                      key={fy.id}
                      onClick={() => stageRegionalChange({ fiscalYearStart: fy.id })}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        background: stagedConfig.regional?.fiscalYearStart === fy.id ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                        border: stagedConfig.regional?.fiscalYearStart === fy.id ? '1px solid rgba(0, 255, 135, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F8FAFC' }}>{fy.title}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{fy.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: HARDWARE PROFILER */}
        {activeTab === 'device' && (
          <motion.div
            key="device"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DevicePerformanceCard />
          </motion.div>
        )}

        {/* TAB 6: BACKUP VAULT */}
        {activeTab === 'snapshots' && (
          <motion.div
            key="snapshots"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
          >
            {/* Manual Checkpoint Creator */}
            <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 className="heading-md" style={{ margin: '0 0 2px 0', color: '#F8FAFC' }}>
                  Create Manual Checkpoint
                </h3>
                <p className="body-sm" style={{ margin: 0, color: '#94A3B8' }}>
                  Save an instant encrypted snapshot of current feature flags, custom themes, and layout presets.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Snapshot label (e.g. Pre-Audit Setup)..."
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    width: '240px',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    createManualSnapshot(snapshotLabel || 'Manual Checkpoint');
                    setSnapshotLabel('');
                  }}
                  className="btn-primary-mint"
                  style={{ height: '36px', padding: '0 16px', fontSize: '12px' }}
                >
                  <ShieldCheck size={14} />
                  <span>Snapshot Now</span>
                </button>
              </div>
            </div>

            {/* Import & Export Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 className="heading-md" style={{ margin: '0 0 6px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} color="#00FF87" />
                  Export Customization JSON
                </h4>
                <p className="body-sm" style={{ margin: '0 0 16px 0', color: '#94A3B8' }}>
                  Download a secure JSON archive containing all feature flags, themes, and snapshot logs.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="btn-glass-secondary"
                  style={{ width: '100%', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}
                >
                  <Download size={14} />
                  <span>Download Backup File</span>
                </button>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <h4 className="heading-md" style={{ margin: '0 0 6px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={16} color="#00F0FF" />
                  Import Customization JSON
                </h4>
                <p className="body-sm" style={{ margin: '0 0 16px 0', color: '#94A3B8' }}>
                  Re-hydrate preferences from a previously saved JSON configuration file.
                </p>
                <label
                  className="btn-glass-secondary"
                  style={{
                    width: '100%',
                    color: '#00F0FF',
                    borderColor: 'rgba(0, 240, 255, 0.3)',
                    borderStyle: 'dashed',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Upload size={14} />
                  <span>Upload & Stage Backup</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
                </label>
                {importStatus && (
                  <div style={{ fontSize: '11px', color: '#00FF87', marginTop: '8px', textAlign: 'center' }}>
                    {importStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Historical Snapshots List */}
            <div className="glass-card" style={{ padding: '20px 24px' }}>
              <h3 className="heading-md" style={{ margin: '0 0 14px 0', color: '#F8FAFC' }}>
                Saved State Checkpoints ({snapshots.length})
              </h3>
              {snapshots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B', fontSize: '12.5px' }}>
                  No checkpoints logged yet. Automatic snapshots are created before every confirmed sync.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                  {snapshots.map((snap) => (
                    <div
                      key={snap.snapshotId}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                            {snap.label || (snap.triggerReason === 'FEATURE_FLAG_CHANGE' ? 'Pre-Sync Auto-Backup' : 'Manual Snapshot')}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'var(--font-mono)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#94A3B8',
                            }}
                          >
                            {snap.triggerReason}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} />
                          <span>{new Date(snap.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => restoreSnapshot(snap.snapshotId)}
                        className="btn-glass-secondary"
                        style={{ height: '30px', padding: '0 12px', fontSize: '11.5px', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 7: AI MODELS & VOICE STUDIO */}
        {activeTab === 'models' && (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LocalAiModelStudio />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomizationPage;
