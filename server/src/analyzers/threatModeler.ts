// ──────────────────────────────────────────────────────────────────────────────
// Threat Modeler — STRIDE-based threat analysis powered by Gemini AI
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type {
  Architecture,
  Entity,
  ThreatModel,
  Threat,
  RiskLevel,
  StrideCategory,
} from '../types';

function sanitizeJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

interface RawThreat {
  category?: string;
  title?: string;
  description?: string;
  riskLevel?: string;
  likelihood?: string;
  impact?: string;
  mitigations?: string[];
}

interface RawThreatModelResponse {
  threats?: RawThreat[];
  overallRisk?: string;
}

const VALID_RISK_LEVELS: RiskLevel[] = ['Critical', 'High', 'Medium', 'Low'];

const VALID_STRIDE_CATEGORIES: Record<string, StrideCategory> = {
  spoofing: 'Spoofing' as StrideCategory,
  tampering: 'Tampering' as StrideCategory,
  repudiation: 'Repudiation' as StrideCategory,
  informationdisclosure: 'InformationDisclosure' as StrideCategory,
  information_disclosure: 'InformationDisclosure' as StrideCategory,
  'information disclosure': 'InformationDisclosure' as StrideCategory,
  denialofservice: 'DenialOfService' as StrideCategory,
  denial_of_service: 'DenialOfService' as StrideCategory,
  'denial of service': 'DenialOfService' as StrideCategory,
  elevationofprivilege: 'ElevationOfPrivilege' as StrideCategory,
  elevation_of_privilege: 'ElevationOfPrivilege' as StrideCategory,
  'elevation of privilege': 'ElevationOfPrivilege' as StrideCategory,
};

function normalizeStrideCategory(raw: string): StrideCategory {
  const key = raw.toLowerCase().trim();
  return VALID_STRIDE_CATEGORIES[key] || ('Spoofing' as StrideCategory);
}

function normalizeRiskLevel(raw: string | undefined): RiskLevel {
  if (!raw) return 'Medium';
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return VALID_RISK_LEVELS.includes(capitalized as RiskLevel)
    ? (capitalized as RiskLevel)
    : 'Medium';
}

/**
 * Perform a STRIDE threat model analysis on the given architecture using Gemini AI.
 *
 * Sends architecture details (entities, services, middleware, routes) to Gemini
 * with a detailed prompt to analyze each STRIDE category and returns a structured
 * ThreatModel with individual threats and an overall risk assessment.
 */
export async function analyzeThreatModel(
  architecture: Architecture,
  entities: Entity[],
): Promise<ThreatModel> {
  const entitySummary = entities
    .map(
      (e) =>
        `${e.name}: [${e.attributes.map((a) => `${a.name}(${a.type})`).join(', ')}]`,
    )
    .join('\n');

const architectureSummary = `
Services: ${(architecture.services || []).join(', ')}
Controllers: ${(architecture.controllers || []).join(', ')}
Models: ${(architecture.models || []).join(', ')}
Routes: ${(architecture.routes || []).join(', ')}
Middleware: ${(architecture.middleware || []).join(', ')}
Config Files: ${(architecture.config || []).join(', ')}
Generated Files: ${architecture.generatedFiles?.length || 0} files
`;

  const prompt = `
You are an expert cybersecurity threat modeler. Perform a comprehensive STRIDE threat analysis on the following application architecture.

ENTITIES:
${entitySummary}

ARCHITECTURE:
${architectureSummary}

Analyze the system for threats in ALL six STRIDE categories:

1. **Spoofing** — Can an attacker impersonate a legitimate user or service?
   Consider: authentication mechanisms, session management, token forgery, API key theft

2. **Tampering** — Can an attacker modify data in transit or at rest?
   Consider: input validation, data integrity, MITM attacks, database manipulation

3. **Repudiation** — Can a user deny performing an action?
   Consider: audit logging, transaction records, non-repudiation mechanisms

4. **Information Disclosure** — Can sensitive data be exposed to unauthorized parties?
   Consider: data encryption, error messages, log files, API responses, database queries

5. **Denial of Service** — Can the system be made unavailable?
   Consider: rate limiting, resource exhaustion, infinite loops, large payload attacks

6. **Elevation of Privilege** — Can a user gain unauthorized access to higher privileges?
   Consider: RBAC enforcement, IDOR, horizontal/vertical privilege escalation

Return a JSON object with EXACTLY this shape:
{
  "threats": [
    {
      "category": "Spoofing" | "Tampering" | "Repudiation" | "InformationDisclosure" | "DenialOfService" | "ElevationOfPrivilege",
      "title": "<concise threat title>",
      "description": "<detailed description of the threat scenario>",
      "riskLevel": "Critical" | "High" | "Medium" | "Low",
      "likelihood": "Critical" | "High" | "Medium" | "Low",
      "impact": "Critical" | "High" | "Medium" | "Low",
      "mitigations": [
        "<specific mitigation strategy 1>",
        "<specific mitigation strategy 2>"
      ]
    }
  ],
  "overallRisk": "Critical" | "High" | "Medium" | "Low"
}

Rules:
- Include at least 2 threats per STRIDE category (minimum 12 threats total).
- Each threat must have at least 2 specific, actionable mitigation strategies.
- Risk level should be derived from likelihood × impact.
- Overall risk is the highest risk level among all threats.
- Be specific to this application's architecture, not generic.
- Return valid JSON only, no markdown fences.
`;

  const raw = await generateContent(prompt);
  let parsed: RawThreatModelResponse;

  try {
    parsed = JSON.parse(sanitizeJson(raw)) as RawThreatModelResponse;
  } catch {
    console.warn(
      '[ThreatModeler] Failed to parse Gemini threat model response. Returning baseline model.',
    );
    return buildFallbackModel();
  }

  // Normalize threats
  const threats: Threat[] = (parsed.threats || []).map((t) => ({
    category: normalizeStrideCategory(t.category || 'Spoofing'),
    title: t.title || 'Unnamed Threat',
    description: t.description || '',
    riskLevel: normalizeRiskLevel(t.riskLevel),
    likelihood: normalizeRiskLevel(t.likelihood),
    impact: normalizeRiskLevel(t.impact),
    mitigations: Array.isArray(t.mitigations)
      ? t.mitigations
      : ['Review and implement appropriate security controls.'],
  }));

  const overallRisk = normalizeRiskLevel(parsed.overallRisk);

  return {
    threats,
    overallRisk,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build a fallback threat model when AI analysis fails.
 */
function buildFallbackModel(): ThreatModel {
  return {
    threats: [
      {
        category: 'Spoofing' as StrideCategory,
        title: 'JWT Token Forgery',
        description:
          'An attacker may attempt to forge or tamper with JWT tokens to impersonate legitimate users.',
        riskLevel: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigations: [
          'Use strong, randomly generated JWT secrets (min 256 bits).',
          'Implement token expiration and refresh mechanisms.',
          'Validate token claims thoroughly on every request.',
        ],
      },
      {
        category: 'Tampering' as StrideCategory,
        title: 'Input Data Manipulation',
        description:
          'Unvalidated user input could be used to manipulate application data or inject malicious payloads.',
        riskLevel: 'High',
        likelihood: 'High',
        impact: 'High',
        mitigations: [
          'Implement comprehensive input validation using Zod schemas.',
          'Sanitize all user input before processing.',
          'Use parameterized queries for database operations.',
        ],
      },
      {
        category: 'InformationDisclosure' as StrideCategory,
        title: 'Sensitive Data Exposure in API Responses',
        description:
          'API endpoints may inadvertently include sensitive data (passwords, tokens) in responses.',
        riskLevel: 'Medium',
        likelihood: 'Medium',
        impact: 'High',
        mitigations: [
          'Implement response serialization to exclude sensitive fields.',
          'Never return password hashes or internal IDs in API responses.',
          'Use DTOs to control which fields are exposed.',
        ],
      },
      {
        category: 'DenialOfService' as StrideCategory,
        title: 'Resource Exhaustion via Unthrottled Requests',
        description:
          'Without rate limiting, an attacker could overwhelm the server with excessive requests.',
        riskLevel: 'Medium',
        likelihood: 'High',
        impact: 'Medium',
        mitigations: [
          'Implement rate limiting on all API endpoints.',
          'Use stricter limits on authentication endpoints.',
          'Add request body size limits.',
        ],
      },
      {
        category: 'ElevationOfPrivilege' as StrideCategory,
        title: 'Insecure Direct Object Reference (IDOR)',
        description:
          'Users may access or modify resources belonging to other users by manipulating resource IDs.',
        riskLevel: 'High',
        likelihood: 'Medium',
        impact: 'High',
        mitigations: [
          'Implement ownership verification on all resource endpoints.',
          'Use RBAC middleware to enforce access controls.',
          'Validate that the authenticated user owns the requested resource.',
        ],
      },
      {
        category: 'Repudiation' as StrideCategory,
        title: 'Insufficient Audit Logging',
        description:
          'Without comprehensive audit logs, malicious actions cannot be traced back to their origin.',
        riskLevel: 'Medium',
        likelihood: 'Medium',
        impact: 'Medium',
        mitigations: [
          'Implement structured audit logging for all write operations.',
          'Log user identity, action, timestamp, and affected resources.',
          'Store audit logs in a tamper-proof location.',
        ],
      },
    ],
    overallRisk: 'High',
    timestamp: new Date().toISOString(),
  };
}
