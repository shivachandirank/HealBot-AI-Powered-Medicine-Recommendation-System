import { callGroqAI, MODEL_FAST } from './ai.service';
import type { AnalysisResult } from './architecture.service';

export interface DevOpsBundle {
  dockerfile: string;
  dockerCompose: string;
  githubActionsCI: string;
  nginxConfig: string;
  envTemplate: string;
  deploymentGuide: string;
}

/**
 * Generate DevOps bundle.
 * Dockerfile, nginx, envTemplate, and deploymentGuide are generated from templates (no AI = no tokens).
 * Only docker-compose and GitHub Actions use AI (single combined call to save TPM).
 */
export async function generateDevOpsBundle(analysis: AnalysisResult): Promise<DevOpsBundle> {
  const projectSlug = analysis.projectName.toLowerCase().replace(/\s+/g, '-');

  // Generate docker-compose + GitHub Actions in ONE combined AI call to save tokens
  const combinedResult = await generateDockerAndCI(projectSlug, analysis);

  return {
    dockerfile: generateDockerfile(projectSlug),
    dockerCompose: combinedResult.dockerCompose,
    githubActionsCI: combinedResult.githubActions,
    nginxConfig: generateNginxConfig(projectSlug),
    envTemplate: generateEnvTemplate(analysis, projectSlug),
    deploymentGuide: generateDeploymentGuide(analysis, projectSlug),
  };
}

/** Single AI call for docker-compose + CI/CD to reduce TPM usage */
async function generateDockerAndCI(
  projectSlug: string,
  analysis: AnalysisResult
): Promise<{ dockerCompose: string; githubActions: string }> {
  const prompt = `Generate TWO files for "${analysis.projectName}" (slug: ${projectSlug}).

FILE 1 – docker-compose.yml:
Services: api (Node 20, port 3001), postgres (PostgreSQL 15 Alpine), redis (Redis 7 Alpine).
Include: named volumes, health checks, environment vars from .env, restart: unless-stopped.

FILE 2 – .github/workflows/ci.yml:  
Jobs: lint (tsc --noEmit), build (docker build + push to ghcr.io), deploy-staging (on develop), deploy-production (on main with environment approval).

Format your response exactly as:
=== docker-compose.yml ===
[YAML content]

=== ci.yml ===
[YAML content]`;

  const DEVOPS_PROMPT = 'You are a DevOps engineer. Generate concise, production-ready configs. No explanations.';

  try {
    const response = await callGroqAI(DEVOPS_PROMPT, prompt, 1200, MODEL_FAST);
    const raw = response.content;

    const dcMatch = raw.match(/===\s*docker-compose\.yml\s*===\n([\s\S]*?)(?===|$)/);
    const ciMatch = raw.match(/===\s*ci\.yml\s*===\n([\s\S]*?)(?===|$)/);

    return {
      dockerCompose: cleanYaml(dcMatch?.[1] || generateDockerComposeTemplate(projectSlug)),
      githubActions: cleanYaml(ciMatch?.[1] || generateCITemplate(projectSlug)),
    };
  } catch {
    // Fallback to static templates if AI fails
    return {
      dockerCompose: generateDockerComposeTemplate(projectSlug),
      githubActions: generateCITemplate(projectSlug),
    };
  }
}

/** Static Dockerfile template — no AI needed */
function generateDockerfile(projectSlug: string): string {
  return `# Multi-stage Dockerfile for ${projectSlug}
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \\
  CMD wget -qO- http://localhost:3001/api/health || exit 1
CMD ["node", "dist/index.js"]`;
}

/** Static docker-compose template fallback */
function generateDockerComposeTemplate(projectSlug: string): string {
  return `version: '3.9'
services:
  api:
    build: .
    ports: ["3001:3001"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@postgres:5432/\${DB_NAME}
      - GROQ_API_KEY=\${GROQ_API_KEY}
      - JWT_SECRET=\${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks: [${projectSlug}-net]
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: \${DB_NAME:-${projectSlug}_db}
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes: [postgres_data:/var/lib/postgresql/data]
    networks: [${projectSlug}-net]
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER:-postgres}"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]
    networks: [${projectSlug}-net]
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  ${projectSlug}-net:
    driver: bridge`;
}

/** Static GitHub Actions CI template fallback */
function generateCITemplate(projectSlug: string): string {
  return `name: ${projectSlug} CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  lint:
    name: Type Check & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: backend/package-lock.json }
      - run: npm ci
        working-directory: backend
      - run: npx tsc --noEmit
        working-directory: backend

  build:
    name: Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: [lint]
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://${projectSlug}.example.com
    steps:
      - name: Deploy
        run: echo "Deploy to production server"`;
}

/** Static Nginx config — no AI needed */
function generateNginxConfig(projectSlug: string): string {
  return `upstream api {
    server api:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name ${projectSlug}.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${projectSlug}.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

    location /api/auth {
        limit_req zone=auth burst=10 nodelay;
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 120s;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
}`;
}

function generateEnvTemplate(analysis: AnalysisResult, projectSlug: string): string {
  return `# ${analysis.projectName} – Environment Template
# Copy to .env and fill in values

NODE_ENV=production
PORT=3001
FRONTEND_URL=https://${projectSlug}.example.com

# Database
DATABASE_URL=postgresql://\${DB_USER}:\${DB_PASSWORD}@postgres:5432/\${DB_NAME}
DB_NAME=${projectSlug}_db
DB_USER=${projectSlug}_user
DB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Redis
REDIS_URL=redis://redis:6379

# JWT (generate with: openssl rand -base64 64)
JWT_SECRET=CHANGE_THIS_JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=CHANGE_THIS_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=30d

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Security
BCRYPT_ROUNDS=12`;
}

function generateDeploymentGuide(analysis: AnalysisResult, projectSlug: string): string {
  return `# ${analysis.projectName} – Deployment Guide

## Quick Start (Development)

\`\`\`bash
git clone https://github.com/your-org/${projectSlug}.git
cd ${projectSlug}
cp .env.example .env   # Edit values
npm install
npm run db:migrate
npm run dev
\`\`\`

## Production (Docker)

\`\`\`bash
cp .env.example .env   # Edit with real secrets
docker-compose up -d --build
docker-compose exec api npm run db:migrate
docker-compose logs -f api
\`\`\`

## Critical Security Steps
1. Generate JWT secrets: \`openssl rand -base64 64\`
2. Set strong DB password
3. Configure SSL certificates in nginx
4. Set FRONTEND_URL to your actual domain

## Health Check
- API: http://localhost:3001/api/health
- Swagger: http://localhost:3001/api/docs

## Scaling
\`\`\`bash
docker-compose up -d --scale api=3
\`\`\``;
}

function cleanYaml(content: string): string {
  return content.trim()
    .replace(/^```(?:yaml)?\n?/i, '')
    .replace(/\n?```$/i, '');
}
