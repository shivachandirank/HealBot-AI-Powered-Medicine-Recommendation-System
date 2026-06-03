// ──────────────────────────────────────────────────────────────────────────────
// Security Generator — Produces JWT auth, RBAC, bcrypt, validation files
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { Entity, GeneratedFile } from '../types';

function sanitizeCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code.replace(/^```(?:typescript|ts|env)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return code.trim();
}

export async function generateSecurityFiles(
  entities: Entity[],
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // ── JWT Authentication Middleware ──────────────────────────────────────────
  const jwtPrompt = `
Generate a complete TypeScript JWT authentication module for an Express.js application.
File: src/middleware/auth.ts

Implement these exported functions:
1. generateToken(payload: { userId: string; role: string }): string
   - Sign with process.env.JWT_SECRET, expiresIn '24h'
2. verifyToken(token: string): { userId: string; role: string }
   - Verify and decode the token
3. authMiddleware(req: Request, res: Response, next: NextFunction): void
   - Extract Bearer token from Authorization header
   - Verify it, attach decoded payload to (req as any).user
   - Return 401 if missing or invalid
4. registerHandler(req: Request, res: Response, next: NextFunction): Promise<void>
   - Extract email, password, name from body
   - Hash password with bcrypt (10 rounds)
   - Store in an in-memory Map
   - Return the generated token
5. loginHandler(req: Request, res: Response, next: NextFunction): Promise<void>
   - Validate email/password against the in-memory store
   - Compare with bcrypt
   - Return token or 401

Import jsonwebtoken and bcrypt (use require for CommonJS compat if needed).
Use proper TypeScript types. Return ONLY valid TypeScript code, no markdown fences.
`;

  const jwtContent = sanitizeCode(await generateContent(jwtPrompt));
  files.push({
    path: 'src/middleware/auth.ts',
    content: jwtContent,
    language: 'typescript',
  });

  // ── RBAC Authorization Middleware ─────────────────────────────────────────
  const rbacPrompt = `
Generate a complete TypeScript RBAC authorization middleware for Express.js.
File: src/middleware/rbac.ts

Implement:
1. Type Role = 'admin' | 'user' | 'moderator'
2. A permissions map: Record<Role, string[]> where:
   - admin: ['*'] (all permissions)
   - moderator: ['read', 'write', 'update', 'moderate']
   - user: ['read', 'write:own', 'update:own', 'delete:own']
3. requireRole(...roles: Role[]) — returns Express middleware that checks (req as any).user.role
4. requirePermission(permission: string) — returns Express middleware checking the permissions map
5. isResourceOwner(getOwnerId: (req: Request) => string) — returns middleware comparing (req as any).user.userId with the resource owner id

All should return 403 with JSON error on failure.
Return ONLY valid TypeScript code, no markdown fences.
`;

  const rbacContent = sanitizeCode(await generateContent(rbacPrompt));
  files.push({
    path: 'src/middleware/rbac.ts',
    content: rbacContent,
    language: 'typescript',
  });

  // ── Password Hashing Utilities ────────────────────────────────────────────
  const hashPrompt = `
Generate a TypeScript utility module for password hashing.
File: src/utils/password.ts

Export:
1. hashPassword(password: string): Promise<string> — bcrypt hash with 12 salt rounds
2. comparePassword(password: string, hash: string): Promise<boolean> — bcrypt compare
3. validatePasswordStrength(password: string): { valid: boolean; errors: string[] }
   - Min 8 chars, must contain uppercase, lowercase, digit, special char
   - Return all failing rules in errors array

Import bcrypt (use require for CommonJS compat).
Return ONLY valid TypeScript code, no markdown fences.
`;

  const hashContent = sanitizeCode(await generateContent(hashPrompt));
  files.push({
    path: 'src/utils/password.ts',
    content: hashContent,
    language: 'typescript',
  });

  // ── Input Validation Schemas (Zod) ────────────────────────────────────────
  const entityNames = entities.map((e) => e.name);
  const validationPrompt = `
Generate TypeScript validation schemas using the Zod library for these entities:
${JSON.stringify(entities, null, 2)}

File: src/validators/schemas.ts

For each entity, export:
- create{EntityName}Schema — Zod object for creation (exclude id, createdAt, updatedAt)
- update{EntityName}Schema — Same but all fields optional (use .partial())
- A validate(schema, data) helper function that returns { success, data?, errors? }

Entities: ${entityNames.join(', ')}

Import { z } from 'zod'.
Map attribute types: string→z.string(), number→z.number(), boolean→z.boolean(), Date→z.string().datetime().
Add .min(1) for required string fields, .email() for email fields, .min(6) for password fields.
Return ONLY valid TypeScript code, no markdown fences.
`;

  const validationContent = sanitizeCode(await generateContent(validationPrompt));
  files.push({
    path: 'src/validators/schemas.ts',
    content: validationContent,
    language: 'typescript',
  });

  // ── Rate Limiting Configuration ───────────────────────────────────────────
  const rateLimitPrompt = `
Generate a TypeScript rate limiting middleware module for Express.js.
File: src/middleware/rateLimit.ts

Implement a custom in-memory rate limiter (no external dependency):
1. interface RateLimitOptions { windowMs: number; maxRequests: number; message?: string }
2. createRateLimiter(options: RateLimitOptions) — returns Express middleware
   - Track requests per IP using a Map<string, { count: number; resetTime: number }>
   - Return 429 with JSON error when limit exceeded
   - Set Retry-After and X-RateLimit-* headers
3. Export pre-configured limiters:
   - apiLimiter: 100 requests per 15 minutes
   - authLimiter: 10 requests per 15 minutes
   - uploadLimiter: 5 requests per 15 minutes

Return ONLY valid TypeScript code, no markdown fences.
`;

  const rateLimitContent = sanitizeCode(await generateContent(rateLimitPrompt));
  files.push({
    path: 'src/middleware/rateLimit.ts',
    content: rateLimitContent,
    language: 'typescript',
  });

  // ── Security Headers Config ───────────────────────────────────────────────
  const helmetPrompt = `
Generate a TypeScript security configuration module for Express.js.
File: src/config/security.ts

Export:
1. helmetConfig — a configuration object for the helmet middleware with:
   - contentSecurityPolicy with directives (defaultSrc, scriptSrc, styleSrc, imgSrc)
   - crossOriginEmbedderPolicy: true
   - crossOriginOpenerPolicy: { policy: 'same-origin' }
   - crossOriginResourcePolicy: { policy: 'same-origin' }
   - dnsPrefetchControl: { allow: false }
   - frameguard: { action: 'deny' }
   - hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
   - referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
2. corsConfig — CORS options:
   - origin from process.env.ALLOWED_ORIGINS (comma-separated) or '*' in dev
   - methods: GET, POST, PUT, DELETE, PATCH
   - allowedHeaders: Content-Type, Authorization
   - credentials: true
   - maxAge: 86400

Return ONLY valid TypeScript code, no markdown fences.
`;

  const helmetContent = sanitizeCode(await generateContent(helmetPrompt));
  files.push({
    path: 'src/config/security.ts',
    content: helmetContent,
    language: 'typescript',
  });

  // ── .env Template ─────────────────────────────────────────────────────────
  const envTemplate = `# ── Server ────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── Database ─────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=public

# ── Authentication ───────────────────────────────────
JWT_SECRET=change-me-to-a-strong-random-string-at-least-64-chars
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12

# ── CORS ─────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ── Rate Limiting ────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ── Redis (optional, for session/cache) ──────────────
REDIS_URL=redis://localhost:6379

# ── Logging ──────────────────────────────────────────
LOG_LEVEL=debug
`;

  files.push({
    path: '.env.template',
    content: envTemplate.trim(),
    language: 'env',
  });

  return files;
}
