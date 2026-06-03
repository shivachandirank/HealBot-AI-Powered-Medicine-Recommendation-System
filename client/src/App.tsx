import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewProject } from './pages/NewProject';
import { ProjectView } from './pages/ProjectView';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { DevOpsPage } from './pages/DevOpsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new-project" element={<NewProject />} />
          <Route path="project/:id" element={<ProjectView />} />
          <Route path="project/:id/security" element={<SecurityDashboard />} />
          <Route path="project/:id/api-docs" element={<ApiDocsPage />} />
          <Route path="project/:id/devops" element={<DevOpsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
