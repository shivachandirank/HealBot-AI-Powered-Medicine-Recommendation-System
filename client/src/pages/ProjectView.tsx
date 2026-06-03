import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Code2, GitMerge, FileBox, Database, Activity, Lock } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import TabGroup from '../components/ui/TabGroup';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { CodeViewer } from '../components/CodeViewer';
import { FileTree } from '../components/FileTree';
import { MermaidDiagram } from '../components/MermaidDiagram';
import type { FileTreeNode } from '../types';
import { api } from '../services/api';

export const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProject, loadProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState('code');
  const [selectedFile, setSelectedFile] = useState<string | undefined>();
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (id) {
      loadProject(id);
      
      // If project is generating, poll for updates
      interval = setInterval(() => {
        if (currentProject?.status === 'analyzing' || currentProject?.status === 'generating' || currentProject?.status === 'auditing') {
          loadProject(id);
        }
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, loadProject, currentProject?.status]);

  useEffect(() => {
    if (currentProject?.architecture?.files) {
      // Build file tree structure
      const root: FileTreeNode[] = [];
      const { files: generatedFiles } = currentProject.architecture;
      
      // Set initial selected file if not set
      if (!selectedFile && generatedFiles && generatedFiles.length > 0) {
        // Try to select an index.ts or app.ts first
        const mainFile = generatedFiles.find((f: any) => f.path.includes('index.ts') || f.path.includes('app.ts'));
        setSelectedFile(mainFile ? mainFile.path : generatedFiles[0].path);
      }

      if (generatedFiles) {
        generatedFiles.forEach((file: any) => {
          const parts = file.path.split('/');
          let currentLevel = root;
          
          parts.forEach((part: any, index: number) => {
          const isFile = index === parts.length - 1;
          let existingNode = currentLevel.find(n => n.name === part);
          
          if (!existingNode) {
            existingNode = {
              name: part,
              path: parts.slice(0, index + 1).join('/'),
              type: isFile ? 'file' : 'directory',
              children: isFile ? undefined : []
            };
            currentLevel.push(existingNode);
          }
          
          if (!isFile && existingNode.children) {
            currentLevel = existingNode.children;
          }
        });
      });
      }
      
      // Sort tree: directories first, then files alphabetically
      const sortTree = (nodes: FileTreeNode[]) => {
        nodes.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        nodes.forEach(node => {
          if (node.children) sortTree(node.children);
        });
      };
      
      sortTree(root);
      setFileTree(root);
    }
  }, [currentProject, selectedFile]);

  const handleDownload = async () => {
    if (!id) return;
    try {
      const blob = await api.downloadProject(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject?.name || 'project'}-secureforge.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download project:', error);
      alert('Failed to download project.');
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentProject.status !== 'completed' && currentProject.status !== 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-white">Generating Architecture...</h2>
        <p className="text-gray-400">Current status: <span className="text-electric-blue font-mono">{currentProject.status}</span></p>
        <p className="text-sm text-gray-500">This may take a few minutes as the AI processes your requirements.</p>
      </div>
    );
  }

  if (currentProject.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Generation Failed</h2>
        <p className="text-gray-400 max-w-md">There was an error generating the architecture. Please check the backend server logs. Make sure you have set a valid GROK_API_KEY in the server's .env file.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'code', label: 'Source Code', icon: Code2 },
    { id: 'diagrams', label: 'Architecture Diagrams', icon: GitMerge },
    { id: 'files', label: 'File Explorer', icon: FileBox },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{currentProject.name}</h1>
            <Badge variant="filled" severity="low">Generated</Badge>
          </div>
          <p className="text-gray-400">{currentProject.description}</p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-colors text-white"
        >
          <Download className="w-4 h-4 mr-2 text-electric-blue" />
          Download ZIP
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Entities</p>
            <p className="text-2xl font-bold text-white">{currentProject.architecture?.entities.length || 0}</p>
          </div>
          <Database className="w-8 h-8 text-cyan-500 opacity-80" />
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Endpoints</p>
            <p className="text-2xl font-bold text-white">
              {currentProject.apiDocs?.groups?.reduce((total, group) => total + group.endpoints.length, 0) || 0}
            </p>
          </div>
          <Activity className="w-8 h-8 text-emerald-500 opacity-80" />
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Files Generated</p>
            <p className="text-2xl font-bold text-white">{currentProject.architecture?.files?.length || 0}</p>
          </div>
          <FileBox className="w-8 h-8 text-electric-blue opacity-80" />
        </GlassCard>
        <GlassCard className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Security Score</p>
            <p className="text-2xl font-bold text-white">{currentProject.securityReport?.overallScore || 'N/A'}</p>
          </div>
          <Lock className="w-8 h-8 text-purple-500 opacity-80" />
        </GlassCard>
      </div>

      <div className="mb-4 shrink-0">
        <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-hidden min-h-[500px]">
        {activeTab === 'code' && (
          <div className="h-full flex gap-4">
            <GlassCard className="w-64 shrink-0 overflow-y-auto custom-scrollbar p-2 hidden md:block">
              <FileTree 
                nodes={fileTree} 
                selectedPath={selectedFile} 
                onSelect={setSelectedFile} 
              />
            </GlassCard>
            <div className="flex-1 h-full min-w-0">
              <CodeViewer 
                files={currentProject.architecture?.files || []} 
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
              />
            </div>
          </div>
        )}

        {activeTab === 'diagrams' && currentProject.architecture?.diagrams && (
          <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <GlassCard className="p-4 flex flex-col">
                <h3 className="font-semibold mb-4 text-gray-200 border-b border-white/10 pb-2">Entity Relationship</h3>
                <div className="flex-1 min-h-[300px] bg-navy-900/50 rounded border border-white/5 p-4 overflow-auto custom-scrollbar">
                  <MermaidDiagram chart={currentProject.architecture.diagrams.find(d => d.type === 'er')?.content || ''} />
                </div>
              </GlassCard>
              <GlassCard className="p-4 flex flex-col">
                <h3 className="font-semibold mb-4 text-gray-200 border-b border-white/10 pb-2">Service Architecture</h3>
                <div className="flex-1 min-h-[300px] bg-navy-900/50 rounded border border-white/5 p-4 overflow-auto custom-scrollbar">
                  <MermaidDiagram chart={currentProject.architecture.diagrams.find(d => d.type === 'service-dependency')?.content || ''} />
                </div>
              </GlassCard>
            </div>
            <GlassCard className="p-4">
              <h3 className="font-semibold mb-4 text-gray-200 border-b border-white/10 pb-2">Class Structure</h3>
              <div className="min-h-[400px] bg-navy-900/50 rounded border border-white/5 p-4 overflow-auto custom-scrollbar">
                <MermaidDiagram chart={currentProject.architecture.diagrams.find(d => d.type === 'class')?.content || ''} />
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'files' && (
          <GlassCard className="h-full p-4 overflow-y-auto custom-scrollbar">
             <div className="max-w-2xl mx-auto">
               <h3 className="font-semibold mb-6 text-gray-200 border-b border-white/10 pb-2 text-lg">Project Structure</h3>
               <FileTree nodes={fileTree} />
             </div>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
};
