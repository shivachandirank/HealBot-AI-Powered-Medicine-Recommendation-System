import type { AnalysisResult } from './architecture.service';

export interface DiagramBundle {
  erDiagram: string;
  classDiagram: string;
  serviceDependency: string;
  microserviceInteraction: string;
  dataFlowDiagram: string;
}

export function generateDiagrams(analysis: AnalysisResult): DiagramBundle {
  return {
    erDiagram: generateERDiagram(analysis),
    classDiagram: generateClassDiagram(analysis),
    serviceDependency: generateServiceDependency(analysis),
    microserviceInteraction: generateMicroserviceInteraction(analysis),
    dataFlowDiagram: generateDataFlowDiagram(analysis),
  };
}

/** ─── ER Diagram ──────────────────────────────────────────────────────────── */
function generateERDiagram(analysis: AnalysisResult): string {
  // Limit to 6 entities to keep diagram readable
  const entities = analysis.entities.slice(0, 6).map(entity => {
    const attrs = entity.attributes
      .slice(0, 8) // cap attributes per entity
      .map(a => {
        // ER diagram types must be a single word (no brackets, no special chars)
        const safeType = toERType(a.type);
        const safeName = sanitizeName(a.name);
        return `    ${safeType} ${safeName}`;
      })
      .join('\n');
    return `  ${entity.name} {\n${attrs}\n  }`;
  }).join('\n\n');

  const relations = analysis.relationships
    .slice(0, 8)
    .map(r => {
      const relType = mapERRelationType(r.type);
      // Description must be quoted and short
      const desc = sanitizeLabel(r.description || 'relates to');
      return `  ${r.from} ${relType} ${r.to} : "${desc}"`;
    })
    .join('\n');

  return `erDiagram\n${entities}${relations ? '\n\n' + relations : ''}`;
}

/** ─── Class Diagram ──────────────────────────────────────────────────────── */
function generateClassDiagram(analysis: AnalysisResult): string {
  const entities = analysis.entities.slice(0, 5);

  const classes = entities.map(entity => {
    // Attributes: +Type name (no spaces in type names, simple names only)
    const attrs = entity.attributes
      .slice(0, 6)
      .map(a => `    +${toClassType(a.type)} ${sanitizeName(a.name)}`)
      .join('\n');

    // Methods: must use Mermaid class method syntax — no generics, no commas with spaces
    // Valid: +methodName(paramType) ReturnType
    const name = entity.name;
    const methods = [
      `    +findAll() List`,
      `    +findById(id) ${name}`,
      `    +create(data) ${name}`,
      `    +update(id) ${name}`,
      `    +delete(id) void`,
    ].join('\n');

    return `  class ${name}Service {\n${attrs}\n${methods}\n  }`;
  }).join('\n\n');

  // Class diagram uses --> for dependency (NOT ER relation syntax)
  const relations = analysis.relationships
    .slice(0, 6)
    .filter(r => {
      // Only include if both ends exist in our entity list
      const names = entities.map(e => e.name);
      return names.includes(r.from) && names.includes(r.to);
    })
    .map(r => {
      // classDiagram supports: <|-- (inherit), *-- (composition), o-- (aggregation), --> (dependency)
      const arrow = r.type === 'one-to-many' ? '"1" --> "many"' : '"1" --> "1"';
      return `  ${r.from}Service ${arrow} ${r.to}Service`;
    })
    .join('\n');

  return `classDiagram\n${classes}${relations ? '\n\n' + relations : ''}`;
}

/** ─── Service Dependency Graph ───────────────────────────────────────────── */
function generateServiceDependency(analysis: AnalysisResult): string {
  const services = analysis.entities.slice(0, 5).map(e => ({
    id: `${e.name}Svc`,
    label: `${e.name} Service`,
  }));

  const nodes = services
    .map(s => `  ${s.id}["${s.label}"]`)
    .join('\n');

  const dbEdges = services
    .map(s => `  ${s.id} --> DB`)
    .join('\n');

  const gatewayEdges = services
    .map(s => `  GW --> ${s.id}`)
    .join('\n');

  return `graph TD
  Client["Client"]
  GW["API Gateway"]
  Auth["Auth Service"]
  DB[("PostgreSQL")]
  Cache[("Redis Cache")]

  Client --> GW
  GW --> Auth
${gatewayEdges}
${dbEdges}
  Auth --> DB
  Auth --> Cache`;
}

/** ─── Sequence Diagram ────────────────────────────────────────────────────── */
function generateMicroserviceInteraction(analysis: AnalysisResult): string {
  // Safe participant names (no spaces, no special chars)
  const actorName = sanitizeName(analysis.actors[0] || 'User');
  const actorLabel = analysis.actors[0] || 'User';
  const firstEntity = analysis.entities[0]?.name || 'Resource';
  const firstEntityLower = firstEntity.toLowerCase();

  return `sequenceDiagram
  participant ${actorName} as ${actorLabel}
  participant GW as API Gateway
  participant Auth as Auth Service
  participant Svc as ${firstEntity} Service
  participant DB as Database

  ${actorName}->>GW: POST /api/auth/login
  GW->>Auth: Validate credentials
  Auth->>DB: Query user record
  DB-->>Auth: User data
  Auth-->>GW: JWT token
  GW-->>${actorName}: 200 token

  ${actorName}->>GW: GET /api/${firstEntityLower}s
  Note over GW: Bearer token in header
  GW->>Auth: Verify JWT
  Auth-->>GW: userId role
  GW->>Svc: findAll(filters)
  Svc->>DB: SELECT query
  DB-->>Svc: Result rows
  Svc-->>GW: Data array
  GW-->>${actorName}: 200 data`;
}

/** ─── Data Flow Diagram ──────────────────────────────────────────────────── */
function generateDataFlowDiagram(analysis: AnalysisResult): string {
  const projectName = sanitizeLabel(analysis.projectName);

  return `flowchart LR
  subgraph Internet["Internet"]
    Client["Client App"]
  end

  subgraph Security["Security Layer"]
    WAF["WAF / Rate Limiter"]
    LB["Load Balancer"]
  end

  subgraph App["Application - ${projectName}"]
    GW["API Gateway"]
    Auth["Auth Service"]
  end

  subgraph Data["Data Layer"]
    PG[("PostgreSQL")]
    Redis[("Redis Cache")]
  end

  subgraph External["External APIs"]
    GroqAI["Groq AI"]
    Email["Email Service"]
  end

  Client -->|HTTPS| WAF
  WAF --> LB
  LB --> GW
  GW <-->|validate| Auth
  Auth <-->|sessions| Redis
  GW <-->|queries| PG
  GW <-->|cache| Redis
  GW -->|AI requests| GroqAI
  GW -->|notifications| Email`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Map to valid Mermaid ER diagram types (single word, no brackets) */
function toERType(type: string): string {
  const map: Record<string, string> = {
    string: 'string', text: 'string', uuid: 'string', email: 'string',
    number: 'number', integer: 'int', float: 'float', decimal: 'float',
    boolean: 'boolean',
    date: 'date', datetime: 'datetime',
    json: 'string', array: 'string',
  };
  return map[type.toLowerCase()] || 'string';
}

/** Map to valid TypeScript-like class diagram types */
function toClassType(type: string): string {
  const map: Record<string, string> = {
    string: 'String', text: 'String', uuid: 'String', email: 'String',
    number: 'Number', integer: 'Int', float: 'Float',
    boolean: 'Boolean',
    date: 'Date', datetime: 'Date',
    json: 'Object', array: 'List',
  };
  return map[type.toLowerCase()] || 'String';
}

/** Remove spaces and special chars that break Mermaid node IDs */
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

/** Sanitize label text (used inside quotes) */
function sanitizeLabel(label: string): string {
  return label
    .replace(/"/g, "'")
    .replace(/[<>{}|]/g, '')
    .substring(0, 30)
    .trim();
}

function mapERRelationType(type: string): string {
  const typeMap: Record<string, string> = {
    'one-to-one': '||--||',
    'one-to-many': '||--o{',
    'many-to-many': '}o--o{',
    'many-to-one': '}o--||',
  };
  return typeMap[type] || '||--o{';
}
