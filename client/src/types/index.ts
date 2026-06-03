// ─── Project ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  requirements: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  architecture?: Architecture;
  securityReport?: SecurityReport;
  apiDocs?: ApiDocumentation;
  devOps?: DevOpsConfig;
}

export type ProjectStatus =
  | 'draft'
  | 'analyzing'
  | 'generating'
  | 'securing'
  | 'completed'
  | 'error';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: string;
  tags: string[];
}

// ─── Architecture ───────────────────────────────────────────────────────────

export interface Architecture {
  id: string;
  projectId: string;
  summary: ArchitectureSummary;
  entities: Entity[];
  endpoints: Endpoint[];
  files: GeneratedFile[];
  diagrams: Diagram[];
  techStack: TechStackItem[];
}

export interface ArchitectureSummary {
  totalEntities: number;
  totalEndpoints: number;
  totalFiles: number;
  pattern: string;
  database: string;
  framework: string;
}

export interface Entity {
  name: string;
  fields: EntityField[];
  relationships: EntityRelationship[];
}

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  description?: string;
}

export interface EntityRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  field: string;
}

export interface Endpoint {
  method: HttpMethod;
  path: string;
  controller: string;
  summary: string;
  description?: string;
  requestBody?: SchemaDefinition;
  responseBody?: SchemaDefinition;
  auth: boolean;
  tags: string[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface SchemaDefinition {
  type: string;
  properties?: Record<string, SchemaProperty>;
  example?: unknown;
}

export interface SchemaProperty {
  type: string;
  description?: string;
  required?: boolean;
  example?: unknown;
}

export interface GeneratedFile {
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  type: FileType;
}

export type FileType =
  | 'controller'
  | 'service'
  | 'entity'
  | 'dto'
  | 'config'
  | 'test'
  | 'migration'
  | 'middleware'
  | 'util'
  | 'other';

export interface Diagram {
  id: string;
  type: DiagramType;
  title: string;
  content: string;
}

export type DiagramType =
  | 'er'
  | 'class'
  | 'sequence'
  | 'service-dependency'
  | 'flow';

export interface TechStackItem {
  name: string;
  category: string;
  version?: string;
  description: string;
}

// ─── Security ───────────────────────────────────────────────────────────────

export interface SecurityReport {
  id: string;
  projectId: string;
  overallScore: number;
  grade: SecurityGrade;
  findings: SecurityFinding[];
  threatModel: ThreatModel;
  recommendations: SecurityRecommendation[];
  metrics: SecurityMetrics;
  generatedAt: string;
}

export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  location?: string;
  remediation: string;
  cwe?: string;
  owasp?: string;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface ThreatModel {
  stride: StrideCategory[];
  attackSurfaces: AttackSurface[];
}

export interface StrideCategory {
  category: StrideCategoryType;
  threats: Threat[];
  mitigated: number;
  total: number;
}

export type StrideCategoryType =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

export interface Threat {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  mitigated: boolean;
  mitigation?: string;
}

export interface AttackSurface {
  name: string;
  risk: Severity;
  vectors: string[];
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: Severity;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: string;
}

export interface SecurityMetrics {
  authScore: number;
  inputValidation: number;
  dataProtection: number;
  apiSecurity: number;
  configSecurity: number;
  dependencySecurity: number;
}

// ─── API Documentation ─────────────────────────────────────────────────────

export interface ApiDocumentation {
  id: string;
  projectId: string;
  title: string;
  version: string;
  baseUrl: string;
  description: string;
  groups: ApiGroup[];
  authentication: AuthenticationConfig;
}

export interface ApiGroup {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  parameters?: ApiParameter[];
  requestBody?: ApiRequestBody;
  responses: ApiResponse[];
  auth: boolean;
  tags: string[];
}

export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required: boolean;
  type: string;
  description: string;
}

export interface ApiRequestBody {
  contentType: string;
  schema: SchemaDefinition;
  example?: string;
}

export interface ApiResponse {
  statusCode: number;
  description: string;
  schema?: SchemaDefinition;
  example?: string;
}

export interface AuthenticationConfig {
  type: 'jwt' | 'api-key' | 'oauth2' | 'basic';
  description: string;
  flows?: string[];
}

// ─── DevOps ─────────────────────────────────────────────────────────────────

export interface DevOpsConfig {
  id: string;
  projectId: string;
  dockerfile: string;
  dockerCompose: string;
  githubActions: string;
  envTemplate: string;
  deploymentNotes: string;
}

// ─── UI State ───────────────────────────────────────────────────────────────

export interface ProcessingStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  children?: FileTreeNode[];
  size?: number;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface StatItem {
  label: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose';
  trend?: 'up' | 'down' | 'neutral';
}
