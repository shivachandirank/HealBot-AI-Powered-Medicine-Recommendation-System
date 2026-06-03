import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'node' | 'stream' | 'spark';
}

interface Connection {
  a: number; b: number;
  alpha: number;
}

const COLORS = ['#00D4FF', '#8B5CF6', '#00FF88', '#6171f1', '#00D4FF'];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Responsive particle count
    const NODE_COUNT = Math.min(60, Math.floor((W * H) / 20000));
    const nodes: Particle[] = [];
    const streams: Particle[] = [];
    const connections: Connection[] = [];

    // Initialize network nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.3,
        life: 0,
        maxLife: Infinity,
        type: 'node',
      });
    }

    // Initialize data streams
    const spawnStream = () => {
      const startX = Math.random() * W;
      streams.push({
        x: startX, y: -10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 1.5 + 0.5,
        size: Math.random() * 1.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0,
        life: 0,
        maxLife: H * 1.2 / (Math.random() * 1.5 + 0.5),
        type: 'stream',
      });
    };

    let streamTimer = 0;

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      // Subtle background gradient
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.8);
      bg.addColorStop(0, 'rgba(0,10,30,0.15)');
      bg.addColorStop(1, 'rgba(5,8,22,0.05)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Mouse repulsion
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120 * 0.012;
          n.vx += dx * force;
          n.vy += dy * force;
        }

        // Damping
        n.vx *= 0.99;
        n.vy *= 0.99;

        // Speed limit
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 1.5) { n.vx = (n.vx / speed) * 1.5; n.vy = (n.vy / speed) * 1.5; }

        n.x += n.vx;
        n.y += n.vy;

        // Bounce
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.x = Math.max(0, Math.min(W, n.x));
        n.y = Math.max(0, Math.min(H, n.y));

        // Pulse alpha
        n.life += 0.02;
        const pulsedAlpha = n.alpha * (0.7 + 0.3 * Math.sin(n.life));

        // Draw node
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size * 3);
        grd.addColorStop(0, n.color + 'CC');
        grd.addColorStop(0.5, n.color + '55');
        grd.addColorStop(1, n.color + '00');
        ctx.globalAlpha = pulsedAlpha;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.globalAlpha = pulsedAlpha;
        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw connections
      ctx.globalAlpha = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.25;

            // Gradient line
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, nodes[i].color + Math.round(alpha * 255).toString(16).padStart(2, '0'));
            grad.addColorStop(1, nodes[j].color + Math.round(alpha * 255).toString(16).padStart(2, '0'));

            ctx.beginPath();
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // Data particle traveling on edge
            if (Math.random() < 0.0005) {
              const t = (Math.sin(Date.now() * 0.001 + i + j) + 1) / 2;
              const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
              const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
              ctx.fillStyle = '#00D4FF';
              ctx.globalAlpha = alpha * 2;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Mouse proximity highlight
      if (mx > 0 && my > 0) {
        const mouseGrd = ctx.createRadialGradient(mx, my, 0, mx, my, 150);
        mouseGrd.addColorStop(0, 'rgba(0,212,255,0.04)');
        mouseGrd.addColorStop(1, 'transparent');
        ctx.globalAlpha = 1;
        ctx.fillStyle = mouseGrd;
        ctx.beginPath();
        ctx.arc(mx, my, 150, 0, Math.PI * 2);
        ctx.fill();
      }

      // Data streams
      streamTimer++;
      if (streamTimer % 60 === 0 && streams.length < 20) spawnStream();

      for (let i = streams.length - 1; i >= 0; i--) {
        const s = streams[i];
        s.y += s.vy;
        s.x += s.vx;
        s.life++;

        if (s.life > s.maxLife || s.y > H + 20) {
          streams.splice(i, 1);
          continue;
        }

        const progress = s.life / s.maxLife;
        s.alpha = Math.sin(progress * Math.PI) * 0.4;

        // Draw stream particle
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.globalAlpha = s.alpha * 0.3;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    draw();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
