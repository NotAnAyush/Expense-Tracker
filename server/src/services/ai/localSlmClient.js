const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Local Financial Small Language Model (SLM) Adapter
 * Connects to Ollama / vLLM / llama.cpp host endpoint for zero-cloud AI inference.
 * Defaults to qwen2.5:1.5b (or phi-3.5-mini) adhering to ADR-007.
 */
class LocalSlmClient {
  static getBaseUrl() {
    return process.env.LOCAL_SLM_URL || 'http://127.0.0.1:11434';
  }

  static getModelName() {
    return process.env.LOCAL_SLM_MODEL || 'qwen2.5:1.5b';
  }

  /**
   * Probe if local SLM daemon is active
   */
  static async isAvailable(timeoutMs = 1500) {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(`${this.getBaseUrl()}/api/tags`);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const req = client.get(
          urlObj.href,
          { timeout: timeoutMs },
          (res) => {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Generates a raw completion from the local SLM
   */
  static async generate(prompt, systemPrompt = '', options = {}) {
    const payload = {
      model: this.getModelName(),
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: options.temperature !== undefined ? options.temperature : 0.2,
        top_p: 0.9,
        num_predict: options.maxTokens || 350,
      },
    };

    const res = await this._postJson(`${this.getBaseUrl()}/api/generate`, payload, options.timeout || 12000);
    return res && res.response ? res.response.trim() : '';
  }

  /**
   * Categorizes a transaction using local SLM
   */
  static async suggestCategory(title, amount, merchant, categories = []) {
    const systemPrompt = `You are an expert financial categorization engine. Output ONLY a valid JSON object: {"category": string, "confidence": number, "reasoning": string}.
Valid categories: ${categories.join(', ')}.`;

    const userPrompt = `Classify this expense: Title: "${title}", Merchant: "${merchant || 'Unknown'}", Amount: ${amount}.`;

    try {
      const raw = await this.generate(userPrompt, systemPrompt, { temperature: 0.1 });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.category && categories.includes(parsed.category)) {
          return {
            category: parsed.category,
            confidence: Number(parsed.confidence) || 0.88,
            reasoning: parsed.reasoning || `Categorized via local ${this.getModelName()}`,
            source: 'local_slm_qwen2.5',
          };
        }
      }
    } catch (err) {
      console.warn('[Local SLM Categorize Warning]:', err.message);
    }

    return null;
  }

  /**
   * Copilot conversational inference grounded on deterministic data
   */
  static async copilotChat(intent, toolData, query) {
    const systemPrompt = `You are Richy Rich AI, a sovereign personal wealth copilot. Answer concisely based strictly on this factual data. Do not hallucinate math.
Ground truth data: ${JSON.stringify(toolData)}`;

    const userPrompt = `User question: "${query}"`;

    try {
      const response = await this.generate(userPrompt, systemPrompt, { temperature: 0.3, maxTokens: 250 });
      if (response && response.length > 5) {
        return {
          intent,
          answer: response,
          data: toolData,
          suggestions: ['Break down this month', 'Check savings target', 'Show spending anomalies'],
          source: 'local_slm_qwen2.5',
        };
      }
    } catch (err) {
      console.warn('[Local SLM Copilot Warning]:', err.message);
    }

    return null;
  }

  static _postJson(targetUrl, payload, timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      try {
        const urlObj = new URL(targetUrl);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        const bodyStr = JSON.stringify(payload);

        const options = {
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname + urlObj.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyStr),
          },
          timeout: timeoutMs,
        };

        const req = client.request(options, (res) => {
          let responseBody = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            responseBody += chunk;
          });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                resolve(JSON.parse(responseBody));
              } catch (e) {
                reject(new Error(`Failed to parse SLM JSON: ${e.message}`));
              }
            } else {
              reject(new Error(`Local SLM returned HTTP ${res.statusCode}: ${responseBody}`));
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Local SLM request timed out'));
        });

        req.write(bodyStr);
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = LocalSlmClient;
