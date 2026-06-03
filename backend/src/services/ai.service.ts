import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model tier strategy:
// - PRIMARY: llama-3.3-70b-versatile  → complex analysis/generation (fewer calls, higher quality)
// - FAST:    llama-3.1-8b-instant     → simple/structured tasks (fast, low token usage)
export const MODEL_PRIMARY = 'llama-3.3-70b-versatile';
export const MODEL_FAST = 'llama-3.1-8b-instant';
export const MODEL = MODEL_PRIMARY; // default

// Token budget tracking (12k TPM limit on free tier)
let tokenBucketUsed = 0;
let bucketResetTime = Date.now();

function trackTokens(used: number) {
  const now = Date.now();
  // Reset bucket every 60 seconds
  if (now - bucketResetTime >= 60000) {
    tokenBucketUsed = 0;
    bucketResetTime = now;
  }
  tokenBucketUsed += used;
}

function getTokenBucketUsed() {
  const now = Date.now();
  if (now - bucketResetTime >= 60000) {
    tokenBucketUsed = 0;
    bucketResetTime = now;
  }
  return tokenBucketUsed;
}

export interface AIResponse {
  content: string;
  tokens?: number;
}

/**
 * Sleep for given milliseconds
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call Groq AI with automatic retry on rate limit (429)
 * Uses exponential backoff with jitter
 */
export async function callGroqAI(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2048,
  model: string = MODEL_PRIMARY,
  maxRetries: number = 5
): Promise<AIResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Proactive rate-limit guard: if we've used >9000 tokens this minute, wait
      const used = getTokenBucketUsed();
      if (used > 9000) {
        const waitMs = Math.max(0, 60000 - (Date.now() - bucketResetTime)) + 1000;
        console.log(`[SecureForge] TPM guard: ${used} tokens used, waiting ${Math.round(waitMs/1000)}s...`);
        await sleep(waitMs);
      }

      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content || '';
      const tokens = completion.usage?.total_tokens || 0;

      trackTokens(tokens);
      console.log(`[SecureForge] AI call OK | tokens: ${tokens} | bucket: ${tokenBucketUsed}/12000 | model: ${model}`);

      return { content, tokens };

    } catch (error: unknown) {
      const err = error as { status?: number; message?: string; error?: { message?: string } };
      const message = err.error?.message || err.message || 'Unknown error';

      // Handle rate limit (429)
      if (err.status === 429 || message.includes('rate_limit') || message.includes('Rate limit')) {
        // Parse retry-after from error message (e.g., "try again in 3.69s")
        const retryAfterMatch = message.match(/try again in\s+([\d.]+)s/i);
        const retryAfterSec = retryAfterMatch ? parseFloat(retryAfterMatch[1]) : 0;

        // Exponential backoff: base wait + retry-after + jitter
        const backoffMs = Math.min(
          (Math.pow(2, attempt) * 3000) + (retryAfterSec * 1000) + (Math.random() * 1000),
          60000
        );

        console.warn(`[SecureForge] Rate limit hit (attempt ${attempt + 1}/${maxRetries}). Waiting ${Math.round(backoffMs / 1000)}s...`);
        await sleep(backoffMs);

        // Reset token bucket after wait
        tokenBucketUsed = 0;
        bucketResetTime = Date.now();

        lastError = new Error(`Rate limit: ${message}`);
        continue;
      }

      // Non-retryable error
      throw new Error(`Groq AI Error: ${message}`);
    }
  }

  throw new Error(`Groq AI Error: Exceeded max retries due to rate limiting. ${lastError?.message}`);
}

/**
 * Call Groq AI and parse the response as JSON
 */
export async function callGroqAIJSON(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2048,
  model: string = MODEL_PRIMARY
): Promise<Record<string, unknown>> {
  const response = await callGroqAI(
    systemPrompt + '\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no comments.',
    userPrompt,
    maxTokens,
    model
  );

  // Extract JSON from response
  let jsonStr = response.content.trim();

  // Remove markdown code blocks if present
  jsonStr = jsonStr.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

  // Find JSON boundaries
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI JSON response: ${jsonStr.substring(0, 200)}...`);
  }
}

/**
 * Add a small delay between sequential AI calls to avoid TPM spikes
 */
export async function aiDelay(ms: number = 1500) {
  await sleep(ms);
}

export { groq };
