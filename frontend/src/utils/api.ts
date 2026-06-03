import type {
  AnalysisResult,
  GeneratedCode,
  SecurityAuditResult,
  StrideReport,
  DevOpsBundle,
  DiagramBundle,
} from '../types';

const BASE_URL = '/api';

// ─── Individual endpoints (kept for direct access) ──────────────────────────

export async function analyzeText(requirements: string): Promise<AnalysisResult> {
  const res = await fetch(`${BASE_URL}/analyze/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Unified Pipeline via SSE ────────────────────────────────────────────────

export interface PipelineCallbacks {
  onProgress: (step: string, message: string) => void;
  onStepDone: (step: string, data: unknown) => void;
  onWarning: (step: string, message: string) => void;
  onError: (message: string) => void;
  onDone: () => void;
}

export interface PipelineResult {
  analysis?: AnalysisResult;
  generatedCode?: GeneratedCode;
  securityAudit?: SecurityAuditResult;
  strideReport?: StrideReport;
  devOps?: DevOpsBundle;
  diagrams?: DiagramBundle;
}

/**
 * Runs the entire SecureForge pipeline via a single SSE connection.
 * The backend handles rate limiting and sequential execution.
 * Progress events stream back in real time.
 */
export async function runForgePipeline(
  input: { requirements: string; inputType: 'text' | 'uml'; umlDescription?: string },
  callbacks: PipelineCallbacks
): Promise<PipelineResult> {
  return new Promise((resolve, reject) => {
    const result: PipelineResult = {};

    // Build form data
    const formData = new FormData();
    formData.append('requirements', input.requirements);
    formData.append('inputType', input.inputType);
    if (input.umlDescription) {
      formData.append('umlDescription', input.umlDescription);
    }

    // Use fetch with manual SSE parsing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 min timeout

    fetch(`${BASE_URL}/forge/run`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    }).then(async (res) => {
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => 'Unknown error');
        callbacks.onError(`Server error ${res.status}: ${errText}`);
        reject(new Error(`Server error: ${res.status}`));
        return;
      }

      if (!res.body) {
        callbacks.onError('No response stream');
        reject(new Error('No response stream'));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const parseSSE = (chunk: string) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        let currentEvent = '';
        let currentData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            currentData = line.slice(6).trim();
          } else if (line === '' && currentEvent && currentData) {
            // Process complete event
            try {
              const payload = JSON.parse(currentData);
              handleSSEEvent(currentEvent, payload);
            } catch {
              // Ignore parse errors
            }
            currentEvent = '';
            currentData = '';
          }
        }
      };

      const handleSSEEvent = (event: string, payload: Record<string, unknown>) => {
        switch (event) {
          case 'progress':
            callbacks.onProgress(payload.step as string, payload.message as string);
            break;

          case 'step_done': {
            const step = payload.step as string;
            const data = payload.data;
            callbacks.onStepDone(step, data);

            // Store result
            if (step === 'analyze') result.analysis = data as AnalysisResult;
            else if (step === 'generate') result.generatedCode = data as GeneratedCode;
            else if (step === 'security') result.securityAudit = data as SecurityAuditResult;
            else if (step === 'stride') result.strideReport = data as StrideReport;
            else if (step === 'devops') result.devOps = data as DevOpsBundle;
            else if (step === 'diagrams') result.diagrams = data as DiagramBundle;
            break;
          }

          case 'step_warning':
            callbacks.onWarning(payload.step as string, payload.message as string);
            break;

          case 'error':
            callbacks.onError(payload.message as string);
            reject(new Error(payload.message as string));
            break;

          case 'done':
            callbacks.onDone();
            resolve(result);
            break;
        }
      };

      // Read stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parseSSE(decoder.decode(value, { stream: true }));
        }
        // If stream ended without 'done' event
        if (!result.analysis) {
          reject(new Error('Stream ended unexpectedly'));
        } else {
          resolve(result);
        }
      } catch (streamErr) {
        if ((streamErr as Error).name !== 'AbortError') {
          callbacks.onError(`Stream error: ${(streamErr as Error).message}`);
          reject(streamErr);
        }
      }
    }).catch((fetchErr) => {
      clearTimeout(timeoutId);
      if (fetchErr.name !== 'AbortError') {
        callbacks.onError(`Network error: ${fetchErr.message}`);
        reject(fetchErr);
      }
    });
  });
}
