import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { login, register, loginDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
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
      setError('Demo account initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-background)',
      padding: '16px'
    }}>
      <div className="modal-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.jpg"
            alt="Richy Rich Logo"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '2px solid var(--color-accent)',
              boxShadow: 'var(--glow-accent)',
              marginBottom: '12px'
            }}
          />
          <h1 className="heading-xl" style={{ fontSize: '26px' }}>Richy Rich</h1>
          <p className="body-sm" style={{ marginTop: '4px', color: 'var(--color-muted-text)' }}>
            AI-First Personal Finance Intelligence Platform
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-destructive)', color: 'var(--color-destructive)', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '16px' }}>
              <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input type="text" required className="text-input" placeholder="Ayush Kaushik" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Email Address</label>
            <input type="email" required className="text-input" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="body-sm-strong" style={{ display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" required className="text-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading} className="button-primary" style={{ width: '100%', height: '44px' }}>
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--color-muted-text)', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          <span style={{ padding: '0 12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Demo Account Button */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="button-secondary"
          style={{
            width: '100%',
            height: '44px',
            gap: '8px',
          }}
        >
          <Sparkles size={18} color="var(--color-accent)" />
          Explore Instant Demo Account
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-sm">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} style={{ color: 'var(--color-accent)', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
            {isRegister ? 'Sign In' : 'Create One'}
          </button>
        </div>
      </div>
    </div>
  );
};
