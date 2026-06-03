// ──────────────────────────────────────────────────────────────────────────────
// SecureForge AI — Core Type Definitions
// ──────────────────────────────────────────────────────────────────────────────

/** STRIDE threat categories */
export enum StrideCategory {
  Spoofing = 'Spoofing',
  Tampering = 'Tampering',
  Repudiation = 'Repudiation',
  InformationDisclosure = 'InformationDisclosure',
  DenialOfService = 'DenialOfService',
  ElevationOfPrivilege = 'ElevationOfPrivilege',
}

/** Severity levels for security findings */
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

/** Risk levels for threat modelling */
export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

/** Project processing status */
export type ProjectStatus =
  | 'created'
  | 'analyzing'
  | 'generating'
  | 'auditing'
  | 'completed'
  | 'error';

/** Relationship cardinality */
export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

// ── Primitives ───────────────────────────────────────────────────────────────

export interface Attribute {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default?: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: RelationshipType;
  foreignKey: string;
}

export interface Entity {
  name: string;
  attributes: Attribute[];
  relationships: Relationship[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

// ── Security ─────────────────────────────────────────────────────────────────

export interface SecurityFinding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  location: string;
  recommendation: string;
}

export interface SecurityReport {
  score: number;
  findings: SecurityFinding[];
  recommendations: string[];
  timestamp: string;
}

// ── Threat Modelling ─────────────────────────────────────────────────────────

export interface Threat {
  category: StrideCategory;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  likelihood: RiskLevel;
  impact: RiskLevel;
  mitigations: string[];
}

export interface ThreatModel {
  threats: Threat[];
  overallRisk: RiskLevel;
  timestamp: string;
}

// ── API Documentation ────────────────────────────────────────────────────────

export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  type: string;
  description: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  auth: boolean;
  parameters: ApiParameter[];
}

export interface ApiDocumentation {
  openApiSpec: Record<string, unknown>;
  endpoints: ApiEndpoint[];
}

// ── DevOps ───────────────────────────────────────────────────────────────────

export interface DevOpsConfig {
  dockerfile: string;
  dockerCompose: string;
  githubActions: string;
  envTemplate: string;
  deploymentGuide: string;
}

// ── Diagrams ─────────────────────────────────────────────────────────────────

export interface DiagramSet {
  erDiagram: string;
  classDiagram: string;
  sequenceDiagram: string;
  serviceDiagram: string;
}

// ── Architecture ─────────────────────────────────────────────────────────────

export interface Architecture {
  entities: Entity[];
  relationships: Relationship[];
  services: string[];
  controllers: string[];
  models: string[];
  routes: string[];
  middleware: string[];
  config: string[];
  generatedFiles: GeneratedFile[];
}

// ── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  requirements: string;
  umlDiagram?: string;
  umlMimeType?: string;
  status: ProjectStatus;
  createdAt: string;
  architecture?: Architecture;
  securityReport?: SecurityReport;
  threatModel?: ThreatModel;
  apiDocs?: ApiDocumentation;
  devOps?: DevOpsConfig;
  diagrams?: DiagramSet;
}

// ── Request / Response helpers ───────────────────────────────────────────────

export interface CreateProjectRequest {
  name: string;
  description: string;
  requirements: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
