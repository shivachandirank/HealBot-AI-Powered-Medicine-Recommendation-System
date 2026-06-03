import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AppState } from '../types';

export default function ExportButton({ appState }: { appState: AppState }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const zip = new JSZip();
      
      // Safely serialize the object
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

      const codeStr = typeof appState.generatedCode === 'object' && appState.generatedCode !== null 
          ? serializeObject(appState.generatedCode)
          : String(appState.generatedCode || '');
          
      const devOpsStr = typeof appState.devOps === 'object' && appState.devOps !== null
          ? serializeObject(appState.devOps)
          : String(appState.devOps || '');

      const allText = `
${codeStr}
${devOpsStr}
      `;

      // Split by common file header patterns
      const fileRegex = /(?:\n|^)(?:\/\/\s*|###\s*`?|File:\s*`?)([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)`?\s*\n/g;
      
      const matches = [];
      let match;
      while ((match = fileRegex.exec(allText)) !== null) {
        matches.push({
          path: match[1],
          index: match.index,
          matchLength: match[0].length
        });
      }

      if (matches.length > 0) {
        for (let i = 0; i < matches.length; i++) {
          const current = matches[i];
          const next = matches[i + 1];
          
          let content = allText.substring(
            current.index + current.matchLength,
            next ? next.index : allText.length
          ).trim();
          
          content = content.replace(/^```[a-z]*\n/i, '');
          content = content.replace(/\n```$/i, '');
          content = content.replace(/```/g, ''); // brute force clean
          
          zip.file(current.path, content);
        }
      } else {
        // Fallback if no files detected
        zip.file('secureforge-backend.ts', appState.generatedCode || '');
      }
      
      // Add diagrams
      if (appState.diagrams) {
        const d = appState.diagrams as any;
        if (d.classDiagram) zip.file('diagrams/class.mermaid', d.classDiagram);
        if (d.erDiagram) zip.file('diagrams/er.mermaid', d.erDiagram);
        if (d.sequenceDiagram) zip.file('diagrams/sequence.mermaid', d.sequenceDiagram);
      }

      // Add reports
      if (appState.strideReport) zip.file('reports/STRIDE.md', JSON.stringify(appState.strideReport, null, 2));
      if (appState.securityAudit) zip.file('reports/SECURITY.md', JSON.stringify(appState.securityAudit, null, 2));

      // Generate zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'secureforge-architecture.zip');

    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-glow-sm"
      style={{ 
        background: 'rgba(0,212,255,0.1)', 
        color: '#00D4FF', 
        border: '1px solid rgba(0,212,255,0.3)' 
      }}
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Export .zip
    </button>
  );
}
