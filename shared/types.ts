// SecureForge AI — Shared Type Definitions

export type ProjectStatus = 
  | 'pending'
  | 'analyzing'
  | 'generating'
  | 'auditing'
  | 'completed'
  | 'failed';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type STRIDECategory = 
  | 'spoofing'
  | 'tampering'
  | 'repudiation'
  | 'information_disclosure'
  | 'denial_of_service'
  | 'elevation_of_privilege';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-many';

export interface Project {
  id: string;
  name: string;
  description: string;
  requirements: string;
  umlDiagram?: {
    data: string;
    mimeType: string;
    fileName: string;
  };
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  architecture?: Architecture;
  securityReport?: SecurityReport;
  threatModel?: ThreatModel;
  apiDocs?: ApiDocumentation;
  devOps?: DevOpsConfig;
  diagrams?: DiagramSet;
}

export interface Architecture {
  entities: Entity[];
  relationships: Relationship[];
  services: string[];
  generatedFiles: GeneratedFile[];
  summary: {
    totalFiles: number;
    totalEndpoints: number;
    totalEntities: number;
    totalServices: number;
  };
}

export interface Entity {
  name: string;
  attributes: Attribute[];
  methods?: string[];
  description?: string;
}

export interface Attribute {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: RelationshipType;
  foreignKey?: string;
  description?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  description?: string;
}

export interface SecurityReport {
  score: number;
  grade: string;
  findings: SecurityFinding[];
  recommendations: string[];
  summary: string;
  timestamp: string;
}

export interface SecurityFinding {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  location?: string;
  recommendation: string;
}

export interface ThreatModel {
  threats: Threat[];
  overallRisk: Severity;
  summary: string;
  timestamp: string;
}

export interface Threat {
  id: string;
  category: STRIDECategory;
  title: string;
  description: string;
  riskLevel: Severity;
  likelihood: 'very_likely' | 'likely' | 'possible' | 'unlikely';
  impact: 'catastrophic' | 'major' | 'moderate' | 'minor';
  mitigations: string[];
  status: 'identified' | 'mitigated' | 'accepted';
}

export interface ApiDocumentation {
  openApiSpec: Record<string, any>;
  endpoints: ApiEndpoint[];
  totalEndpoints: number;
}

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tag: string;
  requestBody?: {
    contentType: string;
    schema: Record<string, any>;
    example?: Record<string, any>;
  };
  responseBody?: {
    statusCode: number;
    contentType: string;
    schema: Record<string, any>;
    example?: Record<string, any>;
  };
  parameters?: {
    name: string;
    in: 'path' | 'query' | 'header';
    required: boolean;
    type: string;
    description: string;
  }[];
  requiresAuth: boolean;
  roles?: string[];
}

export interface DevOpsConfig {
  dockerfile: string;
  dockerCompose: string;
  githubActions: string;
  envTemplate: string;
  deploymentGuide: string;
}

export interface DiagramSet {
  erDiagram: string;
  classDiagram: string;
  sequenceDiagram: string;
  serviceDiagram: string;
}
