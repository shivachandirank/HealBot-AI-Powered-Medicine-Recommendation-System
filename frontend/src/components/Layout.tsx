import { Outlet } from 'react-router-dom';
import { Shield, Github, ExternalLink, Cpu } from 'lucide-react';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-space flex flex-col" style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(0,212,255,0.06)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <Shield className="w-4 h-4" style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <div className="text-sm font-black orbitron" style={{ color: '#F8FAFC' }}>
                    SECURE<span style={{ color: '#00D4FF' }}>FORGE</span>
                    <span className="ml-1" style={{ color: 'rgba(0,212,255,0.4)' }}>AI</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/30 leading-relaxed">
                AI-Driven Secure Architecture Synthesizer. Transform requirements into production-ready, security-audited backend architectures.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium"
                style={{ color: '#00FF88', fontFamily: 'Orbitron, sans-serif', fontSize: '9px', letterSpacing: '0.15em' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF88' }} />
                DESIGN LESS · SECURE MORE · DEPLOY FASTER
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,212,255,0.4)' }}>
                Platform
              </div>
              <div className="space-y-2">
                {[
                  ['Workspace', '/workspace'],
                  ['E-Commerce Demo', '/workspace?demo=E-Commerce Platform'],
                  ['Hospital Demo', '/workspace?demo=Hospital Management System'],
                  ['SaaS CRM Demo', '/workspace?demo=SaaS CRM Platform'],
                ].map(([label, href]) => (
                  <a key={label} href={href}
                    className="block text-xs text-white/35 hover:text-neon-blue transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}>
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Powered by */}
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,212,255,0.4)' }}>
                Powered By
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Groq AI', desc: 'llama-3.3-70b-versatile', color: '#FF6B35' },
                  { name: 'Node.js + TypeScript', desc: 'Backend runtime', color: '#539E43' },
                  { name: 'PostgreSQL + Prisma', desc: 'Database layer', color: '#336791' },
                  { name: 'Docker + GitHub Actions', desc: 'DevOps pipeline', color: '#0db7ed' },
                ].map(t => (
                  <div key={t.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                    <div>
                      <span className="text-xs text-white/50">{t.name}</span>
                      <span className="text-[10px] text-white/25 ml-2">{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-[11px] text-white/20">
              © 2024 SecureForge AI · AI-Driven Secure Architecture Synthesizer
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[11px] font-mono"
                style={{ color: '#00FF88', background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)', padding: '4px 10px', borderRadius: '100px' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF88' }} />
                All Systems Operational
              </div>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/60 transition-colors">
                <Github className="w-3.5 h-3.5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
