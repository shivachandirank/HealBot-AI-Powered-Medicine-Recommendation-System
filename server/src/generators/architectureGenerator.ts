// ──────────────────────────────────────────────────────────────────────────────
// Architecture Generator — Produces full backend source files via Gemini
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { Entity, Relationship, GeneratedFile } from '../types';
import type { AnalysisResult } from '../services/requirementAnalyzer';

function sanitizeCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code.replace(/^```(?:typescript|ts|javascript|js)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return code.trim();
}

async function generateFileContent(prompt: string): Promise<string> {
  const raw = await generateContent(prompt);
  return sanitizeCode(raw);
}

// ── Individual file generators ───────────────────────────────────────────────

async function generateModel(entity: Entity): Promise<GeneratedFile> {
  const prompt = `
Generate a complete TypeScript interface/type file for the "${entity.name}" entity.
This file will be placed at src/models/${entity.name.toLowerCase()}.model.ts in an Express.js project.

Entity details:
- Name: ${entity.name}
- Attributes: ${JSON.stringify(entity.attributes, null, 2)}
- Relationships: ${JSON.stringify(entity.relationships, null, 2)}

Requirements:
- Export a main interface named ${entity.name}
- Export a Create${entity.name}Dto interface (omit id, createdAt, updatedAt)
- Export an Update${entity.name}Dto interface (all fields optional via Partial)
- Use proper TypeScript types (string, number, boolean, Date, etc.)
- Add JSDoc comments for each field
- Do NOT include import statements for external packages
- Return ONLY valid TypeScript code, no markdown fences
`;
  const content = await generateFileContent(prompt);
  return {
    path: `src/models/${entity.name.toLowerCase()}.model.ts`,
    content,
    language: 'typescript',
  };
}

async function generateService(entity: Entity): Promise<GeneratedFile> {
  const name = entity.name;
  const lower = name.toLowerCase();
  const prompt = `
Generate a complete TypeScript service file for the "${name}" entity.
File: src/services/${lower}.service.ts

The service uses an in-memory Map<string, ${name}> for storage.
Import the model types from '../models/${lower}.model'.
Import { v4 as uuidv4 } from 'uuid'.

Implement these methods as exported functions (functional style, no class):
- getAll${name}s(): ${name}[]
- get${name}ById(id: string): ${name} | undefined
- create${name}(data: Create${name}Dto): ${name}
- update${name}(id: string, data: Update${name}Dto): ${name} | undefined
- delete${name}(id: string): boolean
- search${name}s(query: string): ${name}[] — search across string fields

Each create should auto-generate id (uuid), createdAt and updatedAt as ISO strings.
Each update should refresh updatedAt.

Entity attributes: ${JSON.stringify(entity.attributes, null, 2)}

Requirements:
- Proper TypeScript types throughout
- JSDoc comments on every function
- Return ONLY valid TypeScript code, no markdown fences
`;
  const content = await generateFileContent(prompt);
  return {
    path: `src/services/${lower}.service.ts`,
    content,
    language: 'typescript',
  };
}

async function generateController(entity: Entity): Promise<GeneratedFile> {
  const name = entity.name;
  const lower = name.toLowerCase();
  const prompt = `
Generate a complete Express.js controller file (TypeScript) for the "${name}" entity.
File: src/controllers/${lower}.controller.ts

Import { Request, Response, NextFunction } from 'express'.
Import all service functions from '../services/${lower}.service'.

Export these request handler functions (each takes req, res, next):
- getAll — GET / — return all records, support ?search= query param
- getById — GET /:id — return single record or 404
- create — POST / — validate required fields exist in body, create record, return 201
- update — PUT /:id — update record or 404
- remove — DELETE /:id — delete record or 404

Entity attributes for validation: ${JSON.stringify(entity.attributes.filter(a => a.required && !['id', 'createdAt', 'updatedAt'].includes(a.name)), null, 2)}

Requirements:
- Wrap each handler in try/catch, call next(error) on failure
- Return proper HTTP status codes (200, 201, 400, 404, 500)
- Return JSON in shape { success: boolean, data?: T, error?: string }
- Return ONLY valid TypeScript code, no markdown fences
`;
  const content = await generateFileContent(prompt);
  return {
    path: `src/controllers/${lower}.controller.ts`,
    content,
    language: 'typescript',
  };
}

async function generateRoute(entity: Entity): Promise<GeneratedFile> {
  const name = entity.name;
  const lower = name.toLowerCase();
  const prompt = `
Generate an Express Router file (TypeScript) for the "${name}" entity.
File: src/routes/${lower}.routes.ts

Import { Router } from 'express'.
Import all controller functions from '../controllers/${lower}.controller'.

Create a router with these routes:
- GET    /          → getAll
- GET    /:id       → getById
- POST   /          → create
- PUT    /:id       → update
- DELETE /:id       → remove

Export the router as default.

Requirements:
- Return ONLY valid TypeScript code, no markdown fences
`;
  const content = await generateFileContent(prompt);
  return {
    path: `src/routes/${lower}.routes.ts`,
    content,
    language: 'typescript',
  };
}

async function generateAppFile(
  entities: Entity[],
  projectName: string,
): Promise<GeneratedFile> {
  const routeImports = entities
    .map(
      (e) =>
        `import ${e.name.toLowerCase()}Routes from './routes/${e.name.toLowerCase()}.routes';`,
    )
    .join('\n');
  const routeMounts = entities
    .map(
      (e) =>
        `app.use('/api/${e.name.toLowerCase()}s', ${e.name.toLowerCase()}Routes);`,
    )
    .join('\n');

  const content = `
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
${routeImports}

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', project: '${projectName}', timestamp: new Date().toISOString() });
});

// Routes
${routeMounts}

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

export default app;
`.trim();

  return {
    path: 'src/app.ts',
    content,
    language: 'typescript',
  };
}

async function generateServerFile(projectName: string): Promise<GeneratedFile> {
  const content = `
import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`[${projectName}] Server running on http://localhost:\${PORT}\`);
  console.log(\`[${projectName}] Environment: \${process.env.NODE_ENV || 'development'}\`);
});
`.trim();

  return {
    path: 'src/server.ts',
    content,
    language: 'typescript',
  };
}

// ── Main orchestrator ────────────────────────────────────────────────────────

export async function generateArchitecture(
  analysis: AnalysisResult,
): Promise<GeneratedFile[]> {
  const { entities, projectName } = analysis;
  const files: GeneratedFile[] = [];

  // Generate sequentially to respect rate limits
  for (const entity of entities) {
    const model = await generateModel(entity);
    const service = await generateService(entity);
    const controller = await generateController(entity);
    const route = await generateRoute(entity);
    files.push(model, service, controller, route);
  }

  // Static scaffold files
  const appFile = await generateAppFile(entities, projectName);
  const serverFile = await generateServerFile(projectName);
  files.push(appFile, serverFile);

  return files;
}
