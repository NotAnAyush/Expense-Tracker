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
      {/* Main Login Board Container */}
      <div className="auth-board">
        
        {/* Left Side: Product Showcase & Intelligence Board */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="auth-showcase-panel"
        >
          {/* Status Badge */}
          <div className="auth-brand-badge">
            <span style={{ 
              width: 7, 
              height: 7, 
              borderRadius: '50%', 
              background: '#00FF87', 
              boxShadow: '0 0 8px #00FF87'
            }} />
            AUTONOMOUS WEALTH ENGINE v2.5
          </div>

          {/* Logo & Main Hero Heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                padding: '2px',
                background: 'rgba(15, 22, 36, 0.9)',
                border: '1.5px solid rgba(16, 185, 129, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
              }}
            >
              <img
                src="/logo.jpg"
                alt="Richy Rich Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div>
              <h1 className="heading-xl" style={{ fontSize: '28px', margin: 0, lineHeight: 1.1, color: 'var(--color-text-main)' }}>
                Richy Rich
              </h1>
              <p style={{ color: '#00FF87', fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px', marginTop: '2px' }}>
                Pro Intelligence
              </p>
            </div>
          </div>

          <h2 className="auth-hero-title">
            Where Wealth Meets <span style={{ color: '#00FF87' }}>Predictive Intelligence.</span>
          </h2>

          <p className="body-md" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Deterministic financial mathematics combined with an autonomous AI copilot. Track real-time spending velocity, manage category caps, and reach savings goals faster.
          </p>

          {/* Feature Highlights Grid */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#00FF87', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                <Zap size={19} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  Spending Velocity Radar
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Real-time burn-rate trajectory, boundary alerts, and daily safe-to-spend calculations.
                </div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA', border: '1px solid rgba(139, 92, 246, 0.35)' }}>
                <Bot size={19} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  Grounded AI Copilot
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Instant natural-language queries, automated category classification, and anomaly detection.
                </div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                <Target size={19} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                  Dynamic Savings Milestones
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                  Target timelines, milestone tracking, and autonomous reserve allocation.
                </div>
              </div>
            </div>
          </div>

          {/* Live Snapshot Widget */}
          <div className="auth-snapshot-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-muted)' }}>
                Live Sandbox Snapshot
              </span>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '11.5px', 
                fontWeight: 700, 
                color: '#00FF87',
                background: 'rgba(0, 255, 135, 0.12)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                <TrendingUp size={12} /> +24.8% Pace
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#00FF87' }}>
                ₹4,850/day
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                safe-to-spend daily pace
              </span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="#00FF87" />
              <span>AI Tip: <em>"Dining down 18% this week. ₹3,200 auto-allocated to Japan Vacation fund."</em></span>
            </div>
          </div>

          {/* Trust Row */}
          <div className="auth-trust-row">
            <div className="auth-trust-chip">
              <ShieldCheck size={15} color="#00FF87" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="auth-trust-chip">
              <Lock size={15} color="#FBBF24" />
              <span>Zero-Knowledge Storage</span>
            </div>
            <div className="auth-trust-chip">
              <CheckCircle2 size={15} color="#22D3EE" />
              <span>100% Deterministic Math</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Interactive Authentication Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
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
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  color: '#FB7185',
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
                      <User size={17} className="auth-input-icon" />
                      <input
                        type="text"
                        required
                        className="auth-input-field"
                        placeholder="e.g. Anvitha Rao"
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
                      <Coins size={17} className="auth-input-icon" />
                      <select
                        className="auth-input-field"
                        value={preferredCurrency}
                        onChange={(e) => setPreferredCurrency(e.target.value)}
                        style={{ cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', background: 'rgba(14, 20, 32, 0.95)', color: '#F8FAFC' }}
                      >
                        <option value="₹" style={{ background: '#0F172A', color: '#F8FAFC' }}>₹ INR — Indian Rupee</option>
                        <option value="$" style={{ background: '#0F172A', color: '#F8FAFC' }}>$ USD — US Dollar</option>
                        <option value="€" style={{ background: '#0F172A', color: '#F8FAFC' }}>€ EUR — Euro</option>
                        <option value="£" style={{ background: '#0F172A', color: '#F8FAFC' }}>£ GBP — British Pound</option>
                        <option value="¥" style={{ background: '#0F172A', color: '#F8FAFC' }}>¥ JPY — Japanese Yen</option>
                        <option value="C$" style={{ background: '#0F172A', color: '#F8FAFC' }}>C$ CAD — Canadian Dollar</option>
                        <option value="A$" style={{ background: '#0F172A', color: '#F8FAFC' }}>A$ AUD — Australian Dollar</option>
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
                <Mail size={17} className="auth-input-icon" />
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
                <Lock size={17} className="auth-input-icon" />
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
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                height: '46px',
                fontSize: '14.5px',
                gap: '8px'
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #050811', 
                    borderTopColor: 'transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block' 
                  }} />
                  {isRegister ? 'Setting Up...' : 'Authenticating...'}
                </div>
              ) : (
                <>
                  <span>{isRegister ? 'Create Pro Account' : 'Sign In to Dashboard'}</span>
                  <ArrowRight size={17} />
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
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.4px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <span style={{ padding: '0 12px' }}>OR EXPLORE INSTANTLY</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
          </div>

          {/* Instant Demo Sandbox Launcher */}
          <motion.div
            whileHover={{ y: -1 }}
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
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0
                }}
              >
                <Sparkles size={18} color="#00FF87" />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Launch Instant Sandbox Demo
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Pre-loaded with sample transactions & AI Copilot
                </div>
              </div>
            </div>
            <ChevronRight size={17} color="#00FF87" />
          </motion.div>

          {/* Footer toggle prompt */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => switchMode(!isRegister)}
              style={{
                color: '#00FF87',
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

          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--color-text-subtle)' }}>
            Protected by bank-grade encryption & deterministic calculation engines.
          </div>
        </motion.div>
      </div>
    </div>
  );
};
