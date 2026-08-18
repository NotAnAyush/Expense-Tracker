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
  Save,
  Share2,
  Compass,
  Orbit,
  Box,
  Info,
  Activity,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import DevicePerformanceCard from '../components/Settings/DevicePerformanceCard';

const DRAFT_KEY = 'richy_draft_ai_config';

const PROVIDER_KEY_URLS = {
  gemini: 'https://aistudio.google.com/app/apikey',
  openai: 'https://platform.openai.com/api-keys',
  claude: 'https://console.anthropic.com/settings/keys',
  groq: 'https://console.groq.com/keys',
  deepseek: 'https://platform.deepseek.com/api_keys',
  mistral: 'https://console.mistral.ai/api-keys/',
  openrouter: 'https://openrouter.ai/settings/keys',
  together: 'https://api.together.ai/settings/api-keys',
  perplexity: 'https://www.perplexity.ai/settings/api',
  xai: 'https://console.x.ai/',
  cohere: 'https://dashboard.cohere.com/api-keys',
  ollama: 'https://ollama.com/download',
};

const MODEL_TAGS = {
  // Google Gemini Models
  'gemini-3.7-flash': { tag: 'Hybrid Thinking Flagship', icon: '🧠', desc: 'Google premier frontier model combining instant multimodal speed with dynamic reasoning.', tier: 'Latest 2026' },
  'gemini-3.7-flash-thinking': { tag: 'Extended Reasoning CoT', icon: '🤔', desc: 'Gemini 3.7 with dedicated Chain-of-Thought deliberation for high-stakes financial analysis.', tier: 'Reasoning' },
  'gemini-3.5-pro': { tag: 'Deep Analytical Pro', icon: '🔬', desc: 'Advanced math, coding, and multi-step complex financial auditing engine.', tier: 'Pro' },
  'gemini-3.5-flash': { tag: 'Next-Gen Flash Workhorse', icon: '⚡', desc: 'High-throughput sub-second latency with 1M+ token context.', tier: 'Fast' },
  'gemini-3.0-pro': { tag: 'Gemini 3.0 Pro Foundation', icon: '📊', desc: 'Enterprise reasoning foundation model for deep portfolio analytics.', tier: 'Pro' },
  'gemini-3.0-flash': { tag: 'Gemini 3.0 Real-Time', icon: '⚡', desc: 'High speed real-time multimodal financial analysis.', tier: 'Fast' },
  'gemini-2.5-flash': { tag: 'Ultra-Fast Multimodal', icon: '⚡', desc: 'Google high-speed flagship with 1M context and receipt OCR vision.', tier: 'Recommended' },
  'gemini-2.5-pro': { tag: 'Deep Reasoning', icon: '🧠', desc: 'Google state-of-the-art analytical model for complex mathematics and finances.', tier: 'Advanced' },
  'gemini-2.0-flash': { tag: 'High-Speed Multimodal', icon: '⚡', desc: 'Production workhorse with sub-second latency and multimodal receipt OCR.', tier: 'Recommended' },
  'gemini-2.0-flash-lite': { tag: 'Cost-Efficient Speed', icon: '💸', desc: 'Ultra-low latency lightweight model optimized for high throughput.', tier: 'Fast' },
  'gemini-2.0-pro-exp-02-05': { tag: 'Pro Experimental', icon: '🔬', desc: 'Cutting-edge experimental flagship with extreme problem-solving depth.', tier: 'Experimental' },
  'gemini-2.0-flash-thinking-exp-01-21': { tag: 'Thinking / CoT', icon: '🤔', desc: 'Explicit Chain-of-Thought reasoning model designed for financial simulations.', tier: 'Reasoning' },
  'gemini-1.5-flash': { tag: 'Versatile Workhorse', icon: '✨', desc: 'Proven stable multimodal intelligence with large 1M context window.', tier: 'Stable' },
  'gemini-1.5-flash-8b': { tag: 'High Frequency', icon: '🚀', desc: 'Lightweight model for high-frequency categorization and queries.', tier: 'Fast' },
  'gemini-1.5-pro': { tag: 'Long Context Multimodal', icon: '📊', desc: 'Heavy analytical powerhouse with up to 2M token context window.', tier: 'Advanced' },
  'gemini-exp-1206': { tag: 'Gemini Experimental', icon: '🧪', desc: 'Experimental preview model with enhanced benchmark capabilities.', tier: 'Experimental' },
  'gemini-1.0-pro': { tag: 'Legacy Text', icon: '📜', desc: 'Original Gemini text model for standard structured text queries.', tier: 'Legacy' },

  // OpenAI Models
  'gpt-4.5-preview': { tag: 'GPT-4.5 Frontier', icon: '✨', desc: 'OpenAI largest and most capable foundation model for nuanced financial reasoning.', tier: 'Latest 2026' },
  'o3': { tag: 'Next-Gen Autonomous Reasoning', icon: '🔬', desc: 'OpenAI premier frontier reasoning system with state-of-the-art accuracy.', tier: 'Reasoning' },
  'o3-mini': { tag: 'High-Speed STEM & Math', icon: '🧠', desc: 'High-speed reasoning model specialized for mathematical problem-solving.', tier: 'Reasoning' },
  'o3-pro': { tag: 'Deep Deliberation Pro', icon: '💡', desc: 'Maximum compute reasoning model for multi-scenario financial forecasting.', tier: 'Pro' },
  'o1': { tag: 'Autonomous Reasoning', icon: '🔬', desc: 'Deep deliberative reasoning system for complex auditing and strategy.', tier: 'Advanced' },
  'o1-pro': { tag: 'Extended Thinking Pro', icon: '🧠', desc: 'Highest reasoning compute tier for verifiable accuracy.', tier: 'Pro' },
  'o1-mini': { tag: 'Fast Reasoning', icon: '💡', desc: 'Compact reasoning model focused on speed and STEM deduction.', tier: 'Fast' },
  'gpt-4o': { tag: 'Omnimodal Flagship', icon: '✨', desc: 'OpenAI flagship model with top-tier vision, reasoning, and accuracy.', tier: 'Recommended' },
  'gpt-4o-mini': { tag: 'Fast & Affordable', icon: '⚡', desc: 'Efficient lightweight multimodal model for high-speed financial tracking.', tier: 'Recommended' },
  'chatgpt-4o-latest': { tag: 'Continuous Latest 4o', icon: '🔄', desc: 'Dynamically tracking the newest ChatGPT-4o production checkpoint.', tier: 'Dynamic' },
  'gpt-4-turbo': { tag: '128k High Capacity', icon: '🚀', desc: 'High capacity model for large context window analysis.', tier: 'Standard' },
  'gpt-4': { tag: 'Legacy Flagship', icon: '📊', desc: 'Classic GPT-4 foundation model.', tier: 'Legacy' },
  'gpt-3.5-turbo': { tag: 'Legacy High-Speed', icon: '⚡', desc: 'Classic lightweight text generation model.', tier: 'Legacy' },

  // Claude Models
  'claude-3-7-sonnet-latest': { tag: 'Claude 3.7 Latest Checkpoint', icon: '🧠', desc: 'Latest production build of Anthropic hybrid instant and extended reasoning flagship.', tier: 'Latest 2026' },
  'claude-3-7-sonnet-20250219': { tag: 'Hybrid Reasoning Flagship', icon: '🧠', desc: 'Anthropic flagship with selectable instant and extended thinking.', tier: 'Premier' },
  'claude-3-5-sonnet-latest': { tag: 'Continuous Latest 3.5', icon: '✨', desc: 'Latest release of the acclaimed Claude 3.5 Sonnet architecture.', tier: 'Recommended' },
  'claude-3-5-sonnet-20241022': { tag: 'Premier Financial Intelligence', icon: '✨', desc: 'Industry benchmark for nuanced financial reasoning and structuring.', tier: 'Recommended' },
  'claude-3-5-haiku-latest': { tag: 'Sub-Second Responsive Latest', icon: '⚡', desc: 'Blazing-fast model matching previous generation flagship capabilities.', tier: 'Fast' },
  'claude-3-5-haiku-20241022': { tag: 'Sub-Second Responsive', icon: '⚡', desc: 'Blazing-fast model with sub-second response times.', tier: 'Fast' },
  'claude-3-opus-latest': { tag: 'Continuous Latest Opus', icon: '📚', desc: 'Latest checkpoint of maximum analytical depth for forensic auditing.', tier: 'Advanced' },
  'claude-3-opus-20240229': { tag: 'Deep Complex Analysis', icon: '📚', desc: 'Maximum analytical depth for thorough forensic budget auditing.', tier: 'Advanced' },
  'claude-3-sonnet-20240229': { tag: 'Balanced Reasoning', icon: '⚖️', desc: 'Solid enterprise-grade intelligence.', tier: 'Standard' },
  'claude-3-haiku-20240307': { tag: 'Compact & Fast', icon: '⚡', desc: 'Fast baseline Claude model.', tier: 'Legacy' },

  // Groq Models
  'llama-3.3-70b-versatile': { tag: '70B Open Flagship on LPU', icon: '⚡', desc: 'Ultra-fast 70B open weights model running on Groq Tensor LPUs.', tier: 'Recommended' },
  'llama-3.3-70b-specdec': { tag: 'Speculative Decoding 70B', icon: '🚀', desc: 'Accelerated speculative decoding on Groq hardware at 400+ tokens/sec.', tier: 'Ultra-Fast' },
  'llama-3.1-70b-versatile': { tag: '70B High Capacity', icon: '⚡', desc: 'High capability open model on fast LPUs.', tier: 'Standard' },
  'llama-3.1-8b-instant': { tag: 'Sub-100ms Ultra-Fast', icon: '🚀', desc: 'Near instantaneous token streaming for real-time copilot interactions.', tier: 'Fast' },
  'llama-3.2-90b-vision-preview': { tag: '90B Multimodal Vision LPU', icon: '👁️', desc: 'Meta premier open vision model accelerated on Groq LPUs.', tier: 'Vision' },
  'llama-3.2-11b-vision-preview': { tag: '11B Fast Vision LPU', icon: '👁️', desc: 'High-speed image receipt and invoice understanding.', tier: 'Vision' },
  'llama-3.2-3b-preview': { tag: '3B Micro-Latency LPU', icon: '⚡', desc: 'Sub-50ms instant text generation.', tier: 'Micro' },
  'llama-3.2-1b-preview': { tag: '1B Ultra-Compact LPU', icon: '⚡', desc: 'Fastest possible response generation.', tier: 'Micro' },
  'deepseek-r1-distill-llama-70b': { tag: 'R1 Reasoning on LPU', icon: '🧠', desc: 'DeepSeek R1 reasoning architecture distilled and accelerated on Groq.', tier: 'Reasoning' },
  'deepseek-r1-distill-qwen-32b': { tag: 'Math & Logic Distill', icon: '💡', desc: 'Qwen-based R1 reasoning distillation on Groq hardware.', tier: 'Reasoning' },
  'qwen-2.5-coder-32b': { tag: 'Qwen Coding & Logic 32B', icon: '💻', desc: 'Specialized logic and structured schema synthesis.', tier: 'Standard' },
  'qwen-2.5-32b': { tag: 'Multilingual Logic', icon: '🌐', desc: 'Balanced 32B dense parameter model.', tier: 'Standard' },
  'mixtral-8x7b-32768': { tag: '32k Mixture of Experts', icon: '🔄', desc: 'High-throughput 8x7B MoE architecture.', tier: 'Standard' },
  'gemma2-9b-it': { tag: 'Google Gemma 2 on Groq', icon: '💎', desc: 'Google lightweight model running on Groq LPUs.', tier: 'Fast' },

  // DeepSeek Models
  'deepseek-chat': { tag: 'DeepSeek-V3 671B MoE', icon: '✨', desc: 'High-performance 671B mixture-of-experts general intelligence.', tier: 'Recommended' },
  'deepseek-reasoner': { tag: 'DeepSeek-R1 Deep Reasoning', icon: '🧠', desc: 'Reinforcement-learning trained chain-of-thought financial analyst.', tier: 'Reasoning' },
  'deepseek-v3': { tag: 'DeepSeek-V3 Direct ID', icon: '✨', desc: 'Direct alias for DeepSeek-V3 671B parameter production engine.', tier: 'Advanced' },
  'deepseek-r1': { tag: 'DeepSeek-R1 Direct ID', icon: '🧠', desc: 'Direct alias for DeepSeek-R1 reasoning engine.', tier: 'Reasoning' },

  // Mistral Models
  'mistral-large-latest': { tag: 'Enterprise Flagship', icon: '✨', desc: 'Top-tier European flagship for reasoning, multilingual, and coding.', tier: 'Advanced' },
  'mistral-large-2411': { tag: 'Mistral Large Nov 2024', icon: '✨', desc: 'State-of-the-art flagship reasoning version from Mistral AI.', tier: 'Advanced' },
  'mistral-small-latest': { tag: 'Fast & Lightweight', icon: '⚡', desc: 'Cost-effective high-speed model for everyday tasks.', tier: 'Recommended' },
  'mistral-small-2409': { tag: 'Mistral Small Checkpoint', icon: '⚡', desc: 'Proven cost-efficient lightweight enterprise model.', tier: 'Standard' },
  'pixtral-large-latest': { tag: 'Multimodal Vision OCR', icon: '👁️', desc: 'Frontier multimodal model for document and receipt inspection.', tier: 'Vision' },
  'pixtral-12b-2409': { tag: '12B Vision Document Model', icon: '👁️', desc: 'Compact multimodal image and document extraction.', tier: 'Vision' },
  'ministral-8b-latest': { tag: 'Edge Powerhouse', icon: '📱', desc: 'High performance edge model with low memory footprint.', tier: 'Fast' },
  'ministral-3b-latest': { tag: 'Ultra-Compact Edge', icon: '🚀', desc: 'Sub-second lightweight model for immediate responses.', tier: 'Fast' },
  'codestral-latest': { tag: 'Logic & Code Engine', icon: '💻', desc: 'Specialized for math, syntax, and computational workflows.', tier: 'Standard' },
  'codestral-2501': { tag: 'Codestral Jan 2025', icon: '💻', desc: 'Upgraded coding and precision calculation checkpoint.', tier: 'Standard' },
  'open-mixtral-8x22b': { tag: 'Large Open MoE', icon: '🔄', desc: 'High capacity open weights mixture-of-experts.', tier: 'Standard' },

  // OpenRouter Models
  'google/gemini-2.0-flash-001': { tag: 'Gemini 2.0 via OpenRouter', icon: '⚡', desc: 'Next-gen Gemini speed routed via OpenRouter unified API.', tier: 'Recommended' },
  'google/gemini-2.0-pro-exp-02-05:free': { tag: 'Free Experimental Tier', icon: '🆓', desc: 'No-cost community access to Gemini 2.0 Pro Experimental.', tier: 'Free Tier' },
  'google/gemini-2.0-flash-thinking-exp:free': { tag: 'Free Thinking Tier', icon: '🆓', desc: 'Free access to Gemini 2.0 Flash Thinking reasoning engine.', tier: 'Free Tier' },
  'google/gemini-1.5-pro': { tag: 'Gemini 1.5 Pro Router', icon: '📊', desc: 'Long-context Gemini model via OpenRouter API.', tier: 'Advanced' },
  'openai/gpt-4.5-preview': { tag: 'GPT-4.5 via Router', icon: '✨', desc: 'OpenAI flagship foundation model on OpenRouter.', tier: 'Latest 2026' },
  'anthropic/claude-3.7-sonnet': { tag: 'Claude 3.7 on OpenRouter', icon: '🧠', desc: 'Anthropic hybrid reasoning model routed via OpenRouter.', tier: 'Premier' },
  'anthropic/claude-3.7-sonnet:thinking': { tag: 'Claude 3.7 Thinking Mode', icon: '🤔', desc: 'OpenRouter parameter enabling extended CoT thinking budget.', tier: 'Reasoning' },
  'auto': { tag: 'Auto Smart Router', icon: '🎯', desc: 'Automatically routes queries to the optimal price-to-performance model.', tier: 'Smart' },

  // Together AI Models
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': { tag: 'Turbo 70B Open Model', icon: '⚡', desc: 'High-speed accelerated Llama 3.3 70B on Together cloud.', tier: 'Recommended' },
  'deepseek-ai/DeepSeek-R1': { tag: 'DeepSeek R1 on Together', icon: '🧠', desc: 'Full-scale DeepSeek R1 reasoning on high-bandwidth clusters.', tier: 'Reasoning' },
  'deepseek-ai/DeepSeek-V3': { tag: 'DeepSeek V3 on Together', icon: '✨', desc: 'Full-scale DeepSeek V3 671B MoE model.', tier: 'Advanced' },
  'Qwen/Qwen2.5-72B-Instruct-Turbo': { tag: 'Qwen 2.5 72B Turbo', icon: '🌐', desc: 'Alibaba leading 72B open model on Together AI infrastructure.', tier: 'Advanced' },
  'Qwen/Qwen2.5-Coder-32B-Instruct': { tag: 'Qwen 2.5 Coder 32B', icon: '💻', desc: 'Specialized math & code reasoning on Together AI.', tier: 'Standard' },
  'mistralai/Mixtral-8x22B-Instruct-v0.1': { tag: 'Mixtral 8x22B Cloud', icon: '🔄', desc: 'Heavyweight Mixture-of-Experts on Together AI.', tier: 'Standard' },

  // Perplexity AI Models
  'sonar-pro': { tag: 'Online Grounded Search & Reasoning', icon: '🔍', desc: 'Premier search-augmented model citing real-time web sources and market rates.', tier: 'Recommended' },
  'sonar': { tag: 'Fast Grounded Search', icon: '⚡', desc: 'Lightweight real-time web-connected intelligence.', tier: 'Fast' },
  'sonar-reasoning-pro': { tag: 'Deep Research with Live Web Search', icon: '🔬', desc: 'Multi-turn deep research engine with real-time web grounding.', tier: 'Advanced' },
  'sonar-reasoning': { tag: 'Reasoning with Live Web Search', icon: '🧠', desc: 'Step-by-step reasoning verified against real-time internet data.', tier: 'Reasoning' },
  'r1-1776': { tag: 'Perplexity R1-1776 Post-Trained', icon: '🗽', desc: 'DeepSeek R1 post-trained by Perplexity for unbiased factual citations.', tier: 'Reasoning' },

  // xAI Grok Models
  'grok-2-1212': { tag: 'xAI Grok 2 Frontier', icon: '✨', desc: 'Frontier reasoning and real-world understanding by xAI.', tier: 'Recommended' },
  'grok-2': { tag: 'xAI Grok 2 Alias', icon: '✨', desc: 'Standard production alias for Grok 2.', tier: 'Standard' },
  'grok-2-vision-1212': { tag: 'xAI Grok 2 Vision', icon: '👁️', desc: 'Multimodal vision and transactional OCR understanding.', tier: 'Vision' },
  'grok-2-vision': { tag: 'xAI Grok 2 Vision Alias', icon: '👁️', desc: 'Standard alias for Grok 2 Vision.', tier: 'Vision' },
  'grok-beta': { tag: 'xAI Grok Preview', icon: '🚀', desc: 'Early preview release of newest xAI architecture.', tier: 'Preview' },

  // Cohere Models
  'command-r-plus': { tag: 'Enterprise Tool & RAG Flagship', icon: '✨', desc: 'Optimized for high-accuracy financial retrieval and structured workflows.', tier: 'Recommended' },
  'command-r': { tag: 'Scalable RAG Model', icon: '⚡', desc: 'Cost-effective model with strong citation and tool support.', tier: 'Standard' },
  'command-light': { tag: 'Fast Instruction Model', icon: '🚀', desc: 'Fast, lightweight command model for rapid responses.', tier: 'Fast' },

  // Ollama Offline Models
  'llama3.2': { tag: 'Offline Local 3B', icon: '🛡️', desc: 'Lightweight local model running entirely offline on your hardware.', tier: 'Local' },
  'llama3.3': { tag: 'Offline Local 70B', icon: '🛡️', desc: 'High capability local open model without cloud dependency.', tier: 'Local' },
  'qwen2.5': { tag: 'Offline Qwen 2.5', icon: '🌐', desc: 'Multilingual offline model on Ollama.', tier: 'Local' },
  'mistral': { tag: 'Offline Mistral', icon: '🇫🇷', desc: 'Classic 7B offline local model.', tier: 'Local' },
  'gemma2': { tag: 'Offline Gemma 2', icon: '💎', desc: 'Google Gemma 2 running locally.', tier: 'Local' },
  'phi4': { tag: 'Offline Phi-4', icon: '🔬', desc: 'Microsoft Phi-4 compact reasoning model.', tier: 'Local' },
  'codellama': { tag: 'Offline Code Llama', icon: '💻', desc: 'Code and structured data model.', tier: 'Local' },
  'starcoder2': { tag: 'Offline StarCoder 2', icon: '💻', desc: 'Code generation offline model.', tier: 'Local' },

  // Native Local RAG
  'deterministic-rag-v2': { tag: 'Zero-Cloud In-Memory Math', icon: '🛡️', desc: '100% deterministic mathematical accounting engine (0ms latency, zero API keys).', tier: 'Offline RAG' },
};

export const SettingsPage = () => {
  const { user } = useAuth();

  // AI Configuration State
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.0-flash');
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
  const [resettingDemo, setResettingDemo] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Currency State
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || '₹');

  const handleResetDemoData = async () => {
    setResettingDemo(true);
    try {
      await apiFetch('/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ forceRefresh: true }),
      });
      setResetSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error('Failed to reset demo sandbox data', err);
    } finally {
      setResettingDemo(false);
    }
  };

  const providerIcons = {
    gemini: Sparkles,
    openai: Bot,
    claude: Cpu,
    groq: Zap,
    deepseek: Server,
    mistral: Layers,
    openrouter: Globe,
    together: Share2,
    perplexity: Compass,
    xai: Orbit,
    cohere: Box,
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
    together: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(236, 72, 153, 0.2))',
    perplexity: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(59, 130, 246, 0.2))',
    xai: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))',
    cohere: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.2))',
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
          Customize your AI Provider (Google Gemini, OpenAI, Claude, Groq, DeepSeek, Mistral, OpenRouter, Together AI, Perplexity, xAI Grok, Cohere, Ollama, or Custom Endpoints) with automatic Local RAG fallback.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
        {/* SECTION 0: Device Hardware & AI Capability Scanner */}
        <DevicePerformanceCard />

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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {(info.apiKeyUrl || PROVIDER_KEY_URLS[key]) && (
                        <a
                          href={info.apiKeyUrl || PROVIDER_KEY_URLS[key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={`Open ${info.name} API Key Portal`}
                          style={{
                            color: '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '3px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#00FF87';
                            e.currentTarget.style.background = 'rgba(0, 255, 135, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#64748B';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                          }}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
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
                      {availableModels.map((m) => {
                        const metaTag = MODEL_TAGS[m];
                        return (
                          <option key={m} value={m} style={{ background: '#0F1420', color: '#F1F5F9' }}>
                            {m} {metaTag ? `— ${metaTag.icon} ${metaTag.tag}` : ''} {m === currentProviderMeta.defaultModel ? '★ (Default)' : ''}
                          </option>
                        );
                      })}
                      {!availableModels.includes(model) && model !== 'custom-input' && (
                        <option value={model} style={{ background: '#0F1420', color: '#F1F5F9' }}>
                          {model} (Custom Saved)
                        </option>
                      )}
                      <option value="custom-input" style={{ background: '#0F1420', color: '#00FF87', fontWeight: 700 }}>
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
                    placeholder="Enter model string (e.g. gemini-2.5-pro, gpt-4o, llama-3.3-70b)"
                    className="auth-input-field"
                    style={{ marginTop: '8px' }}
                  />
                )}

                {/* Dynamic Selected Model Capability Pill */}
                {(() => {
                  const activeKey = model === 'custom-input' ? customModelInput.trim() : model;
                  const metaTag = MODEL_TAGS[activeKey];
                  if (metaTag) {
                    return (
                      <motion.div
                        key={activeKey}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          marginTop: '10px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                        }}
                      >
                        <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '1px' }}>{metaTag.icon || '✨'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#00FF87' }}>{metaTag.tag}</span>
                            {metaTag.tier && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '1px 7px',
                                  borderRadius: '6px',
                                  background: 'rgba(0, 240, 255, 0.12)',
                                  color: '#00F0FF',
                                  border: '1px solid rgba(0, 240, 255, 0.25)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {metaTag.tier}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                            {metaTag.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  }
                  if (model === 'custom-input' && customModelInput.trim()) {
                    return (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: 'rgba(0, 255, 135, 0.05)',
                          border: '1px solid rgba(0, 255, 135, 0.15)',
                          fontSize: '11.5px',
                          color: '#00FF87',
                        }}
                      >
                        ⚙️ Custom Target Model: <strong>{customModelInput.trim()}</strong>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* API Key Input (if not local_rag) */}
              {provider !== 'local_rag' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#CBD5E1', margin: 0 }}>
                      API Key (BYOK)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(currentProviderMeta.apiKeyUrl || PROVIDER_KEY_URLS[provider]) && (
                        <a
                          href={currentProviderMeta.apiKeyUrl || PROVIDER_KEY_URLS[provider]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Open ${currentProviderMeta.name || provider} API Key Portal`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#00FF87',
                            background: 'rgba(0, 255, 135, 0.1)',
                            border: '1px solid rgba(0, 255, 135, 0.3)',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0, 255, 135, 0.15)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Key size={11} />
                          <span>Get {currentProviderMeta.name ? currentProviderMeta.name.split(' ')[0] : 'Provider'} Key</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {hasCustomKey ? 'Custom Key Saved' : 'Using Server Environment'}
                      </span>
                    </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {provider === 'ollama' ? 'Ollama uses local daemon (no cloud key required).' : 'Keys are stored securely per user and masked.'}
                    </span>
                    {(currentProviderMeta.apiKeyUrl || PROVIDER_KEY_URLS[provider]) && (
                      <a
                        href={currentProviderMeta.apiKeyUrl || PROVIDER_KEY_URLS[provider]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '11.5px',
                          color: '#00F0FF',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 700,
                        }}
                      >
                        <span>Open {currentProviderMeta.name ? currentProviderMeta.name.replace(/ \(.*\)/, '') : ''} Key Portal</span>
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
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

        {/* SECTION 4: Demo Sandbox Tools (Shown for Demo Account) */}
        {(user?.isDemo || user?.email === 'demo@antigravity.finance') && (
          <div
            style={{
              background: 'rgba(15, 20, 32, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 135, 0.25)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 255, 135, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Sparkles size={20} color="#00FF87" />
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#F1F5F9', margin: 0 }}>
                    4. Practical Sandbox Demo Management
                  </h2>
                </div>
                <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
                  You are currently exploring the live Sandbox Demo. Restoring resets all 8 financial modules (multi-month Incomes, Expenses, Budgets, Subscriptions, Goals, Debt Payoff, Multi-Currency Trip Vaults, Group Splits) to their fresh, realistic state.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleResetDemoData}
                disabled={resettingDemo}
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.15), rgba(0, 240, 255, 0.15))',
                  border: '1.5px solid #00FF87',
                  color: '#00FF87',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(0, 255, 135, 0.2)',
                  transition: 'all 0.2s ease',
                }}
              >
                <RefreshCw size={16} className={resettingDemo ? 'animate-spin' : ''} />
                <span>{resettingDemo ? 'Refreshing Sandbox...' : resetSuccess ? 'Sandbox Restored! Reloading...' : 'Restore Fresh Demo Data'}</span>
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
