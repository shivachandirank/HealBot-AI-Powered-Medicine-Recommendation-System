import { callGroqAI, aiDelay, MODEL_PRIMARY, MODEL_FAST } from './ai.service';
import type { AnalysisResult } from './architecture.service';

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

const CODE_SYSTEM_PROMPT = `You are an expert Node.js/TypeScript backend developer.
Generate concise, working TypeScript code for Express.js applications.
Use Prisma ORM, JWT authentication, bcrypt for passwords.
Keep responses BRIEF and focused - no verbose comments or explanations.`;

/**
 * Generate the full architecture sequentially to stay within Groq TPM limits.
 * Big AI calls (controllers, schema, swagger) are spaced with delays.
 * Models & middleware are generated locally (no AI call) to save tokens.
 */
export async function generateFullArchitecture(analysis: AnalysisResult): Promise<GeneratedCode> {
  // Limit to 3 entities max to reduce total token usage
  const entities = analysis.entities.slice(0, 3);
  const reducedAnalysis = { ...analysis, entities };

  // --- Sequential AI calls with delays ---

  // 1. Prisma Schema (most important, use primary model, ~800 tokens)
  const prismaSchema = await generatePrismaSchema(reducedAnalysis);
  await aiDelay(2000);

  // 2. All controllers in ONE batch call (reduces N calls to 1, ~1200 tokens)
  const controllers = await generateAllControllers(reducedAnalysis);
  await aiDelay(2000);

  // 3. All routes in ONE batch call (~800 tokens)
  const routes = await generateAllRoutes(reducedAnalysis);
  await aiDelay(2000);

  // 4. All services in ONE batch call using FAST model (~800 tokens)
  const services = await generateAllServices(reducedAnalysis);
  await aiDelay(1500);

  // 5. Swagger spec (use FAST model with reduced scope, ~600 tokens)
  const swaggerSpec = await generateSwaggerSpec(reducedAnalysis);

  // --- No AI call needed for these (generated from analysis JSON) ---
  const models = generateModels(reducedAnalysis);
  const middleware = generateMiddleware(reducedAnalysis);
  const envExample = generateEnvExample(reducedAnalysis);
  const packageJson = generatePackageJson(reducedAnalysis);
  const appEntry = generateAppEntry(reducedAnalysis);

  return {
    controllers,
    routes,
    services,
    models,
    middleware,
    prismaSchema,
    envExample,
    packageJson,
    appEntry,
    swaggerSpec,
  };
}

/** Generate ALL controllers in a single AI call to save TPM */
async function generateAllControllers(analysis: AnalysisResult): Promise<Record<string, string>> {
  const entityList = analysis.entities.map(e =>
    `- ${e.name}: fields=[${e.attributes.map(a => a.name).join(', ')}]`
  ).join('\n');

  const prompt = `Generate TypeScript Express controllers for these entities:
${entityList}

For each entity, create a controller with these functions:
- create(req, res): validate body, call prisma.create, return 201
- getAll(req, res): call prisma.findMany with pagination, return 200
- getById(req, res): call prisma.findUnique, return 200 or 404
- update(req, res): call prisma.update, return 200
- delete(req, res): call prisma.delete, return 204

Also include an AuthController with: register, login, logout, getProfile.

Format:
// === ${analysis.entities[0]?.name || 'Entity'}Controller ===
[code]

// === AuthController ===
[code]

Use prisma from '@prisma/client'. Keep each controller under 60 lines.`;

  const response = await callGroqAI(CODE_SYSTEM_PROMPT, prompt, 1800, MODEL_PRIMARY);
  const raw = cleanCode(response.content);

  // Split by === marker
  const controllers: Record<string, string> = {};
  const parts = raw.split(/\/\/ ===\s*(.+?)\s*===/);
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].replace('Controller', '').trim();
    const code = parts[i + 1]?.trim() || '';
    if (name && code) controllers[name] = code;
  }

  // Fallback: if splitting failed, dump everything under first entity name
  if (Object.keys(controllers).length === 0) {
    controllers['Combined'] = raw;
  }

  return controllers;
}

/** Generate ALL routes in a single AI call */
async function generateAllRoutes(analysis: AnalysisResult): Promise<Record<string, string>> {
  const entityNames = analysis.entities.map(e => e.name);

  const prompt = `Generate TypeScript Express Router files for: ${entityNames.join(', ')} + Auth.

For each entity router:
- GET /, POST / (public read, protected write)
- GET /:id, PUT /:id, DELETE /:id (authenticate middleware)
- import authenticate from '../middleware/auth.middleware'

For auth router:
- POST /register, POST /login (public)
- GET /profile, PUT /change-password (protected)

Format each as:
// === ${entityNames[0] || 'Entity'}Router ===
import { Router } from 'express';
...

// === AuthRouter ===
...

Keep each router under 30 lines.`;

  const response = await callGroqAI(CODE_SYSTEM_PROMPT, prompt, 1200, MODEL_FAST);
  const raw = cleanCode(response.content);

  const routes: Record<string, string> = {};
  const parts = raw.split(/\/\/ ===\s*(.+?)\s*===/);
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].replace('Router', '').trim();
    const code = parts[i + 1]?.trim() || '';
    if (name && code) routes[name] = code;
  }

  if (Object.keys(routes).length === 0) {
    routes['Combined'] = raw;
  }

  return routes;
}

/** Generate ALL services in a single AI call using faster model */
async function generateAllServices(analysis: AnalysisResult): Promise<Record<string, string>> {
  const entityList = analysis.entities.map(e => e.name).join(', ');

  const prompt = `Generate TypeScript Prisma service classes for: ${entityList}.

For each service:
class ${analysis.entities[0]?.name || 'Entity'}Service {
  async findAll(page=1, limit=20) { return prisma.${analysis.entities[0]?.name?.toLowerCase() || 'entity'}.findMany({skip:(page-1)*limit, take:limit}); }
  async findById(id: string) { return prisma.${analysis.entities[0]?.name?.toLowerCase() || 'entity'}.findUnique({where:{id}}); }
  async create(data: any) { return prisma.${analysis.entities[0]?.name?.toLowerCase() || 'entity'}.create({data}); }
  async update(id: string, data: any) { return prisma.${analysis.entities[0]?.name?.toLowerCase() || 'entity'}.update({where:{id},data}); }
  async delete(id: string) { await prisma.${analysis.entities[0]?.name?.toLowerCase() || 'entity'}.delete({where:{id}}); }
}

Follow this exact pattern for each entity. Format:
// === ${analysis.entities[0]?.name || 'Entity'}Service ===
[code]

Keep concise.`;

  const response = await callGroqAI(CODE_SYSTEM_PROMPT, prompt, 1000, MODEL_FAST);
  const raw = cleanCode(response.content);

  const services: Record<string, string> = {};
  const parts = raw.split(/\/\/ ===\s*(.+?)\s*===/);
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].replace('Service', '').trim();
    const code = parts[i + 1]?.trim() || '';
    if (name && code) services[name] = code;
  }

  if (Object.keys(services).length === 0) {
    services['Combined'] = raw;
  }

  return services;
}

/** Generate Prisma schema — most important AI call */
async function generatePrismaSchema(analysis: AnalysisResult): Promise<string> {
  const entitySummary = analysis.entities.map(e =>
    `${e.name}: ${e.attributes.map(a => `${a.name}(${a.type}${a.required ? '' : '?'})`).join(', ')}`
  ).join('\n');

  const relSummary = analysis.relationships.map(r =>
    `${r.from} ${r.type} ${r.to}`
  ).join(', ');

  const prompt = `Generate a Prisma schema (PostgreSQL) for:

Entities:
${entitySummary}

Relationships: ${relSummary || 'none specified'}

Rules:
- datasource db { provider = "postgresql"; url = env("DATABASE_URL") }
- generator client { provider = "prisma-client-js" }
- All models: id String @id @default(uuid()), createdAt DateTime @default(now()), updatedAt DateTime @updatedAt
- Add User model with: name, email @unique, password, role (enum: USER ADMIN MODERATOR) @default(USER)
- Map entity relationships with proper @relation fields
- Add @@index on common query fields (email, name, status)

Generate ONLY the schema code.`;

  const response = await callGroqAI(CODE_SYSTEM_PROMPT, prompt, 1200, MODEL_PRIMARY);
  return cleanCode(response.content);
}

/** Generate Swagger spec with reduced scope using fast model */
async function generateSwaggerSpec(analysis: AnalysisResult): Promise<string> {
  const entityNames = analysis.entities.map(e => e.name);
  const endpointCount = Math.min(analysis.apiEndpoints.length, 8);
  const sampleEndpoints = analysis.apiEndpoints.slice(0, endpointCount);

  const prompt = `Generate a minimal OpenAPI 3.0 YAML spec for "${analysis.projectName}".

Entities: ${entityNames.join(', ')}
Sample endpoints: ${sampleEndpoints.map(e => `${e.method} ${e.path}`).join(', ')}

Include:
- openapi: 3.0.0, info (title, version: 1.0.0, description)
- servers: [{url: http://localhost:3001/api}]
- securitySchemes: BearerAuth (http bearer JWT)
- paths for: POST /auth/login, POST /auth/register, GET /${entityNames[0]?.toLowerCase() || 'items'}s, POST /${entityNames[0]?.toLowerCase() || 'items'}s
- components/schemas for each entity (id, createdAt plus main fields)

Keep it concise. Generate ONLY the YAML.`;

  const response = await callGroqAI(CODE_SYSTEM_PROMPT, prompt, 800, MODEL_FAST);
  return response.content.trim()
    .replace(/^```(?:yaml)?\n?/i, '')
    .replace(/\n?```$/i, '');
}

/** Generate TypeScript interfaces locally — no AI needed, saves tokens */
function generateModels(analysis: AnalysisResult): Record<string, string> {
  const models: Record<string, string> = {};

  for (const entity of analysis.entities) {
    const attributes = entity.attributes.map(a => `  ${a.name}: ${mapType(a.type)};`).join('\n');
    models[entity.name] = `// ${entity.name} – TypeScript interfaces & DTOs
// Auto-generated by SecureForge AI

export interface ${entity.name} {
  id: string;
${attributes}
  createdAt: Date;
  updatedAt: Date;
}

export interface Create${entity.name}DTO {
${entity.attributes
  .filter(a => !['id', 'createdAt', 'updatedAt'].includes(a.name))
  .map(a => `  ${a.name}${a.required ? '' : '?'}: ${mapType(a.type)};`)
  .join('\n')}
}

export type Update${entity.name}DTO = Partial<Create${entity.name}DTO>;

export interface ${entity.name}Filter {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof ${entity.name};
  sortOrder?: 'asc' | 'desc';
}
`;
  }

  return models;
}

/** Generate middleware code locally — no AI needed, saves tokens */
function generateMiddleware(analysis: AnalysisResult): Record<string, string> {
  const roles = Array.from(new Set(analysis.apiEndpoints.flatMap(e => e.roles || []))).join(', ');

  return {
    auth: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Access denied. No token provided.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const authorize = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: 'Not authenticated.' }); return; }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: \`Access denied. Required roles: \${roles.join(', ')}\` });
      return;
    }
    next();
  };
`,
    validation: `import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ error: 'Validation failed', details: errors.array() });
    return;
  }
  next();
};
`,
    errorHandler: `import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error { statusCode?: number; status?: string; }
export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  console.error(\`[\${new Date().toISOString()}] \${statusCode}: \${err.message}\`);
  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
`,
    security: `import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';

// XSS sanitization
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = JSON.parse(JSON.stringify(req.body).replace(/<[^>]*>/g, ''));
  }
  next();
};

// Bcrypt utilities
export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 12);
export const comparePassword = (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);

// Auth rate limiter (${roles || 'user, admin'})
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' },
  skipSuccessfulRequests: true,
});

export const ROLES = { USER: 'user', ADMIN: 'admin', MODERATOR: 'moderator' } as const;
export type Role = typeof ROLES[keyof typeof ROLES];
`,
  };
}

function generateEnvExample(analysis: AnalysisResult): string {
  const slug = analysis.projectName.toLowerCase().replace(/\s+/g, '_');
  return `# ${analysis.projectName} – Environment Variables
# Copy to .env and fill in values

NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/${slug}_db

# JWT (use: openssl rand -base64 64)
JWT_SECRET=CHANGE_THIS_JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=CHANGE_THIS_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=30d

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Security
BCRYPT_ROUNDS=12
`;
}

function generatePackageJson(analysis: AnalysisResult): string {
  return JSON.stringify({
    name: analysis.projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    description: analysis.description,
    main: 'dist/index.js',
    scripts: {
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      'db:migrate': 'prisma migrate dev',
      'db:studio': 'prisma studio',
    },
    dependencies: {
      express: '^4.18.2',
      '@prisma/client': '^5.6.0',
      cors: '^2.8.5',
      dotenv: '^16.3.1',
      'express-rate-limit': '^7.1.5',
      'express-validator': '^7.0.1',
      helmet: '^7.1.0',
      jsonwebtoken: '^9.0.2',
      bcryptjs: '^2.4.3',
      morgan: '^1.10.0',
      'groq-sdk': '^0.3.3',
    },
    devDependencies: {
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      '@types/jsonwebtoken': '^9.0.5',
      '@types/bcryptjs': '^2.4.6',
      '@types/morgan': '^1.9.9',
      '@types/node': '^20.10.0',
      typescript: '^5.3.2',
      'ts-node-dev': '^2.0.0',
      prisma: '^5.6.0',
    },
  }, null, 2);
}

function generateAppEntry(analysis: AnalysisResult): string {
  const entityNames = analysis.entities.map(e => e.name.toLowerCase());
  const imports = entityNames.map(n => `import ${n}Routes from './routes/${n}.routes';`).join('\n');
  const uses = entityNames.map(n => `app.use('/api/${n}s', authenticate, ${n}Routes);`).join('\n');

  return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authenticate } from './middleware/auth.middleware';
import authRoutes from './routes/auth.routes';
${imports}

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
${uses}

app.get('/api/health', (_req, res) => res.json({ status: 'healthy', project: '${analysis.projectName}' }));
app.listen(PORT, () => console.log(\`🚀 ${analysis.projectName} API running on port \${PORT}\`));
export default app;
`;
}

function cleanCode(code: string): string {
  return code.trim()
    .replace(/^```(?:typescript|ts|javascript|js)?\n?/i, '')
    .replace(/\n?```$/i, '');
}

function mapType(type: string): string {
  const typeMap: Record<string, string> = {
    string: 'string', number: 'number', integer: 'number', float: 'number',
    boolean: 'boolean', date: 'Date', datetime: 'Date', uuid: 'string',
    text: 'string', json: 'Record<string, unknown>', array: 'unknown[]',
  };
  return typeMap[type.toLowerCase()] || 'string';
}
