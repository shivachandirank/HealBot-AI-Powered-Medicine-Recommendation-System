import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, Code2, Shield, FileJson, Container, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { currentProject } = useProjectStore();
  const { id } = useParams();
  
  const activeProjectId = id || currentProject?.id;

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      className="h-screen glass-strong border-r border-white/10 flex flex-col relative z-20 shrink-0"
    >
      <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0">
        <Shield className="w-8 h-8 text-electric-blue shrink-0" />
        {!collapsed && (
          <span className="ml-3 font-semibold text-lg whitespace-nowrap bg-gradient-to-r from-electric-blue to-cyan bg-clip-text text-transparent">
            SecureForge AI
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ml-3 font-medium">Dashboard</span>}
        </NavLink>
        
        <NavLink
          to="/new-project"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Plus className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ml-3 font-medium">New Project</span>}
        </NavLink>

        {activeProjectId && (
          <div className="mt-8 mb-2">
            {!collapsed && <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Project</div>}
            
            <NavLink
              to={`/project/${activeProjectId}`}
              end
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Code2 className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="ml-3 font-medium">Architecture</span>}
            </NavLink>

            <NavLink
              to={`/project/${activeProjectId}/security`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Shield className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="ml-3 font-medium">Security</span>}
            </NavLink>

            <NavLink
              to={`/project/${activeProjectId}/api-docs`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <FileJson className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="ml-3 font-medium">API Docs</span>}
            </NavLink>

            <NavLink
              to={`/project/${activeProjectId}/devops`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? 'bg-electric-blue/10 text-electric-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Container className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="ml-3 font-medium">DevOps</span>}
            </NavLink>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};
