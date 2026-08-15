import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Zap, 
  Bot, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  Coins, 
  ChevronRight,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { login, register, loginDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('₹');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password, preferredCurrency);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await loginDemo();
    } catch (err) {
      setError(err.message || 'Demo account initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const switchMode = (regState) => {
    setIsRegister(regState);
    setError('');
  };

  return (
    <div className="auth-page-wrapper">
      {/* Background Ambient Glows & Grid */}
      <div className="auth-ambient-glow-1" />
      <div className="auth-ambient-glow-2" />
      <div className="auth-grid-overlay" />

      {/* Main Login Board Container */}
      <div className="auth-board">
        
        {/* Left Side: Product Showcase & Intelligence Board */}
        <motion.div 
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="auth-showcase-panel"
        >
          {/* Status Badge */}
          <div className="auth-brand-badge">
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              background: 'var(--color-mint)', 
              boxShadow: '0 0 10px var(--color-mint)' 
            }} />
            FINTECH INTELLIGENCE ENGINE v2.2
          </div>

          {/* Logo & Main Hero Heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '16px',
                padding: '3px',
                background: 'linear-gradient(135deg, #00FF87, #FFD700)',
                boxShadow: '0 0 25px rgba(0, 255, 135, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <img
                src="/logo.jpg"
                alt="Richy Rich Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '13px',
                  objectFit: 'cover'
                }}
              />
            </motion.div>
            <div>
              <h1 className="heading-xl" style={{ fontSize: '30px', margin: 0, lineHeight: 1.1 }}>
                Richy Rich
              </h1>
              <p style={{ color: 'var(--color-mint)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.4px', marginTop: '2px' }}>
                Autonomous Financial OS
              </p>
            </div>
          </div>

          <h2 className="auth-hero-title">
            Where Wealth Meets <span className="text-gradient-mint">Precision Intelligence.</span>
          </h2>

          <p className="body-md" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Combine 100% deterministic mathematical accounting with AI financial copilot reasoning. Experience real-time budget pacing, velocity tracking, and wealth goal accelerators.
          </p>

          {/* Feature Highlights Grid */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box" style={{ background: 'rgba(0, 255, 135, 0.12)', color: 'var(--color-mint)' }}>
                <Zap size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  Autonomous Budget Pacing
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Real-time burn-rate trajectory, runway alarms, and safe-to-spend daily calculations.
                </div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box" style={{ background: 'rgba(121, 40, 202, 0.18)', color: 'var(--color-violet-bright)' }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  Gemini Financial Copilot
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Instant conversational queries, automatic categorization, and actionable wealth insights.
                </div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box" style={{ background: 'rgba(255, 215, 0, 0.14)', color: 'var(--color-gold)' }}>
                <Target size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  Gamified Wealth Milestones
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Dynamic savings buckets, milestone unlocks, and net worth projection engines.
                </div>
              </div>
            </div>
          </div>

          {/* Live Snapshot Widget */}
          <div className="auth-snapshot-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#64748B' }}>
                Live Sandbox Snapshot
              </span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '11.5px', 
                fontWeight: 700, 
                color: 'var(--color-mint)',
                background: 'rgba(0, 255, 135, 0.1)',
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                <TrendingUp size={12} /> +24.8% Pace
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#F1F5F9' }}>
                ₹4,850/day
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                discretionary safe-to-spend runway
              </span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="var(--color-gold)" />
              <span>AI Tip: <em>"Dining down 18% this week. ₹3,200 auto-allocated to Japan Vacation fund."</em></span>
            </div>
          </div>

          {/* Trust Row */}
          <div className="auth-trust-row">
            <div className="auth-trust-chip">
              <ShieldCheck size={15} color="var(--color-mint)" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="auth-trust-chip">
              <Lock size={15} color="var(--color-gold)" />
              <span>Zero-Knowledge Storage</span>
            </div>
            <div className="auth-trust-chip">
              <CheckCircle2 size={15} color="var(--color-cyan)" />
              <span>100% Deterministic Math</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Interactive Authentication Card */}
        <motion.div 
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          className="auth-card-panel"
        >
          {/* Tab Switcher */}
          <div className="auth-tab-switch">
            <button 
              type="button"
              className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
              onClick={() => switchMode(false)}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
              onClick={() => switchMode(true)}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Box */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#FFA2B0',
                  fontSize: '13px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={17} color="#F43F5E" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="register-name-currency"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Full Name */}
                  <div className="auth-input-group">
                    <label className="auth-input-label">Full Name</label>
                    <div className="auth-input-wrapper">
                      <User size={18} className="auth-input-icon" />
                      <input
                        type="text"
                        required
                        className="auth-input-field"
                        placeholder="e.g. Ayush Kaushik"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Preferred Currency */}
                  <div className="auth-input-group">
                    <label className="auth-input-label">Preferred Currency</label>
                    <div className="auth-input-wrapper">
                      <Coins size={18} className="auth-input-icon" />
                      <select
                        className="auth-input-field"
                        value={preferredCurrency}
                        onChange={(e) => setPreferredCurrency(e.target.value)}
                        style={{ cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                      >
                        <option value="₹" style={{ background: '#0F1420', color: '#F1F5F9' }}>₹ INR — Indian Rupee</option>
                        <option value="$" style={{ background: '#0F1420', color: '#F1F5F9' }}>$ USD — US Dollar</option>
                        <option value="€" style={{ background: '#0F1420', color: '#F1F5F9' }}>€ EUR — Euro</option>
                        <option value="£" style={{ background: '#0F1420', color: '#F1F5F9' }}>£ GBP — British Pound</option>
                        <option value="¥" style={{ background: '#0F1420', color: '#F1F5F9' }}>¥ JPY — Japanese Yen</option>
                        <option value="C$" style={{ background: '#0F1420', color: '#F1F5F9' }}>C$ CAD — Canadian Dollar</option>
                        <option value="A$" style={{ background: '#0F1420', color: '#F1F5F9' }}>A$ AUD — Australian Dollar</option>
                      </select>
                      <ChevronRight 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          right: '14px', 
                          transform: 'rotate(90deg)', 
                          color: 'var(--color-text-subtle)', 
                          pointerEvents: 'none' 
                        }} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="auth-input-group">
              <label className="auth-input-label">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  type="email"
                  required
                  className="auth-input-field"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group" style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="auth-input-label" style={{ marginBottom: 0 }}>Password</label>
                {!isRegister && (
                  <span style={{ fontSize: '11.5px', color: 'var(--color-text-subtle)', cursor: 'default' }}>
                    Standard 8+ Characters
                  </span>
                )}
              </div>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="auth-input-field"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="auth-input-action"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="btn-primary-mint"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '15px',
                gap: '10px'
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #050810', 
                    borderTopColor: 'transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block' 
                  }} />
                  {isRegister ? 'Setting Up Intelligent Vault...' : 'Authenticating Securely...'}
                </div>
              ) : (
                <>
                  <span>{isRegister ? 'Create Intelligence Account' : 'Sign In to Dashboard'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '22px 0', 
            color: 'var(--color-text-subtle)', 
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-glass)' }} />
            <span style={{ padding: '0 12px' }}>OR EXPLORE INSTANTLY</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-glass)' }} />
          </div>

          {/* Instant Demo Sandbox Launcher */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="auth-demo-launcher"
            onClick={handleDemo}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDemo(); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.2), rgba(255, 215, 0, 0.2))',
                  border: '1px solid rgba(0, 255, 135, 0.35)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Sparkles size={18} color="var(--color-mint)" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  Launch Instant Sandbox Demo
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Pre-loaded with sample transactions & AI Copilot
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="var(--color-mint)" />
          </motion.div>

          {/* Footer toggle prompt */}
          <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => switchMode(!isRegister)}
              style={{
                color: 'var(--color-mint)',
                fontWeight: 700,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              {isRegister ? 'Sign In Here' : 'Create Free Account'}
            </button>
          </div>

          <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
            Protected by bank-grade security protocols & AI-audited encryption.
          </div>
        </motion.div>
      </div>
    </div>
  );
};
