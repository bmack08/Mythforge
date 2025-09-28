// Test script to check for syntax errors in navbar components
import fs from 'fs';

console.log('🔍 Checking navbar component syntax...\n');

const navbarFiles = [
  'client/homebrew/navbar/ai-assistant.navitem.jsx',
  'client/homebrew/navbar/project-dashboard.navitem.jsx', 
  'client/homebrew/navbar/collaboration.navitem.jsx',
  'client/homebrew/navbar/mythwright-settings.navitem.jsx',
  'client/homebrew/navbar/navbar.jsx'
];

navbarFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common syntax issues
    const issues = [];
    
    // Check for unclosed brackets
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      issues.push(`Mismatched brackets: ${openBrackets} open, ${closeBrackets} close`);
    }
    
    // Check for unclosed parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
    }
    
    // Check for missing semicolons in key places
    if (content.includes('module.exports') && !content.includes('module.exports;')) {
      issues.push('Missing semicolon after module.exports');
    }
    
    // Check for React component structure
    if (file.includes('.navitem.jsx')) {
      if (!content.includes('createClass')) {
        issues.push('Missing createClass');
      }
      if (!content.includes('displayName')) {
        issues.push('Missing displayName');
      }
      if (!content.includes('render')) {
        issues.push('Missing render function');
      }
    }
    
    if (issues.length === 0) {
      console.log(`✅ ${file} - No syntax issues found`);
    } else {
      console.log(`❌ ${file} - Issues found:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
  } catch (error) {
    console.log(`❌ ${file} - Error reading file: ${error.message}`);
  }
});

console.log('\n🔍 Checking navbar.jsx imports...');
try {
  const navbarContent = fs.readFileSync('client/homebrew/navbar/navbar.jsx', 'utf8');
  
  // Check if the new components are properly imported
  const requiredImports = [
    'AIAssistantNavItem',
    'ProjectDashboardNavItem',
    'CollaborationNavItem', 
    'MythwrightSettingsNavItem'
  ];
  
  requiredImports.forEach(importName => {
    if (navbarContent.includes(`require('./${importName.toLowerCase().replace(/([A-Z])/g, '-$1').slice(1)}.navitem.jsx')`)) {
      console.log(`✅ Import for ${importName} - FOUND`);
    } else {
      console.log(`❌ Import for ${importName} - MISSING or INCORRECT`);
    }
  });
  
  // Check if components are used in render
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
  console.log(`❌ Error checking navbar.jsx: ${error.message}`);
}

console.log('\n💡 Troubleshooting Tips:');
console.log('1. Make sure the server is restarted after navbar changes');
console.log('2. Check browser console for JavaScript errors');
console.log('3. Verify that all navbar files are in the correct location');
console.log('4. Check if the CSS file is being loaded properly');
