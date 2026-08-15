import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Zap,
  ShieldCheck,
  Coins,
  Server,
  Layers,
  Terminal,
  Eye,
  EyeOff,
  ChevronDown,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DRAFT_KEY = 'richy_draft_ai_config';

export const SettingsPage = () => {
  const { user } = useAuth();

  // AI Configuration State
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [customModelInput, setCustomModelInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [useLocalRagFallback, setUseLocalRagFallback] = useState(true);

  // Metadata from backend
  const [providersMeta, setProvidersMeta] = useState({});
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [draftRestored, setDraftRestored] = useState(false);

  // UI state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Currency State
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || '₹');

  const providerIcons = {
    gemini: Sparkles,
    openai: Bot,
    claude: Cpu,
    groq: Zap,
    deepseek: Server,
    mistral: Layers,
    openrouter: Globe,
    ollama: Terminal,
    custom: Sliders,
    local_rag: ShieldCheck,
  };

  const providerGradients = {
    gemini: 'linear-gradient(135deg, rgba(0, 255, 135, 0.2), rgba(0, 240, 255, 0.2))',
    openai: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
    claude: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(245, 158, 11, 0.2))',
    groq: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 179, 8, 0.2))',
    deepseek: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))',
    mistral: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
    openrouter: 'linear-gradient(135deg, rgba(121, 40, 202, 0.25), rgba(0, 255, 135, 0.25))',
    ollama: 'linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(148, 163, 184, 0.2))',
    custom: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(79, 70, 229, 0.2))',
    local_rag: 'linear-gradient(135deg, rgba(0, 255, 135, 0.25), rgba(255, 215, 0, 0.25))',
  };

  // Load existing configuration from backend and restore uncommitted draft
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiFetch('/ai/config');
        if (data.providers) {
          setProvidersMeta(data.providers);
        }

        const draftStr = localStorage.getItem(DRAFT_KEY);
        let draft = null;
        if (draftStr) {
          try {
            draft = JSON.parse(draftStr);
          } catch {}
        }

        if (draft) {
          if (draft.provider) setProvider(draft.provider);
          if (draft.model) setModel(draft.model);
          if (draft.customModelInput) setCustomModelInput(draft.customModelInput);
          if (draft.apiKey) setApiKey(draft.apiKey);
          if (draft.customBaseUrl) setCustomBaseUrl(draft.customBaseUrl);
          if (draft.temperature !== undefined) setTemperature(draft.temperature);
          if (draft.useLocalRagFallback !== undefined) setUseLocalRagFallback(draft.useLocalRagFallback);
          setDraftRestored(true);
        } else if (data.config) {
          setProvider(data.config.provider || 'gemini');
          setModel(data.config.model || 'gemini-1.5-flash');
          setApiKey(data.config.apiKey || '');
          setHasCustomKey(data.config.hasCustomKey || false);
          setCustomBaseUrl(data.config.customBaseUrl || '');
          setTemperature(data.config.temperature !== undefined ? data.config.temperature : 0.2);
          setUseLocalRagFallback(data.config.useLocalRagFallback !== undefined ? data.config.useLocalRagFallback : true);
        }
      } catch (err) {
        console.error('Failed to load AI configuration:', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  // Autosave draft on any field change
  useEffect(() => {
    if (!loadingConfig) {
      const draft = {
        provider,
        model,
        customModelInput,
        apiKey,
        customBaseUrl,
        temperature,
        useLocalRagFallback,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [provider, model, customModelInput, apiKey, customBaseUrl, temperature, useLocalRagFallback, loadingConfig]);

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setTestResult(null);
    setSaveSuccess(false);

    const meta = providersMeta[newProvider];
    if (meta && meta.models && meta.models.length > 0) {
      setModel(meta.defaultModel || meta.models[0]);
    } else if (newProvider === 'custom') {
      setModel('custom-model');
    } else if (newProvider === 'local_rag') {
      setModel('deterministic-rag-v2');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const activeModel = customModelInput.trim() ? customModelInput.trim() : model;
      const res = await apiFetch('/ai/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          model: activeModel,
          apiKey,
          customBaseUrl,
        }),
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const activeModel = customModelInput.trim() ? customModelInput.trim() : model;
      await apiFetch('/ai/config', {
        method: 'PUT',
        body: JSON.stringify({
          provider,
          model: activeModel,
          apiKey,
          customBaseUrl,
          temperature,
          useLocalRagFallback,
        }),
      });

      // Clear draft on successful save
      localStorage.removeItem(DRAFT_KEY);
      setDraftRestored(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loadingConfig) {
    return (
      <div style={{ padding: '40px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <RefreshCw size={20} className="animate-spin" color="#00FF87" />
        <span>Loading AI Intelligence Engine Settings...</span>
      </div>
    );
  }

  const currentProviderMeta = providersMeta[provider] || {};
  const availableModels = currentProviderMeta.models || [];

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7928CA 0%, #00FF87 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 255, 135, 0.4)',
            }}
          >
            <Sliders size={20} color="#050810" />
          </div>
          <h1 className="heading-xl" style={{ fontSize: '26px', margin: 0 }}>
            AI Engine & Platform Settings
          </h1>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#00FF87',
              background: 'rgba(0, 255, 135, 0.1)',
              border: '1px solid rgba(0, 255, 135, 0.3)',
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
            }}
          >
            Multi-Model v2.2
          </span>
          {draftRestored && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#FFD700',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Save size={11} /> Uncommitted Draft Restored
            </span>
          )}
        </div>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
          Customize your AI Provider (Gemini, OpenAI, Claude, Groq, DeepSeek, OpenRouter, Ollama, or Custom Endpoints) with automatic Local RAG fallback.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
        {/* SECTION 1: AI Provider Selection Grid */}
        <div
          style={{
            background: 'rgba(15, 20, 32, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9', margin: '0 0 4px 0' }}>
                1. Select AI Intelligence Provider
              </h2>
              <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                Choose which model powers your Copilot chat, smart categorizer, and monthly summaries.
              </span>
            </div>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#00FF87',
                background: 'rgba(0, 255, 135, 0.08)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 135, 0.2)',
              }}
            >
              Active: {currentProviderMeta.name || provider}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {Object.entries(providersMeta).map(([key, info]) => {
              const Icon = providerIcons[key] || Bot;
              const isSelected = provider === key;
              const gradient = providerGradients[key] || providerGradients.gemini;

              return (
                <motion.div
                  key={key}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProviderChange(key)}
                  style={{
                    position: 'relative',
                    padding: '14px',
                    borderRadius: '14px',
                    background: isSelected ? gradient : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid #00FF87' : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 20px rgba(0, 255, 135, 0.25)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '92px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(0, 255, 135, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={17} color={isSelected ? '#00FF87' : '#94A3B8'} />
                    </div>

                    {isSelected ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00FF87', fontSize: '11px', fontWeight: 800 }}>
                        <CheckCircle2 size={14} /> ACTIVE
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                        {key === 'ollama' || key === 'local_rag' ? 'OFFLINE' : 'CLOUD'}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9', marginBottom: '2px' }}>
                      {info.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {info.defaultModel || 'Custom'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Provider Parameters & Endpoint Configuration */}
        <div
          style={{
            background: 'rgba(15, 20, 32, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9', margin: '0 0 16px 0' }}>
            2. Configure {currentProviderMeta.name || provider} Parameters
          </h2>

          <form onSubmit={handleSaveSettings}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
              {/* Model Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Model Selection
                </label>
                {availableModels.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="auth-input-field"
                      style={{ cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m} style={{ background: '#0F1420', color: '#F1F5F9' }}>
                          {m} {m === currentProviderMeta.defaultModel ? '(Default)' : ''}
                        </option>
                      ))}
                      <option value="custom-input" style={{ background: '#0F1420', color: '#F1F5F9' }}>
                        + Enter Custom Model ID...
                      </option>
                    </select>
                    <ChevronDown
                      size={16}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                    className="auth-input-field"
                  />
                )}

                {model === 'custom-input' && (
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="Enter model string (e.g. gpt-4-32k, llama3-70b)"
                    className="auth-input-field"
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>

              {/* API Key Input (if not local_rag) */}
              {provider !== 'local_rag' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#CBD5E1', margin: 0 }}>
                      API Key (BYOK)
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {hasCustomKey ? 'Custom Key Saved' : 'Using Server Environment'}
                    </span>
                  </div>
                  <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                    <Key size={17} className="auth-input-icon" />
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={hasCustomKey ? '••••••••••••••••' : `Optional: Leave empty for default env key`}
                      className="auth-input-field"
                      style={{ paddingLeft: '42px', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    {provider === 'ollama' ? 'Ollama uses local daemon (no cloud key required).' : 'Keys are stored securely per user and masked.'}
                  </span>
                </div>
              )}
            </div>

            {/* Custom Endpoint Base URL (for Ollama or Custom provider) */}
            {(provider === 'custom' || provider === 'ollama') && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Custom Base URL Endpoint
                </label>
                <div className="auth-input-wrapper">
                  <Server size={17} className="auth-input-icon" />
                  <input
                    type="text"
                    value={customBaseUrl}
                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                    placeholder={provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://api.your-ai-gateway.com/v1'}
                    className="auth-input-field"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Any OpenAI-compatible REST API endpoint (Ollama, vLLM, LM Studio, Together, Perplexity).
                </span>
              </div>
            )}

            {/* Advanced Tuning: Temperature & Local RAG Fallback */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '14px',
                padding: '16px',
                marginBottom: '22px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Temperature */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#CBD5E1' }}>
                    Reasoning Temperature: <span style={{ color: '#00FF87' }}>{temperature}</span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {temperature <= 0.2 ? 'Deterministic' : temperature <= 0.5 ? 'Balanced' : 'Creative'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#00FF87', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Lower values ensure 100% strict mathematical precision.
                </span>
              </div>

              {/* Local RAG Fallback Toggle */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#CBD5E1' }}>
                    Deterministic Local RAG Fallback
                  </label>
                  <input
                    type="checkbox"
                    checked={useLocalRagFallback}
                    onChange={(e) => setUseLocalRagFallback(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#00FF87', cursor: 'pointer' }}
                  />
                </div>
                <span style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4, display: 'block' }}>
                  Automatically fall back to zero-network Local RAG if the selected AI provider disconnects or hits rate limits.
                </span>
              </div>
            </div>

            {/* Test Connection Results Card */}
            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    marginBottom: '18px',
                    background: testResult.success ? 'rgba(0, 255, 135, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    border: `1px solid ${testResult.success ? 'rgba(0, 255, 135, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {testResult.success ? (
                      <CheckCircle2 size={18} color="#00FF87" />
                    ) : (
                      <AlertCircle size={18} color="#F43F5E" />
                    )}
                    <span style={{ fontSize: '13px', color: testResult.success ? '#F1F5F9' : '#FFA2B0', fontWeight: 600 }}>
                      {testResult.message}
                    </span>
                  </div>
                  {testResult.latencyMs !== undefined && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: testResult.success ? '#00FF87' : '#F43F5E',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {testResult.latencyMs}ms
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons: Test Connection & Save */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#F1F5F9',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'var(--transition)',
                }}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" color="#00FF87" />
                    <span>Pinging Endpoint...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} color="#00FF87" />
                    <span>Test AI Connection</span>
                  </>
                )}
              </motion.button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {saveSuccess && (
                  <span style={{ fontSize: '13px', color: '#00FF87', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Saved Successfully!
                  </span>
                )}
                {saveError && (
                  <span style={{ fontSize: '13px', color: '#F43F5E', fontWeight: 700 }}>
                    {saveError}
                  </span>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="btn-primary-mint"
                  style={{
                    padding: '12px 28px',
                    fontSize: '14px',
                    height: '44px',
                  }}
                >
                  {saving ? 'Applying Configuration...' : 'Save AI Configuration'}
                </motion.button>
              </div>
            </div>
          </form>
        </div>

        {/* SECTION 3: Currency & Regional Preferences */}
        <div
          style={{
            background: 'rgba(15, 20, 32, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Coins size={20} color="#FFD700" />
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9', margin: 0 }}>
              3. Currency & Regional Format
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { symbol: '₹', label: 'INR — Indian Rupee', code: '₹' },
              { symbol: '$', label: 'USD — US Dollar', code: '$' },
              { symbol: '€', label: 'EUR — Euro', code: '€' },
              { symbol: '£', label: 'GBP — British Pound', code: '£' },
              { symbol: '¥', label: 'JPY — Japanese Yen', code: '¥' },
              { symbol: 'C$', label: 'CAD — Canadian Dollar', code: 'C$' },
              { symbol: 'A$', label: 'AUD — Australian Dollar', code: 'A$' },
            ].map((c) => (
              <div
                key={c.code}
                onClick={() => setPreferredCurrency(c.code)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: preferredCurrency === c.code ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: preferredCurrency === c.code ? '1.5px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: preferredCurrency === c.code ? '#FFD700' : '#CBD5E1' }}>
                  {c.symbol}
                </span>
                <span style={{ fontSize: '12.5px', color: '#F1F5F9', fontWeight: 600 }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
