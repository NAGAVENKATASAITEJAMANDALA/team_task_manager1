// In-memory database (replace with PostgreSQL/MySQL for production)
// For Railway deployment, use process.env.DATABASE_URL with pg package

const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.users = [];
    this.projects = [];
    this.tasks = [];
    this.projectMembers = [];
    
    // Seed admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    this.users.push({
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
  }

  // Users
  findUserByEmail(email) {
    return this.users.find(u => u.email === email);
  }
  findUserById(id) {
    return this.users.find(u => u.id === id);
  }
  createUser(data) {
    const user = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    this.users.push(user);
    return user;
  }
  getAllUsers() {
    return this.users.map(({ password, ...u }) => u);
  }

  // Projects
  createProject(data) {
    const project = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
    this.projects.push(project);
    // Add owner as admin member
    this.projectMembers.push({ projectId: project.id, userId: data.ownerId, role: 'admin' });
    return project;
  }
  getProjectById(id) {
    return this.projects.find(p => p.id === id);
  }
  getProjectsForUser(userId) {
    const memberProjectIds = this.projectMembers
      .filter(pm => pm.userId === userId)
      .map(pm => pm.projectId);
    return this.projects.filter(p => memberProjectIds.includes(p.id));
  }
  getAllProjects() {
    return this.projects;
  }
  updateProject(id, data) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.projects[idx] = { ...this.projects[idx], ...data, updatedAt: new Date().toISOString() };
    return this.projects[idx];
  }
  deleteProject(id) {
    this.projects = this.projects.filter(p => p.id !== id);
    this.tasks = this.tasks.filter(t => t.projectId !== id);
    this.projectMembers = this.projectMembers.filter(pm => pm.projectId !== id);
  }

  // Project Members
  addProjectMember(projectId, userId, role = 'member') {
    const existing = this.projectMembers.find(pm => pm.projectId === projectId && pm.userId === userId);
    if (existing) return existing;
    const pm = { projectId, userId, role };
    this.projectMembers.push(pm);
    return pm;
  }
  getProjectMembers(projectId) {
    return this.projectMembers
      .filter(pm => pm.projectId === projectId)
      .map(pm => {
        const user = this.findUserById(pm.userId);
        return user ? { ...pm, user: { id: user.id, name: user.name, email: user.email } } : pm;
      });
  }
  isProjectMember(projectId, userId) {
    return this.projectMembers.some(pm => pm.projectId === projectId && pm.userId === userId);
  }
  getMemberRole(projectId, userId) {
    const pm = this.projectMembers.find(pm => pm.projectId === projectId && pm.userId === userId);
    return pm ? pm.role : null;
  }
  removeProjectMember(projectId, userId) {
    this.projectMembers = this.projectMembers.filter(
      pm => !(pm.projectId === projectId && pm.userId === userId)
    );
  }

  // Tasks
  createTask(data) {
    const task = { id: uuidv4(), ...data, status: data.status || 'todo', createdAt: new Date().toISOString() };
    this.tasks.push(task);
    return task;
  }
  getTaskById(id) {
    return this.tasks.find(t => t.id === id);
  }
  getTasksByProject(projectId) {
    return this.tasks.filter(t => t.projectId === projectId);
  }
  getTasksByAssignee(userId) {
    return this.tasks.filter(t => t.assigneeId === userId);
  }
  updateTask(id, data) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date().toISOString() };
    return this.tasks[idx];
  }
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }
  getOverdueTasks() {
    const now = new Date();
    return this.tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
  }
  getDashboardStats(userId, isAdmin) {
    const userTasks = isAdmin ? this.tasks : this.tasks.filter(t => t.assigneeId === userId);
    const userProjects = isAdmin ? this.projects : this.getProjectsForUser(userId);
    const now = new Date();
    return {
      totalProjects: userProjects.length,
      totalTasks: userTasks.length,
      todoTasks: userTasks.filter(t => t.status === 'todo').length,
      inProgressTasks: userTasks.filter(t => t.status === 'in_progress').length,
      doneTasks: userTasks.filter(t => t.status === 'done').length,
      overdueTasks: userTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
    };
  }
}

module.exports = new Database();
