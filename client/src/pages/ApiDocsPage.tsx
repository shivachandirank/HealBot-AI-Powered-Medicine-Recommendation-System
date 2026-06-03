import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Server, Lock, Download, ExternalLink } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import GlassCard from '../components/ui/GlassCard';
import { ApiEndpointCard } from '../components/ApiEndpointCard';
import type { ApiEndpoint } from '../types';

export const ApiDocsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProject, loadProject } = useProjectStore();

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  const endpointsByTag = useMemo(() => {
    if (!currentProject?.apiDocs?.groups) return {};
    
    return currentProject.apiDocs.groups.reduce((acc, group) => {
      acc[group.name] = group.endpoints;
      return acc;
    }, {} as Record<string, ApiEndpoint[]>);
  }, [currentProject]);

  if (!currentProject || !currentProject.apiDocs) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const info = { title: currentProject.name + ' API', version: currentProject.apiDocs.version, description: currentProject.apiDocs.description };
  
  const handleDownloadSpec = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProject.apiDocs, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}-openapi.json`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-electric-blue/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{info.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                v{info.version}
              </span>
            </div>
            <p className="text-gray-400 max-w-2xl text-lg">{info.description}</p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={handleDownloadSpec}
              className="flex items-center px-4 py-2 bg-navy-800 hover:bg-navy-700 border border-white/10 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              OpenAPI JSON
            </button>
            <button className="flex items-center px-4 py-2 bg-electric-blue/20 hover:bg-electric-blue/30 text-electric-blue border border-electric-blue/30 rounded-lg text-sm font-medium transition-colors">
              <ExternalLink className="w-4 h-4 mr-2" />
              Swagger UI
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-4 bg-navy-900/50 rounded-lg border border-white/5">
            <Server className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Base URL</p>
              <p className="text-sm font-mono text-gray-300">https://api.{currentProject.name.toLowerCase().replace(/\s+/g, '')}.com/v1</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-navy-900/50 rounded-lg border border-white/5">
            <Lock className="w-5 h-5 text-amber-400 mr-3" />
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Authentication</p>
              <p className="text-sm font-mono text-gray-300">Bearer Token (JWT)</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-12">
        {Object.entries(endpointsByTag).map(([tag, endpoints]) => (
          <div key={tag}>
            <h2 className="text-xl font-bold mb-4 flex items-center capitalize pb-2 border-b border-white/10">
              <span className="bg-electric-blue w-2 h-6 rounded-full mr-3"></span>
              {tag} Endpoints
            </h2>
            <div className="space-y-3 pl-5">
              {endpoints.map((endpoint: ApiEndpoint, idx: number) => (
                <ApiEndpointCard key={idx} endpoint={endpoint} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(endpointsByTag).length === 0 && (
        <GlassCard className="p-12 text-center text-gray-400">
          No endpoints found in the generated architecture.
        </GlassCard>
      )}
    </motion.div>
  );
};
