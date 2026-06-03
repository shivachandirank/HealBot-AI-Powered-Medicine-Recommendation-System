import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import LoadingScreen from './components/LoadingScreen';
import ParticleBackground from './components/ParticleBackground';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    return <LoadingScreen onComplete={() => setLoaded(true)} />;
  }

  return (
    <>
      {/* Interactive particle system — behind everything */}
      <ParticleBackground />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(5,8,22,0.95)',
            color: '#F8FAFC',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: '14px',
            backdropFilter: 'blur(20px)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.05)',
          },
          success: {
            iconTheme: { primary: '#00FF88', secondary: '#042f2e' },
          },
          error: {
            iconTheme: { primary: '#ff4757', secondary: '#450a0a' },
          },
          duration: 4000,
        }}
      />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="workspace" element={<WorkspacePage />} />
        </Route>
      </Routes>
    </>
  );
}
