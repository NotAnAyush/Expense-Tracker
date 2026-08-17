/**
 * Unified Multi-Provider AI Engine Adapter
 * Highly Optimized with Connection Pooling, Request Timeouts, Structured Schemas, Streaming & Multimodal OCR.
 */

let GoogleGenerativeAI;
try {
  ({ GoogleGenerativeAI } = require('@google/generative-ai'));
} catch (e) {
  // Loaded on-demand
}

let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  // Loaded on-demand
}

const PROVIDER_METADATA = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    models: [
      'gemini-3.7-flash',
      'gemini-3.7-flash-thinking',
      'gemini-3.5-pro',
      'gemini-3.5-flash',
      'gemini-3.0-pro',
      'gemini-3.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.0-pro-exp-02-05',
      'gemini-2.0-flash-thinking-exp-01-21',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-pro',
      'gemini-exp-1206',
      'gemini-1.0-pro',
    ],
    envKey: 'GEMINI_API_KEY',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    type: 'gemini',
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: [
      'gpt-4.5-preview',
      'o3',
      'o3-mini',
      'o3-pro',
      'o1',
      'o1-pro',
      'o1-mini',
      'gpt-4o',
      'gpt-4o-mini',
      'chatgpt-4o-latest',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
    envKey: 'OPENAI_API_KEY',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/docs',
    baseURL: 'https://api.openai.com/v1',
    type: 'openai_compatible',
  },
  claude: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-7-sonnet-20250219',
    models: [
      'claude-3-7-sonnet-latest',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-latest',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-latest',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-latest',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    envKey: 'ANTHROPIC_API_KEY',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    docsUrl: 'https://docs.anthropic.com',
    baseURL: 'https://api.anthropic.com/v1',
    type: 'claude',
  },
  groq: {
    name: 'Groq (Ultra-Fast)',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.3-70b-specdec',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.2-90b-vision-preview',
      'llama-3.2-11b-vision-preview',
      'llama-3.2-3b-preview',
      'llama-3.2-1b-preview',
      'deepseek-r1-distill-llama-70b',
      'deepseek-r1-distill-qwen-32b',
      'qwen-2.5-coder-32b',
      'qwen-2.5-32b',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    envKey: 'GROQ_API_KEY',
    apiKeyUrl: 'https://console.groq.com/keys',
    docsUrl: 'https://console.groq.com/docs',
    baseURL: 'https://api.groq.com/openai/v1',
    type: 'openai_compatible',
  },
  deepseek: {
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: [
      'deepseek-chat',
      'deepseek-reasoner',
      'deepseek-v3',
      'deepseek-r1',
    ],
    envKey: 'DEEPSEEK_API_KEY',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    docsUrl: 'https://api-docs.deepseek.com',
    baseURL: 'https://api.deepseek.com/v1',
    type: 'openai_compatible',
  },
  mistral: {
    name: 'Mistral AI',
    defaultModel: 'mistral-large-latest',
    models: [
      'mistral-large-latest',
      'mistral-large-2411',
      'mistral-small-latest',
      'mistral-small-2409',
      'pixtral-large-latest',
      'pixtral-12b-2409',
      'ministral-8b-latest',
      'ministral-3b-latest',
      'codestral-latest',
      'codestral-2501',
      'open-mixtral-8x22b',
    ],
    envKey: 'MISTRAL_API_KEY',
    apiKeyUrl: 'https://console.mistral.ai/api-keys/',
    docsUrl: 'https://docs.mistral.ai',
    baseURL: 'https://api.mistral.ai/v1',
    type: 'openai_compatible',
  },
  openrouter: {
    name: 'OpenRouter (100+ Models)',
    defaultModel: 'google/gemini-2.0-flash-001',
    models: [
      'google/gemini-2.0-flash-001',
      'google/gemini-2.0-pro-exp-02-05:free',
      'google/gemini-2.0-flash-thinking-exp:free',
      'google/gemini-1.5-pro',
      'openai/gpt-4.5-preview',
      'openai/o3-mini',
      'openai/o1',
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'anthropic/claude-3.7-sonnet',
      'anthropic/claude-3.7-sonnet:thinking',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3.5-haiku',
      'deepseek/deepseek-r1',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.3-70b-instruct',
      'qwen/qwen-2.5-72b-instruct',
      'qwen/qwen-2.5-coder-32b-instruct',
      'mistralai/mistral-large-2411',
      'auto',
    ],
    envKey: 'OPENROUTER_API_KEY',
    apiKeyUrl: 'https://openrouter.ai/settings/keys',
    docsUrl: 'https://openrouter.ai/docs',
    baseURL: 'https://openrouter.ai/api/v1',
    type: 'openai_compatible',
  },
  together: {
    name: 'Together AI',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: [
      'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      'deepseek-ai/DeepSeek-R1',
      'deepseek-ai/DeepSeek-V3',
      'Qwen/Qwen2.5-72B-Instruct-Turbo',
      'Qwen/Qwen2.5-Coder-32B-Instruct',
      'mistralai/Mixtral-8x22B-Instruct-v0.1',
    ],
    envKey: 'TOGETHER_API_KEY',
    apiKeyUrl: 'https://api.together.ai/settings/api-keys',
    docsUrl: 'https://docs.together.ai',
    baseURL: 'https://api.together.xyz/v1',
    type: 'openai_compatible',
  },
  perplexity: {
    name: 'Perplexity AI',
    defaultModel: 'sonar-pro',
    models: [
      'sonar-pro',
      'sonar',
      'sonar-reasoning-pro',
      'sonar-reasoning',
      'r1-1776',
    ],
    envKey: 'PERPLEXITY_API_KEY',
    apiKeyUrl: 'https://www.perplexity.ai/settings/api',
    docsUrl: 'https://docs.perplexity.ai',
    baseURL: 'https://api.perplexity.ai',
    type: 'openai_compatible',
  },
  xai: {
    name: 'xAI Grok',
    defaultModel: 'grok-2-1212',
    models: [
      'grok-2-1212',
      'grok-2',
      'grok-2-vision-1212',
      'grok-2-vision',
      'grok-beta',
    ],
    envKey: 'XAI_API_KEY',
    apiKeyUrl: 'https://console.x.ai/',
    docsUrl: 'https://docs.x.ai',
    baseURL: 'https://api.x.ai/v1',
    type: 'openai_compatible',
  },
  cohere: {
    name: 'Cohere',
    defaultModel: 'command-r-plus',
    models: [
      'command-r-plus',
      'command-r',
      'command-light',
    ],
    envKey: 'COHERE_API_KEY',
    apiKeyUrl: 'https://dashboard.cohere.com/api-keys',
    docsUrl: 'https://docs.cohere.com',
    baseURL: 'https://api.cohere.com/v2',
    type: 'openai_compatible',
  },
  ollama: {
    name: 'Ollama (Local Offline)',
    defaultModel: 'llama3.2',
    models: [
      'llama3.2',
      'llama3.3',
      'deepseek-r1',
      'qwen2.5',
      'mistral',
      'gemma2',
      'phi4',
      'codellama',
      'starcoder2',
    ],
    envKey: null,
    apiKeyUrl: 'https://ollama.com/download',
    docsUrl: 'https://ollama.com',
    baseURL: 'http://localhost:11434/v1',
    type: 'openai_compatible',
  },
  custom: {
    name: 'Custom Endpoint',
    defaultModel: 'custom-model',
    models: [],
    envKey: null,
    apiKeyUrl: null,
    docsUrl: null,
    baseURL: '',
    type: 'openai_compatible',
  },
  local_rag: {
    name: 'Native Local RAG',
    defaultModel: 'deterministic-rag-v2',
    models: ['deterministic-rag-v2'],
    envKey: null,
    apiKeyUrl: null,
    docsUrl: null,
    type: 'local_rag',
  },
};

// Client Instance Cache for Connection Reuse & Socket Pooling
const clientPool = new Map();

const getOpenAIClient = (apiKey, baseURL, defaultHeaders = {}) => {
  if (!OpenAI) {
    try {
      OpenAI = require('openai');
    } catch {
      throw new Error('OpenAI client library is not available. Please run npm install in the server directory.');
    }
  }

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
      if (!GoogleGenerativeAI) {
        try {
          ({ GoogleGenerativeAI } = require('@google/generative-ai'));
        } catch {
          return null;
        }
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const generationConfig = { temperature };
      if (jsonMode) {
        generationConfig.responseMimeType = 'application/json';
      }

      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
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
   * Generates Streaming AI completion (Server-Sent Events / Chunk callback)
   */
  static async generateStreamingCompletion({ prompt, systemPrompt = '', userConfig = {}, onChunk }) {
    const provider = userConfig.provider || 'gemini';

    if (provider === 'local_rag') {
      return null;
    }

    const meta = PROVIDER_METADATA[provider] || PROVIDER_METADATA.gemini;
    const apiKey = resolveApiKey(provider, userConfig.apiKey);
    const modelName = (userConfig.model && userConfig.model.trim()) || meta.defaultModel;
    const temperature = userConfig.temperature !== undefined ? Math.max(0, Math.min(1, Number(userConfig.temperature))) : 0.2;

    // 1. Google Gemini Streaming
    if (provider === 'gemini') {
      if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
      if (!GoogleGenerativeAI) {
        try {
          ({ GoogleGenerativeAI } = require('@google/generative-ai'));
        } catch {
          return null;
        }
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature },
      });
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const resultStream = await geminiModel.generateContentStream(fullPrompt);

      let fullText = '';
      for await (const chunk of resultStream.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        if (onChunk) onChunk({ token: chunkText, accumulated: fullText });
      }
      return fullText.trim();
    }

    // 2. OpenAI / Groq / DeepSeek Streaming
    const baseURL = (userConfig.customBaseUrl && userConfig.customBaseUrl.trim()) || meta.baseURL || 'https://api.openai.com/v1';
    const effectiveKey = apiKey || (provider === 'ollama' ? 'ollama' : 'dummy-key');

    const client = getOpenAIClient(effectiveKey, baseURL);
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const stream = await client.chat.completions.create({
      model: modelName,
      messages,
      temperature,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        if (onChunk) onChunk({ token: content, accumulated: fullText });
      }
    }
    return fullText.trim();
  }

  /**
   * Generates Multimodal Vision Completion for Receipts & Invoices (OCR)
   */
  static async generateMultimodalCompletion({ prompt, imageBase64, mimeType = 'image/jpeg', userConfig = {} }) {
    const provider = userConfig.provider || 'gemini';
    const meta = PROVIDER_METADATA[provider] || PROVIDER_METADATA.gemini;
    const apiKey = resolveApiKey(provider, userConfig.apiKey);
    const modelName = (userConfig.model && userConfig.model.trim()) || (provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini');

    // 1. Gemini Vision
    if (provider === 'gemini' || provider === 'local_rag') {
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key is required for receipt vision OCR.');
      }
      if (!GoogleGenerativeAI) ({ GoogleGenerativeAI } = require('@google/generative-ai'));
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const imagePart = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text().trim();
    }

    // 2. OpenAI / GPT-4o Vision
    const baseURL = (userConfig.customBaseUrl && userConfig.customBaseUrl.trim()) || meta.baseURL || 'https://api.openai.com/v1';
    const client = getOpenAIClient(apiKey, baseURL);

    const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${imageBase64}`;

    const response = await client.chat.completions.create({
      model: modelName.includes('gpt-4') ? modelName : 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

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

  /**
   * Multimodal Receipt & Invoice Vision OCR Scanner
   * Extracts merchant, amount, category, date, line items, and payment method from image Base64
   */
  static async scanReceipt({ imageBase64, mimeType = 'image/jpeg', userConfig = {} }) {
    if (!imageBase64) {
      throw new Error('Receipt image data is required');
    }

    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '').trim();
    const provider = userConfig.provider || 'gemini';
    const effectiveKey = resolveApiKey(provider, userConfig.apiKey);

    const prompt = `You are an expert financial receipt and invoice OCR parser.
Analyze this receipt image and extract the key transactional details.
Return ONLY a valid, single JSON object adhering strictly to this schema:
{
  "merchant": string (The name of the store, business, or service provider),
  "amount": number (The final total amount paid),
  "currency": string (e.g. "₹", "$", "€", "£"),
  "date": string (ISO date "YYYY-MM-DD" if visible, or current date),
  "category": string (Must be one of: "Food & Dining", "Transportation", "Housing & Utilities", "Entertainment", "Shopping", "Health & Medical", "Subscriptions", "General"),
  "paymentMethod": string (One of: "Card", "Cash", "UPI", "Bank Transfer", "Other"),
  "confidence": number (Confidence score between 0.0 and 1.0),
  "taxAmount": number (Total tax if listed, or 0),
  "lineItems": [
    { "name": string, "price": number }
  ]
}
Do not include markdown code block backticks, just raw JSON.`;

    // 1. Google Gemini Multimodal Vision
    if (provider === 'gemini' || !provider) {
      if (!effectiveKey) {
        throw new Error('Gemini API key is required for receipt vision scanner. Please configure it in AI Settings.');
      }

      const genAI = new GoogleGenerativeAI(effectiveKey);
      const modelName = userConfig.model && userConfig.model.includes('gemini') ? userConfig.model : 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        },
      ]);

      const text = result.response.text();
      return this._parseReceiptJson(text);
    }

    // 2. OpenAI / Compatible Vision Models (gpt-4o-mini, gpt-4o)
    const baseURL = userConfig.customBaseUrl || PROVIDER_METADATA[provider]?.baseURL || 'https://api.openai.com/v1';
    if (!effectiveKey) {
      throw new Error(`API key required for ${provider} vision scanner.`);
    }

    const client = getOpenAIClient(effectiveKey, baseURL);
    const visionModel = userConfig.model || 'gpt-4o-mini';

    const response = await client.chat.completions.create({
      model: visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${cleanBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    return this._parseReceiptJson(content);
  }

  /**
   * Helper to safely extract and validate JSON from AI vision outputs
   */
  static _parseReceiptJson(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('No receipt text data received from AI model');
    }

    let cleanText = rawText.trim();
    // 1. Check for fenced code block ```json ... ```
    const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      cleanText = codeBlockMatch[1].trim();
    } else {
      // 2. Fallback: Extract innermost or outermost balanced JSON object
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0].trim();
      }
    }

    try {
      const parsed = JSON.parse(cleanText);
      return {
        merchant: String(parsed.merchant || 'Store / Merchant').trim(),
        amount: Math.abs(Number(parsed.amount) || 0),
        currency: parsed.currency || '₹',
        date: parsed.date || new Date().toISOString().slice(0, 10),
        category: parsed.category || 'Food & Dining',
        paymentMethod: parsed.paymentMethod || 'UPI',
        confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.9,
        taxAmount: Number(parsed.taxAmount) || 0,
        lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems.map(item => ({
          name: String(item.name || 'Item'),
          price: Math.abs(Number(item.price) || 0),
        })) : [],
      };
    } catch (parseErr) {
      throw new Error(`Failed to parse structured receipt data from AI output: ${parseErr.message}`);
    }
  }

  static getEffectiveApiKey(provider, userApiKey) {
    return resolveApiKey(provider, userApiKey);
  }

  static resolveApiKey(provider, userApiKey) {
    return resolveApiKey(provider, userApiKey);
  }

  static getProviderMetadata() {
    return PROVIDER_METADATA;
  }
}

module.exports = UnifiedAIClient;
