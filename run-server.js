// Simple server runner that bypasses the vitreum build issues
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('build'));

// Import and setup API routes
async function setupAPI() {
  try {
    console.log('🔧 Setting up API routes...');
    
    // Import the homebrew API
    const { default: homebrewApi } = await import('./server/homebrew.api.js');
    
    // Add the mythwright generation route
    app.post('/api/mythwright/generate', async (req, res) => {
      console.log('📥 Received campaign generation request');
      console.log('Request body keys:', Object.keys(req.body));
      
      try {
        await homebrewApi.generateCampaign(req, res);
      } catch (error) {
        console.error('❌ Campaign generation failed:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
          success: false,
          error: 'Campaign generation failed',
          details: error.message
        });
      }
    });
    
    // Basic health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', message: 'Mythwright API running' });
    });
    
    console.log('✅ API routes configured');
    
  } catch (error) {
    console.error('❌ Failed to setup API:', error.message);
    process.exit(1);
  }
}

// Initialize database models if needed
async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database models...');
    
    // Try to initialize models, but don't fail if it doesn't work
    try {
      const { initializeModels } = await import('./server/models/index.js');
      await initializeModels();
      console.log('✅ Database models initialized');
    } catch (dbError) {
      console.warn('⚠️  Database initialization failed, continuing without database:', dbError.message);
      // Continue without database - AI generation will work, just won't save to DB
    }
    
  } catch (error) {
    console.warn('⚠️  Could not load database module:', error.message);
  }
}

// Serve the frontend
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Run npm run build first.');
    }
  });
});

async function startServer() {
  console.log('🚀 Starting Mythwright server...');
  
  await setupAPI();
  await initializeDatabase();
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`✨ Mythwright server running on http://localhost:${PORT}`);
    console.log('📝 API endpoints:');
    console.log(`   POST http://localhost:${PORT}/api/mythwright/generate`);
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('🎲 Ready for AI campaign generation!');
  });
}

startServer().catch(error => {
  console.error('💥 Server startup failed:', error.message);
  process.exit(1);
});