<<<<<<< HEAD
# TeamFlow - Team Task Manager

A full-stack web application for managing projects, tasks, and teams with role-based access control.

## 🚀 Live Demo

> Deploy to Railway and add your URL here

## ✨ Features

### Authentication
- JWT-based signup/login
- Role-based access (Admin / Member)

### Projects
- Create, view, update, delete projects
- Add/remove team members with roles
- Progress tracking with completion percentage

### Tasks
- Create tasks with title, description, priority, status, due date
- Assign tasks to project members
- Kanban board view (To Do / In Progress / Done)
- List view with inline status updates
- Overdue task detection and alerts

### Dashboard
- Summary stats (total projects, tasks by status, overdue count)
- Recent tasks
- Overdue tasks overview

### Admin Features
- View all users
- Access all projects and tasks
- Delete any project

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js
- JWT Authentication (bcryptjs + jsonwebtoken)
- In-memory database (easily swappable to PostgreSQL)
- express-validator for input validation
- REST API with role-based access control

**Frontend:**
- React 18 + Vite
- React Router (client-side routing)
- Axios for API calls
- CSS custom properties for theming

## 📦 Project Structure

```
teamflow/
├── backend/
│   ├── src/
│   │   ├── db/database.js        # In-memory DB (swap with PostgreSQL)
│   │   ├── middleware/auth.js    # JWT auth middleware
│   │   └── routes/
│   │       ├── auth.js           # Signup, Login, Me
│   │       ├── projects.js       # CRUD + members
│   │       ├── tasks.js          # CRUD + filtering
│   │       └── users.js          # Users list + dashboard
│   └── server.js                 # Express app entry
├── frontend/
│   └── src/
│       ├── context/AuthContext.jsx
│       ├── pages/
│       │   ├── AuthPages.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── ProjectsPage.jsx
│       │   ├── ProjectDetailPage.jsx
│       │   └── OtherPages.jsx
│       ├── components/Sidebar.jsx
│       ├── api.js
│       └── App.jsx
└── railway.toml
```

## 🏃 Running Locally

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd teamflow
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
node server.js
# Backend runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Default Admin Credentials
- Email: `admin@example.com`
- Password: `admin123`

## 🚀 Deployment on Railway

### Method 1: Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Method 2: Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Connect your GitHub repo
4. Set environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=<generate-random-64-char-string>
   PORT=5000
   ```
5. Railway auto-detects the `railway.toml` and deploys

### Environment Variables for Production
| Variable | Description |
|----------|-------------|
| `NODE_ENV` | Set to `production` |
| `JWT_SECRET` | Random secret string (64+ chars) |
| `PORT` | Port (Railway sets this automatically) |
| `FRONTEND_URL` | Your frontend domain (for CORS) |

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/projects` | List projects | All |
| POST | `/api/projects` | Create project | All |
| GET | `/api/projects/:id` | Get project details | Member+ |
| PUT | `/api/projects/:id` | Update project | Project Admin+ |
| DELETE | `/api/projects/:id` | Delete project | Admin only |
| POST | `/api/projects/:id/members` | Add member | Project Admin+ |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Project Admin+ |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filtered) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Users
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/users` | List all users | Admin only |
| GET | `/api/users/dashboard` | Dashboard stats | All |

## 🔒 Role-Based Access Control

- **Admin**: Full access to all projects, tasks, users
- **Project Admin**: Can manage their project's tasks and members
- **Member**: Can view and manage tasks in their projects

## 🔄 Upgrading to PostgreSQL

Replace the in-memory database with a real one:

```bash
npm install pg pg-hstore sequelize
```

Add `DATABASE_URL` to your Railway environment variables (Railway provides a free PostgreSQL addon).

## 📋 Submission Checklist
- [x] Live URL (after Railway deploy)
- [x] GitHub repo with this README
- [x] Authentication (JWT-based)
- [x] Project & team management
- [x] Task creation, assignment & status tracking
- [x] Dashboard with overdue tasks
- [x] REST API with validation
- [x] Role-based access control (Admin/Member)
- [x] Deployed on Railway

## 🎥 Demo Video Tips
1. Show signup as Member, then login as Admin
2. Create a project, add the member
3. Create tasks with different priorities/due dates
4. Show kanban view and status changes
5. Show dashboard with overdue detection
6. Show admin's full user list access
=======
# team_task_manager
>>>>>>> 767a5849f6a1f93b1fdcf6ce43e1809bbc8a6bd0
