import { useState } from 'react';
import {
  Shield, AlertTriangle, CheckCircle2, XCircle,
  ChevronDown, ChevronRight, ExternalLink, TrendingUp
} from 'lucide-react';
import type { SecurityAuditResult, Vulnerability } from '../../types';

interface Props { audit: SecurityAuditResult }

export default function SecurityTab({ audit }: Props) {
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const scoreColor = audit.score >= 80 ? 'text-cyber-400' : audit.score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreGradient = audit.score >= 80
    ? 'from-cyber-500 to-cyber-600'
    : audit.score >= 60
    ? 'from-yellow-500 to-orange-500'
    : 'from-red-500 to-red-600';

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  const filteredVulns = audit.vulnerabilities?.filter(v =>
    filterSeverity === 'all' || v.severity === filterSeverity
  ).sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)) || [];

  const severityBadge = (s: string) => {
    const map: Record<string, string> = {
      critical: 'badge-critical',
      high: 'badge-high',
      medium: 'badge badge-medium',
      low: 'badge badge-low',
    };
    return map[s] || 'badge-info';
  };

  return (
    <div className="p-5 space-y-6 max-h-[700px] overflow-y-auto">
      {/* Score Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Main score */}
        <div className="sm:col-span-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={audit.score >= 80 ? '#14b8a6' : audit.score >= 60 ? '#eab308' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(audit.score / 100) * 264} 264`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${scoreColor}`}>{audit.score}</span>
              <span className="text-xs text-white/40">/ 100</span>
            </div>
          </div>
          <div className={`text-3xl font-black ${scoreColor}`}>Grade {audit.grade}</div>
          <div className="text-sm text-white/50 mt-1">Security Score</div>
        </div>

        {/* Issue counts */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: 'Critical', value: audit.criticalIssues, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'High', value: audit.highIssues, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Medium', value: audit.mediumIssues, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Low', value: audit.lowIssues, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          ].map(item => (
            <div key={item.label} className={`${item.bg} border rounded-xl p-4 text-center`}>
              <div className={`text-3xl font-black ${item.color}`}>{item.value || 0}</div>
              <div className="text-xs text-white/50">{item.label} Issues</div>
            </div>
          ))}
        </div>
      </div>

      {/* Vulnerabilities */}
      {audit.vulnerabilities?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Vulnerabilities ({audit.vulnerabilities.length})
            </h3>
            <div className="flex gap-1">
              {['all', 'critical', 'high', 'medium', 'low'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterSeverity === s ? 'bg-forge-500/20 text-forge-300' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredVulns.map((vuln: Vulnerability) => (
              <div key={vuln.id} className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  id={`vuln-${vuln.id}`}
                  onClick={() => setExpandedVuln(expandedVuln === vuln.id ? null : vuln.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <span className={`badge ${severityBadge(vuln.severity)} flex-shrink-0`}>
                    {vuln.severity}
                  </span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-white truncate">{vuln.name}</div>
                    <div className="text-xs text-white/40 truncate">{vuln.category}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {vuln.cwe && (
                      <span className="text-[10px] text-white/30 font-mono">{vuln.cwe}</span>
                    )}
                    {expandedVuln === vuln.id ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  </div>
                </button>
                {expandedVuln === vuln.id && (
                  <div className="border-t border-white/[0.05] p-4 space-y-3 bg-black/20">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Description</p>
                      <p className="text-sm text-white/70 leading-relaxed">{vuln.description}</p>
                    </div>
                    {vuln.location && (
                      <div>
                        <p className="text-xs text-white/40 mb-1">Location</p>
                        <code className="text-xs text-forge-300 font-mono bg-forge-500/10 px-2 py-1 rounded">{vuln.location}</code>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-white/40 mb-1">Recommended Fix</p>
                      <p className="text-sm text-cyber-300 leading-relaxed">{vuln.fix}</p>
                    </div>
                    {(vuln.cwe || vuln.owasp) && (
                      <div className="flex gap-2">
                        {vuln.cwe && <span className="badge badge-info text-[10px]">{vuln.cwe}</span>}
                        {vuln.owasp && <span className="badge badge-high text-[10px]">{vuln.owasp}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {audit.recommendations?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyber-400" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {audit.recommendations.slice(0, 5).map((rec, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge text-[10px] border ${
                    rec.priority === 'immediate' ? 'badge-critical' :
                    rec.priority === 'high' ? 'badge-high' :
                    rec.priority === 'medium' ? 'badge-medium' : 'badge-low'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-sm font-semibold text-white">{rec.title}</span>
                </div>
                <p className="text-xs text-white/50 mb-2">{rec.description}</p>
                {rec.implementation && (
                  <code className="block text-xs text-cyber-300 font-mono bg-black/30 border border-white/[0.05] rounded-lg p-2 whitespace-pre-wrap">
                    {rec.implementation.substring(0, 200)}
                    {rec.implementation.length > 200 ? '...' : ''}
                  </code>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed checks */}
      {audit.passedChecks?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyber-400" />
            Passed Security Checks ({audit.passedChecks.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {audit.passedChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/50 bg-cyber-500/5 border border-cyber-500/10 rounded-lg p-2.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyber-400 flex-shrink-0" />
                {check}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
