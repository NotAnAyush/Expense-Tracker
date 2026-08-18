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
      <div className="glass-card" style={{ padding: '20px', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#94A3B8', fontSize: '12.5px' }}>Synthesizing on-device habit metrics...</div>
      </div>
    );
  }

  const score = profile?.habitScore || 85;
  const cadence = profile?.cadence || { cadenceType: 'SALARIED_FIXED', coefficientOfVariation: 0.05 };
  const lateNight = profile?.lateNight || { isHighRisk: false, impulseRatio: 0 };
  const euphoria = profile?.euphoria || { hasEuphoriaSpike: false };

  return (
    <div
      className="glass-card"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid rgba(0, 255, 135, 0.2)',
        background: 'linear-gradient(145deg, rgba(0, 255, 135, 0.03) 0%, rgba(13, 17, 28, 0.85) 100%)',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 255, 135, 0.12)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00FF87',
              }}
            >
              <Activity size={18} />
            </div>
            <div>
              <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                Lifestyle & Habit Intelligence
              </h3>
              <span style={{ fontSize: '10.5px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#00FF87', textTransform: 'uppercase' }}>
                On-Device Mathematical Profiling
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(0, 255, 135, 0.12)',
              border: '1px solid rgba(0, 255, 135, 0.3)',
              color: '#00FF87',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Score: {score}/100
          </div>
        </div>

        {/* Behavioral Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#94A3B8', marginBottom: '3px' }}>
              <Clock size={12} color="#00F0FF" />
              <span>Income Rhythm</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {cadence.cadenceType === 'SALARIED_FIXED' ? 'Salaried Fixed' : cadence.cadenceType === 'IRREGULAR_GIG' ? 'Gig Variable' : 'Semi-Regular'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#94A3B8', marginBottom: '3px' }}>
              <Moon size={12} color="#A78BFA" />
              <span>Late-Night Leaks</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F8FAFC' }}>
              {lateNight.isHighRisk ? `${Math.round(lateNight.impulseRatio * 100)}% (High)` : 'Guarded 🛡️'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#94A3B8', marginBottom: '3px' }}>
              <Zap size={12} color="#FFD700" />
              <span>Payday Surge</span>
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F8FAFC' }}>
              {euphoria.hasEuphoriaSpike ? 'Surge Active ⚡' : 'Controlled 🛡️'}
            </div>
          </div>
        </div>

        {/* Nudges List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(profile?.nudges || []).map((nudge) => (
            <div
              key={nudge.id}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: nudge.type === 'critical' ? 'rgba(244, 63, 94, 0.08)' : nudge.type === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 255, 135, 0.06)',
                border: nudge.type === 'critical' ? '1px solid rgba(244, 63, 94, 0.25)' : nudge.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(0, 255, 135, 0.25)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px',
                color: nudge.type === 'critical' ? '#FECDD3' : nudge.type === 'warning' ? '#FDE68A' : '#D1FAE5',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                {nudge.type === 'critical' ? <AlertCircle size={14} color="#F43F5E" /> : <Sparkles size={14} color="#00FF87" />}
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '1px' }}>{nudge.title}</strong>
                <span style={{ fontSize: '11.5px', opacity: 0.9 }}>{nudge.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitNudgesCard;
