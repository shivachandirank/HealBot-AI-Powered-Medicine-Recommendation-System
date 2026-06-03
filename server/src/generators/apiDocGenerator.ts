// ──────────────────────────────────────────────────────────────────────────────
// API Doc Generator — Produces OpenAPI 3.0 spec and endpoint metadata
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { Entity, ApiDocumentation, ApiEndpoint, GeneratedFile } from '../types';

function sanitizeJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return cleaned.trim();
}

export async function generateApiDocs(
  entities: Entity[],
  projectName: string,
): Promise<{ documentation: ApiDocumentation; files: GeneratedFile[] }> {
  const entitySummary = entities
    .map(
      (e) =>
        `${e.name} (fields: ${e.attributes.map((a) => `${a.name}:${a.type}`).join(', ')})`,
    )
    .join('\n');

  const prompt = `
You are an API documentation expert. Generate a complete OpenAPI 3.0.0 specification for a REST API with these entities:

${entitySummary}

Project name: ${projectName}

For EACH entity generate CRUD endpoints:
- GET    /api/{entity}s       — List all (supports ?search=, ?page=, ?limit=)
- GET    /api/{entity}s/:id   — Get by ID
- POST   /api/{entity}s       — Create
- PUT    /api/{entity}s/:id   — Update
- DELETE /api/{entity}s/:id   — Delete

Also include:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/health

Return a JSON object with this EXACT shape:
{
  "openApiSpec": {
    "openapi": "3.0.0",
    "info": { "title": "...", "version": "1.0.0", "description": "..." },
    "servers": [{ "url": "http://localhost:3000", "description": "Development" }],
    "components": {
      "securitySchemes": {
        "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
      },
      "schemas": { ... }
    },
    "paths": { ... }
  },
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/users",
      "description": "List all users",
      "auth": true,
      "parameters": [{ "name": "search", "in": "query", "required": false, "type": "string", "description": "Search term" }],
      "requestBody": null,
      "responseBody": { "type": "array", "items": { "$ref": "#/components/schemas/User" } }
    }
  ]
}

Requirements:
- Include proper request/response schemas for each entity under components.schemas
- Include example values in schemas
- Mark auth endpoints as NOT requiring auth, all others require bearerAuth
- Add proper 200, 201, 400, 401, 404 responses
- Return valid JSON only, no markdown fences
`;

  const raw = await generateContent(prompt);
  let parsed: ApiDocumentation;
  try {
    parsed = JSON.parse(sanitizeJson(raw)) as ApiDocumentation;
  } catch {
    // Fallback: build a minimal spec
    const endpoints: ApiEndpoint[] = [];
    for (const entity of entities) {
      const lower = entity.name.toLowerCase();
      endpoints.push(
        { method: 'GET', path: `/api/${lower}s`, description: `List all ${lower}s`, auth: true, parameters: [], requestBody: undefined, responseBody: undefined },
        { method: 'GET', path: `/api/${lower}s/:id`, description: `Get ${lower} by ID`, auth: true, parameters: [{ name: 'id', in: 'path', required: true, type: 'string', description: `${entity.name} ID` }], requestBody: undefined, responseBody: undefined },
        { method: 'POST', path: `/api/${lower}s`, description: `Create ${lower}`, auth: true, parameters: [], requestBody: undefined, responseBody: undefined },
        { method: 'PUT', path: `/api/${lower}s/:id`, description: `Update ${lower}`, auth: true, parameters: [{ name: 'id', in: 'path', required: true, type: 'string', description: `${entity.name} ID` }], requestBody: undefined, responseBody: undefined },
        { method: 'DELETE', path: `/api/${lower}s/:id`, description: `Delete ${lower}`, auth: true, parameters: [{ name: 'id', in: 'path', required: true, type: 'string', description: `${entity.name} ID` }], requestBody: undefined, responseBody: undefined },
      );
    }
    parsed = {
      openApiSpec: { openapi: '3.0.0', info: { title: projectName, version: '1.0.0' }, paths: {} },
      endpoints,
    };
  }

  const files: GeneratedFile[] = [
    {
      path: 'docs/openapi.json',
      content: JSON.stringify(parsed.openApiSpec, null, 2),
      language: 'json',
    },
  ];

  return { documentation: parsed, files };
}
