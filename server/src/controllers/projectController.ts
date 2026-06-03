import { Request, Response } from 'express';
import {
  createProject as createProjectService,
  getProject as getProjectService,
  listProjects as listProjectsService,
  generateFullArchitecture,
} from '../services/projectService';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../types';

export async function createProject(req: Request, res: Response) {
  try {
    const { name, description, requirements } = req.body;
    if (!name || !requirements) {
      return res.status(400).json({ error: 'Name and requirements are required' });
    }
    const project = createProjectService({ name, description, requirements });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create project' });
  }
}

export async function uploadUml(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { name, description } = req.body;
    const requirements = `Analyze the uploaded UML diagram for project: ${name}`;

    const project = createProjectService({ name, description, requirements });
    project.umlDiagram = file.buffer.toString('base64');
    project.umlMimeType = file.mimetype;
    
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upload UML' });
  }
}

export async function getProject(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get project' });
  }
}

export async function listProjects(req: Request, res: Response) {
  try {
    const projects = listProjectsService();
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to list projects' });
  }
}

export async function generateArchitecture(req: Request, res: Response) {
  try {
    const projectId = req.params.id as string;
    const project = getProjectService(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Start generation asynchronously
    generateFullArchitecture(projectId).catch(console.error);

    res.json({ success: true, message: 'Generation started' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start generation' });
  }
}

export async function getArchitecture(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.architecture) {
      return res.status(404).json({ success: false, error: 'Architecture not found' });
    }
    res.json({ success: true, data: project.architecture });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get architecture' });
  }
}

export async function getSecurityReport(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.securityReport) {
      return res.status(404).json({ success: false, error: 'Security report not found' });
    }
    res.json({ success: true, data: project.securityReport });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get security report' });
  }
}

export async function getThreatModel(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.threatModel) {
      return res.status(404).json({ success: false, error: 'Threat model not found' });
    }
    res.json({ success: true, data: project.threatModel });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get threat model' });
  }
}

export async function getApiDocs(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.apiDocs) {
      return res.status(404).json({ success: false, error: 'API docs not found' });
    }
    res.json({ success: true, data: project.apiDocs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get API docs' });
  }
}

export async function getDevOps(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.devOps) {
      return res.status(404).json({ success: false, error: 'DevOps config not found' });
    }
    res.json({ success: true, data: project.devOps });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get DevOps config' });
  }
}

export async function getDiagrams(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.diagrams) {
      return res.status(404).json({ success: false, error: 'Diagrams not found' });
    }
    res.json({ success: true, data: project.diagrams });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get diagrams' });
  }
}

export async function downloadProject(req: Request, res: Response) {
  try {
    const project = getProjectService(req.params.id as string);
    if (!project || !project.architecture || !project.architecture.generatedFiles) {
      return res.status(404).json({ success: false, error: 'Project files not found' });
    }

    res.attachment(`${project.name || 'project'}-secureforge.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      res.status(500).end();
    });

    archive.pipe(res);

    for (const file of project.architecture.generatedFiles) {
      archive.append(file.content, { name: file.path });
    }

    if (project.devOps) {
      archive.append(project.devOps.dockerfile, { name: 'Dockerfile' });
      archive.append(project.devOps.dockerCompose, { name: 'docker-compose.yml' });
      archive.append(project.devOps.githubActions, { name: '.github/workflows/ci.yml' });
      archive.append(project.devOps.envTemplate, { name: '.env.template' });
      archive.append(project.devOps.deploymentGuide, { name: 'DEPLOYMENT.md' });
    }

    await archive.finalize();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Failed to download project' });
    }
  }
}
