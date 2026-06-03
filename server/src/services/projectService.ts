import { v4 as uuidv4 } from 'uuid';
import { Project, CreateProjectRequest, Architecture, Entity, Relationship } from '../types';
import { analyzeTextRequirements } from './requirementAnalyzer';
import { generateArchitecture } from '../generators/architectureGenerator';
import { generateSchema } from '../generators/databaseGenerator';
import { generateSecurityFiles } from '../generators/securityGenerator';
import { auditSecurity } from '../analyzers/securityAuditor';
import { analyzeThreatModel } from '../analyzers/threatModeler';
import { generateApiDocs } from '../generators/apiDocGenerator';
import { generateDiagrams } from '../generators/diagramGenerator';
import { generateDevOps } from '../generators/devOpsGenerator';

const projects = new Map<string, Project>();

export function createProject(req: CreateProjectRequest): Project {
  const id = uuidv4();
  const project: Project = {
    id,
    name: req.name,
    description: req.description,
    requirements: req.requirements,
    status: 'created',
    createdAt: new Date().toISOString(),
  };
  projects.set(id, project);
  return project;
}

export function getProject(id: string): Project | undefined {
  return projects.get(id);
}

export function listProjects(): Project[] {
  return Array.from(projects.values());
}

export async function generateFullArchitecture(projectId: string): Promise<Project> {
  const project = projects.get(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} not found`);
  }

  try {
    project.status = 'analyzing';
    projects.set(projectId, project);

    // 1. Analyze Requirements
    const analysis = await analyzeTextRequirements(project.requirements);
    const { entities, relationships, services, controllers, models, routes, middleware, config } = analysis as any;
    
    project.status = 'generating';
    projects.set(projectId, project);

    // 2. Generate Architecture Code
    const generatedFiles = await generateArchitecture(analysis as any);

    // 3. Generate Database Schema
    const dbFiles = await generateSchema(entities as Entity[], relationships as Relationship[]);

    // 4. Generate Security Files
    const securityFiles = await generateSecurityFiles(entities as Entity[]);

    const allFiles = [...generatedFiles, ...dbFiles, ...securityFiles];

    project.architecture = {
      entities: entities as Entity[],
      relationships: relationships as Relationship[],
      services: services as string[],
      controllers: controllers as string[],
      models: models as string[],
      routes: routes as string[],
      middleware: middleware as string[],
      config: config as string[],
      generatedFiles: allFiles,
    };

    project.status = 'auditing';
    projects.set(projectId, project);

    // 5. Security Audit
    const securityReport = await auditSecurity(allFiles);
    project.securityReport = securityReport;

    // 6. Threat Modeling
    const threatModel = await analyzeThreatModel(project.architecture, entities as Entity[]);
    project.threatModel = threatModel;

    // 7. API Docs
    const apiDocsResult = await generateApiDocs(entities as Entity[], project.name);
    project.apiDocs = apiDocsResult.documentation;
    project.architecture.generatedFiles.push(...apiDocsResult.files);

    // 8. Diagrams
    const diagrams = await generateDiagrams(entities as Entity[], relationships as Relationship[], services as string[]);
    project.diagrams = diagrams;

    // 9. DevOps Config
    const devOps = await generateDevOps(project.name, entities as Entity[]);
    project.devOps = devOps;

    project.status = 'completed';
    projects.set(projectId, project);

    return project;
  } catch (error) {
    project.status = 'error';
    projects.set(projectId, project);
    console.error(`Error generating architecture for project ${projectId}:`, error);
    throw error;
  }
}
