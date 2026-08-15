/**
 * Unified Multi-Provider AI Engine Adapter
 * Highly Optimized with Connection Pooling, Request Timeouts & Robust Fallbacks.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const PROVIDER_METADATA = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    envKey: 'GEMINI_API_KEY',
    type: 'gemini',
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-3.5-turbo'],
    envKey: 'OPENAI_API_KEY',
    baseURL: 'https://api.openai.com/v1',
    type: 'openai_compatible',
  },
  claude: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-5-haiku-20241022',
    models: ['claude-3-5-haiku-20241022', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    envKey: 'ANTHROPIC_API_KEY',
    baseURL: 'https://api.anthropic.com/v1',
    type: 'claude',
  },
  groq: {
    name: 'Groq (Ultra-Fast)',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'deepseek-r1-distill-llama-70b', 'mixtral-8x7b-32768'],
    envKey: 'GROQ_API_KEY',
    baseURL: 'https://api.groq.com/openai/v1',
    type: 'openai_compatible',
  },
  deepseek: {
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    envKey: 'DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com/v1',
    type: 'openai_compatible',
  },
  mistral: {
    name: 'Mistral AI',
    defaultModel: 'mistral-small-latest',
    models: ['mistral-small-latest', 'mistral-large-latest', 'codestral-latest'],
    envKey: 'MISTRAL_API_KEY',
    baseURL: 'https://api.mistral.ai/v1',
    type: 'openai_compatible',
  },
  openrouter: {
    name: 'OpenRouter (100+ Models)',
    defaultModel: 'openai/gpt-4o-mini',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-haiku', 'deepseek/deepseek-r1', 'meta-llama/llama-3.3-70b-instruct', 'auto'],
    envKey: 'OPENROUTER_API_KEY',
    baseURL: 'https://openrouter.ai/api/v1',
    type: 'openai_compatible',
  },
  ollama: {
    name: 'Ollama (Local Offline)',
    defaultModel: 'llama3.2',
    models: ['llama3.2', 'deepseek-r1', 'mistral', 'qwen2.5', 'gemma2'],
    envKey: null,
    baseURL: 'http://localhost:11434/v1',
    type: 'openai_compatible',
  },
  custom: {
    name: 'Custom Endpoint',
    defaultModel: 'custom-model',
    models: [],
    envKey: null,
    baseURL: '',
    type: 'openai_compatible',
  },
  local_rag: {
    name: 'Native Local RAG',
    defaultModel: 'deterministic-rag-v2',
    models: ['deterministic-rag-v2'],
    envKey: null,
    type: 'local_rag',
  },
};

// Client Instance Cache for Connection Reuse & Socket Pooling
const clientPool = new Map();

const getOpenAIClient = (apiKey, baseURL, defaultHeaders = {}) => {
  const cacheKey = `${apiKey}_${baseURL}`;
  if (clientPool.has(cacheKey)) {
    return clientPool.get(cacheKey);
  }

  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 12000, // 12s socket timeout to avoid hanging requests
    maxRetries: 1,
    defaultHeaders,
  });

  clientPool.set(cacheKey, client);
  return client;
};

/**
 * Resolves active API key for a given provider
 */
const resolveApiKey = (provider, userApiKey) => {
  if (userApiKey && typeof userApiKey === 'string' && userApiKey.trim() !== '' && !userApiKey.startsWith('••••')) {
    return userApiKey.trim();
  }
  const meta = PROVIDER_METADATA[provider];
  if (meta && meta.envKey && process.env[meta.envKey]) {
    return process.env[meta.envKey].trim();
  }
  return null;
};

class UnifiedAIClient {
  /**
   * Generates AI completion using the configured provider
   */
  static async generateCompletion({ prompt, systemPrompt = '', jsonMode = false, userConfig = {} }) {
    const provider = userConfig.provider || 'gemini';

    if (provider === 'local_rag') {
      return null;
    }

    const meta = PROVIDER_METADATA[provider] || PROVIDER_METADATA.gemini;
    const apiKey = resolveApiKey(provider, userConfig.apiKey);
    const modelName = (userConfig.model && userConfig.model.trim()) || meta.defaultModel;
    const temperature = userConfig.temperature !== undefined ? Math.max(0, Math.min(1, Number(userConfig.temperature))) : 0.2;

    // 1. Google Gemini Native Handler
    if (provider === 'gemini') {
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return null;
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature },
      });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await geminiModel.generateContent(fullPrompt);
      return result.response.text().trim();
    }

    // 2. Anthropic Claude Direct REST Handler
    if (provider === 'claude') {
      if (!apiKey) return null;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 1024,
            system: systemPrompt || undefined,
            messages: [{ role: 'user', content: prompt }],
            temperature,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Claude API Error (${res.status}): ${errBody.slice(0, 150)}`);
        }

        const data = await res.json();
        return data.content?.[0]?.text?.trim() || '';
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // 3. OpenAI-Compatible Handler (OpenAI, Groq, DeepSeek, Mistral, OpenRouter, Ollama, Custom)
    const baseURL = (userConfig.customBaseUrl && userConfig.customBaseUrl.trim()) || meta.baseURL || 'https://api.openai.com/v1';
    const effectiveKey = apiKey || (provider === 'ollama' ? 'ollama' : 'dummy-key');

    const defaultHeaders = {
      ...(userConfig.customHeaders instanceof Map
        ? Object.fromEntries(userConfig.customHeaders)
        : userConfig.customHeaders || {}),
    };

    if (provider === 'openrouter') {
      defaultHeaders['HTTP-Referer'] = 'https://richyrich.app';
      defaultHeaders['X-Title'] = 'Richy Rich Finance OS';
    }

    const client = getOpenAIClient(effectiveKey, baseURL, defaultHeaders);

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completionParams = {
      model: modelName,
      messages,
      temperature,
    };

    if (jsonMode && (provider === 'openai' || provider === 'groq' || provider === 'deepseek')) {
      completionParams.response_format = { type: 'json_object' };
    }

    const response = await client.chat.completions.create(completionParams);
    return response.choices?.[0]?.message?.content?.trim() || '';
  }

  /**
   * Tests connection to a given provider / model configuration
   */
  static async testConnection({ provider, model, apiKey, customBaseUrl, customHeaders }) {
    const startTime = Date.now();
    const meta = PROVIDER_METADATA[provider] || PROVIDER_METADATA.gemini;
    const targetModel = (model && model.trim()) || meta.defaultModel;

    if (provider === 'local_rag') {
      return {
        success: true,
        latencyMs: 1,
        message: 'Local RAG Engine operational (0ms latency, zero cloud dependency).',
        provider: 'local_rag',
        model: 'deterministic-rag-v2',
      };
    }

    try {
      const pingPrompt = 'Respond with "PONG" and nothing else.';
      const result = await this.generateCompletion({
        prompt: pingPrompt,
        userConfig: { provider, model: targetModel, apiKey, customBaseUrl, customHeaders, temperature: 0 },
      });

      const latencyMs = Date.now() - startTime;
      if (!result) {
        return {
          success: false,
          latencyMs,
          message: 'No API key configured for this provider. Local RAG fallback will be used.',
        };
      }

      return {
        success: true,
        latencyMs,
        message: `Connected to ${meta.name} [${targetModel}] (${latencyMs}ms)`,
        provider,
        model: targetModel,
        preview: result.slice(0, 40),
      };
    } catch (err) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: err.message || 'Connection test failed',
      };
    }
  }

  static getProviderMetadata() {
    return PROVIDER_METADATA;
  }
}

module.exports = UnifiedAIClient;
