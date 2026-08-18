import React, { useState, useEffect } from 'react';
import { Activity, Zap, ShieldCheck, AlertCircle, Clock, Sparkles, TrendingUp, Moon } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { calculateLocalHabitProfile } from '../../services/localHabitEngine';

export const HabitNudgesCard = ({ expenses = [], incomes = [] }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const res = await apiFetch('/analytics/habit-profile');
        if (isMounted && res) {
          setProfile(res);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to client-side on-device calculation
        if (isMounted) {
          const localRes = calculateLocalHabitProfile(expenses, incomes);
          setProfile(localRes);
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [expenses, incomes]);

  if (loading && !profile) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl animate-pulse">
        <div className="h-4 w-36 bg-slate-800 rounded mb-3" />
        <div className="h-10 w-full bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  const score = profile?.habitScore || 85;
  const cadence = profile?.cadence || { cadenceType: 'SALARIED_FIXED', coefficientOfVariation: 0.05 };
  const lateNight = profile?.lateNight || { isHighRisk: false, impulseRatio: 0 };
  const euphoria = profile?.euphoria || { hasEuphoriaSpike: false };

  return (
    <div className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Lifestyle & Habit Intelligence
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  On-Device AI
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
            <span>Score: {score}/100</span>
          </div>
        </div>

        {/* Behavioral Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Income Rhythm</span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {cadence.cadenceType === 'SALARIED_FIXED' ? 'Salaried Fixed' : cadence.cadenceType === 'IRREGULAR_GIG' ? 'Gig / Variable' : 'Semi-Regular'}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
              <Moon className="w-3 h-3 text-violet-400" />
              <span>Late-Night Leaks</span>
            </div>
            <div className="text-xs font-bold text-white">
              {lateNight.isHighRisk ? `${Math.round(lateNight.impulseRatio * 100)}% (High)` : 'Low / Guarded'}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Payday Spike</span>
            </div>
            <div className="text-xs font-bold text-white">
              {euphoria.hasEuphoriaSpike ? 'Surge Detected ⚡' : 'Controlled 🛡️'}
            </div>
          </div>
        </div>

        {/* Nudges List */}
        <div className="space-y-2">
          {(profile?.nudges || []).map((nudge) => (
            <div
              key={nudge.id}
              className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                nudge.type === 'critical' || nudge.type === 'alert'
                  ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  : nudge.type === 'warning'
                  ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {nudge.type === 'critical' || nudge.type === 'alert' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : nudge.type === 'warning' ? (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 leading-snug">
                <span className="font-bold block mb-0.5">{nudge.title}</span>
                <span className="text-[11px] opacity-90">{nudge.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitNudgesCard;
