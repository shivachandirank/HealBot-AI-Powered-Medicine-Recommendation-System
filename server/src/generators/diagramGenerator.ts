// ──────────────────────────────────────────────────────────────────────────────
// Diagram Generator — Produces Mermaid.js diagram code via Gemini AI
// ──────────────────────────────────────────────────────────────────────────────

import { generateContent } from '../services/grokService';
import type { Entity, Relationship, DiagramSet } from '../types';

function sanitizeMermaid(raw: string): string {
  let code = raw.trim();
  if (code.startsWith('```')) {
    code = code
      .replace(/^```(?:mermaid)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '');
  }
  return code.trim();
}

/**
 * Generate a full set of Mermaid.js diagrams for the given architecture.
 */
export async function generateDiagrams(
  entities: Entity[],
  relationships: Relationship[],
  services: string[],
): Promise<DiagramSet> {
  const entitySummary = entities
    .map(
      (e) =>
        `${e.name} (${e.attributes.map((a) => `${a.name}:${a.type}`).join(', ')})`,
    )
    .join('\n');

  const relationshipSummary = relationships
    .map((r) => `${r.from} --[${r.type}]--> ${r.to} (FK: ${r.foreignKey})`)
    .join('\n');

  const serviceSummary = services.join(', ');

  // ── ER Diagram ──────────────────────────────────────────────────────────────
  const erPrompt = `
Generate a Mermaid.js ER diagram for these entities and relationships.

Entities:
${entitySummary}

Relationships:
${relationshipSummary}

Requirements:
- Use the "erDiagram" Mermaid syntax
- Include ALL entity attributes with their types
- Show relationship cardinalities correctly (||--o{, }|--|{, etc.)
- Use proper Mermaid ER notation
- Return ONLY the Mermaid code starting with "erDiagram", no markdown fences
`;

  // ── Class Diagram ───────────────────────────────────────────────────────────
  const classPrompt = `
Generate a Mermaid.js class diagram showing service classes for a backend application.

Services: ${serviceSummary}

Entities:
${entitySummary}

Requirements:
- Use the "classDiagram" Mermaid syntax
- For each entity, create a Model class with its attributes and types
- For each service, create a Service class with CRUD methods (getAll, getById, create, update, delete)
- For each entity, create a Controller class with handler methods
- Show inheritance and composition relationships between classes
- Return ONLY the Mermaid code starting with "classDiagram", no markdown fences
`;

  // ── Sequence Diagram ────────────────────────────────────────────────────────
  const sequencePrompt = `
Generate a Mermaid.js sequence diagram showing a typical API request flow.

Show the flow for a CREATE operation on the first entity (${entities[0]?.name || 'Resource'}):
1. Client sends POST request
2. Express Router receives request
3. Auth Middleware validates JWT token
4. Validation Middleware validates request body
5. Controller processes request
6. Service performs business logic
7. Database stores data
8. Response flows back through each layer

Requirements:
- Use "sequenceDiagram" Mermaid syntax
- Include participants: Client, Router, AuthMiddleware, Validator, Controller, Service, Database
- Show both success and error paths using alt/else blocks
- Include proper activation/deactivation of participants
- Return ONLY the Mermaid code starting with "sequenceDiagram", no markdown fences
`;

  // ── Service Dependency Diagram ──────────────────────────────────────────────
  const serviceDiagramPrompt = `
Generate a Mermaid.js flowchart showing service dependencies for a backend application.

Services: ${serviceSummary}

Entities:
${entities.map((e) => e.name).join(', ')}

Requirements:
- Use "flowchart TD" (top-down) Mermaid syntax
- Show the Express App at the top
- Below it, show Router layer
- Below Router, show Middleware layer (Auth, Validation, RateLimit)
- Below Middleware, show Controller layer (one per entity)
- Below Controllers, show Service layer (one per entity)
- Below Services, show Database layer
- Show external dependencies (Redis, JWT, Bcrypt) as separate nodes
- Use different node shapes for different layers ([], (), {{}}, [/\\])
- Use subgraphs to group related components
- Return ONLY the Mermaid code starting with "flowchart TD", no markdown fences
`;

  // Generate all diagrams sequentially
  const erRaw = await generateContent(erPrompt);
  const classRaw = await generateContent(classPrompt);
  const sequenceRaw = await generateContent(sequencePrompt);
  const serviceRaw = await generateContent(serviceDiagramPrompt);

  return {
    erDiagram: sanitizeMermaid(erRaw),
    classDiagram: sanitizeMermaid(classRaw),
    sequenceDiagram: sanitizeMermaid(sequenceRaw),
    serviceDiagram: sanitizeMermaid(serviceRaw),
  };
}
