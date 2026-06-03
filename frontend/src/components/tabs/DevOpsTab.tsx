import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import type { DevOpsBundle } from '../../types';

interface Props { devops: DevOpsBundle }

const DEVOPS_TABS = [
  { key: 'dockerfile', label: 'Dockerfile', lang: 'dockerfile' },
  { key: 'dockerCompose', label: 'docker-compose.yml', lang: 'yaml' },
  { key: 'githubActionsCI', label: 'GitHub Actions CI/CD', lang: 'yaml' },
  { key: 'nginxConfig', label: 'nginx.conf', lang: 'nginx' },
  { key: 'envTemplate', label: '.env.template', lang: 'bash' },
  { key: 'deploymentGuide', label: 'Deployment Guide', lang: 'markdown' },
];

export default function DevOpsTab({ devops }: Props) {
  const [activeTab, setActiveTab] = useState('dockerfile');
  const [copied, setCopied] = useState(false);

  const current = DEVOPS_TABS.find(t => t.key === activeTab);
  const currentContent = devops[activeTab as keyof DevOpsBundle] || '';

  const copyContent = async () => {
    if (currentContent) {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current?.label || 'devops-file.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded: ${current?.label}`);
  };

  return (
    <div className="flex flex-col max-h-[700px]">
      {/* Tab bar */}
      <div className="border-b border-white/[0.06] px-4 py-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {DEVOPS_TABS.map(tab => {
            const hasData = !!devops[tab.key as keyof DevOpsBundle];
            return (
              <button
                key={tab.key}
                id={`devops-${tab.key}`}
                onClick={() => hasData && setActiveTab(tab.key)}
                disabled={!hasData}
                className={`tab-button flex-shrink-0 text-xs ${activeTab === tab.key ? 'active' : ''} ${!hasData ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-black/10">
        <span className="text-xs text-white/40 font-mono">{current?.label}</span>
        <div className="flex items-center gap-2">
          <button
            id={`copy-${activeTab}`}
            onClick={copyContent}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-cyber-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            id={`download-${activeTab}`}
            onClick={downloadFile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {current?.lang === 'markdown' ? (
          <div className="p-6 prose prose-invert prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed font-sans">
              {currentContent}
            </pre>
          </div>
        ) : currentContent ? (
          <SyntaxHighlighter
            language={current?.lang === 'nginx' ? 'nginx' : current?.lang}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: 'transparent',
              fontSize: '11px',
              lineHeight: '1.6',
              minHeight: '300px',
            }}
            lineNumberStyle={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}
          >
            {currentContent}
          </SyntaxHighlighter>
        ) : (
          <div className="flex items-center justify-center h-48 text-white/30 text-sm">
            No content available
          </div>
        )}
      </div>
    </div>
  );
}
