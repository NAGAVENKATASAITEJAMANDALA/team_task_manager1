import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage, SignupPage } from './pages/AuthPages';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TasksPage, UsersPage } from './pages/OtherPages';

function AuthGate() {
  const [authPage, setAuthPage] = useState('login');
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text2)' }}>Loading TeamFlow...</p>
      </div>
    </div>
  );

  if (!user) {
    if (authPage === 'login') return <LoginPage onSwitchToSignup={() => setAuthPage('signup')} />;
    return <SignupPage onSwitchToLogin={() => setAuthPage('login')} />;
  }

  return <MainApp />;
}

function MainApp() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [viewingProjectId, setViewingProjectId] = useState(null);

  const handleNavigate = (p) => {
    setPage(p);
    setViewingProjectId(null);
  };

  const handleViewProject = (id) => {
    setViewingProjectId(id);
    setPage('project-detail');
  };

  return (
    <div className="layout">
      <Sidebar currentPage={page} onNavigate={handleNavigate} />
      <main className="main-content">
        {page === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {page === 'projects' && <ProjectsPage onViewProject={handleViewProject} />}
        {page === 'project-detail' && viewingProjectId && (
          <ProjectDetailPage projectId={viewingProjectId} onBack={() => handleNavigate('projects')} />
        )}
        {page === 'tasks' && <TasksPage />}
        {page === 'users' && isAdmin && <UsersPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
