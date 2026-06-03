import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shield, Cpu, BookOpen, Menu, X, Zap, Palette, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home',      icon: Zap,      exact: true },
  { to: '/workspace', label: 'Workspace', icon: Cpu },
  { to: '/docs',      label: 'Docs',      icon: BookOpen },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme]         = useState(localStorage.getItem('sf_theme') || 'cyberpunk');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sf_theme', theme);
  }, [theme]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled
            ? 'rgba(5,8,22,0.9)'
            : 'rgba(5,8,22,0.3)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled
            ? '1px solid rgba(0,212,255,0.1)'
            : '1px solid transparent',
          boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <NavLink to="/" id="nav-logo" className="flex items-center gap-3 group">
              {/* Shield with animated rings */}
              <div className="relative w-9 h-9 flex items-center justify-center">
                <div className="absolute inset-0 rounded-xl animate-spin-slow"
                  style={{ border: '1px solid rgba(0,212,255,0.3)', borderTopColor: '#00D4FF' }} />
                <div className="absolute inset-1.5 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <Shield className="w-4 h-4" style={{ color: '#00D4FF' }} />
                </div>
              </div>
              <div>
                <div className="text-sm font-black orbitron tracking-wider"
                  style={{ color: '#F8FAFC', letterSpacing: '0.05em' }}>
                  SECURE<span className="text-neon" style={{ fontFamily: 'Orbitron, sans-serif' }}>FORGE</span>
                </div>
                <div className="text-[9px] tracking-[0.2em] uppercase font-medium"
                  style={{ color: 'rgba(0,212,255,0.4)' }}>
                  AI Platform
                </div>
              </div>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.exact}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* Theme Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setThemeOpen(!themeOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                  <Palette className="w-3.5 h-3.5" />
                  <span className="capitalize">{theme}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>
                
                {themeOpen && (
                  <div className="absolute right-0 top-full mt-2 w-32 rounded-xl py-1 z-50 glass"
                    style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
                    {[
                      { id: 'cyberpunk', label: 'Cyberpunk', color: '#00D4FF' },
                      { id: 'matrix',    label: 'Matrix',    color: '#00FF88' },
                      { id: 'synthwave', label: 'Synthwave', color: '#D63AFF' }
                    ].map(t => (
                      <button key={t.id}
                        onClick={() => { setTheme(t.id); setThemeOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
                        style={{ color: theme === t.id ? t.color : 'rgba(255,255,255,0.6)' }}>
                        <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(0,255,136,0.05)',
                  border: '1px solid rgba(0,255,136,0.15)',
                  color: '#00FF88',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF88' }} />
                LIVE
              </div>

              <NavLink to="/workspace" id="nav-cta" className="btn-primary py-2.5 px-5 text-sm">
                <Shield className="w-4 h-4" />
                Open Workspace
              </NavLink>
            </div>

            {/* Mobile burger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-xl text-white/60 hover:text-white transition-colors"
              style={{ border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.05)' }}
              id="nav-mobile-btn"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'all' : 'none' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(20px)' }}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className="absolute top-16 left-0 right-0 p-6 space-y-2"
          style={{ transform: menuOpen ? 'translateY(0)' : 'translateY(-12px)', transition: 'transform 0.3s' }}
        >
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-neon-blue border'
                    : 'text-white/50 hover:text-white border border-transparent hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(0,212,255,0.06)',
                borderColor: 'rgba(0,212,255,0.2)',
              } : {}}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}

          <div className="pt-4 border-t" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
            <NavLink to="/workspace" className="btn-primary w-full justify-center py-4">
              <Shield className="w-5 h-5" />
              Open Workspace
            </NavLink>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
