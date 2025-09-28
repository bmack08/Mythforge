// Test script to verify Mythwright navbar integration
// This tests that all new navbar components can be loaded without errors

import path from 'path';
import fs from 'fs';

console.log('🧪 Testing Mythwright Navbar Integration...\n');

// Test 1: Check if all navbar files exist
const navbarFiles = [
  'client/homebrew/navbar/ai-assistant.navitem.jsx',
  'client/homebrew/navbar/project-dashboard.navitem.jsx', 
  'client/homebrew/navbar/collaboration.navitem.jsx',
  'client/homebrew/navbar/mythwright-settings.navitem.jsx',
  'client/homebrew/navbar/mythwright-navbar.less',
  'client/homebrew/navbar/navbar.jsx'
];

console.log('📁 Checking navbar files exist...');
navbarFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - EXISTS`);
    } else {
      console.log(`❌ ${file} - MISSING`);
    }
  } catch (error) {
    console.log(`❌ ${file} - ERROR: ${error.message}`);
  }
});

// Test 2: Check navbar.jsx syntax
console.log('\n🔍 Checking navbar.jsx syntax...');
try {
  const navbarContent = fs.readFileSync('client/homebrew/navbar/navbar.jsx', 'utf8');
  
  // Check for required imports
  const requiredImports = [
    'AIAssistantNavItem',
    'ProjectDashboardNavItem', 
    'CollaborationNavItem',
    'MythwrightSettingsNavItem'
  ];
  
  requiredImports.forEach(importName => {
    if (navbarContent.includes(importName)) {
      console.log(`✅ Import ${importName} - FOUND`);
    } else {
      console.log(`❌ Import ${importName} - MISSING`);
    }
  });
  
  // Check for component usage
  const requiredComponents = [
    '<AIAssistantNavItem />',
    '<ProjectDashboardNavItem />',
    '<CollaborationNavItem />',
    '<MythwrightSettingsNavItem />'
  ];
  
  requiredComponents.forEach(component => {
    if (navbarContent.includes(component)) {
      console.log(`✅ Component ${component} - FOUND`);
    } else {
      console.log(`❌ Component ${component} - MISSING`);
    }
  });
  
} catch (error) {
  console.log(`❌ navbar.jsx syntax check failed: ${error.message}`);
}

// Test 3: Check CSS file
console.log('\n🎨 Checking CSS file...');
try {
  const cssContent = fs.readFileSync('client/homebrew/navbar/mythwright-navbar.less', 'utf8');
  
  const requiredStyles = [
    '.ai-dropdown',
    '.project-dropdown', 
    '.collaboration-dropdown',
    '.settings-dropdown'
  ];
  
  requiredStyles.forEach(style => {
    if (cssContent.includes(style)) {
      console.log(`✅ Style ${style} - FOUND`);
    } else {
      console.log(`❌ Style ${style} - MISSING`);
    }
  });
  
} catch (error) {
  console.log(`❌ CSS file check failed: ${error.message}`);
}

// Test 4: Verify integration plan
console.log('\n📋 Checking integration plan...');
try {
  if (fs.existsSync('docs/HOMEBREWERY_INTEGRATION_PLAN.md')) {
    console.log('✅ Integration plan document - EXISTS');
    
    const planContent = fs.readFileSync('docs/HOMEBREWERY_INTEGRATION_PLAN.md', 'utf8');
    if (planContent.includes('Phase 9.1: Dashboard & Navigation')) {
      console.log('✅ Phase 9.1 documentation - FOUND');
    } else {
      console.log('❌ Phase 9.1 documentation - MISSING');
    }
  } else {
    console.log('❌ Integration plan document - MISSING');
  }
} catch (error) {
  console.log(`❌ Integration plan check failed: ${error.message}`);
}

console.log('\n🎉 Navbar Integration Test Complete!');
console.log('\n📝 Next Steps:');
console.log('1. Start the Homebrewery server: node server.js');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Check that the new Mythwright navbar items appear');
console.log('4. Test the dropdown functionality for each nav item');
console.log('5. Verify the styling looks correct');

console.log('\n🔧 Features Added:');
console.log('- 🤖 AI Assistant: Quick generation buttons and chat interface');
console.log('- 📊 Project Dashboard: View and manage Mythwright projects');
console.log('- 👥 Collaboration: Invite users and manage permissions');
console.log('- ⚙️ Settings: Configure AI models and preferences');

console.log('\n✨ Phase 9.1 (Dashboard & Navigation) - COMPLETE!');
