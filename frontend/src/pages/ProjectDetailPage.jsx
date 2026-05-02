import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function TaskModal({ task, projectId, members, onClose, onSaved }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    projectId: task?.projectId || projectId,
    assigneeId: task?.assigneeId || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, assigneeId: form.assigneeId || undefined, dueDate: form.dueDate || undefined };
      let res;
      if (isEdit) res = await api.updateTask(task.id, payload);
      else res = await api.createTask(payload);
      onSaved(res.data.task, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task title" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Task description..." rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Assignee</label>
              <select value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUsers().then(res => setUsers(res.data.users)).catch(console.error);
  }, []);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const res = await api.addMember(projectId, selectedUserId, role);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Member</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label>Select User</label>
          <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
            <option value="">Choose a user...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={loading || !selectedUserId}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--todo)' },
  { id: 'in_progress', label: 'In Progress', color: 'var(--inprogress)' },
  { id: 'done', label: 'Done', color: 'var(--done)' },
];

export function ProjectDetailPage({ projectId, onBack }) {
  const { user, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');

  const fetchProject = () => {
    api.getProject(projectId)
      .then(res => {
        setProject(res.data.project);
        setTasks(res.data.project.tasks || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  const handleTaskSaved = (task, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    else setTasks(prev => [...prev, task]);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!project) return <div>Project not found</div>;

  const members = project.members || [];
  const memberRole = members.find(m => m.userId === user?.id)?.role;
  const canManage = isAdmin || memberRole === 'admin';

  const now = new Date();

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" style={{ marginBottom: 8 }} onClick={onBack}>← Back to Projects</button>
          <h1>{project.name}</h1>
          <p style={{ color: 'var(--text2)' }}>{project.description || 'No description'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage && <button className="btn btn-ghost" onClick={() => setShowAddMember(true)}>+ Member</button>}
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>+ Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: -1 }}>
        {['kanban', 'list', 'members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', borderRadius: '8px 8px 0 0', fontSize: 14, fontWeight: 500,
              background: activeTab === tab ? 'var(--card)' : 'transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text2)',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : 'none',
            }}>
            {tab === 'kanban' ? '📋 Kanban' : tab === 'list' ? '📝 List' : '👥 Members'}
          </button>
        ))}
      </div>

      {/* Kanban View */}
      {activeTab === 'kanban' && (
        <div className="kanban">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="kanban-col">
                <div className="kanban-col-header">
                  <span style={{ color: col.color }}>{col.label}</span>
                  <span className="badge" style={{ background: 'var(--bg)', color: 'var(--text2)' }}>{colTasks.length}</span>
                </div>
                {colTasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
                  return (
                    <div key={task.id} className={`task-card ${isOverdue ? 'overdue' : ''}`}
                      onClick={() => { setEditingTask(task); setShowTaskModal(true); }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 8 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.description}</div>}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {isOverdue && <span className="badge badge-overdue">Overdue</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
                        <span>{task.assignee ? `👤 ${task.assignee.name}` : '👤 Unassigned'}</span>
                        {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  );
                })}
                {colTasks.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: 13 }}>No tasks</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">✅</div>
              <h3>No tasks yet</h3>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowTaskModal(true)}>Add Task</button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
                  return (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        {task.description && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{task.description}</div>}
                      </td>
                      <td>
                        <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)}
                          style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                      <td style={{ fontSize: 13 }}>{task.assignee?.name || '—'}</td>
                      <td style={{ fontSize: 13, color: isOverdue ? 'var(--accent2)' : 'inherit' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                        {isOverdue && ' ⚠️'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => { setEditingTask(task); setShowTaskModal(true); }}>Edit</button>
                          <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                            onClick={() => handleDeleteTask(task.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Members View */}
      {activeTab === 'members' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.userId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {m.user?.name?.charAt(0)}
                      </div>
                      {m.user?.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)', fontSize: 13 }}>{m.user?.email}</td>
                  <td><span className={`badge badge-${m.role}`}>{m.role}</span></td>
                  {canManage && (
                    <td>
                      {m.userId !== user?.id && (
                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                          onClick={async () => {
                            if (!confirm('Remove member?')) return;
                            await api.removeMember(projectId, m.userId);
                            fetchProject();
                          }}>Remove</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          projectId={projectId}
          members={members}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddMember(false)}
          onAdded={fetchProject}
        />
      )}
    </div>
  );
}
