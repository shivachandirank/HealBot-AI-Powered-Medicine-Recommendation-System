import React, { useEffect, useRef, memo } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
  logLevel: 'error',
});

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = memo(({ chart, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !chart) return;

      containerRef.current.innerHTML = '';
      const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

      try {
        const { svg } = await mermaid.render(id, chart);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Mermaid render error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-rose-400 p-4 border border-rose-500/20 rounded-lg bg-rose-500/5">Failed to render diagram</div>`;
        }
      }
    };

    renderDiagram();
  }, [chart]);

  return <div ref={containerRef} className={`mermaid flex justify-center ${className || ''}`} />;
});

MermaidDiagram.displayName = 'MermaidDiagram';
