import React from 'react';
import { useLocation } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { currentProject } = useProjectStore();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    if (location.pathname === '/new-project') return 'New Project';
    if (location.pathname.includes('/security')) return 'Security Dashboard';
    if (location.pathname.includes('/api-docs')) return 'API Documentation';
    if (location.pathname.includes('/devops')) return 'DevOps Configuration';
    if (location.pathname.includes('/project/')) return 'Architecture View';
    return '';
  };

  return (
    <header className="h-16 glass z-10 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        {currentProject && location.pathname.includes('/project/') && (
          <span className="ml-4 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-300">
            {currentProject.name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          AI Ready
        </div>
      </div>
    </header>
  );
};
