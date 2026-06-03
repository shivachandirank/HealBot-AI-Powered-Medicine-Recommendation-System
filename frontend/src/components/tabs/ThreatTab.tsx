import { useState } from 'react';
import { Shield, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import type { StrideReport, StrideThreat, StrideCategory } from '../../types';

interface Props { report: StrideReport }

const STRIDE_COLORS: Record<StrideCategory, { bg: string; border: string; text: string; badge: string }> = {
  'Spoofing': { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  'Tampering': { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300 border-red-500/30' },
  'Repudiation': { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-300', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  'Information Disclosure': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-300', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  'Denial of Service': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-300', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  'Elevation of Privilege': { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-300', badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
};

const STRIDE_ABBR: Record<StrideCategory, string> = {
  'Spoofing': 'S',
  'Tampering': 'T',
  'Repudiation': 'R',
  'Information Disclosure': 'I',
  'Denial of Service': 'D',
  'Elevation of Privilege': 'E',
};

const STRIDE_DESCRIPTIONS: Record<StrideCategory, string> = {
  'Spoofing': 'Identity',
  'Tampering': 'Data',
  'Repudiation': 'Actions',
  'Information Disclosure': 'Confidentiality',
  'Denial of Service': 'Availability',
  'Elevation of Privilege': 'Authorization',
};

export default function ThreatTab({ report }: Props) {
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const threatsByCategory = (report.threats || []).reduce<Record<string, StrideThreat[]>>((acc, t) => {
    acc[t.category] = acc[t.category] || [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const filteredThreats = filterCategory === 'all'
    ? report.threats || []
    : (report.threats || []).filter(t => t.category === filterCategory);

  const riskBadge = (level: string) => {
    const map: Record<string, string> = {
      critical: 'badge-critical',
      high: 'badge-high',
      medium: 'badge badge-medium',
      low: 'badge badge-low',
    };
    return map[level] || 'badge-info';
  };

  const statusIcon = (status: string) => {
    if (status === 'mitigated') return <CheckCircle2 className="w-4 h-4 text-cyber-400" />;
    if (status === 'open') return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    return <Clock className="w-4 h-4 text-white/30" />;
  };

  const riskColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="p-5 space-y-6 max-h-[700px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{report.projectName}</h2>
          <p className="text-xs text-white/40">
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${
          report.overallRiskLevel === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
          report.overallRiskLevel === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-300' :
          report.overallRiskLevel === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
          'bg-green-500/10 border-green-500/30 text-green-300'
        }`}>
          {report.overallRiskLevel?.toUpperCase()} RISK
        </div>
      </div>

      {/* STRIDE Category Overview */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3">STRIDE Coverage</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(Object.keys(STRIDE_ABBR) as StrideCategory[]).map(cat => {
            const count = threatsByCategory[cat]?.length || 0;
            const colors = STRIDE_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                className={`${colors.bg} ${colors.border} border rounded-xl p-3 text-center transition-all hover:scale-105 ${
                  filterCategory === cat ? 'ring-2 ring-white/20' : ''
                }`}
              >
                <div className={`text-xl font-black ${colors.text}`}>{STRIDE_ABBR[cat]}</div>
                <div className={`text-xs font-bold ${colors.text}`}>{count}</div>
                <div className="text-[9px] text-white/30">{STRIDE_DESCRIPTIONS[cat]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      {report.mitigationSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Threats', value: report.mitigationSummary.totalThreats, color: 'text-white' },
            { label: 'Critical', value: report.mitigationSummary.criticalThreats, color: 'text-red-400' },
            { label: 'Open', value: report.mitigationSummary.openThreats, color: 'text-orange-400' },
            { label: 'Mitigated', value: report.mitigationSummary.mitigatedThreats, color: 'text-cyber-400' },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
              <div className={`text-2xl font-black ${item.color}`}>{item.value || 0}</div>
              <div className="text-xs text-white/40">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trust Boundaries */}
      {report.trustBoundaries?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-forge-400" />
            Trust Boundaries
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.trustBoundaries.map((boundary, i) => (
              <span key={i} className="badge badge-forge text-xs">{boundary}</span>
            ))}
          </div>
        </div>
      )}

      {/* Threat List */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3">
          Threats {filterCategory !== 'all' && `(${filterCategory})`} — {filteredThreats.length} found
        </h3>
        <div className="space-y-2">
          {filteredThreats.map((threat: StrideThreat) => {
            const colors = STRIDE_COLORS[threat.category] || STRIDE_COLORS['Spoofing'];
            return (
              <div key={threat.id} className="border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  id={`threat-${threat.id}`}
                  onClick={() => setExpandedThreat(expandedThreat === threat.id ? null : threat.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusIcon(threat.status)}
                    <span className={`badge border text-[9px] ${colors.badge}`}>
                      {STRIDE_ABBR[threat.category]}
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-white truncate">{threat.name}</div>
                    <div className="text-xs text-white/40 truncate">{threat.affectedComponent}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-lg font-black ${riskColor(threat.riskScore || 0)}`}>
                      {threat.riskScore?.toFixed(1) || '?'}
                    </span>
                    <span className={`badge ${riskBadge(threat.impact)} text-[10px]`}>{threat.impact}</span>
                    {expandedThreat === threat.id ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  </div>
                </button>
                {expandedThreat === threat.id && (
                  <div className="border-t border-white/[0.05] p-4 space-y-3 bg-black/20">
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-white/40">Likelihood</span>
                        <div className={`font-semibold ${riskColor(threat.likelihood === 'high' ? 8 : threat.likelihood === 'medium' ? 5 : 2)}`}>
                          {threat.likelihood}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40">Impact</span>
                        <div className={`font-semibold ${riskBadge(threat.impact).includes('critical') ? 'text-red-400' : 'text-orange-400'}`}>
                          {threat.impact}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40">CVSS</span>
                        <div className="font-semibold text-white">{threat.cvssScore?.toFixed(1) || 'N/A'}</div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-white/40 mb-1">Description</p>
                      <p className="text-sm text-white/70 leading-relaxed">{threat.description}</p>
                    </div>

                    {threat.attackVector && (
                      <div>
                        <p className="text-xs text-white/40 mb-1">Attack Vector</p>
                        <p className="text-sm text-orange-300">{threat.attackVector}</p>
                      </div>
                    )}

                    {threat.mitigations?.length > 0 && (
                      <div>
                        <p className="text-xs text-white/40 mb-2">Mitigations</p>
                        <ul className="space-y-1">
                          {threat.mitigations.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-cyber-300">
                              <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Controls */}
      {report.mitigationSummary?.securityControls?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/70 mb-3">Active Security Controls</h3>
          <div className="flex flex-wrap gap-2">
            {report.mitigationSummary.securityControls.map((ctrl, i) => (
              <span key={i} className="badge badge-cyber text-xs">{ctrl}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
