const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

// GET /api/tasks - get all tasks for user
router.get('/', authenticate, (req, res) => {
  const { projectId, status, assigneeId } = req.query;
  let tasks;

  if (req.user.role === 'admin') {
    tasks = projectId ? db.getTasksByProject(projectId) : db.tasks;
  } else {
    // Member: only tasks from their projects
    const userProjects = db.getProjectsForUser(req.user.id);
    const projectIds = userProjects.map(p => p.id);
    tasks = db.tasks.filter(t => projectIds.includes(t.projectId));
    if (projectId) tasks = tasks.filter(t => t.projectId === projectId);
  }

  if (status) tasks = tasks.filter(t => t.status === status);
  if (assigneeId) tasks = tasks.filter(t => t.assigneeId === assigneeId);

  const enriched = tasks.map(t => enrichTask(t));
  res.json({ tasks: enriched });
});

function enrichTask(task) {
  const assignee = task.assigneeId ? db.findUserById(task.assigneeId) : null;
  const creator = task.createdBy ? db.findUserById(task.createdBy) : null;
  const project = db.getProjectById(task.projectId);
  return {
    ...task,
    assignee: assignee ? { id: assignee.id, name: assignee.name, email: assignee.email } : null,
    creator: creator ? { id: creator.id, name: creator.name } : null,
    project: project ? { id: project.id, name: project.name } : null,
    isOverdue: task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done',
  };
}

// POST /api/tasks
router.post('/', authenticate, [
  body('title').trim().notEmpty().withMessage('Task title required'),
  body('projectId').notEmpty().withMessage('Project ID required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('dueDate').optional().isISO8601(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, description, projectId, assigneeId, priority, status, dueDate } = req.body;
  
  const project = db.getProjectById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Check access
  if (req.user.role !== 'admin' && !db.isProjectMember(projectId, req.user.id)) {
    return res.status(403).json({ error: 'Not a member of this project' });
  }

  const task = db.createTask({
    title,
    description: description || '',
    projectId,
    assigneeId: assigneeId || null,
    priority: priority || 'medium',
    status: status || 'todo',
    dueDate: dueDate || null,
    createdBy: req.user.id,
  });

  res.status(201).json({ task: enrichTask(task) });
});

// GET /api/tasks/:id
router.get('/:id', authenticate, (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.user.role !== 'admin' && !db.isProjectMember(task.projectId, req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ task: enrichTask(task) });
});

// PUT /api/tasks/:id
router.put('/:id', authenticate, [
  body('title').optional().trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('dueDate').optional().isISO8601(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (req.user.role !== 'admin' && !db.isProjectMember(task.projectId, req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updated = db.updateTask(req.params.id, req.body);
  res.json({ task: enrichTask(updated) });
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const memberRole = db.getMemberRole(task.projectId, req.user.id);
  if (req.user.role !== 'admin' && memberRole !== 'admin' && task.createdBy !== req.user.id) {
    return res.status(403).json({ error: 'Only task creator or admin can delete' });
  }

  db.deleteTask(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
