import { callGroqAIJSON, MODEL_PRIMARY } from './ai.service';
import type { AnalysisResult } from './architecture.service';

export interface StrideReport {
  projectName: string;
  generatedAt: string;
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low';
  threats: StrideThreat[];
  mitigationSummary: MitigationSummary;
  dataFlowDiagram: string;
  trustBoundaries: string[];
  assets: Asset[];
}

export interface StrideThreat {
  id: string;
  category: StrideCategory;
  name: string;
  description: string;
  affectedComponent: string;
  attackVector: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'critical' | 'high' | 'medium' | 'low';
  riskScore: number;
  status: 'open' | 'mitigated' | 'accepted';
  mitigations: string[];
  cvssScore?: number;
}

export type StrideCategory =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

export interface MitigationSummary {
  totalThreats: number;
  mitigatedThreats: number;
  openThreats: number;
  criticalThreats: number;
  securityControls: string[];
}

export interface Asset {
  name: string;
  type: 'data' | 'service' | 'credential' | 'infrastructure';
  sensitivity: 'public' | 'internal' | 'confidential' | 'secret';
  description: string;
}

const STRIDE_SYSTEM_PROMPT = `You are a senior security architect specializing in STRIDE threat modeling for enterprise web applications.
Perform thorough, realistic threat modeling with actionable mitigations.
Focus on Node.js/Express TypeScript microservice architectures.`;

export async function generateStrideReport(analysis: AnalysisResult): Promise<StrideReport> {
  const prompt = `
Perform a comprehensive STRIDE threat model analysis for:

Project: ${analysis.projectName}
Description: ${analysis.description}
Actors: ${analysis.actors.join(', ')}
Entities: ${analysis.entities.map(e => e.name).join(', ')}
API Endpoints: ${analysis.apiEndpoints.map(e => `${e.method} ${e.path}`).join(', ')}
Security Requirements: ${analysis.securityRequirements.join(', ')}
Microservices: ${analysis.microservices.map(m => m.name).join(', ')}

Generate a STRIDE analysis with exactly 8 threats (at least 1 per STRIDE category). Be concise.

Return JSON:
{
  "overallRiskLevel": "critical|high|medium|low",
  "threats": [
    {
      "id": "S-001",
      "category": "Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege",
      "name": "Threat name",
      "description": "Detailed description of the threat",
      "affectedComponent": "Component name",
      "attackVector": "How the attack is executed",
      "likelihood": "high|medium|low",
      "impact": "critical|high|medium|low",
      "riskScore": 0-10,
      "status": "open|mitigated|accepted",
      "mitigations": ["Mitigation 1", "Mitigation 2"],
      "cvssScore": 0.0-10.0
    }
  ],
  "trustBoundaries": ["Internet <-> API Gateway", "API <-> Database", "..."],
  "assets": [
    {
      "name": "Asset name",
      "type": "data|service|credential|infrastructure",
      "sensitivity": "public|internal|confidential|secret",
      "description": "What this asset is"
    }
  ],
  "mitigationSummary": {
    "totalThreats": 12,
    "mitigatedThreats": 5,
    "openThreats": 7,
    "criticalThreats": 2,
    "securityControls": ["JWT Authentication", "Rate Limiting", "..."]
  },
  "dataFlowDiagram": "Mermaid flowchart LR diagram code showing data flows"
}
`;

  const result = await callGroqAIJSON(STRIDE_SYSTEM_PROMPT, prompt, 1800, MODEL_PRIMARY);
  
  return {
    projectName: analysis.projectName,
    generatedAt: new Date().toISOString(),
    ...(result as unknown as Omit<StrideReport, 'projectName' | 'generatedAt'>),
  };
}
