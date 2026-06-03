// ──────────────────────────────────────────────────────────────────────────────
// Database Generator — Produces Prisma schema, migrations, and seed files
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { Entity, Relationship, GeneratedFile } from '../types';

function sanitizeCode(raw: string): string {
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code.replace(/^```(?:prisma|sql|typescript|ts)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return code.trim();
}

export async function generateSchema(
  entities: Entity[],
  relationships: Relationship[],
): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // ── Prisma schema ─────────────────────────────────────────────────────────
  const schemaPrompt = `
Generate a complete Prisma schema file (schema.prisma) for a PostgreSQL database.

Entities:
${JSON.stringify(entities, null, 2)}

Relationships:
${JSON.stringify(relationships, null, 2)}

Requirements:
- Use datasource "postgresql" with env("DATABASE_URL")
- Use generator "prisma-client-js"
- Map TypeScript types to Prisma types: string→String, number→Int or Float, boolean→Boolean, Date→DateTime
- Every model must have:
  - id   String @id @default(uuid())
  - createdAt DateTime @default(now())
  - updatedAt DateTime @updatedAt
- Add proper @relation directives for all relationships
- Add @@index on foreign key fields
- Add @unique where the entity attribute has unique=true
- Add @default where the entity attribute has a default value
- Use @@map to set snake_case table names
- Return ONLY valid Prisma schema code, no markdown fences
`;

  const schemaContent = sanitizeCode(await generateContent(schemaPrompt));
  files.push({
    path: 'prisma/schema.prisma',
    content: schemaContent,
    language: 'prisma',
  });

  // ── Migration SQL ─────────────────────────────────────────────────────────
  const migrationPrompt = `
Generate a PostgreSQL migration SQL file that creates all tables matching this Prisma schema:

${schemaContent}

Requirements:
- Use CREATE TABLE IF NOT EXISTS
- Include all columns with correct PostgreSQL types
- Add PRIMARY KEY, UNIQUE, NOT NULL, DEFAULT constraints
- Add FOREIGN KEY constraints with ON DELETE CASCADE
- Add CREATE INDEX for foreign key columns
- Add created_at DEFAULT now() and updated_at columns
- Return ONLY valid SQL, no markdown fences
`;

  const migrationContent = sanitizeCode(await generateContent(migrationPrompt));
  files.push({
    path: 'prisma/migrations/001_initial/migration.sql',
    content: migrationContent,
    language: 'sql',
  });

  // ── Seed file ─────────────────────────────────────────────────────────────
  const seedPrompt = `
Generate a TypeScript seed file for Prisma that inserts sample data for these entities:
${entities.map((e) => e.name).join(', ')}

Entity details:
${JSON.stringify(entities, null, 2)}

Requirements:
- Import { PrismaClient } from '@prisma/client'
- Create a main() async function
- Insert 3-5 realistic sample records for each entity
- Respect relationships (create parent records before children)
- Use prisma.entity.createMany or prisma.entity.create
- Handle errors and disconnect in finally block
- Call main() at the end
- Return ONLY valid TypeScript code, no markdown fences
`;

  const seedContent = sanitizeCode(await generateContent(seedPrompt));
  files.push({
    path: 'prisma/seed.ts',
    content: seedContent,
    language: 'typescript',
  });

  return files;
}
