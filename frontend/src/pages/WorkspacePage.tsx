import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Shield, Cpu, Lock, FileText, GitBranch,
  UploadCloud, Send, Loader2, CheckCircle2,
  AlertCircle, Code2, Layers, Globe, BarChart3
} from 'lucide-react';
import type { AppState } from '../types';
import { runForgePipeline } from '../utils/api';

// Tab components
import AnalysisTab from '../components/tabs/AnalysisTab';
import SecurityTab from '../components/tabs/SecurityTab';
import ThreatTab from '../components/tabs/ThreatTab';
import DiagramsTab from '../components/tabs/DiagramsTab';
import DevOpsTab from '../components/tabs/DevOpsTab';
import MiniIDE from '../components/tabs/MiniIDE';
import ExportButton from '../components/ExportButton';
import CloudDeployModal from '../components/CloudDeployModal';
import { History, Save, Trash2, Server, Database, Box, Cloud } from 'lucide-react';

const DEMO_REQUIREMENTS: Record<string, string> = {
  'E-Commerce Platform': `Build an E-Commerce Platform with the following requirements:

Entities:
- User (id, name, email, password, role: customer|admin, address, phone, createdAt)
- Product (id, name, description, price, stock, category, images, sellerId)
- Category (id, name, slug, description, parentId)
- Order (id, userId, status: pending|paid|shipped|delivered|cancelled, totalAmount, shippingAddress, createdAt)
- OrderItem (id, orderId, productId, quantity, price)
- Cart (id, userId, items, updatedAt)
- Review (id, productId, userId, rating, comment, createdAt)
- Payment (id, orderId, amount, method: stripe|paypal, status, transactionId)

Use Cases:
- Customer can register, login, browse products, add to cart, checkout, track orders
- Admin can manage products, categories, orders, users
- Customer can leave reviews on purchased products
- Admin can view analytics dashboard

Security: JWT auth, RBAC, rate limiting, input validation, secure payment processing
Tech: Node.js, PostgreSQL, Prisma ORM, REST API`,

  'Hospital Management System': `Build a Hospital Management System:

Entities:
- Patient (id, name, dob, gender, bloodType, phone, email, address, emergencyContact)
- Doctor (id, name, specialization, licenseNumber, email, phone, departmentId)
- Department (id, name, headDoctorId, description)
- Appointment (id, patientId, doctorId, date, time, status, notes)
- MedicalRecord (id, patientId, doctorId, diagnosis, prescription, date, attachments)
- Bed (id, wardId, number, status: available|occupied|maintenance)
- Invoice (id, patientId, amount, items, status, dueDate)
- Staff (id, name, role: nurse|receptionist|admin, departmentId)

Roles: SuperAdmin, Admin, Doctor, Nurse, Receptionist, Patient
Security: HIPAA-compliant, audit logs, data encryption, strict RBAC
Requirements: Appointment scheduling, medical records management, billing, bed management`,

  'SaaS CRM Platform': `Build a Multi-tenant SaaS CRM Platform:

Entities:
- Tenant (id, name, subdomain, plan: free|pro|enterprise, settings)
- User (id, tenantId, name, email, role: owner|admin|member, lastLogin)
- Contact (id, tenantId, name, email, phone, company, status, tags, assignedTo)
- Deal (id, tenantId, title, value, stage, contactId, assignedTo, closeDate)
- Pipeline (id, tenantId, name, stages[])
- Activity (id, tenantId, type: call|email|meeting|task, contactId, dealId, notes, dueDate)
- EmailTemplate (id, tenantId, name, subject, body)
- Tag (id, tenantId, name, color)

Features:
- Multi-tenancy with data isolation
- Contact management with custom fields
- Sales pipeline tracking
- Activity timeline
- Email automation
- Analytics dashboard
- API access with API keys

Security: Multi-tenant data isolation, JWT + API key auth, rate limiting per tenant`
};

const OUTPUT_TABS = [
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'code', label: 'Generated Code', icon: Code2 },
  { id: 'security', label: 'Security Audit', icon: Shield },
  { id: 'threat', label: 'STRIDE Model', icon: Lock },
  { id: 'diagrams', label: 'Diagrams', icon: Layers },
  { id: 'devops', label: 'DevOps', icon: GitBranch },
];

const PIPELINE_STEPS = [
  { key: 'analyze', label: 'Analyzing Requirements', icon: Cpu },
  { key: 'generate', label: 'Generating Architecture', icon: Code2 },
  { key: 'security', label: 'Security Audit', icon: Shield },
  { key: 'stride', label: 'STRIDE Threat Model', icon: Lock },
  { key: 'devops', label: 'DevOps Configuration', icon: GitBranch },
  { key: 'diagrams', label: 'Architecture Diagrams', icon: Globe },
];

export default function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const [inputMode, setInputMode] = useState<'text' | 'uml'>('text');
  const [requirements, setRequirements] = useState('');
  const [umlDescription, setUmlDescription] = useState('');
  const [umlFile, setUmlFile] = useState<File | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState('analysis');
  const [appState, setAppState] = useState<AppState>({ step: 'input' });
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [history, setHistory] = useState<AppState[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('sf_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveToHistory = (state: AppState) => {
    if (!state.analysis) return;
    const newHistory = [state, ...history].slice(0, 10); // Keep last 10
    setHistory(newHistory);
    localStorage.setItem('sf_history', JSON.stringify(newHistory));
  };

  // Load demo on URL param
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo && DEMO_REQUIREMENTS[demo]) {
      setRequirements(DEMO_REQUIREMENTS[demo]);
      setInputMode('text');
      toast.success(`Loaded demo: ${demo}`);
    }
  }, [searchParams]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'text/plain')) {
      setUmlFile(file);
      toast.success(`File loaded: ${file.name}`);
    } else {
      toast.error('Please drop an image or text file');
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUmlFile(file);
      toast.success(`File loaded: ${file.name}`);
    }
  };

  const runPipeline = async () => {
    if (inputMode === 'text' && requirements.trim().length < 50) {
      toast.error('Please enter at least 50 characters of requirements');
      return;
    }
    if (inputMode === 'uml' && !umlDescription.trim() && !umlFile) {
      toast.error('Please provide a UML description or upload a file');
      return;
    }

    setAppState({ step: 'analyzing' });
    setCompletedSteps([]);
    setPipelineStep(0);
    setActiveOutputTab('analysis');

    const STEP_ORDER = ['analyze', 'generate', 'security', 'stride', 'devops', 'diagrams'];

    try {
      const result = await runForgePipeline(
        {
          requirements: inputMode === 'text' ? requirements : umlDescription,
          inputType: inputMode,
          umlDescription,
        },
        {
          onProgress: (step, message) => {
            const stepIdx = STEP_ORDER.indexOf(step);
            if (stepIdx >= 0) setPipelineStep(stepIdx);
            if (step === 'generate') setAppState(prev => ({ ...prev, step: 'generating' }));
            console.log(`[Pipeline] ${step}: ${message}`);
          },
          onStepDone: (step, data) => {
            const stepIdx = STEP_ORDER.indexOf(step);
            if (stepIdx >= 0) setCompletedSteps(prev => [...prev, stepIdx]);

            // Update state incrementally as each step completes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setAppState(prev => {
              const next = { ...prev } as any;
              if (step === 'analyze') { next.analysis = data; next.step = 'generating'; }
              else if (step === 'generate') { next.generatedCode = data; }
              else if (step === 'security') { next.securityAudit = data; }
              else if (step === 'stride') { next.strideReport = data; }
              else if (step === 'devops') { next.devOps = data; }
              else if (step === 'diagrams') { next.diagrams = data; }
              return next as AppState;
            });

            if (step === 'analyze') toast.success(`✅ Requirements analyzed`);
            if (step === 'generate') toast.success(`✅ Code generated`);
          },
          onWarning: (step, message) => {
            console.warn(`[Pipeline] Warning on ${step}:`, message);
            toast(`⚠️ ${step} step skipped`, { icon: '⚠️' });
          },
          onError: (message) => {
            setAppState(prev => ({ ...prev, step: 'input', error: message }));
            setPipelineStep(-1);
            toast.error(message);
          },
          onDone: () => {
            setAppState(prev => ({ ...prev, step: 'results' }));
            setPipelineStep(-1);
            toast.success('🎉 Architecture generated!');
            setActiveOutputTab('analysis');
          },
        }
      );

      // Final state update with complete result
      const finalState = {
        ...appState,
        step: 'results',
        analysis: result.analysis ?? (appState as AppState & { analysis?: unknown }).analysis as never,
        generatedCode: result.generatedCode,
        securityAudit: result.securityAudit,
        strideReport: result.strideReport,
        devOps: result.devOps,
        diagrams: result.diagrams,
      } as AppState;
      setAppState(finalState);
      saveToHistory(finalState);

    } catch (err) {
      const message = (err as Error).message;
      setAppState(prev => ({ ...prev, step: 'input', error: message }));
      setPipelineStep(-1);
      setCompletedSteps([]);
      if (!message.includes('rate_limit')) {
        toast.error(message.substring(0, 100));
      }
    }
  };

  const isProcessing = appState.step === 'analyzing' || appState.step === 'generating';
  const hasResults = appState.step === 'results';
  const progress = completedSteps.length / PIPELINE_STEPS.length * 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Secure<span className="text-gradient">Forge</span> Workspace
          </h1>
          <p className="text-white/40 text-sm mt-1">Describe your app and generate a production-ready secure architecture</p>
        </div>
        {hasResults && appState.securityAudit && (
          <div className="hidden sm:flex items-center gap-3 glass-card px-4 py-2.5 animate-scale-in">
            <div className="text-center">
              <div className={`text-2xl font-black ${appState.securityAudit.score >= 80 ? 'text-gradient' : appState.securityAudit.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {appState.securityAudit.score}
              </div>
              <div className="text-[10px] text-white/30 font-medium">/ 100</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Security Score</div>
              <div className={`text-xs font-bold badge mt-1 ${appState.securityAudit.grade === 'A' ? 'badge-cyber' : appState.securityAudit.grade === 'B' ? 'badge-medium' : 'badge-critical'}`}>
                Grade {appState.securityAudit.grade}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left Panel ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Input mode toggle */}
          <div className="glass-card p-1.5 flex gap-1.5">
            <button id="mode-text" onClick={() => setInputMode('text')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                inputMode === 'text'
                  ? 'text-white shadow-forge'
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={inputMode === 'text' ? {
                background: 'rgba(97,113,241,0.18)',
                border: '1px solid rgba(97,113,241,0.3)',
                boxShadow: '0 0 15px rgba(97,113,241,0.1)',
              } : {}}>
              <FileText className="w-4 h-4 inline mr-2 opacity-70" />
              Text Requirements
            </button>
            <button id="mode-uml" onClick={() => setInputMode('uml')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                inputMode === 'uml'
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={inputMode === 'uml' ? {
                background: 'rgba(97,113,241,0.18)',
                border: '1px solid rgba(97,113,241,0.3)',
              } : {}}>
              <Layers className="w-4 h-4 inline mr-2 opacity-70" />
              UML Diagram
            </button>
          </div>

          {/* Input area */}
          {inputMode === 'text' ? (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Requirements</label>
                <span className="text-xs font-mono" style={{ color: requirements.length > 200 ? '#00d4aa' : 'rgba(255,255,255,0.2)' }}>
                  {requirements.length} chars
                </span>
              </div>
              <textarea
                id="requirements-input"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="Describe your application...

Example:
- Entities: User (name, email, role), Product (name, price, stock)
- Use Cases: Registration, login, product management
- Security: JWT auth, RBAC, rate limiting
- Tech: Node.js, PostgreSQL, Prisma ORM"
                className="forge-input resize-none h-64 font-mono text-xs leading-relaxed"
                disabled={isProcessing}
              />

              {/* Demo buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Quick Load Demo</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(DEMO_REQUIREMENTS).map(demo => (
                    <button key={demo} id={`demo-${demo.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setRequirements(DEMO_REQUIREMENTS[demo])}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                      style={{
                        border: '1px solid rgba(97,113,241,0.2)',
                        background: 'rgba(97,113,241,0.06)',
                        color: '#8196f8',
                      }}
                      disabled={isProcessing}>
                      {demo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-4 space-y-3">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">UML Diagram</label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 hover:border-forge-500/40 hover:bg-forge-500/5"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                onClick={() => document.getElementById('uml-file-input')?.click()}
              >
                <input id="uml-file-input" type="file" accept="image/*,.txt,.svg" onChange={handleFileInput} className="hidden" />
                <UploadCloud className="w-8 h-8 mx-auto mb-3 text-white/20" />
                {umlFile ? (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#00d4aa' }}>{umlFile.name}</p>
                    <p className="text-xs text-white/30 mt-1">{(umlFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-white/40">Drop UML diagram here</p>
                    <p className="text-xs text-white/20 mt-1">PNG, JPG, SVG, TXT</p>
                  </div>
                )}
              </div>
              <textarea
                id="uml-description-input"
                value={umlDescription}
                onChange={e => setUmlDescription(e.target.value)}
                placeholder="Describe your UML diagram:
- Class names and attributes
- Relationships between classes
- Use case actors
- Sequence flows..."
                className="forge-input resize-none h-32 text-xs font-mono"
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Pipeline status */}
          {isProcessing && (
            <div className="glass-card p-4 space-y-3 animate-scale-in">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#6171f1' }} />
                  AI Pipeline Running
                </div>
                <span className="text-xs font-mono text-white/30">{completedSteps.length}/{PIPELINE_STEPS.length}</span>
              </div>

              {/* Progress bar */}
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>

              {/* Steps */}
              <div className="space-y-1.5 pt-1">
                {PIPELINE_STEPS.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isActive = pipelineStep === i;
                  return (
                    <div key={step.key}
                      className={`pipeline-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: '#00d4aa' }} />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6171f1' }} />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-white/15" />
                        )}
                      </div>
                      <step.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isDone ? 'opacity-50' : isActive ? 'opacity-100' : 'opacity-20'}`}
                        style={{ color: isActive ? '#8196f8' : isDone ? '#00d4aa' : 'inherit' }} />
                      <span className={`text-xs font-medium transition-all ${isDone ? 'text-white/35 line-through' : isActive ? 'text-white' : 'text-white/20'}`}>
                        {step.label}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-forge-400 animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {appState.error && !isProcessing && (
            <div className="glass-card p-4 animate-scale-in" style={{ border: '1px solid rgba(255,71,87,0.2)', background: 'rgba(255,71,87,0.04)' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ff4757' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#ff6b81' }}>Generation Failed</p>
                  <p className="text-xs mt-1 text-white/50">{appState.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            id="generate-btn"
            onClick={runPipeline}
            disabled={isProcessing}
            className="btn-forge w-full py-4 text-sm justify-center"
            style={{ fontSize: '0.9375rem' }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing... (~3 min)
              </>
            ) : hasResults ? (
              <>
                <Shield className="w-5 h-5" />
                Regenerate Architecture
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Generate Secure Architecture
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Info */}
          {!isProcessing && !hasResults && (
            <div className="glass-card p-4" style={{ border: '1px solid rgba(0,212,170,0.1)', background: 'rgba(0,212,170,0.04)' }}>
              <div className="flex items-start gap-3">
                <Cpu className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#00d4aa' }} />
                <div className="space-y-1">
                  <p className="text-xs font-semibold" style={{ color: '#00d4aa' }}>Pipeline Stages (~3 min total)</p>
                  {[
                    ['Analyze', '~15s'], ['Code Gen', '~45s'],
                    ['Security', '~30s'], ['STRIDE + DevOps', '~45s'],
                    ['Diagrams', 'instant'],
                  ].map(([stage, time]) => (
                    <div key={stage} className="flex justify-between text-xs text-white/30">
                      <span>{stage}</span>
                      <span className="font-mono">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History */}
          <div className="mt-8">
            <button 
              onClick={() => setHistoryOpen(!historyOpen)}
              className="flex items-center justify-between w-full p-3 glass rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm text-white/70">
                <History className="w-4 h-4" />
                Past Architectures
              </div>
              <span className="badge badge-cyber text-[10px]">{history.length}</span>
            </button>
            
            {historyOpen && history.length > 0 && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {history.map((item, i) => (
                  <div key={i} onClick={() => { setAppState(item); setInputMode('text'); }} className="glass p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-xs text-white truncate max-w-[150px]">
                        {item.analysis?.projectName || 'Unknown Project'}
                      </div>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        const nh = history.filter((_, idx) => idx !== i);
                        setHistory(nh);
                        localStorage.setItem('sf_history', JSON.stringify(nh));
                      }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[10px] text-white/40 truncate mt-1">
                      {item.analysis?.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="lg:col-span-3">
          {!hasResults && !isProcessing ? (
            <div className="glass-card h-full min-h-[520px] flex items-center justify-center text-center p-16 animate-fade-up">
              <div className="space-y-5">
                <div className="relative mx-auto w-24 h-24">
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto animate-float"
                    style={{ background: 'linear-gradient(135deg, rgba(97,113,241,0.2), rgba(0,212,170,0.15))', border: '1px solid rgba(97,113,241,0.2)' }}>
                    <Shield className="w-12 h-12" style={{ color: '#6171f1' }} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center animate-pulse-slow"
                    style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' }}>
                    <Cpu className="w-4 h-4" style={{ color: '#00d4aa' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Ready to Forge
                  </h3>
                  <p className="text-sm text-white/35 max-w-xs mx-auto leading-relaxed">
                    Enter your requirements on the left and click Generate to start the AI pipeline
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['TypeScript', 'Prisma', 'JWT Auth', 'STRIDE', 'Docker'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ borderColor: 'rgba(97,113,241,0.2)', color: 'rgba(97,113,241,0.7)', background: 'rgba(97,113,241,0.06)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="glass-card h-full min-h-[520px] flex items-center justify-center text-center p-16 animate-fade-up">
              <div className="space-y-6">
                {/* Animated spinner */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 rounded-full animate-spin"
                    style={{ background: 'conic-gradient(from 0deg, #6171f1, #00d4aa, transparent)', padding: '2px' }}>
                    <div className="w-full h-full rounded-full" style={{ background: 'var(--bg-primary)' }} />
                  </div>
                  <div className="absolute inset-3 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(97,113,241,0.12)', border: '1px solid rgba(97,113,241,0.2)' }}>
                    <Shield className="w-9 h-9" style={{ color: '#6171f1' }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    AI is Working...
                  </h3>
                  <p className="text-sm text-white/35">
                    Groq AI is analyzing and generating your secure architecture
                  </p>
                </div>
                <div className="progress-bar w-48 mx-auto">
                  <div className="progress-fill transition-all duration-1000" style={{ width: `${Math.max(5, progress)}%` }} />
                </div>
                <p className="text-xs font-mono text-white/20">{completedSteps.length}/{PIPELINE_STEPS.length} steps complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-up">
              {/* Project header & Metrics */}
              {appState.analysis && (
                <div className="space-y-4">
                  <div className="glass-card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6171f1, #4f52e5)', boxShadow: '0 4px 15px rgba(97,113,241,0.4)' }}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-white truncate">{appState.analysis.projectName}</h2>
                        <p className="text-xs text-white/40 truncate mt-0.5">{appState.analysis.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <ExportButton appState={appState} />
                      <button 
                        onClick={() => setDeployModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-space shadow-glow-sm"
                        style={{ background: '#00FF88' }}
                      >
                        <Cloud className="w-4 h-4" />
                        Deploy to Cloud
                      </button>
                    </div>
                  </div>
                  
                  {/* Architecture Metrics Dashboard */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Entities', value: appState.analysis.entities?.length || 0, icon: Server, color: '#00D4FF' },
                      { label: 'Use Cases', value: appState.analysis.useCases?.length || 0, icon: Database, color: '#8B5CF6' },
                      { label: 'Security Score', value: appState.securityAudit?.score || 0, icon: Shield, color: '#00FF88' },
                      { label: 'DevOps Bundle', value: appState.devOps ? 1 : 0, icon: Box, color: '#FF6B81' },
                    ].map((m, i) => (
                      <div key={i} className="glass p-3 flex flex-col gap-2 rounded-xl">
                        <div className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                          <m.icon className="w-3 h-3" style={{ color: m.color }} />
                          {m.label}
                        </div>
                        <div className="text-xl font-bold font-mono" style={{ color: m.color }}>
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Output tabs */}
              <div className="glass-card p-1.5">
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {OUTPUT_TABS.map(tab => (
                    <button key={tab.id} id={`tab-${tab.id}`}
                      onClick={() => setActiveOutputTab(tab.id)}
                      className={`tab-button flex items-center gap-1.5 flex-shrink-0 ${activeOutputTab === tab.id ? 'active' : ''}`}>
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {tab.id === 'security' && appState.securityAudit && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          appState.securityAudit.grade === 'A' ? 'badge-cyber' :
                          appState.securityAudit.grade === 'B' ? 'badge-medium' : 'badge-critical'
                        }`}>
                          {appState.securityAudit.grade}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="glass-card overflow-hidden animate-scale-in">
                {activeOutputTab === 'analysis' && appState.analysis && <AnalysisTab analysis={appState.analysis} />}
                {activeOutputTab === 'code' && appState.generatedCode && <MiniIDE code={appState.generatedCode as unknown as string} />}
                {activeOutputTab === 'security' && appState.securityAudit && <SecurityTab audit={appState.securityAudit} />}
                {activeOutputTab === 'threat' && appState.strideReport && <ThreatTab report={appState.strideReport} />}
                {activeOutputTab === 'diagrams' && appState.diagrams && <DiagramsTab diagrams={appState.diagrams} />}
                {activeOutputTab === 'devops' && appState.devOps && <DevOpsTab devops={appState.devOps} />}

                {/* Empty state for each tab */}
                {(['analysis', 'code', 'security', 'threat', 'diagrams', 'devops'] as const).map(tabId => {
                  const dataMap = {
                    analysis: appState.analysis, code: appState.generatedCode,
                    security: appState.securityAudit, threat: appState.strideReport,
                    diagrams: appState.diagrams, devops: appState.devOps,
                  };
                  if (activeOutputTab === tabId && !dataMap[tabId]) {
                    return (
                      <div key={tabId} className="p-16 text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm text-white/30">This section was skipped or failed</p>
                        <p className="text-xs text-white/20 mt-1">Try regenerating the architecture</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CloudDeployModal 
        isOpen={deployModalOpen} 
        onClose={() => setDeployModalOpen(false)} 
        appState={appState} 
      />
    </div>
  );
}
