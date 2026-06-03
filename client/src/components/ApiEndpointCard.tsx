import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';
import type { ApiEndpoint } from '../types';
import GlassCard from './ui/GlassCard';

interface ApiEndpointCardProps {
  endpoint: ApiEndpoint;
}

export const ApiEndpointCard: React.FC<ApiEndpointCardProps> = ({ endpoint }) => {
  const [expanded, setExpanded] = useState(false);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST': return 'bg-electric-blue/20 text-electric-blue border-electric-blue/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'PATCH': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <GlassCard className="overflow-hidden transition-all duration-300">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 text-xs font-bold rounded uppercase border ${getMethodColor(endpoint.method)} min-w-[70px] text-center`}>
            {endpoint.method}
          </span>
          <span className="font-mono text-gray-200">{endpoint.path}</span>
          {endpoint.auth && (
            <div title="Authentication Required" className="flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400 hidden md:block truncate max-w-md">
            {endpoint.description}
          </span>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-white/10 bg-navy-900/50">
          <p className="text-gray-300 mb-6 md:hidden">{endpoint.description}</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Parameters</h4>
              {endpoint.parameters && endpoint.parameters.length > 0 ? (
                <div className="space-y-2">
                  {endpoint.parameters.map((param, idx) => (
                    <div key={idx} className="flex flex-col bg-navy-800 rounded p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-electric-blue text-sm">{param.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{param.in}</span>
                          {param.required && <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">required</span>}
                        </div>
                      </div>
                      <span className="text-xs text-purple-400 font-mono mb-1">{param.type}</span>
                      <span className="text-sm text-gray-400">{param.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No parameters</p>
              )}
            </div>

            <div className="space-y-6">
              {endpoint.requestBody && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Request Body</h4>
                  <pre className="bg-[#1e1e1e] p-3 rounded-lg text-sm text-gray-300 overflow-x-auto font-mono border border-white/10">
                    {JSON.stringify(endpoint.requestBody, null, 2)}
                  </pre>
                </div>
              )}
              
              {endpoint.responses && endpoint.responses.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Response</h4>
                  <pre className="bg-[#1e1e1e] p-3 rounded-lg text-sm text-emerald-400 overflow-x-auto font-mono border border-white/10">
                    {JSON.stringify(endpoint.responses[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
