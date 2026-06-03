import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Key, Database, Activity, Lock, Fingerprint, Network, ChevronDown, ChevronUp } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import GlassCard from '../components/ui/GlassCard';
import { SecurityGauge } from '../components/SecurityGauge';
import { ThreatMatrix } from '../components/ThreatMatrix';
import type { SecurityFinding } from '../types';

export const SecurityDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentProject, loadProject } = useProjectStore();
  const [expandedFindings, setExpandedFindings] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  if (!currentProject || !currentProject.securityReport || !currentProject.securityReport.threatModel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { securityReport } = currentProject;
  const threatModel = securityReport.threatModel;
  
  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const toggleFinding = (id: string) => {
    setExpandedFindings(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };



  const categories = [
    { name: 'Authentication', score: 95, icon: <Fingerprint className="text-emerald-400" /> },
    { name: 'Data Protection', score: 88, icon: <Database className="text-cyan-400" /> },
    { name: 'Input Validation', score: 76, icon: <Activity className="text-amber-400" /> },
    { name: 'API Security', score: 92, icon: <Network className="text-electric-blue" /> },
    { name: 'Config Security', score: 85, icon: <Lock className="text-purple-400" /> },
    { name: 'Dependency Risk', score: 100, icon: <Shield className="text-emerald-400" /> }
  ];

  // Group findings by severity
  const findingsBySeverity = {
    critical: securityReport.findings.filter(f => f.severity === 'critical'),
    high: securityReport.findings.filter(f => f.severity === 'high'),
    medium: securityReport.findings.filter(f => f.severity === 'medium'),
    low: securityReport.findings.filter(f => f.severity === 'low')
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <GlassCard className="lg:w-1/3 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-electric-blue/10 rounded-full blur-[80px]"></div>
          
          <h2 className="text-xl font-bold mb-8 w-full text-left">Overall Security Posture</h2>
          
          <SecurityGauge 
            score={securityReport.overallScore} 
            grade={getGrade(securityReport.overallScore)} 
            size={280} 
          />
          
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-xs text-gray-400 uppercase">Findings</p>
              <p className="text-xl font-bold text-white">{securityReport.findings.length}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
              <p className="text-xs text-gray-400 uppercase">Threats</p>
              <p className="text-xl font-bold text-white">
                {threatModel.stride ? threatModel.stride.reduce((acc: number, cat: any) => acc + cat.total, 0) : 0}
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="lg:w-2/3">
          <h2 className="text-xl font-bold mb-4">Security Domains</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <GlassCard key={idx} className="p-4 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                <div className="p-3 bg-navy-900 rounded-full mb-3 border border-white/5">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Score</span>
                    <span className={cat.score > 80 ? 'text-emerald-400' : cat.score > 60 ? 'text-amber-400' : 'text-rose-400'}>{cat.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-navy-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.score > 80 ? 'bg-emerald-500' : cat.score > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${cat.score}%` }}
                    ></div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-purple-500 w-2 h-8 rounded-full mr-3"></span>
          STRIDE Threat Model
        </h2>
        <ThreatMatrix threatModel={threatModel} />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-rose-500 w-2 h-8 rounded-full mr-3"></span>
          Vulnerability Findings
        </h2>
        
        {securityReport.findings.length === 0 ? (
          <GlassCard className="p-8 text-center flex flex-col items-center">
            <Shield className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Vulnerabilities Found</h3>
            <p className="text-gray-400">The generated code passed all security checks.</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {['critical', 'high', 'medium', 'low'].map(severity => {
              const findings = findingsBySeverity[severity as keyof typeof findingsBySeverity];
              if (!findings || findings.length === 0) return null;
              
              return (
                <div key={severity} className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      severity === 'critical' ? 'bg-rose-500' : 
                      severity === 'high' ? 'bg-amber-500' : 
                      severity === 'medium' ? 'bg-purple-500' : 'bg-cyan-500'
                    }`}></span>
                    {severity} ({findings.length})
                  </h3>
                  <div className="space-y-3">
                    {findings.map((finding: SecurityFinding) => (
                      <GlassCard 
                        key={finding.id} 
                        className={`overflow-hidden transition-all duration-300 border-l-4 ${
                          severity === 'critical' ? 'border-l-rose-500 hover:border-white/20' : 
                          severity === 'high' ? 'border-l-amber-500 hover:border-white/20' : 
                          severity === 'medium' ? 'border-l-purple-500 hover:border-white/20' : 'border-l-cyan-500 hover:border-white/20'
                        }`}
                      >
                        <div 
                          className="p-4 cursor-pointer flex justify-between items-center bg-white/5 hover:bg-white/10"
                          onClick={() => toggleFinding(finding.id)}
                        >
                          <div className="flex items-center gap-4">
                            {severity === 'critical' || severity === 'high' ? (
                              <ShieldAlert className={`w-5 h-5 ${severity === 'critical' ? 'text-rose-500' : 'text-amber-500'}`} />
                            ) : (
                              <Shield className={`w-5 h-5 ${severity === 'medium' ? 'text-purple-500' : 'text-cyan-500'}`} />
                            )}
                            <div>
                              <h4 className="font-semibold text-white">{finding.title}</h4>
                              <p className="text-xs text-gray-400 mt-1">{finding.category} • {finding.location}</p>
                            </div>
                          </div>
                          <div>
                            {expandedFindings.includes(finding.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedFindings.includes(finding.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-navy-900/50"
                            >
                              <div className="p-5 border-t border-white/5 space-y-4">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</h5>
                                  <p className="text-sm text-gray-300 leading-relaxed">{finding.description}</p>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                                  <h5 className="text-xs font-semibold text-emerald-500 uppercase mb-2 flex items-center">
                                    <Key className="w-3 h-3 mr-1" /> Remediation
                                  </h5>
                                  <p className="text-sm text-emerald-100/90 leading-relaxed">{finding.remediation}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {securityReport.recommendations && securityReport.recommendations.length > 0 && (
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="bg-emerald-500 w-2 h-8 rounded-full mr-3"></span>
            Strategic AI Recommendations
          </h2>
          <GlassCard className="p-6 bg-gradient-to-br from-navy-800 to-navy-900 border-emerald-500/20">
            <ul className="space-y-3">
              {securityReport.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 mr-3 text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-gray-300 leading-relaxed">{rec.title}: {rec.description}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
};
