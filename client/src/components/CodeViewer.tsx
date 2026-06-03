import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import type { GeneratedFile } from '../types';

interface CodeViewerProps {
  files: GeneratedFile[];
  selectedFile?: string;
  onFileSelect?: (path: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ files, selectedFile, onFileSelect }) => {
  const [copied, setCopied] = useState(false);
  const activeFile = files.find(f => f.path === selectedFile) || files[0];

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 glass-subtle rounded-xl border border-white/5">
        No code available to view
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col glass-subtle rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-navy-900/50 border-b border-white/10 shrink-0">
        <div className="flex overflow-x-auto space-x-1 custom-scrollbar">
          {files.slice(0, 5).map((file) => (
            <button
              key={file.path}
              onClick={() => onFileSelect?.(file.path)}
              className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition-colors ${
                (selectedFile === file.path || (!selectedFile && file === activeFile))
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {file.name || file.path.split('/').pop()}
            </button>
          ))}
          {files.length > 5 && (
            <div className="px-3 py-1.5 text-sm text-gray-500 flex items-center">
              +{files.length - 5} more
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-electric-blue/20 text-electric-blue uppercase">
            {activeFile.language || 'typescript'}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        <SyntaxHighlighter
          language={activeFile.language === 'ts' ? 'typescript' : activeFile.language || 'typescript'}
          style={vscDarkPlus}
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
          }}
        >
          {activeFile.content || '// No content'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
