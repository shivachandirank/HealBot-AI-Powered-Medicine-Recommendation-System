import { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import type { GeneratedCode } from '../../types';

interface Props { code: GeneratedCode }

type CodeSection = {
  group: string;
  files: { key: string; label: string; lang: string; content: string }[];
};

export default function CodeTab({ code }: Props) {
  const [activeFile, setActiveFile] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const sections: CodeSection[] = [
    {
      group: 'Application',
      files: [
        { key: 'appEntry', label: 'index.ts', lang: 'typescript', content: code.appEntry || '' },
        { key: 'packageJson', label: 'package.json', lang: 'json', content: code.packageJson || '' },
        { key: 'envExample', label: '.env.example', lang: 'bash', content: code.envExample || '' },
        { key: 'prismaSchema', label: 'schema.prisma', lang: 'prisma', content: code.prismaSchema || '' },
        { key: 'swaggerSpec', label: 'openapi.yaml', lang: 'yaml', content: code.swaggerSpec || '' },
      ].filter(f => f.content),
    },
    {
      group: 'Controllers',
      files: Object.entries(code.controllers || {}).map(([k, v]) => ({
        key: `ctrl-${k}`, label: `${k}Controller.ts`, lang: 'typescript', content: v,
      })),
    },
    {
      group: 'Routes',
      files: Object.entries(code.routes || {}).map(([k, v]) => ({
        key: `route-${k}`, label: `${k}.routes.ts`, lang: 'typescript', content: v,
      })),
    },
    {
      group: 'Services',
      files: Object.entries(code.services || {}).map(([k, v]) => ({
        key: `svc-${k}`, label: `${k}Service.ts`, lang: 'typescript', content: v,
      })),
    },
    {
      group: 'Models',
      files: Object.entries(code.models || {}).map(([k, v]) => ({
        key: `model-${k}`, label: `${k}.model.ts`, lang: 'typescript', content: v,
      })),
    },
    {
      group: 'Middleware',
      files: Object.entries(code.middleware || {}).map(([k, v]) => ({
        key: `mw-${k}`, label: `${k}.middleware.ts`, lang: 'typescript', content: v,
      })),
    },
  ].filter(s => s.files.length > 0);

  const allFiles = sections.flatMap(s => s.files);
  const currentFileKey = activeFile || allFiles[0]?.key || '';
  const currentFile = allFiles.find(f => f.key === currentFileKey);

  const copyCode = async () => {
    if (currentFile) {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAll = () => {
    const content = allFiles.map(f => `// === ${f.label} ===\n${f.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secureforge-generated-code.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded all files!');
  };

  return (
    <div className="flex h-[700px]">
      {/* File tree */}
      <div className="w-48 flex-shrink-0 border-r border-white/[0.06] overflow-y-auto bg-black/20">
        {sections.map(section => (
          <div key={section.group} className="py-2">
            <div className="px-3 py-1 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              {section.group}
            </div>
            {section.files.map(file => (
              <button
                key={file.key}
                id={`file-${file.key}`}
                onClick={() => setActiveFile(file.key)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 ${
                  currentFileKey === file.key
                    ? 'bg-forge-500/15 text-forge-300'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <FileCode className="w-3 h-3 flex-shrink-0" />
                <span className="truncate font-mono">{file.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Code viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-black/10">
          <span className="text-xs font-mono text-white/50">{currentFile?.label || 'Select a file'}</span>
          <div className="flex items-center gap-2">
            <button
              id="copy-code"
              onClick={copyCode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-cyber-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              id="download-all"
              onClick={downloadAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download All
            </button>
          </div>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto">
          {currentFile ? (
            <SyntaxHighlighter
              language={currentFile.lang === 'prisma' ? 'sql' : currentFile.lang}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: 'transparent',
                fontSize: '11px',
                lineHeight: '1.6',
                height: '100%',
              }}
              lineNumberStyle={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px' }}
            >
              {currentFile.content || '// No content generated'}
            </SyntaxHighlighter>
          ) : (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              Select a file to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
