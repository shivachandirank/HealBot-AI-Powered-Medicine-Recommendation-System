import { callGroqAIJSON } from './ai.service';

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
  type: string; // model, entity, service
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

const SYSTEM_PROMPT = `You are an expert software architect and security engineer. 
Analyze the provided requirements or UML diagram description and extract a complete, structured architecture.
Always respond with valid JSON matching the exact schema requested.
Be thorough, practical, and security-conscious in your analysis.`;

export async function analyzeRequirements(input: string, inputType: 'text' | 'uml'): Promise<AnalysisResult> {
  const userPrompt = `
Analyze the following ${inputType === 'uml' ? 'UML diagram description' : 'software requirements'} and extract a comprehensive architecture:

INPUT:
${input}

Return a JSON object with this exact structure:
{
  "projectName": "string - inferred project name",
  "description": "string - brief project description",
  "entities": [
    {
      "name": "EntityName",
      "type": "model|entity|service",
      "attributes": [
        { "name": "fieldName", "type": "string|number|boolean|date|uuid", "required": true, "unique": false, "description": "field purpose" }
      ]
    }
  ],
  "relationships": [
    { "from": "Entity1", "to": "Entity2", "type": "one-to-many", "description": "..." }
  ],
  "useCases": [
    { "name": "Use Case Name", "actor": "Actor", "description": "...", "preconditions": ["..."], "postconditions": ["..."] }
  ],
  "actors": ["User", "Admin", "System"],
  "workflows": [
    { "name": "Workflow Name", "steps": ["Step 1", "Step 2"], "actors": ["User"] }
  ],
  "securityRequirements": ["JWT Authentication", "Role-Based Access Control", "..."],
  "technicalRequirements": ["PostgreSQL Database", "REST API", "..."],
  "microservices": [
    { "name": "ServiceName", "responsibility": "...", "endpoints": ["/api/resource"], "dependencies": ["OtherService"] }
  ],
  "apiEndpoints": [
    { "method": "GET|POST|PUT|DELETE", "path": "/api/resource", "description": "...", "auth": true, "roles": ["admin", "user"], "responseType": "JSON" }
  ]
}
`;

  const result = await callGroqAIJSON(SYSTEM_PROMPT, userPrompt, 6000);
  return result as unknown as AnalysisResult;
}
