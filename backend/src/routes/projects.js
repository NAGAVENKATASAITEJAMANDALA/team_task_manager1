const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// GET /api/projects
router.get('/', authenticate, (req, res) => {
  const projects = req.user.role === 'admin'
    ? db.getAllProjects()
    : db.getProjectsForUser(req.user.id);
  
  const enriched = projects.map(p => {
    const owner = db.findUserById(p.ownerId);
    const tasks = db.getTasksByProject(p.id);
    const members = db.getProjectMembers(p.id);
    return {
      ...p,
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
      taskCount: tasks.length,
      memberCount: members.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
    };
  });
  res.json({ projects: enriched });
});

// POST /api/projects
router.post('/', authenticate, [
  body('name').trim().notEmpty().withMessage('Project name required'),
  body('description').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, description } = req.body;
  const project = db.createProject({
    name,
    description: description || '',
    ownerId: req.user.id,
    status: 'active',
  });
  res.status(201).json({ project });
});

// GET /api/projects/:id
router.get('/:id', authenticate, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (req.user.role !== 'admin' && !db.isProjectMember(project.id, req.user.id)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const tasks = db.getTasksByProject(project.id);
  const members = db.getProjectMembers(project.id);
  const owner = db.findUserById(project.ownerId);

  res.json({
    project: {
      ...project,
      owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
      tasks,
      members,
    }
  });
});

// PUT /api/projects/:id
router.put('/:id', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['active', 'completed', 'archived']),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Only admin or project admin can update
  const memberRole = db.getMemberRole(project.id, req.user.id);
  if (req.user.role !== 'admin' && memberRole !== 'admin') {
    return res.status(403).json({ error: 'Only project admin can update' });
  }

  const updated = db.updateProject(req.params.id, req.body);
  res.json({ project: updated });
});

// DELETE /api/projects/:id
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  db.deleteProject(req.params.id);
  res.json({ message: 'Project deleted' });
});

// POST /api/projects/:id/members
router.post('/:id/members', authenticate, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const memberRole = db.getMemberRole(project.id, req.user.id);
  if (req.user.role !== 'admin' && memberRole !== 'admin') {
    return res.status(403).json({ error: 'Only project admin can add members' });
  }

  const { userId, role } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const pm = db.addProjectMember(project.id, userId, role || 'member');
  res.status(201).json({ member: pm });
});

// DELETE /api/projects/:id/members/:userId
router.delete('/:id/members/:userId', authenticate, (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const memberRole = db.getMemberRole(project.id, req.user.id);
  if (req.user.role !== 'admin' && memberRole !== 'admin') {
    return res.status(403).json({ error: 'Only project admin can remove members' });
  }

  db.removeProjectMember(project.id, req.params.userId);
  res.json({ message: 'Member removed' });
});

module.exports = router;
