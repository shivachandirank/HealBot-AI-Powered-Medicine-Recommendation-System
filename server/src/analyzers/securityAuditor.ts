// ──────────────────────────────────────────────────────────────────────────────
// Security Auditor — AI-powered vulnerability scanner for generated code
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { GeneratedFile, SecurityReport, SecurityFinding, Severity } from '../types';
import { v4 as uuidv4 } from 'uuid';

function sanitizeJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

interface RawFinding {
  severity?: string;
  category?: string;
  title?: string;
  description?: string;
  location?: string;
  recommendation?: string;
}

interface RawAuditResponse {
  score?: number;
  findings?: RawFinding[];
  recommendations?: string[];
}

/**
 * Audit generated code files for security vulnerabilities using Gemini AI.
 *
 * Sends the combined source code to Gemini with a detailed security analysis
 * prompt and parses the structured response into a SecurityReport.
 */
export async function auditSecurity(
  generatedFiles: GeneratedFile[],
): Promise<SecurityReport> {
  // Build a combined code snapshot for analysis
  let codeSnapshot = generatedFiles
    .filter((f) => f.language === 'typescript' || f.language === 'javascript')
    .map((f) => `// ─── File: ${f.path} ───\n${f.content}`)
    .join('\n\n');

  // Truncate to avoid token limits on Groq free tier
  if (codeSnapshot.length > 20000) {
    codeSnapshot = codeSnapshot.substring(0, 20000) + '\n\n...[TRUNCATED TO RESPECT AI TOKEN LIMITS]...';
  }

  if (!codeSnapshot.trim()) {
    return {
      score: 100,
      findings: [],
      recommendations: ['No TypeScript/JavaScript files to audit.'],
      timestamp: new Date().toISOString(),
    };
  }

  const prompt = `
You are an expert application security auditor. Analyze the following generated backend source code for security vulnerabilities.

SOURCE CODE:
${codeSnapshot}

Perform a thorough security audit covering these categories:
1. **SQL Injection** — Look for raw SQL queries, unsanitized user input in queries
2. **Cross-Site Scripting (XSS)** — Look for unsanitized output, reflected/stored XSS vectors
3. **Authentication Issues** — Weak JWT config, missing auth checks, hardcoded secrets
4. **Authorization Flaws** — Missing RBAC enforcement, IDOR vulnerabilities, privilege escalation
5. **Input Validation** — Missing or insufficient validation, type coercion issues
6. **Data Exposure** — Sensitive data in logs, responses including passwords/tokens, excessive data
7. **Cryptographic Issues** — Weak hashing, insufficient salt rounds, insecure random generation
8. **Dependency Risks** — Known vulnerable patterns, insecure imports
9. **Error Handling** — Stack traces leaked to client, missing error boundaries
10. **Configuration** — Hardcoded credentials, insecure defaults, missing security headers
11. **Rate Limiting** — Missing or insufficient rate limiting on sensitive endpoints
12. **CORS Misconfiguration** — Overly permissive CORS, wildcard origins

Return a JSON object with EXACTLY this shape:
{
  "score": <number 0-100, where 100 is perfectly secure>,
  "findings": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
      "category": "<category name from above>",
      "title": "<short finding title>",
      "description": "<detailed description of the vulnerability>",
      "location": "<file path and approximate location>",
      "recommendation": "<specific fix recommendation>"
    }
  ],
  "recommendations": [
    "<general security recommendation 1>",
    "<general security recommendation 2>"
  ]
}

Rules:
- Score should reflect the overall security posture. Deduct points based on severity:
  Critical: -20 pts, High: -10 pts, Medium: -5 pts, Low: -2 pts, Info: 0 pts
- Start from 100 and deduct. Minimum score is 0.
- Include at least 3 findings (even secure code has Info-level observations).
- Include at least 3 general recommendations.
- Be specific about file locations and line references where possible.
- Return valid JSON only, no markdown fences.
`;

  const raw = await generateContent(prompt);
  let parsed: RawAuditResponse;

  try {
    parsed = JSON.parse(sanitizeJson(raw)) as RawAuditResponse;
  } catch {
    // Fallback: return a baseline report when parsing fails
    console.warn(
      '[SecurityAuditor] Failed to parse Gemini audit response. Returning baseline report.',
    );
    return {
      score: 70,
      findings: [
        {
          id: uuidv4(),
          severity: 'Info',
          category: 'Audit',
          title: 'Automated audit parsing failed',
          description:
            'The AI security audit response could not be parsed. Manual review is recommended.',
          location: 'N/A',
          recommendation:
            'Review the generated code manually for security vulnerabilities.',
        },
      ],
      recommendations: [
        'Perform a manual security review of all generated code.',
        'Run static analysis tools (e.g., ESLint security plugin, Snyk).',
        'Conduct penetration testing before deploying to production.',
      ],
      timestamp: new Date().toISOString(),
    };
  }

  // Normalize findings with proper IDs and validated severity levels
  const validSeverities: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Info'];

  const findings: SecurityFinding[] = (parsed.findings || []).map((f) => ({
    id: uuidv4(),
    severity: validSeverities.includes(f.severity as Severity)
      ? (f.severity as Severity)
      : 'Info',
    category: f.category || 'General',
    title: f.title || 'Untitled Finding',
    description: f.description || '',
    location: f.location || 'Unknown',
    recommendation: f.recommendation || 'Review and address this finding.',
  }));

  // Clamp score between 0 and 100
  const score = Math.max(0, Math.min(100, parsed.score ?? 70));

  return {
    score,
    findings,
    recommendations: parsed.recommendations || [
      'Review all generated code before deploying to production.',
      'Implement comprehensive input validation.',
      'Enable security headers and HTTPS in production.',
    ],
    timestamp: new Date().toISOString(),
  };
}
