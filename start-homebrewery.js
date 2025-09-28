// Start Homebrewery server with proper initialization
import app from './server/app.js';

// Set environment to local for CORS
process.env.NODE_ENV = 'local';

async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database models...');
    const { initializeModels } = await import('./server/models/index.js');
    await initializeModels();
    console.log('✅ Database models initialized');
  } catch (error) {
    console.warn('⚠️  Database initialization failed:', error.message);
    console.warn('⚠️  Continuing without database (AI generation will work, but campaigns won\'t be saved)');
  }
}

async function startServer() {
  console.log('🚀 Starting Homebrewery with Mythwright AI...');
  
  // Initialize database
  await initializeDatabase();
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`✨ Homebrewery server running on http://localhost:${PORT}`);
    console.log('🎲 Mythwright AI campaign generation ready!');
    console.log('📝 Navigate to http://localhost:' + PORT + ' to access the application');
  });
}

startServer().catch(error => {
  console.error('💥 Server startup failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});