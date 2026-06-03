import { useState } from 'react';
import { Users, Database, Link2, GitBranch, Shield, Globe, ChevronDown, ChevronRight } from 'lucide-react';
import type { AnalysisResult } from '../../types';

interface Props { analysis: AnalysisResult }

export default function AnalysisTab({ analysis }: Props) {
  const [expandedEntity, setExpandedEntity] = useState<string | null>(null);

  const methodBadgeColor = (m: string) => {
    const colors: Record<string, string> = {
      GET: 'text-green-300 bg-green-500/10 border-green-500/20',
      POST: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
      PUT: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
      PATCH: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
      DELETE: 'text-red-300 bg-red-500/10 border-red-500/20',
    };
    return colors[m.toUpperCase()] || 'text-white/50 bg-white/5 border-white/10';
  };

  return (
    <div className="p-5 space-y-6 max-h-[700px] overflow-y-auto">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Entities', value: analysis.entities.length, icon: Database, color: 'text-forge-400' },
          { label: 'Endpoints', value: analysis.apiEndpoints.length, icon: Globe, color: 'text-cyber-400' },
          { label: 'Use Cases', value: analysis.useCases.length, icon: Users, color: 'text-purple-400' },
          { label: 'Microservices', value: analysis.microservices.length || analysis.entities.length, icon: GitBranch, color: 'text-green-400' },
        ].map(item => (
          <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
            <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
            <div className="text-2xl font-bold text-white">{item.value}</div>
            <div className="text-xs text-white/40">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Entities */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-forge-400" />
          Data Entities
        </h3>
        <div className="space-y-2">
          {analysis.entities.map(entity => (
            <div key={entity.name} className="border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                id={`entity-${entity.name}`}
                onClick={() => setExpandedEntity(expandedEntity === entity.name ? null : entity.name)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-forge-500/15 flex items-center justify-center">
                    <Database className="w-3.5 h-3.5 text-forge-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">{entity.name}</span>
                  <span className="badge badge-forge text-[10px]">{entity.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">{entity.attributes.length} fields</span>
                  {expandedEntity === entity.name ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                </div>
              </button>
              {expandedEntity === entity.name && (
                <div className="border-t border-white/[0.05] p-3">
                  <div className="grid grid-cols-1 gap-1">
                    {entity.attributes.map(attr => (
                      <div key={attr.name} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.04] last:border-0">
                        <span className="text-cyan-400 font-mono w-16 flex-shrink-0">{attr.type}</span>
                        <span className="text-white/80 font-mono">{attr.name}</span>
                        {attr.required && <span className="badge badge-high text-[9px] ml-auto">required</span>}
                        {attr.unique && <span className="badge badge-info text-[9px]">unique</span>}
                        {attr.description && <span className="text-white/30 ml-auto truncate max-w-[100px]">{attr.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Relationships */}
      {analysis.relationships.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyber-400" />
            Relationships
          </h3>
          <div className="space-y-2">
            {analysis.relationships.map((rel, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-lg p-3 text-xs">
                <span className="font-mono text-forge-300 font-semibold">{rel.from}</span>
                <div className="flex-1 flex items-center gap-1 text-white/30">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] whitespace-nowrap">{rel.type}</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
                <span className="font-mono text-cyber-300 font-semibold">{rel.to}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Endpoints */}
      {analysis.apiEndpoints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-400" />
            API Endpoints ({analysis.apiEndpoints.length})
          </h3>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {analysis.apiEndpoints.map((ep, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5 text-xs">
                <span className={`badge text-[10px] flex-shrink-0 border ${methodBadgeColor(ep.method)}`}>
                  {ep.method}
                </span>
                <span className="font-mono text-white/70 flex-1 min-w-0 truncate">{ep.path}</span>
                {ep.auth && <Shield className="w-3 h-3 text-forge-400 flex-shrink-0 mt-0.5" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Requirements */}
      {analysis.securityRequirements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            Security Requirements
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.securityRequirements.map((req, i) => (
              <span key={i} className="badge badge-high text-xs">{req}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actors */}
      {analysis.actors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            System Actors
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.actors.map((actor, i) => (
              <span key={i} className="badge badge-forge">{actor}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
