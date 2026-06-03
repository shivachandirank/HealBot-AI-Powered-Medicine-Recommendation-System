import { callGroqAIJSON, callGroqAI, MODEL_PRIMARY, MODEL_FAST, aiDelay } from './ai.service';
import type { GeneratedCode } from './generator.service';

export interface SecurityAuditResult {
  score: number;
  grade: string;
  vulnerabilities: Vulnerability[];
  recommendations: Recommendation[];
  passedChecks: string[];
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
}

export interface Vulnerability {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  description: string;
  location?: string;
  fix: string;
  cwe?: string;
  owasp?: string;
}

export interface Recommendation {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
}

const SECURITY_SYSTEM_PROMPT = `You are an expert cybersecurity engineer and penetration tester specializing in Node.js/TypeScript applications.
Perform thorough security audits and identify real vulnerabilities with practical fixes.
Assess risks accurately and provide actionable recommendations.`;

export async function auditSecurity(code: GeneratedCode, projectDescription: string): Promise<SecurityAuditResult> {
  const codeSnapshot = `
=== PRISMA SCHEMA ===
${code.prismaSchema?.substring(0, 1000) || 'N/A'}

=== AUTH MIDDLEWARE ===
${code.middleware?.auth?.substring(0, 800) || 'N/A'}

=== APP ENTRY ===
${code.appEntry?.substring(0, 500) || 'N/A'}

=== ENV EXAMPLE ===
${code.envExample?.substring(0, 400) || 'N/A'}
`;

  const prompt = `
Perform a comprehensive security audit of this ${projectDescription} application code:

${codeSnapshot}

Analyze for:
1. SQL Injection vulnerabilities
2. Missing or weak authentication
3. Missing authorization / Broken access control
4. Weak password policies
5. Sensitive data exposure
6. Injection attacks (XSS, Command injection)
7. Security misconfiguration
8. Insecure cryptographic storage
9. Rate limiting issues
10. JWT security issues

Return JSON:
{
  "score": 0-100,
  "grade": "A|B|C|D|F",
  "criticalIssues": 0,
  "highIssues": 0,
  "mediumIssues": 0,
  "lowIssues": 0,
  "vulnerabilities": [
    {
      "id": "VULN-001",
      "name": "Vulnerability Name",
      "severity": "critical|high|medium|low",
      "category": "Authentication|Authorization|Injection|...",
      "description": "Detailed description",
      "location": "file/function",
      "fix": "How to fix it",
      "cwe": "CWE-XXX",
      "owasp": "A01:2021"
    }
  ],
  "recommendations": [
    {
      "priority": "immediate|high|medium|low",
      "title": "Recommendation title",
      "description": "What needs to be done",
      "implementation": "Code or config example"
    }
  ],
  "passedChecks": ["Check that passed", "..."]
}
`;

  const result = await callGroqAIJSON(SECURITY_SYSTEM_PROMPT, prompt, 1800, MODEL_PRIMARY);
  return result as unknown as SecurityAuditResult;
}

export async function generateSecurityCode(): Promise<Record<string, string>> {
  const jwtPrompt = `Generate complete TypeScript JWT utility functions:
- generateAccessToken(payload: object): string
- generateRefreshToken(payload: object): string  
- verifyToken(token: string): JwtPayload | null
- Use RS256 or HS256 with strong secret
- Access token: 15 min expiry
- Refresh token: 30 days expiry
Generate ONLY the TypeScript code.`;

  const rbacPrompt = `Generate TypeScript RBAC (Role-Based Access Control) system:
- Define permissions enum
- Role-permission mapping
- hasPermission(role: string, permission: string): boolean
- Permission guard middleware
- Roles: USER, ADMIN, MODERATOR, SUPER_ADMIN
Generate ONLY the TypeScript code.`;

  const encryptionPrompt = `Generate TypeScript encryption utilities:
- hashPassword(password: string): Promise<string> using bcrypt rounds=12
- comparePassword(password: string, hash: string): Promise<boolean>
- encryptData(data: string): string using AES-256-GCM
- decryptData(encrypted: string): string
- generateSecureToken(length: number): string
Generate ONLY the TypeScript code.`;

  // Sequential to avoid rate limit
  const [jwt, rbac, encryption] = await Promise.allSettled([
    callGroqAI(SECURITY_SYSTEM_PROMPT, jwtPrompt, 600, MODEL_FAST),
    callGroqAI(SECURITY_SYSTEM_PROMPT, rbacPrompt, 600, MODEL_FAST),
    callGroqAI(SECURITY_SYSTEM_PROMPT, encryptionPrompt, 600, MODEL_FAST),
  ]);

  return {
    jwt: cleanCode(jwt.status === 'fulfilled' ? jwt.value.content : '// JWT generation failed'),
    rbac: cleanCode(rbac.status === 'fulfilled' ? rbac.value.content : '// RBAC generation failed'),
    encryption: cleanCode(encryption.status === 'fulfilled' ? encryption.value.content : '// Encryption generation failed'),
  };
}

function cleanCode(code: string): string {
  return code.trim()
    .replace(/^```(?:typescript|ts)?\n?/i, '')
    .replace(/\n?```$/i, '');
}
