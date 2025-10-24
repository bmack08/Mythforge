# Environment Setup Guide

## 1. Backend .env file

Create a file named `.env` in the `dnd-backend/` directory with the following content:

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database Configuration (Optional - not needed for Phase 3)
DATABASE_URL=postgresql://username:password@localhost:5432/dnd_adventure_creator
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dnd_adventure_creator
DB_USER=username
DB_PASSWORD=password

# Redis Configuration (Optional - not needed for Phase 3)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration (Optional - not needed for Phase 3)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Provider Configuration - ADD YOUR API KEYS HERE
# Get OpenAI API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-openai-api-key-here

# Get Anthropic API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AI_RATE_LIMIT_WINDOW_MS=60000
AI_RATE_LIMIT_MAX_REQUESTS=10

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:5173
```

## 2. Frontend .env file

Create a file named `.env` in the `dnd-adventure-creator/` directory with the following content:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001

# Development Settings
VITE_APP_TITLE=D&D Adventure Creator
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_EXPORT=true

# Debug Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
```

## 3. Getting API Keys

### OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and replace `your-openai-api-key-here` in the backend .env

### Anthropic API Key:
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and replace `your-anthropic-api-key-here` in the backend .env

**Note:** You need at least one API key (OpenAI or Anthropic) for the AI features to work. 