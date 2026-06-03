import { create } from 'zustand';
import api from '../services/api';
import type {
  Project,
  ProjectStatus,
  Architecture,
  SecurityReport,
  ApiDocumentation,
  DevOpsConfig,
  ProcessingStage,
} from '../types';

interface ProjectState {
  // Data
  projects: Project[];
  currentProject: Project | null;
  processingStages: ProcessingStage[];

  // UI State
  isLoading: boolean;
  isSidebarCollapsed: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  setCurrentProject: (project: Project | null) => void;
  updateProjectStatus: (id: string, status: ProjectStatus) => void;
  setArchitecture: (projectId: string, architecture: Architecture) => void;
  setSecurityReport: (projectId: string, report: SecurityReport) => void;
  setApiDocs: (projectId: string, docs: ApiDocumentation) => void;
  setDevOps: (projectId: string, config: DevOpsConfig) => void;
  setProcessingStages: (stages: ProcessingStage[]) => void;
  updateProcessingStage: (id: string, status: ProcessingStage['status'], progress?: number) => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Async Actions
  fetchProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  createProject: (name: string, description: string, requirements: string) => Promise<Project>;
  uploadUml: (name: string, description: string, file: File) => Promise<Project>;
  generateArchitecture: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  processingStages: [],
  isLoading: false,
  isSidebarCollapsed: false,
  error: null,

  // Actions
  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  setCurrentProject: (project) => set({ currentProject: project }),

  updateProjectStatus: (id, status) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, status, updatedAt: new Date().toISOString() }
          : state.currentProject,
    })),

  setArchitecture: (projectId, architecture) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, architecture } : p
      );
      const updatedCurrent =
        state.currentProject?.id === projectId
          ? { ...state.currentProject, architecture }
          : state.currentProject;
      return { projects: updatedProjects, currentProject: updatedCurrent };
    }),

  setSecurityReport: (projectId, report) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, securityReport: report } : p
      );
      const updatedCurrent =
        state.currentProject?.id === projectId
          ? { ...state.currentProject, securityReport: report }
          : state.currentProject;
      return { projects: updatedProjects, currentProject: updatedCurrent };
    }),

  setApiDocs: (projectId, docs) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, apiDocs: docs } : p
      );
      const updatedCurrent =
        state.currentProject?.id === projectId
          ? { ...state.currentProject, apiDocs: docs }
          : state.currentProject;
      return { projects: updatedProjects, currentProject: updatedCurrent };
    }),

  setDevOps: (projectId, config) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, devOps: config } : p
      );
      const updatedCurrent =
        state.currentProject?.id === projectId
          ? { ...state.currentProject, devOps: config }
          : state.currentProject;
      return { projects: updatedProjects, currentProject: updatedCurrent };
    }),

  setProcessingStages: (stages) => set({ processingStages: stages }),

  updateProcessingStage: (id, status, progress) =>
    set((state) => ({
      processingStages: state.processingStages.map((s) =>
        s.id === id ? { ...s, status, progress: progress ?? s.progress } : s
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.projects.list();
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      let project = get().projects.find(p => p.id === id);
      if (!project || project.status !== 'completed') {
        project = await api.projects.get(id);
      }
      set({ currentProject: project, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProject: async (name, description, requirements) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.projects.create({ name, description, requirements });
      set(state => ({ 
        projects: [project, ...state.projects],
        currentProject: project,
        isLoading: false 
      }));
      return project;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  uploadUml: async (name, description, file) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.projects.uploadUml(name, description, file);
      set(state => ({ 
        projects: [project, ...state.projects],
        currentProject: project,
        isLoading: false 
      }));
      return project;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  generateArchitecture: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await api.architecture.generate(projectId);
      
      set(state => {
        const updatedProjects = state.projects.map(p => 
          p.id === projectId ? { ...p, status: 'generating' as ProjectStatus } : p
        );
        const updatedCurrent = state.currentProject?.id === projectId 
          ? { ...state.currentProject, status: 'generating' as ProjectStatus } 
          : state.currentProject;
          
        return {
          projects: updatedProjects,
          currentProject: updatedCurrent,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

// Selector hooks for performance
export const useCurrentProject = () => useProjectStore((s) => s.currentProject);
export const useProjects = () => useProjectStore((s) => s.projects);
export const useIsLoading = () => useProjectStore((s) => s.isLoading);
export const useSidebarCollapsed = () => useProjectStore((s) => s.isSidebarCollapsed);
