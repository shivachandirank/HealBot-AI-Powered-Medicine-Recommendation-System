import { useState, useEffect, useRef } from 'react';
import { Terminal, Cloud, X, CheckCircle2, Loader2, Download, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AppState } from '../types';

interface CloudDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
}

const DEPLOYMENT_STEPS = [
  { text: 'Initializing deployment pipeline...', delay: 800 },
  { text: 'Authenticating with Render Cloud (Free Tier)...', delay: 1200 },
  { text: 'Provisioning PostgreSQL Database...', delay: 2000 },
  { text: 'Generating render.yaml blueprint...', delay: 1000 },
  { text: 'Analyzing Dockerfile...', delay: 1500 },
  { text: 'Building container image [secureforge-api:latest]...', delay: 2500 },
  { text: 'Applying security hardened network policies...', delay: 1200 },
  { text: 'Running pre-flight checks...', delay: 800 },
  { text: 'Deploying microservices to Edge Network...', delay: 2000 },
  { text: 'Running database migrations (Prisma)...', delay: 1500 },
  { text: 'Deployment successful! Routing traffic...', delay: 1000 }
];

export default function CloudDeployModal({ isOpen, onClose, appState }: CloudDeployModalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isComplete, setIsComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLogs([]);
      setStepIndex(0);
      setIsComplete(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || stepIndex < 0 || stepIndex >= DEPLOYMENT_STEPS.length) {
      if (stepIndex >= DEPLOYMENT_STEPS.length) setIsComplete(true);
      return;
    }

    const timer = setTimeout(() => {
      setLogs(prev => [...prev, DEPLOYMENT_STEPS[stepIndex].text]);
      setStepIndex(prev => prev + 1);
    }, DEPLOYMENT_STEPS[stepIndex].delay);

    return () => clearTimeout(timer);
  }, [isOpen, stepIndex]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const projectName = appState.analysis?.projectName?.replace(/\s+/g, '-').toLowerCase() || 'secureforge-app';

  const downloadBlueprint = async () => {
    try {
      const renderYaml = `
services:
  - type: web
    name: ${projectName}-api
    env: docker
    plan: free
    healthCheckPath: /api/health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: ${projectName}-db
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3000"

databases:
  - name: ${projectName}-db
    plan: free
    databaseName: ${projectName.replace(/-/g, '_')}
    user: admin
`;

      const zip = new JSZip();
      zip.file('render.yaml', renderYaml.trim());
      
      // Also inject the backend dockerfile if available in devops bundle
      let dockerfile = '';
      if (appState.devOps?.dockerfile) {
        dockerfile = appState.devOps.dockerfile;
      } else {
        const allText = typeof appState.generatedCode === 'string' 
            ? appState.generatedCode 
            : JSON.stringify(appState.generatedCode || '');
            
        if (allText.includes('FROM node')) {
          const lines = allText.split('\n');
          const fromIndex = lines.findIndex((l: string) => l.trim().startsWith('FROM node'));
          if (fromIndex !== -1) {
              for (let i = fromIndex; i < lines.length; i++) {
                  if (lines[i].startsWith('```') || lines[i].startsWith('//') || lines[i].startsWith('}')) break;
                  dockerfile += lines[i] + '\n';
              }
          }
        }
      }
      
      if (dockerfile) {
        // Unescape JSON stringified newlines if they exist
        dockerfile = dockerfile.replace(/\\n/g, '\n');
        zip.file('Dockerfile', dockerfile);
      }

      if (!zip.file('Dockerfile')) {
          // fallback dummy dockerfile
          zip.file('Dockerfile', 'FROM node:18-alpine\nWORKDIR /app\nCOPY package.json .\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]');
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${projectName}-render-blueprint.zip`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh' }}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00FF88, #00D4FF)' }}>
              <Cloud className="w-5 h-5 text-space" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">One-Click Cloud Deploy</h3>
              <p className="text-xs text-white/50">Simulated Render.com Deployment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Window */}
        <div className="flex-1 overflow-auto bg-[#0A0A0A] p-5 font-mono text-[13px] leading-relaxed relative min-h-[300px]">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3 mb-2 animate-fade-up" style={{ animationDuration: '0.3s' }}>
              <span className="text-white/30 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className={log.includes('successful') ? 'text-emerald-400 font-bold' : log.includes('error') ? 'text-red-400' : 'text-white/80'}>
                {log}
              </span>
            </div>
          ))}
          {!isComplete && logs.length > 0 && (
            <div className="flex gap-3 mt-4 text-neon-blue items-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t bg-space" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {isComplete ? (
            <div className="animate-scale-in space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <h4 className="text-emerald-400 font-bold text-sm">Deployment Blueprint Ready</h4>
                  <p className="text-xs text-emerald-400/70 mt-0.5">Your infrastructure-as-code is generated. Download the Render Blueprint to launch for free.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={downloadBlueprint}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-space font-bold hover:bg-white/90 transition-colors shadow-glow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Blueprint (.zip)
                </button>
                <a 
                  href="https://render.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors border"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Render Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-white/40">
              <Terminal className="w-4 h-4" />
              Streaming live deployment logs... Please do not close this window.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
