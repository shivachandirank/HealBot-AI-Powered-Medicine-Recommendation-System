/* 3D CSS Reactor Core — No external dependencies */
export default function ReactorCore() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340 }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full animate-pulse-glow"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)' }} />

      {/* Outer orbital ring */}
      <div className="absolute inset-0 rounded-full animate-spin-slow"
        style={{
          border: '1px solid rgba(0,212,255,0.15)',
          boxShadow: '0 0 20px rgba(0,212,255,0.1), inset 0 0 20px rgba(0,212,255,0.05)',
        }}>
        {/* Orbital node */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
          style={{ background: '#00D4FF', boxShadow: '0 0 15px #00D4FF, 0 0 30px rgba(0,212,255,0.5)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full"
          style={{ background: '#8B5CF6', boxShadow: '0 0 12px #8B5CF6' }} />
      </div>

      {/* Mid ring 1 */}
      <div className="absolute rounded-full animate-spin-reverse"
        style={{
          inset: '32px',
          border: '1px solid rgba(139,92,246,0.25)',
          borderTopColor: '#8B5CF6',
          borderBottomColor: 'rgba(139,92,246,0.5)',
          boxShadow: '0 0 15px rgba(139,92,246,0.15)',
        }}>
        <div className="absolute top-0 right-8 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{ background: '#8B5CF6', boxShadow: '0 0 10px #8B5CF6' }} />
      </div>

      {/* Mid ring 2 */}
      <div className="absolute rounded-full animate-spin-med"
        style={{
          inset: '60px',
          border: '1px solid rgba(0,255,136,0.2)',
          borderLeftColor: '#00FF88',
          boxShadow: '0 0 12px rgba(0,255,136,0.1)',
        }}>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
          style={{ background: '#00FF88', boxShadow: '0 0 10px #00FF88' }} />
      </div>

      {/* Inner ring */}
      <div className="absolute rounded-full animate-spin-slow"
        style={{
          inset: '88px',
          border: '1px solid rgba(97,113,241,0.3)',
          borderRightColor: '#6171f1',
          boxShadow: '0 0 10px rgba(97,113,241,0.15)',
          animationDirection: 'reverse',
          animationDuration: '5s',
        }} />

      {/* Core shield */}
      <div className="absolute rounded-full flex items-center justify-center animate-orb-pulse"
        style={{
          inset: '108px',
          background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, rgba(0,212,255,0.05) 50%, transparent 100%)',
          border: '1px solid rgba(0,212,255,0.4)',
          boxShadow: '0 0 40px rgba(0,212,255,0.3), inset 0 0 40px rgba(0,212,255,0.1)',
        }}>
        {/* Inner hex */}
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
          <polygon points="35,5 62,20 62,50 35,65 8,50 8,20"
            stroke="rgba(0,212,255,0.6)" strokeWidth="1" fill="rgba(0,212,255,0.05)" />
          <polygon points="35,15 52,25 52,45 35,55 18,45 18,25"
            stroke="rgba(139,92,246,0.4)" strokeWidth="0.5" fill="rgba(139,92,246,0.03)" />
          {/* Shield icon */}
          <path d="M35 18 L48 23 L48 35 C48 43 35 50 35 50 C35 50 22 43 22 35 L22 23 Z"
            stroke="rgba(0,212,255,0.8)" strokeWidth="1.5" fill="rgba(0,212,255,0.1)" />
          <circle cx="35" cy="35" r="4" fill="#00D4FF" opacity="0.9" />
        </svg>
      </div>

      {/* Floating service nodes */}
      {[
        { angle: 30, dist: 155, color: '#00D4FF', label: 'API', delay: '0s' },
        { angle: 90, dist: 165, color: '#8B5CF6', label: 'DB', delay: '0.5s' },
        { angle: 150, dist: 155, color: '#00FF88', label: 'AUTH', delay: '1s' },
        { angle: 210, dist: 165, color: '#00D4FF', label: 'CDN', delay: '1.5s' },
        { angle: 270, dist: 155, color: '#8B5CF6', label: 'AI', delay: '2s' },
        { angle: 330, dist: 165, color: '#00FF88', label: 'SEC', delay: '2.5s' },
      ].map((node, i) => {
        const rad = (node.angle * Math.PI) / 180;
        const x = 170 + node.dist * Math.cos(rad);
        const y = 170 + node.dist * Math.sin(rad);
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-1 animate-float"
            style={{
              left: x, top: y,
              transform: 'translate(-50%,-50%)',
              animationDelay: node.delay,
              animationDuration: `${4 + i}s`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold"
              style={{
                background: `${node.color}15`,
                border: `1px solid ${node.color}40`,
                color: node.color,
                boxShadow: `0 0 15px ${node.color}30`,
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '8px',
              }}
            >
              {node.label}
            </div>
          </div>
        );
      })}

      {/* Connection lines to nodes */}
      <svg className="absolute inset-0 pointer-events-none" width="340" height="340">
        <defs>
          <radialGradient id="lineGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.4)" />
            <stop offset="100%" stopColor="rgba(0,212,255,0)" />
          </radialGradient>
        </defs>
        {[30, 90, 150, 210, 270, 330].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const dist = i % 2 === 0 ? 155 : 165;
          const x2 = 170 + dist * Math.cos(rad);
          const y2 = 170 + dist * Math.sin(rad);
          const colors = ['#00D4FF', '#8B5CF6', '#00FF88'];
          const c = colors[i % 3];
          return (
            <line key={i}
              x1="170" y1="170" x2={x2} y2={y2}
              stroke={c} strokeWidth="0.5" strokeOpacity="0.2"
              strokeDasharray="4 4" />
          );
        })}
      </svg>

      {/* Energy particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full animate-particle-flow"
          style={{
            background: PARTICLE_COLORS[i % 3],
            boxShadow: `0 0 6px ${PARTICLE_COLORS[i % 3]}`,
            left: '50%', top: '50%',
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

const PARTICLE_COLORS = ['#00D4FF', '#8B5CF6', '#00FF88'];
