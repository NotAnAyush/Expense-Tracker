import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  ShieldCheck, 
  Key, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Sparkles, 
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  Cpu
} from 'lucide-react';
import { vaultApi } from '../../api/client';
import AddSecretModal from './AddSecretModal';

const PROVIDER_ICONS = {
  gemini: { name: 'Google Gemini', icon: '✨', color: '#00F0FF' },
  openai: { name: 'OpenAI (ChatGPT)', icon: '⚡', color: '#10A37F' },
  claude: { name: 'Anthropic Claude', icon: '🧠', color: '#D97706' },
  groq: { name: 'Groq Cloud', icon: '🚀', color: '#F97316' },
  deepseek: { name: 'DeepSeek AI', icon: '🐋', color: '#3B82F6' },
  together: { name: 'Together AI', icon: '🤝', color: '#8B5CF6' },
  mistral: { name: 'Mistral AI', icon: '🌪️', color: '#EF4444' },
  openrouter: { name: 'OpenRouter', icon: '🌐', color: '#6366F1' },
  perplexity: { name: 'Perplexity', icon: '🔍', color: '#22D3EE' },
  xai: { name: 'xAI (Grok)', icon: '⚡', color: '#E2E8F0' },
  cohere: { name: 'Cohere', icon: '🌲', color: '#14B8A6' },
  custom: { name: 'Custom LLM', icon: '🛠️', color: '#A855F7' },
};

export const SecretVaultCard = () => {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [rotatingSecret, setRotatingSecret] = useState(null);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchSecrets = async () => {
    try {
      setLoading(true);
      const res = await vaultApi.getSecrets();
      if (res.success) {
        setSecrets(res.data || []);
      }
    } catch (err) {
      console.error('[Vault Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const handleTestSecret = async (secretId) => {
    setTestingId(secretId);
    setActionError('');
    try {
      const res = await vaultApi.testSecret(secretId);
      if (res.success) {
        setTestResults(prev => ({
          ...prev,
          [secretId]: {
            valid: res.data.valid,
            latencyMs: res.data.latencyMs,
            message: res.data.message,
          },
        }));
        // Update local secret latency
        setSecrets(prev => prev.map(s => s.id === secretId ? { ...s, latencyMs: res.data.latencyMs, lastTestedAt: new Date() } : s));
      }
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [secretId]: {
          valid: false,
          message: err.message || 'Connection test failed',
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteSecret = async (secretId, secretName) => {
    if (!window.confirm(`Permanently zeroize and delete confidential secret "${secretName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await vaultApi.deleteSecret(secretId);
      if (res.success) {
        setActionSuccess(`Deleted "${secretName}" successfully.`);
        setSecrets(prev => prev.filter(s => s.id !== secretId));
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete secret');
    }
  };

  const handleRotateSubmit = async (e) => {
    e.preventDefault();
    if (!rotatingSecret || !newKeyInput.trim()) return;

    try {
      const res = await vaultApi.rotateSecret(rotatingSecret.id, {
        newSecretValue: newKeyInput.trim(),
      });

      if (res.success) {
        setActionSuccess(`Rotated secret "${rotatingSecret.name}" successfully.`);
        setRotatingSecret(null);
        setNewKeyInput('');
        fetchSecrets();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to rotate secret');
    }
  };

  const handleEmergencyPurge = async () => {
    if (!window.confirm('🚨 EMERGENCY VAULT PURGE:\n\nAre you sure you want to permanently delete and wipe ALL stored API keys and confidential secrets from the vault?\n\nThis cannot be undone!')) {
      return;
    }

    try {
      const res = await vaultApi.purgeVault();
      if (res.success) {
        setActionSuccess(`Vault purged. Deleted ${res.deletedCount} secret(s).`);
        setSecrets([]);
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(err.message || 'Purge failed');
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="glass-card" style={{ padding: '28px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: '#F1F5F9', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="#00F0FF" />
              Confidential Secret Vault
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 9px',
                borderRadius: '999px',
                background: 'rgba(0, 255, 135, 0.15)',
                color: '#00FF87',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={12} /> AES-256-GCM
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
            Bank-grade encrypted storage for AI Provider API keys, webhook signing secrets, and custom LLM tokens.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {secrets.length > 0 && (
            <button
              onClick={handleEmergencyPurge}
              className="btn-glass-secondary"
              style={{
                fontSize: '12.5px',
                color: '#FF7D7D',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Permanently wipe all credentials"
            >
              <Trash2 size={14} /> Purge Vault
            </button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddModalOpen(true)}
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00F0FF 0%, #0072FF 100%)',
              border: 'none',
              color: '#050810',
              fontWeight: 800,
              fontSize: '13px',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
            }}
          >
            <Plus size={16} /> Add Confidential Key
          </motion.button>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(0, 255, 135, 0.12)', border: '1px solid rgba(0, 255, 135, 0.3)', color: '#00FF87', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {actionError}
        </div>
      )}

      {/* Secrets List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00F0FF' }} />
          <div>Decrypting vault metadata...</div>
        </div>
      ) : secrets.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
          }}
        >
          <Key size={32} color="#64748B" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#E2E8F0', marginBottom: '6px' }}>
            No Confidential Secrets in Vault
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '0 auto 16px' }}>
            Securely store your personal API keys for Google Gemini, OpenAI, Claude, or Groq with zero plaintext exposure.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-glass-secondary"
            style={{ fontSize: '12.5px' }}
          >
            <Plus size={14} /> Add First Key
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {secrets.map((secret) => {
            const providerMeta = PROVIDER_ICONS[secret.provider] || PROVIDER_ICONS.custom;
            const testResult = testResults[secret.id];

            return (
              <div
                key={secret.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${secret.isDefault ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 255, 255, 0.07)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                {/* Left: Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${providerMeta.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    {providerMeta.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14.5px', color: '#F1F5F9' }}>
                        {secret.name}
                      </span>
                      {secret.isDefault && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: 'rgba(0, 240, 255, 0.15)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                          }}
                        >
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: '#94A3B8',
                          background: 'rgba(0, 0, 0, 0.3)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        {secret.maskedValue}
                      </span>
                      <button
                        onClick={() => handleCopy(secret.id, secret.maskedValue)}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '2px' }}
                        title="Copy masked key identifier"
                      >
                        {copiedId === secret.id ? <Check size={13} color="#00FF87" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Center: Live Ping Status */}
                <div style={{ minWidth: '180px' }}>
                  {testResult ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: testResult.valid ? '#00FF87' : '#F87171' }}>
                      {testResult.valid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{testResult.message}</span>
                    </div>
                  ) : secret.latencyMs ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00FF87' }}>
                      <Activity size={14} />
                      <span>Ping Latency: {secret.latencyMs}ms</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} color="#00FF87" /> Encrypted & Ready
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleTestSecret(secret.id)}
                    disabled={testingId === secret.id}
                    className="btn-glass-secondary"
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Ping provider to verify connectivity"
                  >
                    <Activity size={13} className={testingId === secret.id ? 'animate-spin' : ''} />
                    {testingId === secret.id ? 'Testing...' : 'Test Connection'}
                  </button>

                  <button
                    onClick={() => setRotatingSecret(secret)}
                    className="btn-glass-secondary"
                    style={{
                      height: '32px',
                      padding: '0 10px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Rotate with new key"
                  >
                    <RotateCw size={13} /> Rotate
                  </button>

                  <button
                    onClick={() => handleDeleteSecret(secret.id, secret.name)}
                    style={{
                      height: '32px',
                      padding: '0 10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#F87171',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="1-Click Permanent Delete (Zeroization)"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rotate Key Modal */}
      {rotatingSecret && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 7, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            className="glass-card"
            style={{ width: '100%', maxWidth: '480px', padding: '24px', border: '1px solid rgba(0, 240, 255, 0.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#F1F5F9', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCw size={16} color="#00F0FF" /> Rotate Secret: {rotatingSecret.name}
              </h3>
              <button onClick={() => setRotatingSecret(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRotateSubmit}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                New API Key / Secret Value
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter new replacement key..."
                value={newKeyInput}
                onChange={(e) => setNewKeyInput(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '13px', marginBottom: '16px' }}
                required
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRotatingSecret(null)}
                  className="btn-glass-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00F0FF 0%, #0072FF 100%)',
                    border: 'none',
                    color: '#050810',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Re-encrypt & Rotate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Secret Modal */}
      <AddSecretModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSecretAdded={() => {
          setActionSuccess('Secret encrypted and added to vault successfully.');
          fetchSecrets();
          setTimeout(() => setActionSuccess(''), 4000);
        }}
      />
    </div>
  );
};

export default SecretVaultCard;
