import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Globe,
  Bell,
  Lock,
  Smartphone,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  Flame,
  Award,
  Calendar,
  DollarSign,
  TrendingUp,
  PieChart,
  Trash2,
  RefreshCw,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Sliders,
  HelpCircle,
  Laptop,
  CheckCheck,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import LinkedAccountsCard from '../components/Profile/LinkedAccountsCard';
import SecretVaultCard from '../components/Vault/SecretVaultCard';

// Preset avatar styles
const AVATAR_PRESETS = [
  { id: 'gradient_gold', name: 'Imperial Gold', bg: 'linear-gradient(135deg, #FFD700 0%, #FF8800 100%)', glow: 'rgba(255, 215, 0, 0.4)', text: '#050810' },
  { id: 'gradient_mint', name: 'Cyber Mint', bg: 'linear-gradient(135deg, #00FF87 0%, #00F0FF 100%)', glow: 'rgba(0, 255, 135, 0.4)', text: '#050810' },
  { id: 'gradient_violet', name: 'Neon Violet', bg: 'linear-gradient(135deg, #7928CA 0%, #FF007A 100%)', glow: 'rgba(121, 40, 202, 0.4)', text: '#FFFFFF' },
  { id: 'gradient_flame', name: 'Sunset Flame', bg: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', glow: 'rgba(255, 65, 108, 0.4)', text: '#FFFFFF' },
];

const EMOJI_PRESETS = ['👑', '💎', '⚡', '🚀', '🦁', '🦅', '💰', '🛡️', '🎯', '🌟', '🎩', '🏛️'];

const CURRENCY_OPTIONS = [
  { code: '₹', name: 'Indian Rupee (INR)', locale: 'en-IN' },
  { code: '$', name: 'US Dollar (USD)', locale: 'en-US' },
  { code: '€', name: 'Euro (EUR)', locale: 'de-DE' },
  { code: '£', name: 'British Pound (GBP)', locale: 'en-GB' },
  { code: '¥', name: 'Japanese Yen (JPY)', locale: 'ja-JP' },
  { code: 'AED', name: 'UAE Dirham (AED)', locale: 'ar-AE' },
  { code: 'CAD', name: 'Canadian Dollar (CAD)', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar (AUD)', locale: 'en-AU' },
  { code: 'SGD', name: 'Singapore Dollar (SGD)', locale: 'en-SG' },
];

export const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { isPrivacyMaskActive, togglePrivacyMask } = usePrivacy();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('identity');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    upiId: '',
    avatarUrl: '',
    avatarStyle: 'gradient_gold',
    avatarEmoji: '👑',
    occupation: '',
    financialPersona: 'sovereign_wealth',
    bio: '',
    location: '',
    preferredCurrency: '₹',
    monthlyIncomeEstimate: 0,
    targetSavingsRate: 40,
    defaultPaymentMethod: 'UPI',
    taxRegime: 'new_regime_in',
    fireTargetAge: 45,
    emergencyFundMonths: 6,
    locale: 'en-IN',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    fiscalYearStart: 'april',
    themePreference: 'dark',
    defaultPrivacyMask: false,
    notificationPreferences: {
      budgetAlerts: true,
      anomalyAlerts: true,
      recurringAlerts: true,
      weeklySummary: true,
      debtMilestones: true,
      emailNotifications: false,
      browserNotifications: false,
    },
  });

  // Original snapshot for dirty-state detection
  const [originalData, setOriginalData] = useState(null);

  // Metadata & Stats
  const [stats, setStats] = useState({
    totalExpensesCount: 0,
    totalIncomeCount: 0,
    activeGoalsCount: 0,
    activeDebtsCount: 0,
    activeSubscriptionsCount: 0,
    activeGroupsCount: 0,
    activeTripsCount: 0,
    accountAgeDays: 1,
    sovereigntyTier: 'Diamond Sovereign VIP',
  });

  // Multi-device sessions
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: '', error: '' });

  // UI state
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState({ text: '', type: 'success' });
  const [copiedId, setCopiedId] = useState(false);
  const [showCard3D, setShowCard3D] = useState(true);
  const [exporting, setExporting] = useState(false);

  // 3D Card tilt state
  const cardRef = useRef(null);
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });

  // Fetch full profile and stats on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch('/users/profile');
        if (data.user) {
          const loaded = {
            name: data.user.name || '',
            phone: data.user.phone || '',
            upiId: data.user.upiId || '',
            avatarUrl: data.user.avatarUrl || '',
            avatarStyle: data.user.avatarStyle || 'gradient_gold',
            avatarEmoji: data.user.avatarEmoji || '👑',
            occupation: data.user.occupation || 'Wealth Architect',
            financialPersona: data.user.financialPersona || 'sovereign_wealth',
            bio: data.user.bio || 'Building sovereign financial freedom & compounding wealth.',
            location: data.user.location || 'Bangalore, India',
            preferredCurrency: data.user.preferredCurrency || '₹',
            monthlyIncomeEstimate: data.user.monthlyIncomeEstimate || 0,
            targetSavingsRate: data.user.targetSavingsRate !== undefined ? data.user.targetSavingsRate : 40,
            defaultPaymentMethod: data.user.defaultPaymentMethod || 'UPI',
            taxRegime: data.user.taxRegime || 'new_regime_in',
            fireTargetAge: data.user.fireTargetAge || 45,
            emergencyFundMonths: data.user.emergencyFundMonths || 6,
            locale: data.user.locale || 'en-IN',
            timezone: data.user.timezone || 'Asia/Kolkata',
            dateFormat: data.user.dateFormat || 'DD/MM/YYYY',
            fiscalYearStart: data.user.fiscalYearStart || 'april',
            themePreference: data.user.themePreference || 'dark',
            defaultPrivacyMask: !!data.user.defaultPrivacyMask,
            notificationPreferences: {
              budgetAlerts: data.user.notificationPreferences?.budgetAlerts ?? true,
              anomalyAlerts: data.user.notificationPreferences?.anomalyAlerts ?? true,
              recurringAlerts: data.user.notificationPreferences?.recurringAlerts ?? true,
              weeklySummary: data.user.notificationPreferences?.weeklySummary ?? true,
              debtMilestones: data.user.notificationPreferences?.debtMilestones ?? true,
              emailNotifications: data.user.notificationPreferences?.emailNotifications ?? false,
              browserNotifications: data.user.notificationPreferences?.browserNotifications ?? false,
            },
          };
          setFormData(loaded);
          setOriginalData(JSON.parse(JSON.stringify(loaded)));
        }
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    loadProfile();
  }, []);

  // Fetch active sessions when security tab is opened
  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await apiFetch('/users/sessions');
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!originalData) return false;
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  // Handle general input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested notification preferences
  const handleNotificationToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key],
      },
    }));
  };

  // Show auto-clearing toast
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage({ text: '', type: 'success' });
    }, 4000);
  };

  // Save changes
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateUserProfile(formData);
      setOriginalData(JSON.parse(JSON.stringify(formData)));
      showToast(res.message || 'Profile changes saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (originalData) {
      setFormData(JSON.parse(JSON.stringify(originalData)));
      showToast('Unsaved changes discarded', 'info');
    }
  };

  // Copy User ID
  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
      showToast('Sovereign Account ID copied to clipboard!', 'success');
    }
  };

  // Password change handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, success: '', error: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ loading: false, success: '', error: 'New passwords do not match' });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ loading: false, success: '', error: 'New password must be at least 8 characters' });
      return;
    }

    try {
      const res = await apiFetch('/users/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordStatus({ loading: false, success: res.message, error: '' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      setPasswordStatus({ loading: false, success: '', error: err.message || 'Failed to change password' });
    }
  };

  // Revoke single session
  const handleRevokeSession = async (sessionId) => {
    try {
      await apiFetch(`/users/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast('Session terminated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to revoke session', 'error');
    }
  };

  // Revoke all other sessions
  const handleRevokeAllOtherSessions = async () => {
    try {
      await apiFetch('/users/sessions', { method: 'DELETE' });
      await loadSessions();
      showToast('All other active sessions have been terminated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to revoke sessions', 'error');
    }
  };

  // Full Data Export (JSON & CSV)
  const handleExportData = async (format = 'json') => {
    setExporting(true);
    try {
      const endpoint = format === 'csv' ? '/export/csv' : '/export/json';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `richy_sovereign_backup_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Exported all wealth data as ${format.toUpperCase()} successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  // Password Strength Evaluator
  const passwordStrength = useMemo(() => {
    const pass = passwordForm.newPassword;
    if (!pass) return { score: 0, label: 'None', color: '#64748B' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: '#F43F5E' };
    if (score === 3) return { score: 50, label: 'Fair', color: '#FF9900' };
    if (score === 4) return { score: 75, label: 'Strong', color: '#00F0FF' };
    return { score: 100, label: 'Sovereign Fortress', color: '#00FF87' };
  }, [passwordForm.newPassword]);

  // 3D Card Hover Tilt calculation
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardRotate({
      x: -(y / rect.height) * 18,
      y: (x / rect.width) * 18,
    });
  };

  const handleCardMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
  };

  const activeAvatarPreset = AVATAR_PRESETS.find((p) => p.id === formData.avatarStyle) || AVATAR_PRESETS[0];

  const tabs = [
    { id: 'identity', label: 'Identity & Persona', icon: User, badge: 'Core' },
    { id: 'secret_vault', label: 'Secret Vault', icon: Key, badge: 'AES-256' },
    { id: 'banking_upi', label: 'Linked UPI & Banks', icon: Smartphone, badge: 'Live Sync' },
    { id: 'financial', label: 'Financial Defaults', icon: CreditCard, badge: formData.preferredCurrency },
    { id: 'localization', label: 'Regional & Formats', icon: Globe },
    { id: 'security', label: 'Security & Sessions', icon: Shield, badge: sessions.length ? `${sessions.length} Active` : null },
    { id: 'notifications', label: 'Alerts & Copilot', icon: Bell },
    { id: 'privacy', label: 'Privacy & Governance', icon: Lock },
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '120px' }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage.text && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: '88px',
              right: '28px',
              zIndex: 9999,
              background: toastMessage.type === 'error' ? 'rgba(244, 63, 94, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${toastMessage.type === 'error' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(0, 255, 135, 0.4)'}`,
              borderRadius: '14px',
              padding: '12px 20px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(16px)',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {toastMessage.type === 'error' ? <AlertCircle size={18} color="#FFFFFF" /> : <CheckCircle2 size={18} color="#00FF87" />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HERO BANNER: Luxury Ambient Mesh & Sovereign Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          marginBottom: '28px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(20, 26, 45, 0.85) 0%, rgba(10, 13, 22, 0.95) 100%)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Ambient Glow Aura */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(0, 255, 135, 0.15) 0%, rgba(121, 40, 202, 0.15) 50%, transparent 80%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* User Avatar + Identity Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <div style={{ position: 'relative' }}>
              {/* Animated Halo Glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '24px',
                  background: activeAvatarPreset.bg,
                  filter: 'blur(8px)',
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  background: activeAvatarPreset.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 900,
                  color: activeAvatarPreset.text,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `0 8px 24px ${activeAvatarPreset.glow}`,
                  overflow: 'hidden',
                }}
              >
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt={formData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : formData.avatarStyle === 'emoji' ? (
                  formData.avatarEmoji
                ) : (
                  formData.name ? formData.name.charAt(0).toUpperCase() : 'R'
                )}
              </div>

              {/* Online Indicator Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '999px',
                  background: '#00FF87',
                  border: '3px solid #0A0D14',
                  boxShadow: '0 0 10px #00FF87',
                }}
                title="Sovereign Active Session"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1
                  className="font-display"
                  style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: '#F8FAFC',
                    margin: 0,
                  }}
                >
                  {formData.name || user?.name || 'Sovereign Citizen'}
                </h1>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 136, 0, 0.2))',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                    color: '#FFD700',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Award size={13} color="#FFD700" />
                  {stats.sovereigntyTier}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', color: '#94A3B8', fontSize: '13.5px' }}>
                <span>{user?.email || 'sovereign@richy.app'}</span>
                <span>•</span>
                <span style={{ color: '#00FF87' }}>{formData.occupation || 'Wealth Architect'}</span>
                <span>•</span>
                <span>Account Age: <strong style={{ color: '#F1F5F9' }}>{stats.accountAgeDays}d</strong></span>
              </div>

              <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748B', fontStyle: 'italic', maxWidth: '500px' }}>
                "{formData.bio}"
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCopyId}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12.5px', borderRadius: '10px' }}
              title="Copy User ID for API or Group Ledger invitations"
            >
              {copiedId ? <Check size={14} color="#00FF87" /> : <Copy size={14} />}
              {copiedId ? 'Copied' : 'Copy ID'}
            </button>

            <button
              onClick={() => handleExportData('json')}
              disabled={exporting}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12.5px', borderRadius: '10px' }}
            >
              <Download size={14} />
              {exporting ? 'Exporting...' : 'Export Backup'}
            </button>

            <button
              onClick={() => setShowCard3D(!showCard3D)}
              className="btn btn-secondary"
              style={{
                padding: '8px 14px',
                fontSize: '12.5px',
                borderRadius: '10px',
                background: showCard3D ? 'rgba(0, 255, 135, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: showCard3D ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                color: showCard3D ? '#00FF87' : '#94A3B8',
              }}
            >
              <CreditCard size={14} />
              {showCard3D ? 'Hide Card' : 'Show 3D Card'}
            </button>
          </div>
        </div>

        {/* Mini Quick-Metric Highlights */}
        <div
          style={{
            marginTop: '26px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '14px',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions Logged</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginTop: '2px' }}>{stats.totalExpensesCount}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Goals</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFD700', marginTop: '2px' }}>{stats.activeGoalsCount}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Subscriptions</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#00F0FF', marginTop: '2px' }}>{stats.activeSubscriptionsCount}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Groups & Trips</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#00FF87', marginTop: '2px' }}>{stats.activeGroupsCount + stats.activeTripsCount}</div>
          </div>
        </div>
      </motion.div>

      {/* 2. MAIN LAYOUT: Segmented Tabs & Active Form Content */}
      <div className="profile-layout-grid">
        <div style={{ minWidth: 0, width: '100%' }}>
          {/* Segmented Tab Navigation Bar */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '6px',
              borderRadius: '16px',
              background: 'rgba(15, 20, 32, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              overflowX: 'auto',
              marginBottom: '24px',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, rgba(0, 255, 135, 0.18), rgba(0, 240, 255, 0.12))' : 'transparent',
                    color: isActive ? '#00FF87' : '#94A3B8',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 0 16px rgba(0, 255, 135, 0.15)' : 'none',
                  }}
                >
                  <Icon size={16} color={isActive ? '#00FF87' : '#64748B'} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: isActive ? 'rgba(0, 255, 135, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#00FF87' : '#64748B',
                        fontWeight: 800,
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="profileActiveTabIndicator"
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: '20%',
                        right: '20%',
                        height: '2px',
                        background: '#00FF87',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: IDENTITY & PERSONA */}
          {activeTab === 'identity' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-card"
              style={{ padding: '28px' }}
            >
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#00FF87" />
                Personal Identity & Sovereign Persona
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                Manage your public financial persona, avatar appearance, and peer settlement handles.
              </p>

              {/* Avatar Customizer */}
              <div style={{ marginBottom: '24px', padding: '18px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Avatar & Luxury Aura Style
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleChange('avatarStyle', preset.id)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: preset.bg,
                        color: preset.text,
                        fontWeight: 700,
                        fontSize: '12px',
                        border: formData.avatarStyle === preset.id ? '2px solid #FFFFFF' : '2px solid transparent',
                        cursor: 'pointer',
                        boxShadow: formData.avatarStyle === preset.id ? `0 0 14px ${preset.glow}` : 'none',
                        transform: formData.avatarStyle === preset.id ? 'scale(1.05)' : 'scale(1)',
                        transition: 'var(--transition)',
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleChange('avatarStyle', 'emoji')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#F1F5F9',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: formData.avatarStyle === 'emoji' ? '2px solid #00FF87' : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Emoji Icon
                  </button>
                </div>

                {formData.avatarStyle === 'emoji' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {EMOJI_PRESETS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handleChange('avatarEmoji', em)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: formData.avatarEmoji === em ? 'rgba(0, 255, 135, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: formData.avatarEmoji === em ? '1.5px solid #00FF87' : '1px solid rgba(255, 255, 255, 0.08)',
                          fontSize: '18px',
                          cursor: 'pointer',
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', minWidth: 0 }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Full Legal / Display Name <span style={{ color: '#F43F5E' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ayush Kaushik"
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Primary Email (Readonly)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="input-field"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(0,0,0,0.3)' }}
                    />
                    <CheckCheck size={16} color="#00FF87" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    UPI ID / VPA (for Group Split QR Auto-Generation)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.upiId}
                      onChange={(e) => handleChange('upiId', e.target.value)}
                      placeholder="yourname@okhdfcbank"
                    />
                    <QrCode size={16} color="#FFD700" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Automatically embeds dynamic UPI QR codes in Group Split settlements.
                  </span>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Occupation / Career Role
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    placeholder="Principal Systems Architect"
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Sovereign Financial Persona
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.financialPersona}
                    onChange={(e) => handleChange('financialPersona', e.target.value)}
                  >
                    <option value="sovereign_wealth">💎 Sovereign Wealth Builder (Max Independence)</option>
                    <option value="fire_aspirant">🔥 FIRE Aspirant (Early Retirement Goal)</option>
                    <option value="balanced_saver">⚖️ Balanced Saver (Steady Cash Flow)</option>
                    <option value="digital_nomad">✈️ Digital Nomad (Global Multi-Currency)</option>
                    <option value="investor">📈 Active Investor (Capital Multiplier)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                  Bio & Sovereign Motto
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Automating freedom and compounding wealth with sovereign intelligence."
                />
              </div>
            </motion.div>
          )}

          {/* TAB: CONFIDENTIAL SECRET VAULT */}
          {activeTab === 'secret_vault' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <SecretVaultCard />
            </motion.div>
          )}

          {/* TAB: LINKED UPI & BANK ACCOUNTS */}
          {activeTab === 'banking_upi' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <LinkedAccountsCard />
            </motion.div>
          )}

          {/* TAB 2: FINANCIAL DEFAULTS */}
          {activeTab === 'financial' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-card"
              style={{ padding: '28px' }}
            >
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#FFD700" />
                Financial Baselines & Platform Defaults
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                Configure platform-wide currency, monthly cash flow baselines, and savings rate targets.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', minWidth: 0 }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Platform Preferred Currency
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.preferredCurrency}
                    onChange={(e) => {
                      const sel = CURRENCY_OPTIONS.find((c) => c.code === e.target.value);
                      handleChange('preferredCurrency', e.target.value);
                      if (sel) handleChange('locale', sel.locale);
                    }}
                  >
                    {CURRENCY_OPTIONS.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} — {curr.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Updates currency symbols globally across Dashboard, Budgets, and FIRE simulator.
                  </span>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Monthly Estimated Net Income ({formData.preferredCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="input-field"
                    value={formData.monthlyIncomeEstimate || ''}
                    onChange={(e) => handleChange('monthlyIncomeEstimate', parseFloat(e.target.value) || 0)}
                    placeholder="150000"
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Used as automatic baseline for savings rate & financial health calculations.
                  </span>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Default Payment Method for Rapid Entry
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.defaultPaymentMethod}
                    onChange={(e) => handleChange('defaultPaymentMethod', e.target.value)}
                  >
                    <option value="UPI">⚡ UPI (Instant / QR)</option>
                    <option value="Credit Card">💳 Credit Card (Rewards / Points)</option>
                    <option value="Debit Card">🏦 Debit Card</option>
                    <option value="Bank Transfer">🏛️ Bank Transfer / NEFT / IMPS</option>
                    <option value="Cash">💵 Sovereign Cash</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Tax Planning Regime
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.taxRegime}
                    onChange={(e) => handleChange('taxRegime', e.target.value)}
                  >
                    <option value="new_regime_in">🇮🇳 India New Tax Regime (Section 115BAC)</option>
                    <option value="old_regime_in">🇮🇳 India Old Regime (80C / 80D / HRA Deductions)</option>
                    <option value="standard_global">🌐 Global Standard Flat / Progressive</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Controls automatic 80C/80D tax deduction tagging on expense creation.
                  </span>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Target Retirement / FIRE Age
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="100"
                    className="input-field"
                    value={formData.fireTargetAge || 45}
                    onChange={(e) => handleChange('fireTargetAge', parseInt(e.target.value, 10) || 45)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Emergency Fund Reserve Multiplier (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    className="input-field"
                    value={formData.emergencyFundMonths || 6}
                    onChange={(e) => handleChange('emergencyFundMonths', parseInt(e.target.value, 10) || 6)}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Target reserve runway for the Wealth Shield score (e.g. 6 months of expenses).
                  </span>
                </div>
              </div>

              {/* Target Savings Rate Slider */}
              <div style={{ marginTop: '26px', padding: '18px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>
                    Target Monthly Savings Rate Goal
                  </label>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#00FF87' }}>
                    {formData.targetSavingsRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={formData.targetSavingsRate}
                  onChange={(e) => handleChange('targetSavingsRate', parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    accentColor: '#00FF87',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                  <span>10% (Modest)</span>
                  <span>40% (Sovereign Target)</span>
                  <span>70%+ (Extreme FIRE)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: LOCALIZATION & FORMATS */}
          {activeTab === 'localization' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-card"
              style={{ padding: '28px' }}
            >
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#00F0FF" />
                Regional & Localization Formats
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                Set number formats (Lakhs/Crores vs Millions), timezone, and fiscal calendar years.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', minWidth: 0 }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Number Formatting System (Locale)
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.locale}
                    onChange={(e) => handleChange('locale', e.target.value)}
                  >
                    <option value="en-IN">🇮🇳 en-IN (1,00,000 — Indian Lakhs/Crores)</option>
                    <option value="en-US">🇺🇸 en-US (100,000.00 — International Millions)</option>
                    <option value="en-GB">🇬🇧 en-GB (100,000.00 — UK Standard)</option>
                    <option value="de-DE">🇩🇪 de-DE (100.000,00 — European Standard)</option>
                    <option value="ja-JP">🇯🇵 ja-JP (100,000 — Japanese Yen No Decimals)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    System Timezone
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <option value="Asia/Kolkata">🇮🇳 Asia/Kolkata (IST - UTC+5:30)</option>
                    <option value="America/New_York">🇺🇸 America/New_York (EST - UTC-5:00)</option>
                    <option value="America/Los_Angeles">🇺🇸 America/Los_Angeles (PST - UTC-8:00)</option>
                    <option value="Europe/London">🇬🇧 Europe/London (GMT/BST - UTC+0)</option>
                    <option value="Asia/Dubai">🇦🇪 Asia/Dubai (GST - UTC+4:00)</option>
                    <option value="Asia/Singapore">🇸🇬 Asia/Singapore (SGT - UTC+8:00)</option>
                    <option value="UTC">🌐 Coordinated Universal Time (UTC)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Date Display Format
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.dateFormat}
                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 17/08/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/17/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                    Fiscal Year Cycle Start
                  </label>
                  <select
                    className="input-field select-field"
                    value={formData.fiscalYearStart}
                    onChange={(e) => handleChange('fiscalYearStart', e.target.value)}
                  >
                    <option value="april">April 1st (India, UK, Canada)</option>
                    <option value="january">January 1st (Calendar Year / US Standard)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SECURITY & SESSIONS */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* Password Change Card */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="#00FF87" />
                  Sovereign Password & Credential Security
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                  Update your authentication credentials. Passwords are encrypted using salted bcrypt hashes.
                </p>

                <form onSubmit={handlePasswordSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%', minWidth: 0 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                        Current Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword.current ? 'text' : 'password'}
                          className="input-field"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                          placeholder="••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                        >
                          {showPassword.current ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                        New Secure Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          className="input-field"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                          placeholder="••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                        >
                          {showPassword.new ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                        Confirm New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          className="input-field"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                          placeholder="••••••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                        >
                          {showPassword.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Password Strength Meter */}
                  {passwordForm.newPassword && (
                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: '#94A3B8' }}>Password Entropy Strength:</span>
                        <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                      </div>
                      <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${passwordStrength.score}%`, background: passwordStrength.color, transition: 'all 0.3s' }} />
                      </div>
                    </div>
                  )}

                  {passwordStatus.error && (
                    <div style={{ marginTop: '14px', color: '#F43F5E', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={15} />
                      {passwordStatus.error}
                    </div>
                  )}

                  {passwordStatus.success && (
                    <div style={{ marginTop: '14px', color: '#00FF87', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      {passwordStatus.success}
                    </div>
                  )}

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={passwordStatus.loading}
                      className="btn btn-primary"
                      style={{ padding: '9px 20px', fontSize: '13px' }}
                    >
                      {passwordStatus.loading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Multi-Device Sessions Manager */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Smartphone size={16} color="#00F0FF" />
                      Active Authorized Multi-Device Sessions
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      Manage devices and browser tokens authorized to access your financial ledger.
                    </p>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={handleRevokeAllOtherSessions}
                      className="btn btn-secondary"
                      style={{ color: '#F43F5E', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '6px 12px', fontSize: '12px' }}
                    >
                      Revoke All Others
                    </button>
                  )}
                </div>

                {loadingSessions ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>Loading active sessions...</div>
                ) : sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>No secondary sessions found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: sess.isCurrent ? 'rgba(0, 255, 135, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${sess.isCurrent ? 'rgba(0, 255, 135, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Laptop size={18} color={sess.isCurrent ? '#00FF87' : '#94A3B8'} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>{sess.device}</span>
                              {sess.isCurrent && (
                                <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: '#00FF87', color: '#050810' }}>
                                  THIS DEVICE
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                              Token: {sess.tokenPrefix} • IP: {sess.ip} • Logged in: {new Date(sess.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {!sess.isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '11.5px', color: '#F43F5E' }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: ALERTS & NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="glass-card"
              style={{ padding: '28px' }}
            >
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={18} color="#FF007A" />
                Alerts & AI Wealth Copilot Notifications
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                Toggle granular notification triggers for budget threshold breaches, outlier expenses, and weekly summaries.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    key: 'budgetAlerts',
                    title: 'Category Overspending Alerts',
                    desc: 'Notify immediately when any category spend crosses 80% or 100% of its allocated budget limit.',
                    icon: AlertTriangle,
                    color: '#FF9900',
                  },
                  {
                    key: 'anomalyAlerts',
                    title: 'Outlier & Anomaly Detection',
                    desc: 'AI alert when an expense is >3x higher than your typical merchant/category historical baseline.',
                    icon: Zap,
                    color: '#00FF87',
                  },
                  {
                    key: 'recurringAlerts',
                    title: 'Subscription Renewal Warnings',
                    desc: 'Receive proactive reminders 3 days before any active subscription or recurring bill renews.',
                    icon: RefreshCw,
                    color: '#00F0FF',
                  },
                  {
                    key: 'weeklySummary',
                    title: 'Weekly AI Wealth Digest',
                    desc: 'Comprehensive Sunday executive briefing with Net Cash Flow, savings rate, and velocity metrics.',
                    icon: Sparkles,
                    color: '#FFD700',
                  },
                  {
                    key: 'debtMilestones',
                    title: 'Debt Payoff Milestone Celebrations',
                    desc: 'Special celebrations and re-amortization summaries when a debt is marked as PAID_OFF in Snowball/Avalanche.',
                    icon: Award,
                    color: '#FF007A',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChecked = !!formData.notificationPreferences[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleNotificationToggle(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        background: isChecked ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                        border: `1px solid ${isChecked ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)'}`,
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: `rgba(${item.color === '#00FF87' ? '0, 255, 135' : item.color === '#FFD700' ? '255, 215, 0' : '121, 40, 202'}, 0.15)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={18} color={item.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9' }}>{item.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                      </div>

                      {/* Custom Toggle Switch */}
                      <div
                        style={{
                          width: '46px',
                          height: '26px',
                          borderRadius: '13px',
                          background: isChecked ? '#00FF87' : 'rgba(255, 255, 255, 0.1)',
                          padding: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.25s',
                        }}
                      >
                        <motion.div
                          animate={{ x: isChecked ? 20 : 0 }}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '999px',
                            background: isChecked ? '#050810' : '#94A3B8',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 6: PRIVACY & GOVERNANCE */}
          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              {/* Privacy Shield Startup Configuration */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#00FF87" />
                  Sovereign Privacy Shield & Masking
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '22px' }}>
                  Control default obfuscation of sensitive net worth and transaction figures for public places or screen-shares.
                </p>

                <div
                  onClick={() => handleChange('defaultPrivacyMask', !formData.defaultPrivacyMask)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: formData.defaultPrivacyMask ? 'rgba(0, 255, 135, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${formData.defaultPrivacyMask ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9' }}>
                      Always Start App in Privacy Mode (Mask Balances by Default)
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      Replaces all numbers with <strong style={{ color: '#00FF87' }}>••••••</strong> on initial load until toggled via <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>Alt+P</kbd>.
                    </div>
                  </div>

                  <div
                    style={{
                      width: '46px',
                      height: '26px',
                      borderRadius: '13px',
                      background: formData.defaultPrivacyMask ? '#00FF87' : 'rgba(255, 255, 255, 0.1)',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.25s',
                    }}
                  >
                    <motion.div
                      animate={{ x: formData.defaultPrivacyMask ? 20 : 0 }}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '999px',
                        background: formData.defaultPrivacyMask ? '#050810' : '#94A3B8',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Data Export & Backup */}
              <div className="glass-card" style={{ padding: '28px' }}>
                <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={16} color="#00F0FF" />
                  Complete Data Sovereignty & Portability
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '18px' }}>
                  Download your entire financial history without vendor lock-in. Full raw structured data.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleExportData('json')}
                    disabled={exporting}
                    className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '13px' }}
                  >
                    <Download size={15} color="#00FF87" />
                    Download Full JSON Archive
                  </button>

                  <button
                    onClick={() => handleExportData('csv')}
                    disabled={exporting}
                    className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '13px' }}
                  >
                    <Download size={15} color="#00F0FF" />
                    Download Clean CSV Spreadsheet
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div
                className="glass-card"
                style={{
                  padding: '28px',
                  background: 'rgba(244, 63, 94, 0.03)',
                  border: '1px solid rgba(244, 63, 94, 0.2)',
                }}
              >
                <h3 className="font-display" style={{ fontSize: '16px', fontWeight: 800, color: '#F43F5E', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#F43F5E" />
                  Account Danger Zone
                </h3>
                <p style={{ fontSize: '12.5px', color: '#94A3B8', marginBottom: '18px' }}>
                  Destructive operations. Please make sure you have exported a backup before proceeding.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('⚠️ Are you sure you want to delete all transactions, budgets, goals, and records? This action cannot be undone!')) {
                        try {
                          await apiFetch('/users/reset-data', { method: 'POST' });
                          showToast('All transaction records have been wiped clean.', 'success');
                        } catch (err) {
                          showToast(err.message || 'Failed to wipe data', 'error');
                        }
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ color: '#FF9900', borderColor: 'rgba(255, 153, 0, 0.3)', padding: '9px 16px', fontSize: '12.5px' }}
                  >
                    <Trash2 size={14} />
                    Wipe All Transactions
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('🚨 PERMANENT ACCOUNT DELETION: Are you absolutely certain you want to delete your account and all associated data permanently?')) {
                        try {
                          await apiFetch('/users/account', { method: 'DELETE' });
                          logout();
                        } catch (err) {
                          showToast(err.message || 'Failed to delete account', 'error');
                        }
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ color: '#F43F5E', borderColor: 'rgba(244, 63, 94, 0.4)', padding: '9px 16px', fontSize: '12.5px' }}
                  >
                    <Trash2 size={14} />
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 3. RIGHT SIDEBAR: Live 3D Sovereign Member Metal Card & Radar */}
        {showCard3D && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ minWidth: 0, width: '100%', position: 'sticky', top: '90px' }}
          >
            {/* 3D Metal Card Widget */}
            <div
              style={{
                perspective: '1000px',
                marginBottom: '20px',
                width: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              <div
                ref={cardRef}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  height: '200px',
                  borderRadius: '20px',
                  background: activeAvatarPreset.bg,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 16px 36px ${activeAvatarPreset.glow}, 0 0 0 1px rgba(255, 255, 255, 0.25) inset`,
                  transform: `rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
                  transition: 'transform 0.15s ease-out',
                  color: activeAvatarPreset.text,
                }}
              >
                {/* Specular Hologram Sheen */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(115deg, rgba(255, 255, 255, 0.4) 0%, transparent 40%, rgba(255, 255, 255, 0.2) 70%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Card Top Row: Chip + Tier */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '24px',
                        borderRadius: '5px',
                        background: 'linear-gradient(135deg, #FFE066 0%, #D4AF37 100%)',
                        border: '1px solid rgba(0,0,0,0.3)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      }}
                    />
                    <Sparkles size={14} color={activeAvatarPreset.text} />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    SOVEREIGN VIP
                  </span>
                </div>

                {/* Card Middle: UPI / Account Handle */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ fontSize: '10.5px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formData.upiId ? `UPI: ${formData.upiId}` : 'RICHY WEALTH PLATFORM'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '1px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    •••• •••• •••• 2026
                  </div>
                </div>

                {/* Card Bottom: Holder Name + Currency Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
                  <div style={{ minWidth: 0, overflow: 'hidden', paddingRight: '8px' }}>
                    <div style={{ fontSize: '9px', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CARDHOLDER</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formData.name || 'AYUSH KAUSHIK'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '9px', opacity: 0.75, textTransform: 'uppercase' }}>BASE</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800 }}>{formData.preferredCurrency} INR</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Radar Shield Card */}
            <div className="glass-card" style={{ padding: '20px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ShieldCheck size={16} color="#00FF87" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>Sovereignty Radar</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Data Encryption:</span>
                  <strong style={{ color: '#00FF87' }}>AES-256 / Bcrypt</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Active Sessions:</span>
                  <strong style={{ color: '#00F0FF' }}>{sessions.length || 1} Connected</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>AI Copilot Engine:</span>
                  <strong style={{ color: '#FFD700' }}>Multi-Provider Sovereign</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8' }}>
                  <span>Target Savings Pace:</span>
                  <strong style={{ color: '#00FF87' }}>{formData.targetSavingsRate}% of Income</strong>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. FLOATING TACTILE SAVE BAR (Dirty State Indicator) */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9000,
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1.5px solid rgba(0, 255, 135, 0.5)',
              borderRadius: '20px',
              padding: '14px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              boxShadow: '0 15px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 255, 135, 0.25)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="animate-live-dot" style={{ width: '8px', height: '8px', background: '#FFD700', boxShadow: '0 0 8px #FFD700' }} />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#F1F5F9' }}>
                  Careful — you have unsaved changes!
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Don't forget to save your profile and financial parameters.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleDiscardChanges}
                disabled={saving}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: '10px' }}
              >
                <RotateCcw size={13} />
                Discard
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn btn-primary"
                style={{
                  padding: '8px 20px',
                  fontSize: '12.5px',
                  borderRadius: '10px',
                  boxShadow: '0 0 16px rgba(0, 255, 135, 0.4)',
                }}
              >
                <Save size={13} />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
