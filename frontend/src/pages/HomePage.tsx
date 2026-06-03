import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  Shield, Cpu, Database, Lock, FileCode, GitBranch,
  ArrowRight, Zap, CheckCircle2, ChevronRight,
  Code2, Globe, Layers, Sparkles, Terminal,
  Activity, BarChart3, AlertTriangle, Eye, Server,
  Network, CloudLightning, Fingerprint, Radio, Radar
} from 'lucide-react';
import ReactorCore from '../components/ReactorCore';

/* ─── Data ──────────────────────────────────────────────────────────────── */
const PIPELINE_STAGES = [
  { icon: FileCode,       label: 'Requirements',     color: '#00D4FF', desc: 'Parse UML & natural language' },
  { icon: Cpu,            label: 'AI Analysis',       color: '#8B5CF6', desc: 'Groq neural processing' },
  { icon: Shield,         label: 'Threat Detection',  color: '#ff4757', desc: 'STRIDE vulnerability scan' },
  { icon: Layers,         label: 'Synthesis',         color: '#00FF88', desc: 'Architecture generation' },
  { icon: Code2,          label: 'Code Generation',   color: '#00D4FF', desc: 'TypeScript microservices' },
  { icon: GitBranch,      label: 'Deployment Ready',  color: '#8B5CF6', desc: 'Docker + CI/CD pipeline' },
];

const STRIDE_ITEMS = [
  { letter: 'S', name: 'Spoofing',              color: '#ff4757', icon: Fingerprint,     risk: 'HIGH',   desc: 'Identity impersonation via stolen JWT tokens and session hijacking attacks' },
  { letter: 'T', name: 'Tampering',             color: '#ffa502', icon: AlertTriangle,   risk: 'MEDIUM', desc: 'Unauthorized data modification bypassing input validation middleware' },
  { letter: 'R', name: 'Repudiation',           color: '#8B5CF6', icon: Eye,             risk: 'LOW',    desc: 'Lack of audit trails enabling users to deny performing critical actions' },
  { letter: 'I', name: 'Info Disclosure',       color: '#00D4FF', icon: Radio,           risk: 'HIGH',   desc: 'Sensitive data exposed through verbose error messages and debug endpoints' },
  { letter: 'D', name: 'Denial of Service',     color: '#ff6b81', icon: CloudLightning,  risk: 'CRITICAL', desc: 'Resource exhaustion via unprotected endpoints lacking rate limiting' },
  { letter: 'E', name: 'Elevation of Privilege',color: '#00FF88', icon: Lock,            risk: 'HIGH',   desc: 'RBAC bypass enabling unauthorized access to admin-level operations' },
];

const TECH_STACK = [
  { name: 'Groq AI', color: '#FF6B35', desc: 'llama-3.3-70b', icon: '🤖' },
  { name: 'Node.js', color: '#539E43', desc: 'v20 LTS', icon: '⬡' },
  { name: 'TypeScript', color: '#007ACC', desc: 'v5.3', icon: 'TS' },
  { name: 'PostgreSQL', color: '#336791', desc: 'v16', icon: '🐘' },
  { name: 'Prisma ORM', color: '#2D3748', desc: 'v5.x', icon: '◆' },
  { name: 'Docker', color: '#0db7ed', desc: 'Containerized', icon: '🐳' },
  { name: 'GitHub Actions', color: '#2088FF', desc: 'CI/CD', icon: '⚡' },
  { name: 'JWT', color: '#D63AFF', desc: 'RS256', icon: '🔑' },
  { name: 'Express.js', color: '#ffffff', desc: 'v4.x', icon: '⚡' },
  { name: 'bcrypt', color: '#FF5E5B', desc: '12 rounds', icon: '🔐' },
];

const METRICS = [
  { label: 'Architectures Generated', value: '2,847', icon: Layers,     color: '#00D4FF', suffix: '+' },
  { label: 'Security Score Avg',       value: '94',    icon: Shield,     color: '#00FF88', suffix: '/100' },
  { label: 'Threats Prevented',        value: '12,400',icon: AlertTriangle, color: '#ff4757', suffix: '+' },
  { label: 'APIs Generated',           value: '45,000',icon: Globe,      color: '#8B5CF6', suffix: '+' },
];

const FEATURES = [
  { icon: Cpu,          title: 'AI Requirement Analyzer', desc: 'Parse UML diagrams and natural language requirements into structured architectures using Groq AI', color: '#00D4FF' },
  { icon: Code2,        title: 'Architecture Synthesis',  desc: 'Generate TypeScript microservices with controllers, routes, services, models, and middleware', color: '#8B5CF6' },
  { icon: Database,     title: 'Database Generator',      desc: 'PostgreSQL schemas and Prisma ORM models with indexes, relations, and migrations', color: '#00FF88' },
  { icon: Lock,         title: 'Security Generator',      desc: 'JWT auth, RBAC, bcrypt, rate limiting, helmet, input validation — auto-generated', color: '#ff4757' },
  { icon: Shield,       title: 'AI Security Auditor',     desc: 'Detect SQL injection, broken access control, weak policies with a 0–100 security score', color: '#ffa502' },
  { icon: Radar,        title: 'STRIDE Threat Modeling',  desc: 'Full STRIDE analysis with risk levels, CVE scores, and prioritized mitigations', color: '#ff6b81' },
  { icon: FileCode,     title: 'Swagger / OpenAPI Docs',  desc: 'Auto-generated API documentation with endpoints, schemas, and auth requirements', color: '#00FF88' },
  { icon: Globe,        title: 'Architecture Diagrams',   desc: 'ER, class, service dependency, sequence, and data flow diagrams via Mermaid', color: '#00D4FF' },
  { icon: GitBranch,    title: 'DevOps Generator',        desc: 'Dockerfiles, docker-compose, GitHub Actions CI/CD, Nginx configs — production-ready', color: '#8B5CF6' },
];

/* ─── Animated Counter ──────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const numStr = target.replace(/[^0-9]/g, '');
        const num = parseInt(numStr);
        const comma = target.includes(',');
        let current = 0;
        const step = Math.max(1, Math.floor(num / 60));
        const t = setInterval(() => {
          current += step;
          if (current >= num) { current = num; clearInterval(t); }
          setDisplay(comma ? current.toLocaleString() : String(current));
        }, 25);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="text-4xl xl:text-5xl font-black orbitron text-neon">{display}{suffix}</div>;
}

/* ─── STRIDE Radar ──────────────────────────────────────────────────────── */
function StrideRadar() {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Rings */}
      {[1, 0.65, 0.35].map((scale, i) => (
        <div key={i} className="absolute inset-0 rounded-full border"
          style={{
            borderColor: i === 0 ? 'rgba(0,212,255,0.2)' : 'rgba(0,212,255,0.1)',
            transform: `scale(${scale})`,
            top: `${(1 - scale) * 50}%`,
            left: `${(1 - scale) * 50}%`,
            right: `${(1 - scale) * 50}%`,
            bottom: `${(1 - scale) * 50}%`,
          }} />
      ))}
      {/* Radar sweep */}
      <div className="absolute inset-0 rounded-full overflow-hidden animate-radar">
        <div className="absolute inset-0 origin-center"
          style={{
            background: 'conic-gradient(from 0deg, rgba(0,212,255,0.15) 0deg, rgba(0,212,255,0.05) 60deg, transparent 90deg)',
          }} />
      </div>
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-neon-blue animate-pulse-blue"
          style={{ background: '#00D4FF', boxShadow: '0 0 10px #00D4FF' }} />
      </div>
      {/* Radar label */}
      <div className="absolute -bottom-8 w-full text-center text-xs font-mono text-white/30">THREAT RADAR</div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
  const [activePipeline, setActivePipeline] = useState(0);
  const [activeStride, setActiveStride] = useState<number | null>(null);

  // Animate pipeline stage
  useEffect(() => {
    const t = setInterval(() => setActivePipeline(p => (p + 1) % PIPELINE_STAGES.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative flex flex-col">

      {/* ════════════════════════════════════════════════
           HERO SECTION
          ════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center py-20 px-6 overflow-hidden">

        {/* Holographic grid */}
        <div className="absolute inset-0 grid-overlay opacity-40" />

        {/* Radial backdrop glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[5%] w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] right-[0%] w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
          <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)' }} />
          {/* Scan line */}
          <div className="absolute inset-0 scanlines opacity-10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT: Text content */}
            <div className="space-y-8 animate-fade-up">

              {/* Status badge */}
              <div className="section-badge w-fit animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" style={{ background: '#00FF88' }} />
                Powered by Groq AI · llama-3.3-70b · LIVE
              </div>

              {/* Main heading */}
              <div>
                <h1 className="font-black leading-[0.9] tracking-tight">
                  <span className="block text-5xl sm:text-6xl xl:text-7xl text-white orbitron">
                    SECURE
                  </span>
                  <span className="block text-5xl sm:text-6xl xl:text-7xl text-neon orbitron">
                    FORGE
                  </span>
                  <span className="block text-5xl sm:text-6xl xl:text-7xl" style={{ color: 'rgba(248,250,252,0.4)' }}>
                    AI
                  </span>
                </h1>
              </div>

              {/* Tagline */}
              <div className="glass-blue rounded-xl px-5 py-3 w-fit animate-fade-in delay-200">
                <p className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#00D4FF', fontFamily: 'Orbitron, sans-serif' }}>
                  Design Less · Secure More · Deploy Faster
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-white/55 leading-relaxed max-w-xl animate-fade-in delay-300">
                Transform UML diagrams and software requirements into{' '}
                <span className="text-neon-blue font-semibold">secure, production-ready architectures</span>{' '}
                powered by artificial intelligence. Full backend, security audit, STRIDE threats,
                and DevOps — in under 5 minutes.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-in delay-400">
                <button id="hero-forge-btn" onClick={() => navigate('/workspace')}
                  className="btn-primary text-base px-8 py-4">
                  <Shield className="w-5 h-5" />
                  Generate Architecture
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button id="hero-demo-btn" onClick={() => navigate('/workspace?demo=E-Commerce Platform')}
                  className="btn-outline text-base px-8 py-4">
                  <Terminal className="w-5 h-5" />
                  Watch Live Demo
                </button>
                <button id="hero-explore-btn"
                  onClick={() => document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-ghost-cyber text-base px-8 py-4">
                  <Zap className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  Security Engine
                </button>
              </div>

              {/* Tech pills */}
              <div className="flex flex-wrap gap-2 animate-fade-in delay-500">
                {['TypeScript', 'PostgreSQL', 'Prisma', 'JWT Auth', 'Docker', 'Express.js'].map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-mono font-medium"
                    style={{ border: '1px solid rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.6)', background: 'rgba(0,212,255,0.04)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Reactor */}
            <div className="flex items-center justify-center animate-fade-in delay-300">
              <div className="relative">
                <ReactorCore />
                {/* Labels around reactor */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-center">
                  <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">AI CORE ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow">
            <span className="text-[10px] font-mono text-white/25 tracking-widest">SCROLL</span>
            <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.4), transparent)' }} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           METRICS DASHBOARD
          ════════════════════════════════════════════════ */}
      <section className="py-16 px-6 relative" style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(0,212,255,0.08)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {METRICS.map((m, i) => (
            <div key={i} className="metric-card animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-2 mb-3">
                <m.icon className="w-4 h-4" style={{ color: m.color }} />
                <span className="text-xs text-white/40 font-medium">{m.label}</span>
              </div>
              <AnimatedCounter target={m.value} suffix={m.suffix} />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           AI PIPELINE SECTION
          ════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)' }} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4 animate-fade-up">
            <div className="section-badge mx-auto w-fit">
              <Cpu className="w-3.5 h-3.5" />
              AI Architecture Pipeline
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              From Requirements to{' '}
              <span className="text-neon">Production</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Six sequential AI stages transform your input into a complete, audited architecture
            </p>
          </div>

          {/* Pipeline */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-9 left-[8%] right-[8%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), rgba(139,92,246,0.2), rgba(0,255,136,0.2), transparent)' }}>
              {/* Traveling dot */}
              <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-particle-flow"
                style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={i}
                  className="pipeline-node animate-fade-up cursor-pointer"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => setActivePipeline(i)}
                >
                  <div
                    className="pipeline-node-icon w-20 h-20 rounded-2xl"
                    style={{
                      background: activePipeline === i ? `${stage.color}15` : 'rgba(0,0,0,0.3)',
                      borderColor: activePipeline === i ? `${stage.color}50` : 'rgba(255,255,255,0.06)',
                      boxShadow: activePipeline === i ? `0 0 30px ${stage.color}30` : 'none',
                      transform: activePipeline === i ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.4s',
                    }}
                  >
                    <stage.icon className="w-8 h-8" style={{ color: activePipeline === i ? stage.color : 'rgba(255,255,255,0.3)' }} />
                    {/* Step number */}
                    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: activePipeline === i ? stage.color : 'rgba(255,255,255,0.1)',
                        color: activePipeline === i ? '#000' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'Orbitron, sans-serif',
                      }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold text-white" style={{ color: activePipeline === i ? stage.color : 'rgba(248,250,252,0.7)' }}>
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-white/30 mt-0.5">{stage.desc}</div>
                  </div>

                  {/* Arrow */}
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-9 z-10">
                      <ChevronRight className="w-5 h-5 text-white/10" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active stage detail */}
            <div className="mt-10 glass-blue rounded-2xl p-6 transition-all duration-500 animate-scale-in">
              <div className="flex items-center gap-4">
                {(() => {
                  const s = PIPELINE_STAGES[activePipeline];
                  return (
                    <>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                        <s.icon className="w-6 h-6" style={{ color: s.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{s.label}</div>
                        <div className="text-xs text-white/40 mt-0.5">{s.desc}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: s.color }} />
                        <span className="text-xs font-mono" style={{ color: s.color }}>PROCESSING</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="cyber-progress mt-4">
                <div className="cyber-progress-fill animate-shimmer" style={{ width: `${(activePipeline + 1) / PIPELINE_STAGES.length * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           SECURITY DASHBOARD
          ════════════════════════════════════════════════ */}
      <section id="security-section" className="py-28 px-6 relative overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.2), transparent)' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4 animate-fade-up">
            <div className="section-badge mx-auto w-fit"
              style={{ color: '#00FF88', background: 'rgba(0,255,136,0.06)', borderColor: 'rgba(0,255,136,0.2)' }}>
              <Shield className="w-3.5 h-3.5" />
              Security Audit Center
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Holographic{' '}
              <span className="text-cyber">Security Dashboard</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Real-time vulnerability analysis with AI-powered threat intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score widget */}
            <div className="glass-emerald rounded-2xl p-8 flex flex-col items-center gap-6 animate-fade-up">
              {/* Circular score */}
              <div className="relative w-36 h-36">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="72" cy="72" r="60" fill="none" stroke="rgba(0,255,136,0.1)" strokeWidth="8" />
                  <circle cx="72" cy="72" r="60" fill="none"
                    stroke="#00FF88" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60 * 0.94} ${2 * Math.PI * 60}`}
                    style={{ filter: 'drop-shadow(0 0 8px #00FF88)' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black orbitron" style={{ color: '#00FF88' }}>94</div>
                  <div className="text-xs text-white/40">/ 100</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">Security Score</div>
                <div className="badge badge-emerald mt-2">Grade A+</div>
              </div>
              {/* Bars */}
              {[
                { label: 'Authentication', pct: 96 },
                { label: 'Authorization',  pct: 91 },
                { label: 'Data Protection',pct: 88 },
                { label: 'API Security',   pct: 95 },
              ].map(bar => (
                <div key={bar.label} className="w-full space-y-1">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>{bar.label}</span>
                    <span style={{ color: '#00FF88' }}>{bar.pct}%</span>
                  </div>
                  <div className="cyber-progress">
                    <div className="cyber-progress-fill" style={{ width: `${bar.pct}%`, background: '#00FF88', boxShadow: '0 0 8px rgba(0,255,136,0.4)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Threat breakdown */}
            <div className="glass rounded-2xl p-6 space-y-4 animate-fade-up delay-100"
              style={{ borderColor: 'rgba(255,71,87,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" style={{ color: '#ff4757' }} />
                <span className="text-sm font-semibold text-white">Vulnerability Analysis</span>
              </div>

              {[
                { type: 'Critical', count: 0,  color: '#ff4757' },
                { type: 'High',     count: 1,  color: '#ffa502' },
                { type: 'Medium',   count: 3,  color: '#ffd43b' },
                { type: 'Low',      count: 7,  color: '#00FF88' },
                { type: 'Info',     count: 12, color: '#00D4FF' },
              ].map(v => (
                <div key={v.type} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: v.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60">{v.type}</span>
                      <span style={{ color: v.color }} className="font-bold">{v.count}</span>
                    </div>
                    <div className="cyber-progress h-1.5">
                      <div style={{
                        height: '100%', borderRadius: '100px', width: `${(v.count / 12) * 100}%`,
                        background: v.color, boxShadow: `0 0 6px ${v.color}60`, transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-white/[0.05] space-y-3">
                {[
                  { check: 'SQL Injection Protection',  pass: true },
                  { check: 'XSS Sanitization',          pass: true },
                  { check: 'CSRF Protection',            pass: true },
                  { check: 'Rate Limiting',              pass: true },
                  { check: 'Secrets in Codebase',       pass: false },
                ].map(c => (
                  <div key={c.check} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: c.pass ? '#00FF88' : '#ff4757' }} />
                    <span style={{ color: c.pass ? 'rgba(248,250,252,0.6)' : '#ff6b81' }}>{c.check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="glass-purple rounded-2xl p-6 space-y-5 animate-fade-up delay-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                <span className="text-sm font-semibold text-white">Compliance Status</span>
              </div>

              {[
                { std: 'OWASP Top 10',   score: 96, color: '#00FF88' },
                { std: 'CWE/SANS 25',    score: 92, color: '#00D4FF' },
                { std: 'GDPR Ready',     score: 88, color: '#8B5CF6' },
                { std: 'SOC 2 Type II',  score: 84, color: '#ffa502' },
                { std: 'ISO 27001',      score: 79, color: '#00D4FF' },
              ].map(c => (
                <div key={c.std} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">{c.std}</span>
                    <span style={{ color: c.color }} className="font-bold font-mono">{c.score}%</span>
                  </div>
                  <div className="cyber-progress">
                    <div className="cyber-progress-fill" style={{ width: `${c.score}%`, background: c.color, boxShadow: `0 0 6px ${c.color}40` }} />
                  </div>
                </div>
              ))}

              {/* Radar */}
              <div className="pt-4 flex justify-center">
                <StrideRadar />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           STRIDE THREAT MODELING
          ════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(255,71,87,0.04) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4 animate-fade-up">
            <div className="section-badge mx-auto w-fit"
              style={{ color: '#ff4757', background: 'rgba(255,71,87,0.06)', borderColor: 'rgba(255,71,87,0.2)' }}>
              <Radar className="w-3.5 h-3.5" />
              STRIDE Threat Modeling
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Holographic{' '}
              <span style={{
                background: 'linear-gradient(135deg, #ff4757, #ff6b81)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Threat Radar
              </span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Full STRIDE analysis with prioritized mitigations and CVE cross-references
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STRIDE_ITEMS.map((item, i) => (
              <div
                key={i}
                className="stride-card animate-fade-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  borderColor: activeStride === i ? `${item.color}30` : 'rgba(255,255,255,0.06)',
                  background: activeStride === i ? `${item.color}06` : 'var(--glass)',
                }}
                onMouseEnter={() => setActiveStride(i)}
                onMouseLeave={() => setActiveStride(null)}
              >
                {/* Background letter */}
                <div className="absolute top-3 right-4 text-6xl font-black opacity-[0.04] orbitron select-none"
                  style={{ color: item.color }}>
                  {item.letter}
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-3 relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.name}</div>
                    <div className={`badge text-[10px] mt-0.5 ${
                      item.risk === 'CRITICAL' ? 'badge-critical' :
                      item.risk === 'HIGH' ? 'badge-high' :
                      item.risk === 'MEDIUM' ? 'badge-medium' : 'badge-low'
                    }`}>
                      {item.risk}
                    </div>
                  </div>
                  {/* Pulse indicator */}
                  <div className="absolute top-0 right-0 w-2 h-2 rounded-full animate-pulse"
                    style={{ background: item.color }} />
                </div>

                <p className="text-xs text-white/40 leading-relaxed relative">{item.desc}</p>

                {/* Glow border on hover */}
                {activeStride === i && (
                  <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
                    style={{ boxShadow: `0 0 30px ${item.color}10, inset 0 0 30px ${item.color}05` }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           9 FEATURES GRID
          ════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="absolute inset-0 grid-overlay opacity-15" />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)' }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4 animate-fade-up">
            <div className="section-badge mx-auto w-fit"
              style={{ color: '#8B5CF6', background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              9 AI-Powered Modules
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Everything You Need to{' '}
              <span className="text-neon">Build & Secure</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              A complete AI-powered platform from requirements to production-ready deployment
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="cyber-card p-6 group animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${f.color}10`, border: `1px solid ${f.color}25` }}>
                    <f.icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1.5 transition-all group-hover:text-neon">{f.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           TECH STACK
          ════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4 animate-fade-up">
            <div className="section-badge mx-auto w-fit">
              <Server className="w-3.5 h-3.5" />
              Technology Stack
            </div>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Powered by{' '}
              <span className="text-neon">Enterprise-Grade</span>{' '}
              Technology
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TECH_STACK.map((tech, i) => (
              <div key={i} className="tech-card group animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${tech.color}15` }} />

                <div className="text-2xl font-black" style={{ color: tech.color, fontFamily: tech.icon.length <= 2 ? 'Orbitron, sans-serif' : 'inherit', fontSize: tech.icon.length <= 2 ? '14px' : '24px' }}>
                  {tech.icon}
                </div>
                <div className="text-xs font-bold text-white">{tech.name}</div>
                <div className="text-[10px] text-white/30 font-mono">{tech.desc}</div>

                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: `linear-gradient(90deg, transparent, ${tech.color}, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           OUTPUTS GRID
          ════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <h2 className="text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              What You Get
            </h2>
            <p className="text-white/35">Complete production-ready outputs every time</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              'TypeScript Microservices', 'Prisma ORM Schema', 'JWT + RBAC Auth',
              'REST API Endpoints', 'Swagger/OpenAPI Docs', 'Security Audit Report',
              'STRIDE Threat Model', 'Docker + CI/CD', 'Architecture Diagrams',
              'ER + Class Diagrams', 'Deployment Guide', 'Environment Templates',
            ].map((item, i) => (
              <div key={item} className="cyber-card p-3.5 flex items-center gap-3 group animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                </div>
                <span className="text-xs font-medium text-white/60 group-hover:text-white/90 transition-colors">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
           FINAL CTA
          ════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
          <div className="absolute inset-0 grid-overlay opacity-20" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center animate-fade-up">
          {/* Reactor mini */}
          <div className="flex justify-center mb-10">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border animate-spin-slow"
                style={{ borderColor: 'transparent', borderTopColor: '#00D4FF', boxShadow: '0 0 15px rgba(0,212,255,0.3)' }} />
              <div className="absolute inset-2 rounded-full border animate-spin-reverse"
                style={{ borderColor: 'transparent', borderTopColor: '#8B5CF6' }} />
              <div className="absolute inset-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <Shield className="w-5 h-5" style={{ color: '#00D4FF' }} />
              </div>
            </div>
          </div>

          <div className="glass-blue rounded-3xl p-14 relative overflow-hidden">
            <div className="absolute inset-0 grid-overlay opacity-10" />
            <div className="relative">
              <div className="section-badge mx-auto w-fit mb-6">
                <Shield className="w-3.5 h-3.5" />
                Zero setup · Just type your requirements
              </div>
              <h2 className="text-4xl xl:text-5xl font-black text-white mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Ready to Build the{' '}
                <span className="text-neon">Future</span>{' '}
                Securely?
              </h2>
              <p className="text-white/45 mb-10 max-w-lg mx-auto leading-relaxed">
                Transform your requirements into a complete, security-audited backend architecture
                in under 5 minutes. No boilerplate. No vulnerabilities. Just production-ready code.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button id="cta-generate" onClick={() => navigate('/workspace')}
                  className="btn-primary text-base px-12 py-5 animate-glow-pulse">
                  <Shield className="w-5 h-5" />
                  Launch SecureForge AI
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button id="cta-workspace" onClick={() => navigate('/workspace?demo=Hospital Management System')}
                  className="btn-outline text-base px-8 py-5">
                  <Zap className="w-5 h-5" />
                  Try Hospital Demo
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-10 text-xs text-white/25">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                  Free to use
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                  No account required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#00FF88' }} />
                  Instant results
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
