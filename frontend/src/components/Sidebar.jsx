import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'projects', icon: '📁', label: 'Projects' },
  { id: 'tasks', icon: '✅', label: 'My Tasks' },
  { id: 'users', icon: '👥', label: 'Users', adminOnly: true },
];

export function Sidebar({ currentPage, onNavigate }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>TeamFlow</h1>
        <span>Task Manager</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.filter(item => !item.adminOnly || isAdmin).map(item => (
          <div
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <div className="name">{user?.name}</div>
          <div className="role">{user?.role}</div>
        </div>
        <button
          onClick={logout}
          style={{ background: 'none', color: 'var(--text3)', fontSize: 18, padding: 4 }}
          title="Sign out"
        >
          ↩
        </button>
      </div>
    </div>
  );
}
