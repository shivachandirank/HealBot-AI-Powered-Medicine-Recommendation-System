// ──────────────────────────────────────────────────────────────────────────────
// Requirement Analyzer — Extracts structured entities from text / UML images
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent, analyzeImage } from './grokService';
import type { Entity, Relationship } from '../types';

export interface AnalysisResult {
  projectName: string;
  description: string;
  entities: Entity[];
  relationships: Relationship[];
  useCases: string[];
  workflows: string[];
  securityRequirements: string[];
  techStack: string[];
}

const TEXT_ANALYSIS_PROMPT = (text: string) => `
You are an expert software architect. Analyze the following project requirements and extract a structured architecture specification.

REQUIREMENTS:
${text}

Return a JSON object with EXACTLY this shape:
{
  "projectName": "string — short snake_case project name",
  "description": "string — one sentence project summary",
  "entities": [
    {
      "name": "string — PascalCase entity name, e.g. User",
      "attributes": [
        { "name": "string", "type": "string (e.g. string, number, boolean, Date)", "required": true/false, "unique": true/false, "default": "optional default value or omit" }
      ],
      "relationships": [
        { "from": "ThisEntity", "to": "OtherEntity", "type": "one-to-one | one-to-many | many-to-many", "foreignKey": "fieldName" }
      ]
    }
  ],
  "relationships": [
    { "from": "EntityA", "to": "EntityB", "type": "one-to-one | one-to-many | many-to-many", "foreignKey": "fieldName" }
  ],
  "useCases": ["Use case description 1", "Use case description 2"],
  "workflows": ["Workflow description 1"],
  "securityRequirements": ["Security req 1"],
  "techStack": ["Express.js", "TypeScript", "Prisma", "PostgreSQL"]
}

Rules:
- Every entity MUST have an "id" attribute (type string, required true, unique true).
- Every entity MUST have "createdAt" and "updatedAt" attributes (type Date).
- If users exist, include password (string, required) and role (string, required, default "user").
- Infer implicit entities (e.g. if "users can create posts" implies User and Post).
- Infer at least 3 security requirements.
- Be thorough — extract ALL entities, attributes, and relationships.
`;

const UML_ANALYSIS_PROMPT = `
You are an expert software architect. Analyze the uploaded UML diagram image and extract a structured architecture specification.

Return a JSON object with EXACTLY this shape:
{
  "projectName": "string — short snake_case project name derived from the diagram",
  "description": "string — one sentence project summary",
  "entities": [
    {
      "name": "string — PascalCase entity name",
      "attributes": [
        { "name": "string", "type": "string", "required": true/false, "unique": true/false }
      ],
      "relationships": [
        { "from": "ThisEntity", "to": "OtherEntity", "type": "one-to-one | one-to-many | many-to-many", "foreignKey": "fieldName" }
      ]
    }
  ],
  "relationships": [
    { "from": "EntityA", "to": "EntityB", "type": "one-to-one | one-to-many | many-to-many", "foreignKey": "fieldName" }
  ],
  "useCases": ["Use case 1"],
  "workflows": ["Workflow 1"],
  "securityRequirements": ["Security req 1"],
  "techStack": ["Express.js", "TypeScript", "Prisma", "PostgreSQL"]
}

Rules:
- Identify all classes/entities, their attributes, methods, and relationships.
- Translate UML multiplicities (1..*, 0..1, etc.) into one-to-one / one-to-many / many-to-many.
- Every entity MUST have id, createdAt, updatedAt.
- Be thorough.
`;

function sanitizeJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

export async function analyzeTextRequirements(
  text: string,
): Promise<AnalysisResult> {
  const raw = await generateContent(TEXT_ANALYSIS_PROMPT(text));
  try {
    const parsed = JSON.parse(sanitizeJson(raw)) as AnalysisResult;
    return normalizeResult(parsed);
  } catch {
    throw new Error(
      `Failed to parse Gemini analysis response as JSON. Raw: ${raw.slice(0, 500)}`,
    );
  }
}

export async function analyzeUmlDiagram(
  imageBase64: string,
  mimeType: string,
): Promise<AnalysisResult> {
  const raw = await analyzeImage(imageBase64, mimeType, UML_ANALYSIS_PROMPT);
  try {
    const parsed = JSON.parse(sanitizeJson(raw)) as AnalysisResult;
    return normalizeResult(parsed);
  } catch {
    throw new Error(
      `Failed to parse UML analysis response as JSON. Raw: ${raw.slice(0, 500)}`,
    );
  }
}

function normalizeResult(r: AnalysisResult): AnalysisResult {
  return {
    projectName: r.projectName || 'untitled_project',
    description: r.description || '',
    entities: (r.entities || []).map((e) => ({
      name: e.name,
      attributes: (e.attributes || []).map((a) => ({
        name: a.name,
        type: a.type,
        required: a.required ?? false,
        unique: a.unique ?? false,
        default: a.default,
      })),
      relationships: e.relationships || [],
    })),
    relationships: r.relationships || [],
    useCases: r.useCases || [],
    workflows: r.workflows || [],
    securityRequirements: r.securityRequirements || [],
    techStack: r.techStack || ['Express.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
  };
}
