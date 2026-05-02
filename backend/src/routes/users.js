const router = require('express').Router();
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/users - admin only
router.get('/', authenticate, requireAdmin, (req, res) => {
  res.json({ users: db.getAllUsers() });
});

// GET /api/users/dashboard
router.get('/dashboard', authenticate, (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const stats = db.getDashboardStats(req.user.id, isAdmin);
  
  // Recent tasks
  const allTasks = isAdmin
    ? db.tasks
    : db.tasks.filter(t => {
        const userProjects = db.getProjectsForUser(req.user.id).map(p => p.id);
        return userProjects.includes(t.projectId);
      });
  
  const now = new Date();
  const recentTasks = allTasks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(t => {
      const project = db.getProjectById(t.projectId);
      const assignee = t.assigneeId ? db.findUserById(t.assigneeId) : null;
      return {
        ...t,
        project: project ? { id: project.id, name: project.name } : null,
        assignee: assignee ? { id: assignee.id, name: assignee.name } : null,
        isOverdue: t.dueDate && new Date(t.dueDate) < now && t.status !== 'done',
      };
    });

  const overdueTasks = allTasks
    .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done')
    .slice(0, 5)
    .map(t => {
      const project = db.getProjectById(t.projectId);
      return { ...t, project: project ? { id: project.id, name: project.name } : null };
    });

  res.json({ stats, recentTasks, overdueTasks });
});

module.exports = router;
