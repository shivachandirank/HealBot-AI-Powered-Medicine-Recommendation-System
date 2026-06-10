import type {
  Project,
  Architecture,
  SecurityReport,
  ApiDocumentation,
  DevOpsConfig,
  ProjectTemplate,
} from '../types';

// Replace the top of api.ts with this:
const API_BASE = import.meta.env.PROD 
  ? 'https://your-backend-service.up.railway.app/api' // We will update this exact URL after the backend deploys
  : '/api';

class ApiError extends Error {
  statusCode: number;
  constructor(
    statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.text();
    let message: string;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.error || errorBody;
    } catch {
      message = errorBody || `HTTP ${response.status}`;
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return (json.data !== undefined ? json.data : json) as T;
}

// ─── Projects ───────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}

export async function fetchProject(id: string): Promise<Project> {
  return request<Project>(`/projects/${id}`);
}

export async function createProject(data: {
  name: string;
  requirements: string;
  templateId?: string;
}): Promise<Project> {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<void> {
  return request<void>(`/projects/${id}`, { method: 'DELETE' });
}

// ─── Architecture Generation ────────────────────────────────────────────────

export async function generateArchitecture(
  projectId: string
): Promise<Architecture> {
  return request<Architecture>(`/projects/${projectId}/generate`, {
    method: 'POST',
  });
}

export async function fetchArchitecture(
  projectId: string
): Promise<Architecture> {
  return request<Architecture>(`/projects/${projectId}/architecture`);
}

// ─── UML Upload ─────────────────────────────────────────────────────────────

export async function uploadUmlDiagram(
  name: string,
  description: string,
  file: File
): Promise<Project> {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('diagram', file);

  const response = await fetch(`${API_BASE}/projects/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(response.status, errorBody);
  }

  const result = await response.json();
  return result.data as Project;
}

export async function downloadProjectArchive(projectId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/download`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to download project');
  }

  return response.blob();
}

// ─── Security ───────────────────────────────────────────────────────────────

export async function fetchSecurityReport(
  projectId: string
): Promise<SecurityReport> {
  return request<SecurityReport>(`/projects/${projectId}/security`);
}

export async function runSecurityAnalysis(
  projectId: string
): Promise<SecurityReport> {
  return request<SecurityReport>(`/projects/${projectId}/security/analyze`, {
    method: 'POST',
  });
}

// ─── API Docs ───────────────────────────────────────────────────────────────

export async function fetchApiDocs(
  projectId: string
): Promise<ApiDocumentation> {
  return request<ApiDocumentation>(`/projects/${projectId}/api-docs`);
}

// ─── DevOps ─────────────────────────────────────────────────────────────────

export async function fetchDevOpsConfig(
  projectId: string
): Promise<DevOpsConfig> {
  return request<DevOpsConfig>(`/projects/${projectId}/devops`);
}

// ─── Templates ──────────────────────────────────────────────────────────────

export async function fetchTemplates(): Promise<ProjectTemplate[]> {
  return request<ProjectTemplate[]>('/templates');
}

// ─── Health ─────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string; ai: boolean }> {
  return request<{ status: string; ai: boolean }>('/health');
}

export const api = {
  projects: {
    list: fetchProjects,
    get: fetchProject,
    create: createProject,
    delete: deleteProject,
    uploadUml: uploadUmlDiagram,
  },
  architecture: {
    generate: generateArchitecture,
    get: fetchArchitecture,
  },
  security: {
    getReport: fetchSecurityReport,
    analyze: runSecurityAnalysis,
  },
  apiDocs: {
    get: fetchApiDocs,
  },
  devOps: {
    get: fetchDevOpsConfig,
  },
  templates: {
    list: fetchTemplates,
  },
  health: checkHealth,
  downloadProject: downloadProjectArchive,
};

export default api;
