import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Key, 
  Eye, 
  EyeOff, 
  X, 
  Sparkles, 
  Lock, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { vaultApi } from '../../api/client';

const PROVIDER_OPTIONS = [
  { id: 'gemini', name: 'Google Gemini', defaultModel: 'gemini-2.0-flash', color: '#00F0FF', icon: '✨' },
  { id: 'openai', name: 'OpenAI (ChatGPT)', defaultModel: 'gpt-4o', color: '#10A37F', icon: '⚡' },
  { id: 'claude', name: 'Anthropic Claude', defaultModel: 'claude-3-5-sonnet-20241022', color: '#D97706', icon: '🧠' },
  { id: 'groq', name: 'Groq (Ultra-Fast LPU)', defaultModel: 'llama-3.3-70b-versatile', color: '#F97316', icon: '🚀' },
  { id: 'deepseek', name: 'DeepSeek AI', defaultModel: 'deepseek-chat', color: '#3B82F6', icon: '🐋' },
  { id: 'together', name: 'Together AI', defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', color: '#8B5CF6', icon: '🤝' },
  { id: 'mistral', name: 'Mistral AI', defaultModel: 'mistral-large-latest', color: '#EF4444', icon: '🌪️' },
  { id: 'openrouter', name: 'OpenRouter Aggregator', defaultModel: 'auto', color: '#6366F1', icon: '🌐' },
  { id: 'perplexity', name: 'Perplexity AI', defaultModel: 'sonar-pro', color: '#22D3EE', icon: '🔍' },
  { id: 'xai', name: 'xAI (Grok)', defaultModel: 'grok-2-1212', color: '#E2E8F0', icon: '⚡' },
  { id: 'cohere', name: 'Cohere', defaultModel: 'command-r-plus', color: '#14B8A6', icon: '🌲' },
  { id: 'custom', name: 'Custom OpenAI-Compatible API', defaultModel: 'custom-model', color: '#A855F7', icon: '🛠️' },
];

export const AddSecretModal = ({ isOpen, onClose, onSecretAdded }) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [category, setCategory] = useState('ai_api_key');
  const [secretValue, setSecretValue] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleProviderChange = (pId) => {
    setProvider(pId);
    const selected = PROVIDER_OPTIONS.find(p => p.id === pId);
    if (selected && !name) {
      setName(`${selected.name} API Key`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a descriptive name for this secret.');
      return;
    }

    if (!secretValue.trim()) {
      setError('Secret credential / API key value is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await vaultApi.createSecret({
        name: name.trim(),
        provider,
        category,
        secretValue: secretValue.trim(),
        customBaseUrl: customBaseUrl.trim(),
        description: description.trim(),
        isDefault,
      });

      if (res.success) {
        if (onSecretAdded) onSecretAdded(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to securely store confidential secret in vault.');
    } finally {
      setLoading(false);
    }
  };

  const activeProviderObj = PROVIDER_OPTIONS.find(p => p.id === provider) || PROVIDER_OPTIONS[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          position: 'relative',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#F1F5F9', margin: 0 }}>
                Add Confidential Secret
              </h2>
              <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={13} color="#00FF87" />
                AES-256-GCM Envelope Encrypted
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Provider Selector */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
              Target AI Provider / Service
            </label>
            <select
              className="input-field select-field"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              style={{ width: '100%' }}
            >
              {PROVIDER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.icon} {opt.name} ({opt.defaultModel})
                </option>
              ))}
            </select>
          </div>

          {/* Secret Name */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
              Secret Label Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder={`e.g. My ${activeProviderObj.name} Key`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Secret API Key Value */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
              API Key / Secret Token (Encrypted Immediately)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder={provider === 'gemini' ? 'AIzaSy...' : (provider === 'groq' ? 'gsk_...' : 'sk-...')}
                value={secretValue}
                onChange={(e) => setSecretValue(e.target.value)}
                style={{ paddingRight: '42px', fontFamily: 'monospace', fontSize: '13px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '5px' }}>
              Stored with 256-bit encryption. The server will never display this in plaintext again.
            </p>
          </div>

          {/* Custom Base URL (Optional) */}
          {(provider === 'custom' || provider === 'openai' || provider === 'together' || provider === 'openrouter') && (
            <div>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                Custom API Base URL (Optional)
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://api.openai.com/v1 or http://localhost:11434/v1"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
              />
            </div>
          )}

          {/* Default Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>Set as Primary Key for {activeProviderObj.name}</div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>Auto-selected for AI Assistant, Categorization & Voice Logging</div>
            </div>
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#00F0FF', cursor: 'pointer' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-glass-secondary"
              style={{ flex: 1, padding: '11px' }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00F0FF 0%, #0072FF 100%)',
                border: 'none',
                color: '#050810',
                fontWeight: 800,
                fontSize: '14px',
                fontFamily: 'var(--font-heading)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 240, 255, 0.35)',
              }}
            >
              {loading ? (
                <>Encrypting & Saving...</>
              ) : (
                <>
                  <Lock size={16} /> Encrypt & Store in Vault
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddSecretModal;
