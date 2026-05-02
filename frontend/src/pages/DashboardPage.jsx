import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export function DashboardPage({ onNavigate }) {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return <div>Failed to load</div>;

  const { stats, recentTasks, overdueTasks } = data;

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, color: 'var(--accent)', icon: '📁' },
    { label: 'Total Tasks', value: stats.totalTasks, color: 'var(--text)', icon: '✅' },
    { label: 'To Do', value: stats.todoTasks, color: 'var(--todo)', icon: '⏳' },
    { label: 'In Progress', value: stats.inProgressTasks, color: 'var(--inprogress)', icon: '🔄' },
    { label: 'Completed', value: stats.doneTasks, color: 'var(--done)', icon: '✔️' },
    { label: 'Overdue', value: stats.overdueTasks, color: 'var(--accent2)', icon: '🚨' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Here's what's happening with your projects</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 32 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Recent Tasks</h3>
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => onNavigate('tasks')}>View all</button>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <p>No tasks yet</p>
            </div>
          ) : (
            recentTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{task.project?.name}</div>
                </div>
                <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                {task.isOverdue && <span className="badge badge-overdue">Overdue</span>}
              </div>
            ))
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3>⚠️ Overdue Tasks</h3>
          </div>
          {overdueTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div style={{ color: 'var(--done)', fontSize: 24, marginBottom: 8 }}>✓</div>
              <p style={{ color: 'var(--text2)' }}>No overdue tasks!</p>
            </div>
          ) : (
            overdueTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--accent2)' }}>
                    Due: {new Date(task.dueDate).toLocaleDateString()} · {task.project?.name}
                  </div>
                </div>
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
