import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileDeviceCapabilities } from '../services/deviceCapabilityProfiler';

const DeviceCapabilityContext = createContext(null);

export const DeviceCapabilityProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isProfiling, setIsProfiling] = useState(true);
  const [manualOverrideTier, setManualOverrideTier] = useState(() => {
    try {
      const saved = localStorage.getItem('richy_manual_tier_override');
      return saved !== null ? Number(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const runProfiler = useCallback(async () => {
    setIsProfiling(true);
    try {
      const result = await profileDeviceCapabilities();
      setProfile(result);
    } catch (err) {
      console.warn('[Device Capability Profiler Error]:', err);
    } finally {
      setIsProfiling(false);
    }
  }, []);

  useEffect(() => {
    runProfiler();
  }, [runProfiler]);

  const setTierOverride = useCallback((tier) => {
    setManualOverrideTier(tier);
    if (tier === null) {
      localStorage.removeItem('richy_manual_tier_override');
    } else {
      localStorage.setItem('richy_manual_tier_override', String(tier));
    }
  }, []);

  // Effective tier is manual override if set, otherwise auto-detected tier (default 1)
  const effectiveTier = manualOverrideTier !== null ? manualOverrideTier : (profile?.tier ?? 1);

  const isEcoMode = effectiveTier === 0;
  const isBalanced = effectiveTier === 1;
  const isPro = effectiveTier === 2;

  return (
    <DeviceCapabilityContext.Provider
      value={{
        profile,
        isProfiling,
        effectiveTier,
        manualOverrideTier,
        isEcoMode,
        isBalanced,
        isPro,
        setTierOverride,
        refreshProfiler: runProfiler,
      }}
    >
      {children}
    </DeviceCapabilityContext.Provider>
  );
};

export const useDeviceCapability = () => {
  const context = useContext(DeviceCapabilityContext);
  if (!context) {
    throw new Error('useDeviceCapability must be used within a DeviceCapabilityProvider');
  }
  return context;
};
