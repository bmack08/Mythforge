// Test if the navbar components can be loaded without errors
console.log('Testing navbar component loading...');

try {
  // Test loading the navbar components
  const AIAssistantNavItem = require('../client/homebrew/navbar/ai-assistant.navitem.jsx');
  console.log('✅ AIAssistantNavItem loaded successfully');
  
  const ProjectDashboardNavItem = require('../client/homebrew/navbar/project-dashboard.navitem.jsx');
  console.log('✅ ProjectDashboardNavItem loaded successfully');
  
  const CollaborationNavItem = require('../client/homebrew/navbar/collaboration.navitem.jsx');
  console.log('✅ CollaborationNavItem loaded successfully');
  
  const MythwrightSettingsNavItem = require('../client/homebrew/navbar/mythwright-settings.navitem.jsx');
  console.log('✅ MythwrightSettingsNavItem loaded successfully');
  
  // Test loading the main navbar
  const Navbar = require('../client/homebrew/navbar/navbar.jsx');
  console.log('✅ Main Navbar loaded successfully');
  
  console.log('\n🎉 All navbar components loaded successfully!');
  
} catch (error) {
  console.error('❌ Error loading navbar components:', error.message);
  console.error('Stack trace:', error.stack);
}
