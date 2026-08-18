import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Mic,
  Receipt,
  Bot,
  Layers,
  HardDrive,
  Download,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  Zap,
  Play,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LOCAL_AI_MODELS_CATALOG,
  getCachedModelsList,
  setCachedModelStatus,
  purgeAllLocalModelCaches
} from '../../services/localVoiceAiService';
import { useDeviceCapability } from '../../context/DeviceCapabilityContext';

export const LocalAiModelStudio = () => {
  const { profile, effectiveTier } = useDeviceCapability();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cachedModels, setCachedModels] = useState([]);
  const [activeEngineMap, setActiveEngineMap] = useState({
    STT: 'whisper-tiny-onnx',
    OCR: 'baidu-ppocr-v4',
    SLM: 'qwen-2.5-0.5b',
    EMBEDDING: 'bge-micro-v2',
  });
  const [downloadingModelId, setDownloadingModelId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [testOutputMap, setTestOutputMap] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  // Load cached models from localStorage on mount
  useEffect(() => {
    getCachedModelsList().then((list) => {
      // Default Whisper-Tiny and Baidu PP-OCR as pre-cached in local catalog simulation
      if (list.length === 0) {
        const defaults = ['whisper-tiny-onnx', 'baidu-ppocr-v4'];
        localStorage.setItem('richy_cached_models', JSON.stringify(defaults));
        setCachedModels(defaults);
      } else {
        setCachedModels(list);
      }
    });

    const savedEngines = localStorage.getItem('richy_active_engines');
    if (savedEngines) {
      try {
        setActiveEngineMap(JSON.parse(savedEngines));
      } catch (e) {}
    }
  }, []);

  // Save active engine preferences
  const handleSelectActiveEngine = (category, modelId) => {
    const updated = { ...activeEngineMap, [category]: modelId };
    setActiveEngineMap(updated);
    localStorage.setItem('richy_active_engines', JSON.stringify(updated));
    setStatusMessage(`Active ${category} engine switched to ${modelId}.`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Simulate On-Demand Progressive Download & Cache
  const handleDownloadModel = (model) => {
    setDownloadingModelId(model.id);
    setDownloadProgress(5);

    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 12;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setCachedModelStatus(model.id, true);
        setCachedModels((prev) => Array.from(new Set([...prev, model.id])));
        setDownloadingModelId(null);
        setStatusMessage(`Successfully downloaded and cached ${model.name} (${model.sizeMb} MB).`);
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        setDownloadProgress(progress);
      }
    }, 180);
  };

  // Delete Model from Cache
  const handleDeleteModel = (modelId) => {
    setCachedModelStatus(modelId, false);
    setCachedModels((prev) => prev.filter((id) => id !== modelId));
    setStatusMessage(`Removed model cache from browser storage.`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Purge All Model Caches
  const handlePurgeAll = async () => {
    await purgeAllLocalModelCaches();
    setCachedModels([]);
    setStatusMessage(`All local AI model caches purged. 0 MB allocated.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Test Inference Sandbox
  const handleTestInference = (model) => {
    setTestOutputMap((prev) => ({
      ...prev,
      [model.id]: { loading: true },
    }));

    setTimeout(() => {
      let sampleResult = '';
      if (model.category === 'STT') {
        sampleResult = `Transcribed: "Paid 350 for lunch via UPI" • Latency: ${model.latencyMs}ms • Accuracy: ${model.accuracyScore}`;
      } else if (model.category === 'OCR') {
        sampleResult = `Parsed: Merchant "Starbucks", Total ₹350.00, GST ₹17.50 • Latency: ${model.latencyMs}ms`;
      } else if (model.category === 'SLM') {
        sampleResult = `Generated Response: "Allocating 20% of income to emergency savings satisfies the 50/30/20 rule." • Tokens/s: ${model.latencyMs}`;
      } else {
        sampleResult = `Computed 384-dim normalized embedding in ${model.latencyMs}ms. Vector distance: 0.89.`;
      }

      setTestOutputMap((prev) => ({
        ...prev,
        [model.id]: { loading: false, result: sampleResult },
      }));
    }, 600);
  };

  // Filter models
  const filteredModels = selectedCategory === 'ALL'
    ? LOCAL_AI_MODELS_CATALOG
    : LOCAL_AI_MODELS_CATALOG.filter((m) => m.category === selectedCategory);

  // Total cached storage in MB
  const totalCachedMb = LOCAL_AI_MODELS_CATALOG
    .filter((m) => cachedModels.includes(m.id))
    .reduce((sum, m) => sum + m.sizeMb, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Header Banner & Hardware Diagnostic */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          background: 'linear-gradient(145deg, rgba(0, 240, 255, 0.05) 0%, rgba(13, 17, 28, 0.95) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="animate-live-dot" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Sovereign On-Demand AI Hub • ADR-013
              </span>
            </div>
            <h3 className="heading-lg" style={{ margin: 0, color: '#F8FAFC' }}>
              Local On-Device AI Models & Voice Studio
            </h3>
            <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8', maxWidth: '650px' }}>
              Run private speech-to-text, receipt OCR, and financial SLMs directly in your browser or local host. Models are 100% optional and downloaded strictly on-demand.
            </p>
          </div>

          {/* Storage & Purge Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Cached Storage</div>
              <div className="font-display" style={{ fontSize: '18px', fontWeight: 800, color: '#00FF87' }}>
                {totalCachedMb} MB
              </div>
            </div>
            {totalCachedMb > 0 && (
              <button
                type="button"
                onClick={handlePurgeAll}
                className="btn-glass-secondary"
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  color: '#FB7185',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                }}
              >
                <Trash2 size={13} />
                <span>Purge Cache</span>
              </button>
            )}
          </div>
        </div>

        {/* Hardware Capability Badge */}
        {profile && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '18px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF' }}>
              <Cpu size={14} />
              <span>Hardware Tier: <strong>Tier {effectiveTier}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00FF87' }}>
              <Zap size={14} />
              <span>RAM: <strong>~{profile.ramGb || 8} GB</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: profile.gpu?.supported ? '#A78BFA' : '#94A3B8' }}>
              <Sparkles size={14} />
              <span>WebGPU: <strong>{profile.gpu?.supported ? 'Active 🚀' : 'WASM Mode'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFD700' }}>
              <HardDrive size={14} />
              <span>Free Disk: <strong>{profile.diskStorage?.freeGb || 10} GB</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Status Feedback Pill */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(0, 255, 135, 0.12)',
            border: '1px solid rgba(0, 255, 135, 0.3)',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '13px',
            color: '#00FF87',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* 2. Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Local Models', icon: Layers },
          { id: 'STT', label: 'Voice-to-Text (STT)', icon: Mic },
          { id: 'OCR', label: 'Receipt & Vision OCR', icon: Receipt },
          { id: 'SLM', label: 'Financial SLM & Chat', icon: Bot },
          { id: 'EMBEDDING', label: 'Vector Embeddings', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`filter-chip ${isActive ? 'filter-chip-active' : ''}`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Model Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredModels.map((model) => {
          const isCached = cachedModels.includes(model.id);
          const isDownloading = downloadingModelId === model.id;
          const isActiveEngine = activeEngineMap[model.category] === model.id;
          const testData = testOutputMap[model.id];

          return (
            <div
              key={model.id}
              className="glass-card"
              style={{
                padding: '20px',
                border: isActiveEngine
                  ? '1.5px solid rgba(0, 255, 135, 0.4)'
                  : isCached
                  ? '1px solid rgba(0, 240, 255, 0.25)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActiveEngine
                  ? 'linear-gradient(145deg, rgba(0, 255, 135, 0.04) 0%, rgba(13, 17, 28, 0.95) 100%)'
                  : 'linear-gradient(145deg, rgba(255, 255, 255, 0.02) 0%, rgba(8, 11, 17, 0.95) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                position: 'relative',
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'rgba(0, 240, 255, 0.12)',
                        color: '#00F0FF',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      {model.task}
                    </span>
                    <h4 className="heading-md" style={{ margin: '6px 0 2px 0', color: '#F8FAFC', fontSize: '16px' }}>
                      {model.name}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>by {model.author}</span>
                  </div>

                  {isActiveEngine && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: 'rgba(0, 255, 135, 0.15)',
                        color: '#00FF87',
                        border: '1px solid rgba(0, 255, 135, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={12} /> Active
                    </span>
                  )}
                </div>

                <p className="body-sm" style={{ margin: '8px 0 14px 0', color: '#94A3B8', fontSize: '12.5px', lineHeight: 1.45 }}>
                  {model.desc}
                </p>

                {/* Specs Matrix (4-Item Mini Grid) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '11.5px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B' }}>Download Size:</span>
                    <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{model.sizeMb} MB</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>RAM Usage:</span>
                    <div style={{ fontWeight: 700, color: '#00FF87' }}>~{model.ramMb} MB</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Inference Latency:</span>
                    <div style={{ fontWeight: 700, color: '#00F0FF' }}>{model.latencyMs} ms</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Accuracy / Benchmark:</span>
                    <div style={{ fontWeight: 700, color: '#FFD700' }}>{model.accuracyScore}</div>
                  </div>
                </div>
              </div>

              {/* Downloading Progress Bar */}
              {isDownloading && (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#00F0FF', marginBottom: '4px' }}>
                    <span>Downloading model weights...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${downloadProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #00F0FF 0%, #00FF87 100%)',
                        transition: 'width 0.15s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Test Output Console */}
              {testData && (
                <div
                  style={{
                    background: '#070A12',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '11.5px',
                    fontFamily: 'var(--font-mono)',
                    color: '#E2E8F0',
                  }}
                >
                  {testData.loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF' }}>
                      <RefreshCw size={12} className="animate-spin" />
                      <span>Running on-device inference benchmark...</span>
                    </div>
                  ) : (
                    <div>{testData.result}</div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {!isCached ? (
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownloadModel(model)}
                    className="btn-primary-mint"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
                  >
                    <Download size={13} />
                    <span>Download ({model.sizeMb} MB)</span>
                  </button>
                ) : (
                  <>
                    {!isActiveEngine && (
                      <button
                        type="button"
                        onClick={() => handleSelectActiveEngine(model.category, model.id)}
                        className="btn-glass-secondary"
                        style={{ flex: 1, padding: '8px 12px', fontSize: '12px', justifyContent: 'center', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}
                      >
                        <Check size={13} />
                        <span>Set Active Engine</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTestInference(model)}
                      className="btn-glass-secondary"
                      style={{ padding: '8px 12px', fontSize: '12px', color: '#00F0FF' }}
                      title="Run Live Test"
                    >
                      <Play size={13} />
                      <span>Test</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteModel(model.id)}
                      className="btn-glass-secondary"
                      style={{ padding: '8px', fontSize: '12px', color: '#94A3B8' }}
                      title="Delete from Cache"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocalAiModelStudio;
