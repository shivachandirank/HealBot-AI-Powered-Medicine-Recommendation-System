import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Upload, BookTemplate, Box, Code2, Shield, Activity } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-10"
    >
      <div className="text-center py-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-electric-blue/20 rounded-full blur-[100px] pointer-events-none"></div>
        <motion.h1 variants={itemVariants} className="text-5xl font-extrabold mb-4">
          <span className="gradient-text">SecureForge AI</span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-2xl mx-auto">
          AI-Driven Secure Architecture Synthesizer. From requirements to production-ready secure backend in minutes.
        </motion.p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard stat={{ label: "Projects Created", value: projects.length, icon: Box, color: 'blue', trend: 'up', suffix: '' }} />
        <StatCard stat={{ label: "Lines Generated", value: 45200, icon: Code2, color: 'emerald', trend: 'up', suffix: '' }} />
        <StatCard stat={{ label: "Avg Security Score", value: 94, icon: Shield, color: 'purple', trend: 'up', suffix: '/100' }} />
        <StatCard stat={{ label: "Threats Mitigated", value: 1284, icon: Activity, color: 'cyan', trend: 'up', suffix: '' }} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-electric-blue w-2 h-8 rounded-full mr-3"></span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard 
            className="p-6 cursor-pointer hover:-translate-y-1 transition-transform duration-300 group"
            onClick={() => navigate('/new-project')}
          >
            <div className="w-12 h-12 rounded-xl bg-electric-blue/20 text-electric-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">New Project</h3>
            <p className="text-gray-400 text-sm">Create a new architecture from plain text requirements.</p>
          </GlassCard>

          <GlassCard 
            className="p-6 cursor-pointer hover:-translate-y-1 transition-transform duration-300 group"
            onClick={() => navigate('/new-project')}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Upload UML</h3>
            <p className="text-gray-400 text-sm">Generate code directly from Class or Sequence diagrams.</p>
          </GlassCard>

          <GlassCard 
            className="p-6 cursor-pointer hover:-translate-y-1 transition-transform duration-300 group"
            onClick={() => navigate('/new-project')}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookTemplate className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Browse Templates</h3>
            <p className="text-gray-400 text-sm">Start from industry-standard secure architecture templates.</p>
          </GlassCard>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="bg-cyan-500 w-2 h-8 rounded-full mr-3"></span>
          Recent Projects
        </h2>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map(project => (
              <GlassCard 
                key={project.id}
                className="p-5 cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold truncate pr-2">{project.name}</h3>
                  <Badge variant={project.status === 'completed' ? 'filled' : project.status === 'error' ? 'outline' : 'subtle'} severity={project.status === 'completed' ? 'low' : project.status === 'error' ? 'critical' : 'medium'}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 h-10">{project.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  {project.securityReport && (
                    <span className="flex items-center text-emerald-400">
                      <Shield className="w-3 h-3 mr-1" />
                      Score: {project.securityReport.overallScore}
                    </span>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="p-10 text-center flex flex-col items-center justify-center">
            <Box className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first architecture project to get started.</p>
            <button 
              onClick={() => navigate('/new-project')}
              className="px-6 py-2 bg-electric-blue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Create Project
            </button>
          </GlassCard>
        )}
      </motion.div>
    </motion.div>
  );
};
