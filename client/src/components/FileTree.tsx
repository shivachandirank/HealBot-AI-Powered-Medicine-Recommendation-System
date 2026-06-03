import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FileJson, FileCode2, FileText, Database } from 'lucide-react';
import type { FileTreeNode } from '../types';

interface FileTreeProps {
  nodes: FileTreeNode[];
  onSelect?: (path: string) => void;
  selectedPath?: string;
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({ nodes, onSelect, selectedPath, level = 0 }) => {
  return (
    <div className="w-full">
      {nodes.map((node, index) => (
        <FileTreeNodeItem
          key={`${node.path}-${index}`}
          node={node}
          onSelect={onSelect}
          selectedPath={selectedPath}
          level={level}
        />
      ))}
    </div>
  );
};

interface FileTreeNodeItemProps {
  node: FileTreeNode;
  onSelect?: (path: string) => void;
  selectedPath?: string;
  level: number;
}

const FileTreeNodeItem: React.FC<FileTreeNodeItemProps> = ({ node, onSelect, selectedPath, level }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const isSelected = selectedPath === node.path;
  const isDir = node.type === 'directory';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDir) {
      setExpanded(!expanded);
    } else if (onSelect) {
      onSelect(node.path);
    }
  };

  const getFileIcon = () => {
    if (isDir) return <Folder className="w-4 h-4 text-cyan-400" fill="currentColor" fillOpacity={0.2} />;
    
    const ext = node.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode2 className="w-4 h-4 text-electric-blue" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-amber-400" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-400" />;
      case 'sql':
      case 'prisma':
        return <Database className="w-4 h-4 text-purple-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1.5 px-2 cursor-pointer transition-colors hover:bg-white/5 rounded-md ${
          isSelected && !isDir ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center w-4 h-4 mr-1 shrink-0">
          {isDir && (
            <span className="text-gray-500">
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
          )}
        </div>
        <div className="mr-2 shrink-0">{getFileIcon()}</div>
        <span className="text-sm truncate select-none">{node.name}</span>
      </div>
      
      {isDir && expanded && node.children && (
        <div className="flex flex-col">
          <FileTree
            nodes={node.children}
            onSelect={onSelect}
            selectedPath={selectedPath}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};
