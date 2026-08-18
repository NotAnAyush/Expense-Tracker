/**
 * Unified Multi-Provider AI Engine Adapter
 * Highly Optimized with Connection Pooling, Request Timeouts & Robust Fallbacks.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

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

    const prompt = `You are an expert financial receipt, tax invoice, and e-commerce order OCR engine.
Analyze this receipt or invoice image with maximum precision and extract all key transactional, tax, line-item, and merchant details.

Return ONLY a valid, single JSON object adhering strictly to this schema:
{
  "merchant": string (The clean business/store/platform name, e.g. "The Rameshwaram Cafe", "Amazon India", "Flipkart", "Blinkit", "Starbucks"),
  "merchantAddress": string (Store physical address, branch, or city/state if visible, e.g. "Indiranagar, Bengaluru"),
  "gstin": string (15-character Indian GST Identification Number or country VAT/Tax ID if visible, e.g. "29ABHFR8210M1ZP", or ""),
  "phone": string (Merchant phone or contact number if printed, or ""),
  "invoiceNumber": string (Bill No, Order ID, Invoice Number, e.g. "311086", "408-1234567-8901234"),
  "tokenNumber": string (Queue Token or Table No if printed, e.g. "136", or ""),
  "date": string (ISO date "YYYY-MM-DD" if visible, e.g. "2026-08-16", or current date),
  "time": string (Time of transaction if visible, e.g. "06:37", or ""),
  "category": string (Must match the most accurate category from: "Food & Dining", "Groceries & Supermarket", "Shopping & E-Commerce", "Electronics & Gadgets", "Clothing & Apparel", "Home & Kitchen", "Transportation & Fuel", "Travel & Lodging", "Health & Medical", "Entertainment & OTT", "Housing & Utilities", "Subscriptions & Software", "Education & Learning", "Beauty & Personal Care", "Gifts & Donations", "Investments & Wealth", "Office & Business", "Vehicle & Maintenance", "General & Miscellaneous"),
  "subCategory": string (Specific sub-tag, e.g. "South Indian Cafe", "Online Grocery", "Fast Food"),
  "paymentMethod": string (One of: "UPI", "Card", "Cash", "Net Banking", "Wallet", "COD", "Amazon Pay", "Other"),
  "paymentRef": string (UTR number, UPI Ref, Card last 4 digits, or transaction ID if visible, or ""),
  "currency": string (e.g. "₹", "$", "€", "£"),
  "subtotal": number (Pre-tax taxable value of items before taxes and fees, e.g. 319.04),
  "cgst": {
    "rate": number (Percentage rate, e.g. 2.5),
    "amount": number (CGST tax amount in currency, e.g. 7.98)
  },
  "sgst": {
    "rate": number (Percentage rate, e.g. 2.5),
    "amount": number (SGST tax amount in currency, e.g. 7.98)
  },
  "igst": {
    "rate": number (Percentage rate, e.g. 0),
    "amount": number (IGST tax amount in currency, e.g. 0)
  },
  "taxAmount": number (Total tax sum CGST + SGST + IGST or other VAT, e.g. 15.96),
  "deliveryFee": number (Delivery / shipping charge if listed, or 0),
  "platformFee": number (Platform / handling / convenience fee if listed, or 0),
  "packagingFee": number (Restaurant packaging / box charges if listed, or 0),
  "discount": number (Discounts, promo coupons, or cashback applied, or 0),
  "roundOff": number (Rounding adjustment if listed, e.g. 0.00 or -0.04),
  "amount": number (The final net total amount paid, e.g. 335.00),
  "lineItems": [
    {
      "name": string (Clean description of the product or dish, e.g. "Ghee Pudi Masala Dosa"),
      "quantity": number (Number of units purchased, e.g. 1, 2, 0.5),
      "unitPrice": number (Rate or unit cost per item, e.g. 147.62),
      "price": number (Total cost for this item = quantity * unitPrice or printed amount, e.g. 147.62),
      "category": string (Optional item-level category, or same as overall category),
      "hsnCode": string (HSN / SAC tax code if present, or ""),
      "taxRate": number (Tax rate percentage on this item if printed, e.g. 5)
    }
  ],
  "isECommerce": boolean (true if detected as Amazon, Flipkart, Swiggy, Zomato, Blinkit, Zepto, Myntra, etc.),
  "confidence": number (Confidence score between 0.0 and 1.0)
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

      // Extract CGST, SGST, IGST objects or numbers
      const rawCgst = parsed.cgst || {};
      const cgst = typeof rawCgst === 'number' 
        ? { rate: 0, amount: Math.abs(rawCgst) } 
        : { rate: Number(rawCgst.rate) || 0, amount: Math.abs(Number(rawCgst.amount) || 0) };

      const rawSgst = parsed.sgst || {};
      const sgst = typeof rawSgst === 'number' 
        ? { rate: 0, amount: Math.abs(rawSgst) } 
        : { rate: Number(rawSgst.rate) || 0, amount: Math.abs(Number(rawSgst.amount) || 0) };

      const rawIgst = parsed.igst || {};
      const igst = typeof rawIgst === 'number' 
        ? { rate: 0, amount: Math.abs(rawIgst) } 
        : { rate: Number(rawIgst.rate) || 0, amount: Math.abs(Number(rawIgst.amount) || 0) };

      let taxAmount = Number(parsed.taxAmount) || 0;
      if (!taxAmount && (cgst.amount || sgst.amount || igst.amount)) {
        taxAmount = Number((cgst.amount + sgst.amount + igst.amount).toFixed(2));
      }

      // Line items normalization with quantities and unit costs
      const lineItems = Array.isArray(parsed.lineItems) ? parsed.lineItems.map(item => {
        const qty = Math.max(0.001, Number(item.quantity) || 1);
        const itemPrice = Math.abs(Number(item.price) || 0);
        const unitPrice = item.unitPrice !== undefined && Number(item.unitPrice) > 0 
          ? Number(item.unitPrice) 
          : (itemPrice > 0 ? Number((itemPrice / qty).toFixed(2)) : 0);

        return {
          name: String(item.name || 'Item').trim(),
          quantity: qty,
          unitPrice: unitPrice,
          price: itemPrice > 0 ? itemPrice : Number((unitPrice * qty).toFixed(2)),
          category: String(item.category || parsed.category || 'Food & Dining').trim(),
          hsnCode: String(item.hsnCode || '').trim(),
          taxRate: Number(item.taxRate) || 0,
        };
      }) : [];

      const lineItemsSum = lineItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
      const subtotal = parsed.subtotal !== undefined && Number(parsed.subtotal) > 0
        ? Number(parsed.subtotal)
        : (lineItemsSum > 0 ? Number(lineItemsSum.toFixed(2)) : 0);

      const finalAmount = Math.abs(Number(parsed.amount) || 0) || (subtotal + taxAmount);

      return {
        merchant: String(parsed.merchant || 'Store / Merchant').trim(),
        merchantAddress: String(parsed.merchantAddress || '').trim(),
        gstin: String(parsed.gstin || '').trim().toUpperCase(),
        phone: String(parsed.phone || '').trim(),
        invoiceNumber: String(parsed.invoiceNumber || parsed.billNumber || parsed.orderId || '').trim(),
        tokenNumber: String(parsed.tokenNumber || parsed.token || '').trim(),
        amount: Number(finalAmount.toFixed(2)),
        currency: parsed.currency || '₹',
        date: parsed.date || new Date().toISOString().slice(0, 10),
        time: String(parsed.time || '').trim(),
        category: parsed.category || 'Food & Dining',
        subCategory: String(parsed.subCategory || '').trim(),
        paymentMethod: parsed.paymentMethod || 'UPI',
        paymentRef: String(parsed.paymentRef || parsed.utr || '').trim(),
        confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.9,
        subtotal: Number(subtotal.toFixed(2)),
        cgst,
        sgst,
        igst,
        taxAmount: Number(taxAmount.toFixed(2)),
        deliveryFee: Math.abs(Number(parsed.deliveryFee) || 0),
        platformFee: Math.abs(Number(parsed.platformFee) || 0),
        packagingFee: Math.abs(Number(parsed.packagingFee) || 0),
        discount: Math.abs(Number(parsed.discount) || 0),
        roundOff: Number(parsed.roundOff) || 0,
        lineItems,
        isECommerce: Boolean(parsed.isECommerce),
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
