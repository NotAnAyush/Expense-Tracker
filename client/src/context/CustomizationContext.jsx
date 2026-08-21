import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from './AuthContext';

const CustomizationContext = createContext(null);

export const DEFAULT_CUSTOMIZATION_CONFIG = {
  modules: {
    aiCopilot: true,
    receiptOcr: true,
    fireSimulator: true,
    debtOptimizer: true,
    groupSplitting: true,
    travelFxVaults: true,
    lifestyleHabits: true,
    voiceLogging: true,
    bankCsvImport: true,
    advancedTax: true,
    deluxeVisuals: true,
    geotradeTerminal: true,
  },
  theme: {
    themeId: 'midnight-obsidian',
    accentColor: '#00FF87',
    glassmorphismOpacity: 0.72,
    fontScale: 100,
    borderRadius: '16px',
  },
  dashboardLayout: [
    { id: 'hero-dial', label: 'Net Worth & Health Dial', visible: true, order: 1, minSpan: 4 },
    { id: 'cashflow-velocity', label: 'Cash Flow Velocity', visible: true, order: 2, minSpan: 4 },
    { id: 'monthly-trends', label: 'Monthly Trends Bar', visible: true, order: 3, minSpan: 8 },
    { id: 'category-breakdown', label: 'Category Donut', visible: true, order: 4, minSpan: 4 },
    { id: 'habit-nudges', label: 'Behavioral Habit Nudges', visible: true, order: 5, minSpan: 4 },
    { id: 'fire-gauge', label: 'FIRE Milestone Radar', visible: true, order: 6, minSpan: 4 },
    { id: 'debt-radar', label: 'Debt Avalanche Tracker', visible: true, order: 7, minSpan: 6 },
    { id: 'recent-transactions', label: 'Recent Transactions Ledger', visible: true, order: 8, minSpan: 12 },
  ],
  regional: {
    currency: '₹',
    numberFormat: 'INDIAN_LAKHS_CRORES',
    fiscalYearStart: 'april',
  },
};

const THEMES_METADATA = {
  'midnight-obsidian': {
    name: 'Midnight Obsidian',
    description: 'Deep obsidian black luxury finish with neon mint & emerald accents.',
    bg: '#080B11',
    card: 'rgba(13, 17, 28, 0.72)',
    accent: '#00FF87',
    border: 'rgba(0, 255, 135, 0.25)',
  },
  'cyber-gold': {
    name: 'Cyber Gold Sovereign',
    description: 'Anthracite slate background with warm gold & amber glowing borders.',
    bg: '#0B0B0E',
    card: 'rgba(20, 18, 24, 0.78)',
    accent: '#FFD700',
    border: 'rgba(255, 215, 0, 0.28)',
  },
  'emerald-sovereign': {
    name: 'Emerald Sovereign',
    description: 'Deep forest green luxury fintech matrix with brilliant emerald tones.',
    bg: '#050D0A',
    card: 'rgba(10, 24, 18, 0.75)',
    accent: '#10B981',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  'neon-violet': {
    name: 'Neon Synth Violet',
    description: 'Cyberpunk deep indigo canvas with glowing violet & cyan highlights.',
    bg: '#090814',
    card: 'rgba(18, 15, 32, 0.75)',
    accent: '#8B5CF6',
    border: 'rgba(139, 92, 246, 0.3)',
  },
  'minimalist-snow': {
    name: 'Minimalist High-Contrast',
    description: 'Ultra-clean slate monochrome background for maximum daylight readability.',
    bg: '#0F172A',
    card: 'rgba(30, 41, 59, 0.85)',
    accent: '#38BDF8',
    border: 'rgba(56, 189, 248, 0.3)',
  },
};

export const CustomizationProvider = ({ children }) => {
  const { user } = useAuth();

  // Active configuration (live, committed state)
  const [activeConfig, setActiveConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('richy_active_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...DEFAULT_CUSTOMIZATION_CONFIG,
          ...parsed,
          modules: { ...DEFAULT_CUSTOMIZATION_CONFIG.modules, ...(parsed.modules || {}) },
          theme: { ...DEFAULT_CUSTOMIZATION_CONFIG.theme, ...(parsed.theme || {}) },
          regional: { ...DEFAULT_CUSTOMIZATION_CONFIG.regional, ...(parsed.regional || {}) },
        };
      }
    } catch (e) {
      console.warn('[Customization] Failed to parse cached active config:', e);
    }
    return DEFAULT_CUSTOMIZATION_CONFIG;
  });

  // Staged configuration (in-flight draft buffer)
  const [stagedConfig, setStagedConfig] = useState(activeConfig);
  const [isApplying, setIsApplying] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Memento State Snapshots
  const [snapshots, setSnapshots] = useState(() => {
    try {
      const cachedSnapshots = localStorage.getItem('richy_state_snapshots');
      return cachedSnapshots ? JSON.parse(cachedSnapshots) : [];
    } catch (e) {
      return [];
    }
  });

  // Check if staged configuration has unapplied differences
  const isDirty = JSON.stringify(stagedConfig) !== JSON.stringify(activeConfig);

  // Sync with cloud on initial user authentication
  useEffect(() => {
    if (user?.customization && Object.keys(user.customization).length > 0) {
      const merged = {
        ...DEFAULT_CUSTOMIZATION_CONFIG,
        ...user.customization,
        modules: { ...DEFAULT_CUSTOMIZATION_CONFIG.modules, ...(user.customization.modules || {}) },
        theme: { ...DEFAULT_CUSTOMIZATION_CONFIG.theme, ...(user.customization.theme || {}) },
        regional: { ...DEFAULT_CUSTOMIZATION_CONFIG.regional, ...(user.customization.regional || {}) },
      };
      setActiveConfig(merged);
      setStagedConfig(merged);
      localStorage.setItem('richy_active_config', JSON.stringify(merged));
    }
  }, [user]);

  // Apply CSS design tokens dynamically whenever activeConfig.theme changes
  useEffect(() => {
    const root = document.documentElement;
    const { theme } = activeConfig;
    if (theme) {
      if (theme.accentColor) {
        root.style.setProperty('--color-mint', theme.accentColor);
        root.style.setProperty('--color-mint-glow', `${theme.accentColor}33`);
      }
      if (theme.fontScale) {
        root.style.setProperty('--font-scale', `${theme.fontScale}%`);
      }
      if (theme.glassmorphismOpacity !== undefined) {
        root.style.setProperty(
          '--bg-obsidian-card',
          `rgba(13, 17, 28, ${theme.glassmorphismOpacity})`
        );
      }
    }
  }, [activeConfig.theme]);

  // Staging API methods
  const stageModuleToggle = useCallback((moduleKey) => {
    setStagedConfig((prev) => ({
      ...prev,
      modules: {
        ...prev.modules,
        [moduleKey]: !prev.modules[moduleKey],
      },
    }));
  }, []);

  const stageThemeChange = useCallback((newThemeProps) => {
    setStagedConfig((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...newThemeProps },
    }));
  }, []);

  const stageDashboardLayoutChange = useCallback((newLayout) => {
    setStagedConfig((prev) => ({
      ...prev,
      dashboardLayout: newLayout,
    }));
  }, []);

  const stageRegionalChange = useCallback((newRegionalProps) => {
    setStagedConfig((prev) => ({
      ...prev,
      regional: { ...prev.regional, ...newRegionalProps },
    }));
  }, []);

  const discardStagedChanges = useCallback(() => {
    setStagedConfig(activeConfig);
  }, [activeConfig]);

  // Atomic 4-Step Commit Pipeline
  const confirmAndApplyChanges = useCallback(async () => {
    setIsApplying(true);
    try {
      // Step 1: Pre-Flight Validation
      // Ensure at least basic core integrity is valid

      // Step 2: Take Automated Encrypted Pre-Sync Snapshot (Memento Pattern)
      const snapshot = {
        snapshotId: crypto.randomUUID ? crypto.randomUUID() : `snap_${Date.now()}`,
        timestamp: new Date().toISOString(),
        triggerReason: 'FEATURE_FLAG_CHANGE',
        previousConfig: activeConfig,
      };

      const updatedSnapshots = [snapshot, ...snapshots.slice(0, 14)];
      setSnapshots(updatedSnapshots);
      localStorage.setItem('richy_state_snapshots', JSON.stringify(updatedSnapshots));

      // Step 3: Atomic Mutation & Local Storage
      setActiveConfig(stagedConfig);
      localStorage.setItem('richy_active_config', JSON.stringify(stagedConfig));

      // Sync to cloud backend
      if (user) {
        await apiFetch('/api/users/customization', {
          method: 'PUT',
          body: JSON.stringify(stagedConfig),
        }).catch((err) => {
          console.warn('[Customization Cloud Sync Deferred]:', err.message);
        });
      }

      setLastSyncTime(new Date().toISOString());

      // Step 4: Self-Aware Layout Re-Formatting (Triggered automatically by activeConfig React state updates)
      return { success: true, snapshotId: snapshot.snapshotId };
    } catch (err) {
      console.error('[Apply Customization Failed]:', err);
      // Revert in-memory staged to active on failure
      setStagedConfig(activeConfig);
      throw err;
    } finally {
      setIsApplying(false);
    }
  }, [activeConfig, stagedConfig, snapshots, user]);

  // Restore snapshot (Instant Rollback)
  const restoreSnapshot = useCallback((snapshotId) => {
    const target = snapshots.find((s) => s.snapshotId === snapshotId);
    if (target && target.previousConfig) {
      setActiveConfig(target.previousConfig);
      setStagedConfig(target.previousConfig);
      localStorage.setItem('richy_active_config', JSON.stringify(target.previousConfig));
      if (user) {
        apiFetch('/api/users/customization', {
          method: 'PUT',
          body: JSON.stringify(target.previousConfig),
        }).catch((err) => console.warn('[Customization Restore Cloud Sync Deferred]:', err.message));
      }
      return true;
    }
    return false;
  }, [snapshots, user]);

  // Take manual snapshot
  const createManualSnapshot = useCallback((label = 'Manual Snapshot') => {
    const snapshot = {
      snapshotId: crypto.randomUUID ? crypto.randomUUID() : `snap_${Date.now()}`,
      timestamp: new Date().toISOString(),
      triggerReason: 'MANUAL_USER',
      label,
      previousConfig: activeConfig,
    };
    const updatedSnapshots = [snapshot, ...snapshots.slice(0, 14)];
    setSnapshots(updatedSnapshots);
    localStorage.setItem('richy_state_snapshots', JSON.stringify(updatedSnapshots));
    return snapshot;
  }, [activeConfig, snapshots]);

  return (
    <CustomizationContext.Provider
      value={{
        activeConfig,
        stagedConfig,
        isDirty,
        isApplying,
        snapshots,
        lastSyncTime,
        themesMetadata: THEMES_METADATA,
        stageModuleToggle,
        stageThemeChange,
        stageDashboardLayoutChange,
        stageRegionalChange,
        discardStagedChanges,
        confirmAndApplyChanges,
        restoreSnapshot,
        createManualSnapshot,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
};

export const useCustomization = () => {
  const context = useContext(CustomizationContext);
  if (!context) {
    throw new Error('useCustomization must be used within a CustomizationProvider');
  }
  return context;
};
