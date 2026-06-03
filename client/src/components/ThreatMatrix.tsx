import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import type { ThreatModel, Threat, Severity } from '../types';
import Badge from './ui/Badge';
import GlassCard from './ui/GlassCard';

interface ThreatMatrixProps {
  threatModel: ThreatModel;
}

export const ThreatMatrix: React.FC<ThreatMatrixProps> = ({ threatModel }) => {
  if (!threatModel || !threatModel.stride) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {threatModel.stride.map((category) => (
        <ThreatCategoryCard key={category.category} data={category} />
      ))}
    </div>
  );
};

interface ThreatCategoryCardProps {
  data: {
    category: string;
    threats: Threat[];
    mitigated: number;
    total: number;
  };
}

const ThreatCategoryCard: React.FC<ThreatCategoryCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'text-rose-500';
      case 'high': return 'text-amber-500';
      case 'medium': return 'text-purple-400';
      case 'low': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityCounts = () => {
    const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    data.threats.forEach(t => {
      if (counts[t.severity] !== undefined) {
        counts[t.severity]++;
      }
    });
    return counts;
  };

  const stats = getSeverityCounts();
  const hasHighRisk = stats.critical > 0 || stats.high > 0;
  const isFullyMitigated = data.mitigated === data.total && data.total > 0;

  return (
    <GlassCard 
      className={`h-full flex flex-col transition-all duration-300 ${
        hasHighRisk ? 'border-amber-500/30' : ''
      }`}
    >
      <div 
        className="p-5 flex flex-col cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isFullyMitigated ? 'bg-emerald-500/20 text-emerald-400' : hasHighRisk ? 'bg-amber-500/20 text-amber-400' : 'bg-electric-blue/20 text-electric-blue'}`}>
              {hasHighRisk && !isFullyMitigated ? <ShieldAlert className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-semibold text-white">{data.category}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-400">
              {data.mitigated} / {data.total} Mitigated
            </span>
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          </div>
        </div>

        <div className="flex space-x-2 mt-auto flex-wrap gap-y-2">
          {data.total > 0 && (
            <>
              <Badge variant="outline" severity="critical">Critical ({stats.critical})</Badge>
              <Badge variant="outline" severity="high">High ({stats.high})</Badge>
              <Badge variant="outline" severity="medium">Medium ({stats.medium})</Badge>
              <Badge variant="outline" severity="low">Low ({stats.low})</Badge>
            </>
          )}
          {data.total === 0 && <span className="text-sm text-gray-500">No threats identified</span>}
        </div>
      </div>

      <AnimatePresence>
        {expanded && data.threats.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-white/10 flex flex-col space-y-4">
              {data.threats.map((threat, idx) => (
                <div key={idx} className="bg-navy-900/50 rounded-lg p-4 border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white text-sm">{threat.title}</h4>
                    <span className={`text-xs font-semibold uppercase ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{threat.description}</p>
                  
                  {threat.mitigation && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 mt-3">
                      <p className="text-xs font-medium text-emerald-400 mb-1">Mitigation Strategy</p>
                      <p className="text-xs text-emerald-100/80">{threat.mitigation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
