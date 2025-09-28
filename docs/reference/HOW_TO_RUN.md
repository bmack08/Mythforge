# How to Run the D&D Adventure Creator

## Prerequisites

1. **Node.js** (version 16 or higher)
2. **npm** or **yarn** package manager
3. **API Keys** (at least one):
   - OpenAI API key from https://platform.openai.com/api-keys
   - Anthropic API key from https://console.anthropic.com/

## Quick Start (First Time Setup)

### Step 1: Set up Environment Files

1. **Backend .env file**: Create `dnd-backend/.env` (see setup-env.md for content)
2. **Frontend .env file**: Create `dnd-adventure-creator/.env` (see setup-env.md for content)
3. **Add your API keys** to the backend .env file

### Step 2: Install Dependencies

Open **two terminal windows** (one for backend, one for frontend):

**Terminal 1 - Backend:**
```bash
cd dnd-backend
npm install
```

**Terminal 2 - Frontend:**
```bash
cd dnd-adventure-creator
npm install
```

### Step 3: Run the Applications

**Terminal 1 - Start Backend:**
```bash
cd dnd-backend
npm run dev
```
- Backend will run on http://localhost:3001
- You should see: "🚀 Server running on port 3001"

**Terminal 2 - Start Frontend:**
```bash
cd dnd-adventure-creator
npm run dev
```
- Frontend will run on http://localhost:5173
- You should see: "Local: http://localhost:5173/"

### Step 4: Access the Application

Open your browser and go to: **http://localhost:5173**

## Daily Development Workflow

After the first setup, you only need to:

1. **Start Backend** (Terminal 1):
   ```bash
   cd dnd-backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd dnd-adventure-creator
   npm run dev
   ```

## Available Scripts

### Backend (dnd-backend)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter

### Frontend (dnd-adventure-creator)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run linter

## Troubleshooting

### Backend won't start:
1. Check if port 3001 is available
2. Verify .env file exists in `dnd-backend/`
3. Check if dependencies are installed: `npm install`
4. Check console for error messages

### Frontend won't start:
1. Check if port 5173 is available
2. Verify .env file exists in `dnd-adventure-creator/`
3. Check if dependencies are installed: `npm install`
4. Make sure backend is running first

### AI features not working:
1. Verify API keys are set in `dnd-backend/.env`
2. Check backend console for AI provider messages
3. Make sure at least one API key (OpenAI or Anthropic) is valid

### Connection issues:
1. Make sure both frontend and backend are running
2. Check that FRONTEND_URL in backend .env matches frontend URL
3. Check that VITE_API_URL in frontend .env matches backend URL

## Port Configuration

**Default Ports:**
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

**To change ports:**
- Backend: Change `PORT=3001` in `dnd-backend/.env`
- Frontend: Change port in `dnd-adventure-creator/vite.config.ts`

## Development Tips

1. **Keep both terminals open** - you need both backend and frontend running
2. **Check console messages** - both terminals will show helpful debug info
3. **Hot reload enabled** - changes auto-refresh in development
4. **API testing** - Backend API available at http://localhost:3001/api/
5. **Health check** - Test backend at http://localhost:3001/health 