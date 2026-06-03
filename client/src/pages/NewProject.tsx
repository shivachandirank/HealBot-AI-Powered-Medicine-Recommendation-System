import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Box } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import TabGroup from '../components/ui/TabGroup';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { DragDropUpload } from '../components/DragDropUpload';
import LoadingOverlay from '../components/ui/LoadingOverlay';

const TEMPLATES = [
  {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    icon: <Box className="w-6 h-6 text-emerald-400" />,
    description: 'Complete backend for an online store with products, carts, orders, and payments.',
    tags: ['Products', 'Orders', 'Payments', 'Users'],
    requirements: 'Build an e-commerce backend. I need a User entity (id, email, password_hash, role). Product entity (id, name, description, price, stock). Order entity (id, user_id, status, total_amount). OrderItem entity (id, order_id, product_id, quantity, price). Users can browse products. Authenticated users can place orders. Admins can manage products. Include JWT auth and RBAC.'
  },
  {
    id: 'saas',
    name: 'SaaS API Backend',
    icon: <Box className="w-6 h-6 text-electric-blue" />,
    description: 'Multi-tenant SaaS backend with subscription management and organizations.',
    tags: ['Multi-tenant', 'Subscriptions', 'Teams'],
    requirements: 'Create a multi-tenant SaaS API. Entities: Organization (id, name, subscription_tier), User (id, org_id, email, password, role), Project (id, org_id, name, status). Users belong to an organization. Projects belong to an organization. Implement role-based access control (Owner, Admin, Member). Include subscription limits logic.'
  },
  {
    id: 'social',
    name: 'Social Media Platform',
    icon: <Box className="w-6 h-6 text-purple-400" />,
    description: 'Social network backend with posts, comments, likes, and followers.',
    tags: ['Posts', 'Followers', 'Feeds'],
    requirements: 'Social media backend. Entities: User (username, email, bio), Post (author_id, content, created_at), Comment (post_id, author_id, content), Like (post_id, user_id), Follower (follower_id, following_id). Users can create posts, comment, and like. Need feed generation logic. Include rate limiting and robust input validation.'
  },
  {
    id: 'iot',
    name: 'IoT Dashboard',
    icon: <Box className="w-6 h-6 text-amber-400" />,
    description: 'Time-series data collection and device management backend.',
    tags: ['Devices', 'Telemetry', 'Alerts'],
    requirements: 'IoT device management platform. Entities: Device (id, mac_address, type, status, owner_id), TelemetryData (device_id, timestamp, temperature, humidity, battery), Alert (device_id, type, threshold, active). Devices report data continuously. System generates alerts based on thresholds. Must handle high write throughput.'
  }
];

export const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { createProject, uploadUml, generateArchitecture, isLoading } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState('text');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [umlFile, setUmlFile] = useState<File | null>(null);

  const tabs = [
    { id: 'text', label: 'Text Requirements', icon: FileText },
    { id: 'upload', label: 'Upload UML', icon: ImageIcon },
    { id: 'templates', label: 'Templates', icon: Box },
  ];

  const handleGenerate = async () => {
    if (!name) {
      alert('Please provide a project name');
      return;
    }

    try {
      let project;
      if (activeTab === 'upload' && umlFile) {
        project = await uploadUml(name, description, umlFile);
      } else {
        if (!requirements) {
          alert('Please provide requirements');
          return;
        }
        project = await createProject(name, description, requirements);
      }
      
      if (project) {
        // Start architecture generation
        await generateArchitecture(project.id);
        navigate(`/project/${project.id}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Check console for details.');
    }
  };

  const handleTemplateSelect = (reqs: string) => {
    setRequirements(reqs);
    setActiveTab('text'); // Switch back to text tab
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-400">Describe your architecture or upload a diagram, and AI will generate the rest.</p>
      </div>

      <GlassCard className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
            <input
              type="text"
              className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              placeholder="e.g. Acme E-commerce Backend"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
            <input
              type="text"
              className="w-full bg-navy-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all"
              placeholder="Brief description of the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 mb-6">
        <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-6">
          {activeTab === 'text' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <label className="block text-sm font-medium text-gray-300 mb-2">System Requirements</label>
              <textarea
                className="w-full h-64 bg-navy-900/50 border border-white/10 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue transition-all resize-none custom-scrollbar"
                placeholder={`Describe the entities, relationships, and features you need...

Example:
I need a blogging platform backend.
Entities:
- User (id, email, password_hash, role)
- Post (id, author_id, title, content, published)
- Comment (id, post_id, author_id, content)

Requirements:
- Users can register and login (JWT auth)
- Authors can create, edit, delete their own posts
- Anyone can read published posts
- Users can comment on published posts
- Implement strict input validation and rate limiting`}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              ></textarea>
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DragDropUpload onUpload={setUmlFile} />
            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((template) => (
                <div 
                  key={template.id}
                  className="bg-navy-900/50 border border-white/10 rounded-xl p-5 cursor-pointer hover:border-electric-blue/50 hover:bg-white/5 transition-all group"
                  onClick={() => handleTemplateSelect(template.requirements)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-electric-blue/10 transition-colors">
                      {template.icon}
                    </div>
                    <h3 className="font-semibold text-white">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-white/5 text-gray-300 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <AnimatedButton
          onClick={handleGenerate}
          loading={isLoading}
          disabled={!name || (activeTab === 'text' && !requirements) || (activeTab === 'upload' && !umlFile)}
          className="px-8 py-3"
        >
          Generate Secure Architecture
        </AnimatedButton>
      </div>

      <LoadingOverlay 
        visible={isLoading}
        title="Synthesizing Architecture..." 
        subtitle="Analyzing requirements with Gemini..."
        stages={[]}
      />
    </motion.div>
  );
};
