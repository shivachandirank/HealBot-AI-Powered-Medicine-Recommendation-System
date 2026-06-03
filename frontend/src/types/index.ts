// Shared TypeScript types for the frontend

export interface AnalysisResult {
  projectName: string;
  description: string;
  entities: Entity[];
  relationships: Relationship[];
  useCases: UseCase[];
  actors: string[];
  workflows: Workflow[];
  securityRequirements: string[];
  technicalRequirements: string[];
  microservices: Microservice[];
  apiEndpoints: APIEndpoint[];
}

export interface Entity {
  name: string;
  attributes: Attribute[];
  type: string;
}

export interface Attribute {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  description?: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description?: string;
}

export interface UseCase {
  name: string;
  actor: string;
  description: string;
  preconditions?: string[];
  postconditions?: string[];
}

export interface Workflow {
  name: string;
  steps: string[];
  actors: string[];
}

export interface Microservice {
  name: string;
  responsibility: string;
  endpoints: string[];
  dependencies: string[];
}

export interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  roles?: string[];
  requestBody?: Record<string, unknown>;
  responseType?: string;
}

// Generated code
export interface GeneratedCode {
  controllers: Record<string, string>;
  routes: Record<string, string>;
  services: Record<string, string>;
  models: Record<string, string>;
  middleware: Record<string, string>;
  prismaSchema: string;
  envExample: string;
  packageJson: string;
  appEntry: string;
  swaggerSpec: string;
}

// Security Audit
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

// STRIDE Threat Model
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

// DevOps
export interface DevOpsBundle {
  dockerfile: string;
  dockerCompose: string;
  githubActionsCI: string;
  nginxConfig: string;
  envTemplate: string;
  deploymentGuide: string;
}

// Diagrams
export interface DiagramBundle {
  erDiagram: string;
  classDiagram: string;
  serviceDependency: string;
  microserviceInteraction: string;
  dataFlowDiagram: string;
}

// App state
export type AppStep = 'input' | 'analyzing' | 'generating' | 'results';

export interface AppState {
  step: AppStep;
  analysis?: AnalysisResult;
  generatedCode?: GeneratedCode;
  securityAudit?: SecurityAuditResult;
  strideReport?: StrideReport;
  devOps?: DevOpsBundle;
  diagrams?: DiagramBundle;
  error?: string;
}
