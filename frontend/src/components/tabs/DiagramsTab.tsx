import { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Layers, AlertCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { DiagramBundle } from '../../types';

interface Props { diagrams: DiagramBundle }

const DIAGRAM_TABS = [
  { key: 'erDiagram', label: 'ER Diagram', desc: 'Entity-Relationship diagram' },
  { key: 'classDiagram', label: 'Class Diagram', desc: 'TypeScript class structure' },
  { key: 'serviceDependency', label: 'Service Dependency', desc: 'Microservice dependency graph' },
  { key: 'microserviceInteraction', label: 'Sequence Diagram', desc: 'Service interaction flows' },
  { key: 'dataFlowDiagram', label: 'Data Flow', desc: 'Data flow architecture' },
];

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#4f5fef',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: 'rgba(97,113,241,0.4)',
    lineColor: 'rgba(255,255,255,0.3)',
    secondaryColor: '#0d9488',
    tertiaryColor: '#1e1b4b',
    background: '#0a0a1a',
    mainBkg: 'rgba(79,95,239,0.1)',
    nodeBorder: 'rgba(97,113,241,0.4)',
    clusterBkg: 'rgba(13,148,136,0.08)',
    clusterBorder: 'rgba(13,148,136,0.2)',
    titleColor: '#e2e8f0',
    edgeLabelBackground: 'rgba(10,10,26,0.9)',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    // ER diagram
    attributeBackgroundColorEven: 'rgba(79,95,239,0.05)',
    attributeBackgroundColorOdd: 'rgba(0,0,0,0.2)',
    // Sequence diagram
    actorBkg: 'rgba(79,95,239,0.15)',
    actorBorder: 'rgba(97,113,241,0.4)',
    actorTextColor: '#e2e8f0',
    signalColor: 'rgba(255,255,255,0.5)',
    signalTextColor: '#e2e8f0',
    labelBoxBkgColor: 'rgba(10,10,26,0.9)',
    labelBoxBorderColor: 'rgba(255,255,255,0.15)',
    labelTextColor: '#e2e8f0',
    loopTextColor: '#e2e8f0',
    noteBorderColor: 'rgba(255,255,255,0.15)',
    noteBkgColor: 'rgba(79,95,239,0.1)',
    noteTextColor: '#e2e8f0',
    activationBorderColor: 'rgba(13,148,136,0.6)',
    activationBkgColor: 'rgba(13,148,136,0.1)',
  },
  securityLevel: 'loose',
  flowchart: { curve: 'basis', htmlLabels: false, padding: 15 },
  er: { diagramPadding: 20, layoutDirection: 'TB', minEntityWidth: 100 },
  sequence: { diagramMarginX: 30, diagramMarginY: 20, actorMargin: 60, width: 150, height: 65, boxMargin: 10 },
});

function MermaidDiagram({ code, id }: { code: string; id: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [scale, setScale] = useState(0.85);
  const renderIdRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    setError(null);
    setShowRaw(false);

    const renderId = ++renderIdRef.current;
    const uid = `mermaid-${id}-${Date.now()}`;

    const render = async () => {
      try {
        // Strip markdown fences and leading/trailing whitespace
        let cleanCode = code.trim();
        cleanCode = cleanCode.replace(/^```(?:mermaid)?\s*\n?/i, '').replace(/\n?\s*```\s*$/i, '');
        cleanCode = cleanCode.trim();

        const { svg } = await mermaid.render(uid, cleanCode);

        if (renderId !== renderIdRef.current) return; // stale render
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
            svgEl.setAttribute('width', '100%');
          }
        }
      } catch (err) {
        if (renderId !== renderIdRef.current) return;
        const msg = (err as Error).message || String(err);
        setError(msg);
        if (containerRef.current) containerRef.current.innerHTML = '';
      }
    };

    // Small delay so tab switching doesn't fire multiple renders
    const t = setTimeout(render, 50);
    return () => clearTimeout(t);
  }, [code, id]);

  return (
    <div className="relative space-y-2">
      {error && (
        <div className="flex items-start gap-2 text-xs text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium mb-1">Mermaid parse error</p>
            <p className="text-orange-200/60 break-all">{error.substring(0, 150)}</p>
            <button
              onClick={() => setShowRaw(v => !v)}
              className="mt-2 text-orange-300/70 hover:text-orange-300 underline"
            >
              {showRaw ? 'Hide' : 'Show'} raw diagram code
            </button>
          </div>
        </div>
      )}

      {showRaw ? (
        <pre className="text-xs text-white/50 font-mono bg-black/30 border border-white/[0.06] rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap">
          {code}
        </pre>
      ) : (
        <div
          className="overflow-auto bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 min-h-48"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: `${100 / scale}%` }}
        >
          <div ref={containerRef} className="mermaid-container" />
        </div>
      )}

      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-white/30 w-10 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(2, s + 0.1))}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setScale(0.85)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors" title="Reset">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function DiagramsTab({ diagrams }: Props) {
  const [activeTab, setActiveTab] = useState('erDiagram');

  const currentDiagram = diagrams[activeTab as keyof DiagramBundle];
  const currentTabInfo = DIAGRAM_TABS.find(t => t.key === activeTab);

  return (
    <div className="p-5 space-y-4 max-h-[700px] overflow-y-auto">
      {/* Tab switcher */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {DIAGRAM_TABS.map(tab => {
          const hasData = !!diagrams[tab.key as keyof DiagramBundle];
          return (
            <button
              key={tab.key}
              id={`diagram-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              disabled={!hasData}
              className={`tab-button flex-shrink-0 text-xs ${activeTab === tab.key ? 'active' : ''} ${!hasData ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Layers className="w-3 h-3 inline mr-1" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      {currentTabInfo && (
        <p className="text-xs text-white/40">{currentTabInfo.desc}</p>
      )}

      {/* Diagram */}
      {currentDiagram ? (
        <MermaidDiagram code={currentDiagram} id={activeTab} />
      ) : (
        <div className="text-center py-12 text-white/30">
          <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No diagram available</p>
        </div>
      )}
    </div>
  );
}
