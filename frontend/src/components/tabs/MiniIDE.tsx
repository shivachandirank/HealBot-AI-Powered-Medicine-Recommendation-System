import { useState, useMemo } from 'react';
import { FileCode, FileJson, FileText, Database, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ParsedFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

export default function MiniIDE({ code }: { code: any }) {
  const files = useMemo(() => {
    const parsed: ParsedFile[] = [];
    // We try to match patterns like:
    // // src/server.ts
    // // path/to/file.tsx
    // ### src/db.ts
    // File: docker-compose.yml
    
    // First, let's remove any markdown code block wrappers from the whole string if they exist globally
    let cleanCode = '';
    
    if (typeof code === 'object' && code !== null) {
      // Serialize the GeneratedCode object into a readable string format that the regex can parse
      const serializeObject = (obj: any, pathPrefix: string = '') => {
        let result = '';
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            let filename = key;
            if (key === 'prismaSchema') filename = 'schema.prisma';
            if (key === 'envExample') filename = '.env.example';
            if (key === 'packageJson') filename = 'package.json';
            if (key === 'appEntry') filename = 'src/index.ts';
            if (key === 'swaggerSpec') filename = 'swagger.yaml';
            if (!filename.includes('.')) filename += '.ts';
            
            result += `\n// ${pathPrefix}${filename}\n${value}\n`;
          } else if (typeof value === 'object' && value !== null) {
            let subPath = key;
            if (subPath === 'controllers') subPath = 'src/controllers/';
            if (subPath === 'routes') subPath = 'src/routes/';
            if (subPath === 'services') subPath = 'src/services/';
            if (subPath === 'models') subPath = 'src/models/';
            if (subPath === 'middleware') subPath = 'src/middleware/';
            result += serializeObject(value, subPath);
          }
        }
        return result;
      };
      cleanCode = serializeObject(code);
    } else {
      cleanCode = String(code || '');
    }
    
    // Split by common file header patterns
    const fileRegex = /(?:\n|^)(?:\/\/\s*|###\s*`?|File:\s*`?)([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)`?\s*\n/g;
    
    let match;
    let lastIndex = 0;
    let currentPath = 'setup.ts';
    
    // If the string starts with some text before a file header, save it
    match = fileRegex.exec(cleanCode);
    if (match && match.index > 0) {
      parsed.push({
        path: 'readme.txt',
        name: 'readme.txt',
        content: cleanCode.substring(0, match.index).trim(),
        language: 'text'
      });
    }
    
    fileRegex.lastIndex = 0; // reset
    
    const matches = [];
    while ((match = fileRegex.exec(cleanCode)) !== null) {
      matches.push({
        path: match[1],
        index: match.index,
        matchLength: match[0].length
      });
    }
    
    if (matches.length === 0) {
      // No files detected, just return a single file
      return [{
        path: 'generated.ts',
        name: 'generated.ts',
        content: cleanCode,
        language: 'typescript'
      }];
    }
    
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      
      let content = cleanCode.substring(
        current.index + current.matchLength,
        next ? next.index : cleanCode.length
      ).trim();
      
      // Remove trailing markdown code blocks if present
      content = content.replace(/^```[a-z]*\n/i, '');
      content = content.replace(/\n```$/i, '');
      content = content.replace(/```/g, ''); // brute force clean
      
      let lang = 'typescript';
      if (current.path.endsWith('.json')) lang = 'json';
      if (current.path.endsWith('.prisma')) lang = 'graphql';
      if (current.path.endsWith('.yml') || current.path.endsWith('.yaml')) lang = 'yaml';
      if (current.path.endsWith('.sh') || current.path.includes('Dockerfile')) lang = 'bash';
      
      parsed.push({
        path: current.path,
        name: current.path.split('/').pop() || current.path,
        content,
        language: lang
      });
    }
    
    return parsed;
  }, [code]);

  const [activeFile, setActiveFile] = useState<ParsedFile>(files[0]);
  const [treeOpen, setTreeOpen] = useState(true);

  // Group files into a simple flat tree representation for now
  
  const getIcon = (filename: string) => {
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
    if (filename.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-yellow-400" />;
    if (filename.endsWith('.prisma')) return <Database className="w-3.5 h-3.5 text-emerald-400" />;
    return <FileText className="w-3.5 h-3.5 text-gray-400" />;
  };

  return (
    <div className="flex h-[600px] rounded-xl overflow-hidden glass" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="p-3 text-xs font-semibold text-white/40 uppercase tracking-widest border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          EXPLORER
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <button 
            onClick={() => setTreeOpen(!treeOpen)}
            className="flex items-center gap-1 w-full px-2 py-1.5 text-xs font-bold text-white/70 hover:text-white transition-colors">
            {treeOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Folder className="w-3.5 h-3.5 text-neon-blue" />
            src
          </button>
          
          {treeOpen && (
            <div className="pl-6 space-y-0.5">
              {files.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFile(f)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-md transition-colors text-left"
                  style={{
                    background: activeFile === f ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: activeFile === f ? '#fff' : 'rgba(255,255,255,0.6)'
                  }}
                >
                  {getIcon(f.name)}
                  <span className="truncate">{f.path}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#1e1e1e' }}>
        {/* Editor Tabs */}
        <div className="flex bg-[#252526] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border-t-2 border-neon-blue text-xs text-white">
            {getIcon(activeFile.name)}
            {activeFile.name}
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto">
          <SyntaxHighlighter
            language={activeFile.language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '16px',
              background: 'transparent',
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
            showLineNumbers
          >
            {activeFile.content}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
