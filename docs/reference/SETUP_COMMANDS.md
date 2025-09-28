# 🚀 Quick Setup Commands

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- OpenAI API key (optional, for AI features)
- Anthropic API key (optional, for AI features)

## Phase 1-3 Complete Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd dnd-adventure-creator
npm install
```

**Backend:**
```bash
cd dnd-backend
npm install
```

### 2. Environment Configuration

**Backend (.env file in dnd-backend/):**
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings:
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# AI Provider API Keys (at least one required for AI features)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (for future phases)
DATABASE_URL=postgresql://username:password@localhost:5432/dnd_adventure_creator
REDIS_URL=redis://localhost:6379

# JWT Secret (for future authentication)
JWT_SECRET=your_super_secret_jwt_key_here
```

**Frontend (.env file in dnd-adventure-creator/):**
```bash
# Create frontend environment file
echo "VITE_API_URL=http://localhost:3001" > .env
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd dnd-backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd dnd-adventure-creator
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🤖 AI Features Setup

### Getting API Keys

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add to your `.env` file as `OPENAI_API_KEY`

**Anthropic:**
1. Go to https://console.anthropic.com/
2. Create a new API key
3. Add to your `.env` file as `ANTHROPIC_API_KEY`

### Testing AI Integration

1. Start both servers (backend and frontend)
2. Open the editor at http://localhost:5173
3. Try the AI Assistant (floating panel on the right)
4. Use slash commands like `/ai-monster` or `/ai-npc`
5. Generate content with custom prompts

## 🧪 Testing Commands

**Frontend Tests:**
```bash
cd dnd-adventure-creator
npm test
```

**Backend Tests:**
```bash
cd dnd-backend
npm test
```

**Linting:**
```bash
# Frontend
cd dnd-adventure-creator
npm run lint

# Backend
cd dnd-backend
npm run lint
```

## 🔧 Development Commands

**Build for Production:**
```bash
# Frontend
cd dnd-adventure-creator
npm run build

# Backend
cd dnd-backend
npm run build
npm start
```

**Database Commands (Future Phases):**
```bash
cd dnd-backend
npm run migrate
npm run seed
```

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

**AI Features Not Working:**
- Check that at least one AI API key is set in backend `.env`
- Verify backend server is running on port 3001
- Check browser console for API errors
- Ensure you have sufficient API credits

**Module Not Found Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors:**
- These are expected until dependencies are installed
- Run `npm install` in both frontend and backend directories
- Restart your IDE/editor after installation

## 📋 Feature Checklist

### Phase 1: Foundation ✅
- [x] Project structure created
- [x] Dependencies installed
- [x] TypeScript configured
- [x] Fantasy theme implemented

### Phase 2: Core Editor ✅
- [x] Rich text editor working
- [x] Slash commands functional
- [x] Auto-save implemented
- [x] Preview mode available

### Phase 3: AI Integration ✅
- [x] AI service configured
- [x] Multiple AI providers supported
- [x] AI generation dialog working
- [x] AI assistant panel functional
- [x] Content formatting implemented

### Next: Phase 4 Features
- [ ] Real-time collaboration
- [ ] User authentication
- [ ] Adventure persistence
- [ ] Advanced D&D features

## 🎯 Quick Start (TL;DR)

```bash
# 1. Install everything
cd dnd-adventure-creator && npm install
cd ../dnd-backend && npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your AI API keys

# 3. Start servers (2 terminals)
npm run dev  # in dnd-backend/
npm run dev  # in dnd-adventure-creator/

# 4. Open http://localhost:5173 and start creating!
```

## Prerequisites Installation

### Windows
```powershell
# Install Node.js 18+ from https://nodejs.org
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# Install Redis from https://github.com/microsoftarchive/redis/releases
```

### macOS
```bash
# Using Homebrew
brew install node@18 postgresql@15 redis
brew services start postgresql
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Redis
sudo apt-get install redis-server
```

## Development Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd "dnd story writer"
```

### 2. Environment Setup
```bash
# In dnd-backend directory
cp env.example .env
# Edit .env file with your credentials
```

### 3. Database Setup
```bash
# Create database (PostgreSQL)
createdb dnd_adventure_creator

# Run migrations
cd dnd-backend
npm run migrate

# Seed with sample data
npm run seed
```

### 4. Start Development
```bash
# Terminal 1 - Backend
cd dnd-backend
npm run dev

# Terminal 2 - Frontend  
cd dnd-adventure-creator
npm run dev
```

## Daily Development Commands

### Start Development Servers
```bash
# Backend (Terminal 1)
cd dnd-backend && npm run dev

# Frontend (Terminal 2)
cd dnd-adventure-creator && npm run dev
```

### Testing
```bash
# Frontend tests
cd dnd-adventure-creator && npm test

# Backend tests
cd dnd-backend && npm test

# Run all tests
npm run test:all
```

### Database Operations
```bash
# Create new migration
cd dnd-backend && npm run migrate:create migration_name

# Run migrations
npm run migrate

# Rollback migration
npm run migrate:rollback

# Reset database
npm run db:reset
```

### Code Quality
```bash
# Lint frontend
cd dnd-adventure-creator && npm run lint

# Lint backend
cd dnd-backend && npm run lint

# Format code
npm run format
```

## Troubleshooting

### Port Conflicts
```bash
# Check what's using port 3001 (backend)
lsof -i :3001

# Check what's using port 5173 (frontend)
lsof -i :5173

# Kill process on port
kill -9 $(lsof -t -i:3001)
```

### Database Issues
```bash
# Reset PostgreSQL password
sudo -u postgres psql
\password postgres

# Restart PostgreSQL
sudo service postgresql restart

# Check PostgreSQL status
sudo service postgresql status
```

### Redis Issues
```bash
# Start Redis
redis-server

# Check Redis connection
redis-cli ping

# Restart Redis
sudo service redis-server restart
```

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

## Production Deployment (Optional)

### Docker Setup (For Production Only)
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Production Setup
```bash
# Build frontend
cd dnd-adventure-creator
npm run build

# Build backend
cd ../dnd-backend
npm run build

# Start production server
NODE_ENV=production npm start
```

## Environment Variables Reference

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dnd_adventure_creator
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# AI Services
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

## Useful URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **Database Admin**: Use pgAdmin or your preferred PostgreSQL client

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub/GitLab
``` 