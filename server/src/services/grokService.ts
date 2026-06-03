// ──────────────────────────────────────────────────────────────────────────────
// Grok AI Service — xAI wrapper using OpenAI SDK with retry logic
// ──────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai';

const MODEL = 'llama-3.1-8b-instant';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

let _ai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_ai) {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey || apiKey === 'your-grok-api-key-here') {
      throw new Error(
        'GROK_API_KEY is not configured. Set a valid key in your .env file.',
      );
    }
    _ai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _ai;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isRateLimit =
        lastError.message.includes('429') ||
        lastError.message.toLowerCase().includes('rate');
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) * (isRateLimit ? 2 : 1);
      console.warn(
        `[GrokService] Attempt ${attempt + 1}/${MAX_RETRIES} failed: ${lastError.message}. Retrying in ${delay}ms…`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(
    `Grok API call failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  );
}

/**
 * Generate text content.
 * Grok's beta API supports JSON mode via `response_format: { type: 'json_object' }`.
 */
export async function generateContent(
  prompt: string,
  schema?: Record<string, unknown>,
): Promise<string> {
  return withRetry(async () => {
    const ai = getClient();
    
    // Add instruction for JSON format if a schema is requested
    const systemPrompt = schema 
      ? `You are a specialized code generation AI. Respond ONLY with valid JSON that matches this schema: ${JSON.stringify(schema)}`
      : 'You are a specialized code generation AI.';

    const response = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: schema ? { type: 'json_object' } : undefined,
    });
    
    const text = response.choices[0]?.message?.content ?? '';
    if (!text) {
      throw new Error('Grok returned an empty response');
    }
    return text;
  });
}

/**
 * Analyse an image (e.g. a UML diagram) together with a text prompt.
 * Using grok-2-vision-1212 model for image analysis.
 */
export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  schema?: Record<string, unknown>,
): Promise<string> {
  return withRetry(async () => {
    const ai = getClient();
    
    const systemPrompt = schema 
      ? `You are an expert systems architect AI. Respond ONLY with valid JSON that matches this schema: ${JSON.stringify(schema)}`
      : 'You are an expert systems architect AI.';

    // Base64 Data URI
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const response = await ai.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      response_format: schema ? { type: 'json_object' } : undefined,
    });
    
    const text = response.choices[0]?.message?.content ?? '';
    if (!text) {
      throw new Error('Grok returned an empty response for image analysis');
    }
    return text;
  });
}

/**
 * Stream content from Grok (returns the fully-aggregated text).
 */
export async function generateContentStream(prompt: string): Promise<string> {
  return withRetry(async () => {
    const ai = getClient();
    const stream = await ai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a specialized code generation AI.' },
        { role: 'user', content: prompt }
      ],
      stream: true,
    });
    
    let result = '';
    for await (const chunk of stream) {
      result += chunk.choices[0]?.delta?.content ?? '';
    }
    if (!result) {
      throw new Error('Grok stream returned empty content');
    }
    return result;
  });
}
