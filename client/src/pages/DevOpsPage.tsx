import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Settings, Container as DockerIcon } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import TabGroup from '../components/ui/TabGroup';
import GlassCard from '../components/ui/GlassCard';
import { CodeViewer } from '../components/CodeViewer';

export const DevOpsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProject, loadProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState('dockerfile');

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  if (!currentProject || !currentProject.devOps) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { devOps } = currentProject;

  const tabs = [
    { id: 'dockerfile', label: 'Dockerfile', icon: DockerIcon },
    { id: 'compose', label: 'Docker Compose', icon: Server },
    { id: 'ci', label: 'CI/CD Pipeline', icon: Server },
    { id: 'env', label: 'Environment', icon: Settings },
    { id: 'guide', label: 'Deployment Guide', icon: Server },
  ];

  const getFilesForTab = () => {
    switch (activeTab) {
      case 'dockerfile':
        return [{ path: 'Dockerfile', name: 'Dockerfile', content: devOps.dockerfile, language: 'dockerfile', size: devOps.dockerfile?.length || 0, type: 'other' as const }];
      case 'compose':
        return [{ path: 'docker-compose.yml', name: 'docker-compose.yml', content: devOps.dockerCompose, language: 'yaml', size: devOps.dockerCompose?.length || 0, type: 'other' as const }];
      case 'ci':
        return [{ path: '.github/workflows/ci.yml', name: 'ci.yml', content: devOps.githubActions, language: 'yaml', size: devOps.githubActions?.length || 0, type: 'other' as const }];
      case 'env':
        return [{ path: '.env.example', name: '.env.example', content: devOps.envTemplate, language: 'env', size: devOps.envTemplate?.length || 0, type: 'other' as const }];
      case 'guide':
        return [{ path: 'DEPLOYMENT.md', name: 'DEPLOYMENT.md', content: devOps.deploymentNotes, language: 'markdown', size: devOps.deploymentNotes?.length || 0, type: 'other' as const }];
      default:
        return [];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold mb-2 text-white">DevOps & Infrastructure</h1>
        <p className="text-gray-400">Production-ready configurations for deployment and continuous integration.</p>
      </div>

      <div className="mb-4 shrink-0">
        <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <GlassCard className="flex-1 min-h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <CodeViewer files={getFilesForTab()} />
        </div>
      </GlassCard>
    </motion.div>
  );
};
