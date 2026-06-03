import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

const BOOT_LINES = [
  { text: 'Initializing AI Architecture Engine...', delay: 400 },
  { text: 'Loading Security Modules...', delay: 900 },
  { text: 'Analyzing Threat Landscape...', delay: 1400 },
  { text: 'Connecting to Groq Neural Network...', delay: 1900 },
  { text: 'Preparing Deployment Environment...', delay: 2400 },
  { text: 'Calibrating STRIDE Analyzer...', delay: 2900 },
  { text: '> ALL SYSTEMS OPERATIONAL', delay: 3300 },
];

interface Props { onComplete: () => void; }

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 1.4;
      });
    }, 50);

    // Boot lines
    BOOT_LINES.forEach(({ text, delay }) => {
      setTimeout(() => setVisibleLines(l => [...l, text]), delay);
    });

    // Complete
    setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        setFade(true);
        setTimeout(onComplete, 600);
      }, 400);
    }, 3700);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: '#050816',
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-30" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Scan lines */}
      <div className="absolute inset-0 scanlines opacity-20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 max-w-lg w-full px-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Reactor orb */}
          <div className="relative w-28 h-28">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border-2 animate-spin-slow"
              style={{ borderColor: 'rgba(0,212,255,0.2)', borderTopColor: '#00D4FF' }} />
            <div className="absolute inset-3 rounded-full border animate-spin-reverse"
              style={{ borderColor: 'rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6' }} />
            <div className="absolute inset-6 rounded-full border animate-spin-med"
              style={{ borderColor: 'rgba(0,255,136,0.15)', borderTopColor: '#00FF88' }} />
            {/* Core */}
            <div className="absolute inset-9 rounded-full flex items-center justify-center animate-pulse-glow"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, rgba(0,212,255,0.1) 60%, transparent 100%)' }}>
              <Shield className="w-6 h-6" style={{ color: '#00D4FF' }} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <div className="text-3xl font-black orbitron text-neon tracking-widest">
              SECUREFORGE
            </div>
            <div className="text-sm font-medium tracking-[0.3em] text-white/40 uppercase mt-1">
              AI Architecture Synthesizer
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full space-y-2 animate-fade-in delay-300">
          <div className="cyber-progress w-full h-1">
            <div className="cyber-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs font-mono text-white/30">
            <span>BOOTING SYSTEMS</span>
            <span style={{ color: progress >= 100 ? '#00FF88' : '#00D4FF' }}>
              {Math.min(Math.round(progress), 100)}%
            </span>
          </div>
        </div>

        {/* Boot log */}
        <div className="w-full glass-blue rounded-xl p-5 font-mono text-xs space-y-1.5 min-h-[160px] animate-fade-in delay-300">
          <div className="text-white/30 mb-3 text-[10px] tracking-widest uppercase">
            ▶ SYSTEM BOOT LOG
          </div>
          {visibleLines.map((line, i) => (
            <div key={i} className="flex items-start gap-2"
              style={{
                color: line.startsWith('>') ? '#00FF88' : '#00D4FF',
                animation: 'fadeUp 0.3s ease both',
              }}>
              <span className="text-white/20 flex-shrink-0">{'>'}</span>
              <span>{line}</span>
            </div>
          ))}
          {visibleLines.length < BOOT_LINES.length && (
            <div className="flex items-center gap-1">
              <span className="text-white/20">{'>'}</span>
              <span className="w-2 h-3 bg-neon-blue animate-pulse" style={{ background: '#00D4FF' }} />
            </div>
          )}
        </div>

        {/* Status */}
        {done && (
          <div className="text-center animate-scale-in" style={{ color: '#00FF88' }}>
            <div className="text-lg font-black orbitron tracking-widest">READY</div>
            <div className="text-xs text-white/40 mt-1">Design Less. Secure More. Deploy Faster.</div>
          </div>
        )}
      </div>
    </div>
  );
}
