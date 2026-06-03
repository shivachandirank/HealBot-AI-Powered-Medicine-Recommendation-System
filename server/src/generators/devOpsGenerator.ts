// ──────────────────────────────────────────────────────────────────────────────
// DevOps Generator — Produces Docker, CI/CD, and deployment configurations
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { Entity, DevOpsConfig } from '../types';

function sanitizeCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code
      .replace(/^```(?:dockerfile|yaml|yml|markdown|md|env|sh)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }
  return code.trim();
}

/**
 * Generate a complete DevOps configuration set for the given project.
 */
export async function generateDevOps(
  projectName: string,
  entities: Entity[],
): Promise<DevOpsConfig> {
  const entityNames = entities.map((e) => e.name.toLowerCase()).join(', ');

  // ── Dockerfile ────────────────────────────────────────────────────────────
  const dockerfilePrompt = `
Generate a production-ready multi-stage Dockerfile for a Node.js TypeScript application.

Project: ${projectName}
Entities: ${entityNames}

Requirements:
- Stage 1 (builder): Use node:20-alpine, install dependencies, copy source, run tsc
- Stage 2 (production): Use node:20-alpine, copy only dist/ and node_modules from builder
- Install only production dependencies in the final stage
- Create a non-root user "appuser" and run as that user
- Expose port 3001
- Set NODE_ENV=production
- Add HEALTHCHECK instruction (curl http://localhost:3001/api/health)
- Add proper LABEL maintainer metadata
- Use .dockerignore best practices in comments
- CMD ["node", "dist/index.js"]
- Return ONLY the Dockerfile content, no markdown fences
`;

  // ── Docker Compose ────────────────────────────────────────────────────────
  const composePrompt = `
Generate a docker-compose.yml file for local development.

Project: ${projectName}

Services:
1. app:
   - Build from ./Dockerfile
   - Ports: 3001:3001
   - Depends on: postgres, redis
   - Environment variables from .env file
   - Volumes: mount ./src for development
   - Restart: unless-stopped
   - Healthcheck

2. postgres:
   - Image: postgres:16-alpine
   - Ports: 5432:5432
   - Environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
   - Volume: postgres_data for persistence
   - Healthcheck with pg_isready

3. redis:
   - Image: redis:7-alpine
   - Ports: 6379:6379
   - Volume: redis_data for persistence
   - Healthcheck with redis-cli ping
   - Command with appendonly yes

Include named volumes at the bottom.
Include a network definition.
Return ONLY valid YAML, no markdown fences.
`;

  // ── GitHub Actions ────────────────────────────────────────────────────────
  const actionsPrompt = `
Generate a GitHub Actions CI/CD workflow YAML file for a Node.js TypeScript project.

Project: ${projectName}

The workflow should:
1. Name: "CI/CD Pipeline"
2. Trigger on push to main/develop and pull_requests to main
3. Jobs:
   a. lint-and-test:
      - runs-on: ubuntu-latest
      - Node.js 20.x
      - Install dependencies (npm ci)
      - Run linter (npm run lint --if-present)
      - Run type checking (npx tsc --noEmit)
      - Run tests (npm test --if-present)
   b. build:
      - needs: lint-and-test
      - runs-on: ubuntu-latest
      - Build the project (npm run build)
      - Upload dist/ as artifact
   c. docker:
      - needs: build
      - runs-on: ubuntu-latest
      - Only on push to main
      - Login to GitHub Container Registry
      - Build and push Docker image with GHCR
      - Tag with commit SHA and latest
   d. deploy:
      - needs: docker
      - runs-on: ubuntu-latest
      - Only on push to main
      - Environment: production
      - Placeholder step for deployment (echo deploy)

Include proper caching for npm dependencies.
Return ONLY valid YAML, no markdown fences.
`;

  // ── Env Template ──────────────────────────────────────────────────────────
  const envPrompt = `
Generate a well-documented .env.template file for a Node.js Express application.

Project: ${projectName}
Entities: ${entityNames}

Include these sections with comments:
1. Server Configuration: PORT, NODE_ENV, HOST
2. Database: DATABASE_URL (PostgreSQL connection string)
3. Redis: REDIS_URL
4. Authentication: JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS
5. CORS: ALLOWED_ORIGINS
6. Rate Limiting: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
7. File Uploads: MAX_FILE_SIZE, UPLOAD_DIR
8. Logging: LOG_LEVEL, LOG_FORMAT
9. Gemini AI: GEMINI_API_KEY
10. Application: APP_NAME, APP_VERSION

Use placeholder values that clearly indicate what needs to be changed.
Add descriptive comments explaining each variable.
Return ONLY the .env content, no markdown fences.
`;

  // ── Deployment Guide ──────────────────────────────────────────────────────
  const guidePrompt = `
Generate a comprehensive deployment guide in Markdown for a Node.js TypeScript application.

Project: ${projectName}

Cover these topics:
1. Prerequisites (Node.js 20+, Docker, PostgreSQL, Redis)
2. Local Development Setup (clone, install, env setup, database setup, run dev server)
3. Docker Development (docker-compose up)
4. Production Build (npm run build, environment variables)
5. Docker Production Deployment (build image, push to registry, run container)
6. Cloud Deployment Options (brief overview of AWS ECS, Google Cloud Run, Railway, Render)
7. Database Migrations (Prisma migrate)
8. Monitoring & Logging (health checks, log aggregation)
9. Security Checklist (env vars, HTTPS, rate limiting, CORS, etc.)
10. Troubleshooting (common issues and solutions)

Use proper Markdown formatting with headers, code blocks, and bullet points.
Return ONLY Markdown content, no outer markdown fences.
`;

  // Generate all configs in parallel
  const dockerfileRaw = await generateContent(dockerfilePrompt);
  const composeRaw = await generateContent(composePrompt);
  const actionsRaw = await generateContent(actionsPrompt);
  const envRaw = await generateContent(envPrompt);
  const guideRaw = await generateContent(guidePrompt);

  return {
    dockerfile: sanitizeCode(dockerfileRaw),
    dockerCompose: sanitizeCode(composeRaw),
    githubActions: sanitizeCode(actionsRaw),
    envTemplate: sanitizeCode(envRaw),
    deploymentGuide: sanitizeCode(guideRaw),
  };
}
