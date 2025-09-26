// Accessibility Enhancement Module for Homebrewery - Task 64
// Adds WCAG 2.2 AA compliance features to rendered content

// ============================================================================
// ACCESSIBILITY CONSTANTS
// ============================================================================

const WCAG_COMPLIANCE = {
  // Contrast ratios for WCAG AA
  MIN_CONTRAST_NORMAL: 4.5,
  MIN_CONTRAST_LARGE: 3.0,
  
  // Font size thresholds for large text
  LARGE_TEXT_PX: 18,
  LARGE_BOLD_TEXT_PX: 14,
  
  // Heading hierarchy
  MAX_HEADING_LEVEL: 6,
  
  // Alt text requirements
  MIN_ALT_TEXT_LENGTH: 5,
  MAX_ALT_TEXT_LENGTH: 125,
};

const SEMANTIC_ROLES = {
  statblock: 'complementary',
  sidebar: 'complementary', 
  table: 'table',
  handout: 'article',
  boxedtext: 'note',
  image: 'img'
};

// ============================================================================
// HEADING HIERARCHY MANAGEMENT
// ============================================================================

/**
 * Analyze and fix heading hierarchy in content
 * @param {string} markdown - The markdown content
 * @returns {Object} - Analysis results and fixed content
 */
function analyzeAndFixHeadings(markdown) {
  if (!markdown) return { content: markdown, issues: [], fixes: [] };
  
  const issues = [];
  const fixes = [];
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  
  let match;
  while ((match = headingPattern.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const start = match.index;
    
    headings.push({
      level,
      text,
      start,
      raw: match[0],
      id: generateHeadingId(text)
    });
  }
  
  // Check for proper hierarchy
  let lastLevel = 0;
  let fixedMarkdown = markdown;
  
  headings.forEach((heading, index) => {
    // Check for skipped levels
    if (heading.level > lastLevel + 1 && lastLevel > 0) {
      issues.push({
        type: 'heading-skip',
        message: `Heading skips from h${lastLevel} to h${heading.level}: "${heading.text}"`,
        line: getLineNumber(markdown, heading.start),
        severity: 'warning'
      });
    }
    
    // Add semantic IDs for screen readers
    const headingId = heading.id;
    const originalHeading = heading.raw;
    const enhancedHeading = `${'#'.repeat(heading.level)} <span id="${headingId}" class="heading-anchor">${heading.text}</span>`;
    
    // Replace in the markdown
    fixedMarkdown = fixedMarkdown.replace(originalHeading, enhancedHeading);
    
    fixes.push({
      type: 'heading-id-added',
      message: `Added semantic ID "${headingId}" to heading`,
      original: originalHeading,
      fixed: enhancedHeading
    });
    
    lastLevel = heading.level;
  });
  
  return {
    content: fixedMarkdown,
    headings,
    issues,
    fixes
  };
}

/**
 * Generate a semantic ID from heading text
 * @param {string} text - The heading text
 * @returns {string} - URL-friendly ID
 */
function generateHeadingId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get line number from character position
 * @param {string} text - The full text
 * @param {number} position - Character position
 * @returns {number} - Line number (1-based)
 */
function getLineNumber(text, position) {
  return text.substring(0, position).split('\n').length;
}

// ============================================================================
// IMAGE ALT TEXT VALIDATION
// ============================================================================

/**
 * Analyze and improve image alt text
 * @param {string} markdown - The markdown content
 * @returns {Object} - Analysis results and improved content
 */
function analyzeAndImproveImages(markdown) {
  if (!markdown) return { content: markdown, issues: [], fixes: [] };
  
  const issues = [];
  const fixes = [];
  
  // Pattern for markdown images: ![alt](src "title")
  const imagePattern = /!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g;
  let fixedMarkdown = markdown;
  
  let match;
  while ((match = imagePattern.exec(markdown)) !== null) {
    const [fullMatch, altText, src, title] = match;
    const start = match.index;
    const line = getLineNumber(markdown, start);
    
    // Check alt text quality
    const altIssues = validateAltText(altText, src);
    altIssues.forEach(issue => {
      issues.push({
        ...issue,
        line,
        image: src
      });
    });
    
    // Generate improved alt text if needed
    if (!altText || altText.length < WCAG_COMPLIANCE.MIN_ALT_TEXT_LENGTH) {
      const improvedAlt = generateImprovedAltText(altText, src, title);
      const improvedImage = `![${improvedAlt}](${src}${title ? ` "${title}"` : ''})`;
      
      fixedMarkdown = fixedMarkdown.replace(fullMatch, improvedImage);
      
      fixes.push({
        type: 'alt-text-improved',
        message: `Improved alt text from "${altText}" to "${improvedAlt}"`,
        line,
        original: fullMatch,
        fixed: improvedImage
      });
    }
    
    // Add semantic markup for complex images
    if (src.includes('stat') || src.includes('table') || title?.includes('diagram')) {
      const accessibleImage = enhanceImageAccessibility(fullMatch, altText, src, title);
      if (accessibleImage !== fullMatch) {
        fixedMarkdown = fixedMarkdown.replace(fullMatch, accessibleImage);
        fixes.push({
          type: 'image-accessibility-enhanced',
          message: 'Added enhanced accessibility markup for complex image',
          line,
          original: fullMatch,
          fixed: accessibleImage
        });
      }
    }
  }
  
  // Also check HTML img tags
  const htmlImagePattern = /<img\s+([^>]*?)>/gi;
  while ((match = htmlImagePattern.exec(markdown)) !== null) {
    const [fullMatch, attributes] = match;
    const start = match.index;
    const line = getLineNumber(markdown, start);
    
    const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
    const altMatch = attributes.match(/alt=["']([^"']*)["']/i);
    
    const src = srcMatch ? srcMatch[1] : '';
    const altText = altMatch ? altMatch[1] : '';
    
    if (!altMatch) {
      issues.push({
        type: 'missing-alt-attribute',
        message: 'HTML img tag missing alt attribute',
        line,
        image: src,
        severity: 'error'
      });
      
      // Add alt attribute
      const improvedAlt = generateImprovedAltText('', src);
      const fixedImg = fullMatch.replace('<img', `<img alt="${improvedAlt}"`);
      fixedMarkdown = fixedMarkdown.replace(fullMatch, fixedImg);
      
      fixes.push({
        type: 'alt-attribute-added',
        message: `Added missing alt attribute: "${improvedAlt}"`,
        line,
        original: fullMatch,
        fixed: fixedImg
      });
    }
  }
  
  return {
    content: fixedMarkdown,
    issues,
    fixes
  };
}

/**
 * Validate alt text quality
 * @param {string} altText - The alt text to validate
 * @param {string} src - The image source for context
 * @returns {Array} - Array of validation issues
 */
function validateAltText(altText, src) {
  const issues = [];
  
  if (!altText) {
    issues.push({
      type: 'missing-alt-text',
      message: 'Image missing alt text',
      severity: 'error'
    });
    return issues;
  }
  
  if (altText.length < WCAG_COMPLIANCE.MIN_ALT_TEXT_LENGTH) {
    issues.push({
      type: 'alt-text-too-short',
      message: `Alt text too short (${altText.length} chars, minimum ${WCAG_COMPLIANCE.MIN_ALT_TEXT_LENGTH})`,
      severity: 'warning'
    });
  }
  
  if (altText.length > WCAG_COMPLIANCE.MAX_ALT_TEXT_LENGTH) {
    issues.push({
      type: 'alt-text-too-long',
      message: `Alt text too long (${altText.length} chars, maximum ${WCAG_COMPLIANCE.MAX_ALT_TEXT_LENGTH})`,
      severity: 'warning'
    });
  }
  
  // Check for redundant phrases
  const redundantPhrases = ['image of', 'picture of', 'photo of', 'graphic of'];
  const lowerAlt = altText.toLowerCase();
  redundantPhrases.forEach(phrase => {
    if (lowerAlt.includes(phrase)) {
      issues.push({
        type: 'redundant-alt-text',
        message: `Alt text contains redundant phrase: "${phrase}"`,
        severity: 'info'
      });
    }
  });
  
  // Check if alt text just repeats the filename
  const filename = src.split('/').pop().split('.')[0];
  if (altText.toLowerCase().replace(/\s/g, '') === filename.toLowerCase().replace(/[-_]/g, '')) {
    issues.push({
      type: 'filename-as-alt-text',
      message: 'Alt text appears to be just the filename',
      severity: 'warning'
    });
  }
  
  return issues;
}

/**
 * Generate improved alt text based on context
 * @param {string} currentAlt - Current alt text
 * @param {string} src - Image source
 * @param {string} title - Image title
 * @returns {string} - Improved alt text
 */
function generateImprovedAltText(currentAlt, src, title) {
  if (currentAlt && currentAlt.length >= WCAG_COMPLIANCE.MIN_ALT_TEXT_LENGTH) {
    return currentAlt;
  }
  
  // Use title if available and descriptive
  if (title && title.length >= WCAG_COMPLIANCE.MIN_ALT_TEXT_LENGTH) {
    return title;
  }
  
  // Generate context-aware alt text based on filename/path
  const filename = src.split('/').pop().split('.')[0];
  const path = src.toLowerCase();
  
  // D&D specific context
  if (path.includes('dragon')) return 'Dragon illustration';
  if (path.includes('monster')) return 'Monster illustration';
  if (path.includes('dungeon')) return 'Dungeon map';
  if (path.includes('character') || path.includes('npc')) return 'Character portrait';
  if (path.includes('weapon')) return 'Weapon illustration';
  if (path.includes('armor')) return 'Armor illustration';
  if (path.includes('spell')) return 'Magical spell effect';
  if (path.includes('treasure')) return 'Treasure illustration';
  if (path.includes('map')) return 'Map illustration';
  if (path.includes('symbol') || path.includes('icon')) return 'Symbolic illustration';
  
  // Generic improvements
  const cleanFilename = filename
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return cleanFilename.length >= WCAG_COMPLIANCE.MIN_ALT_TEXT_LENGTH 
    ? cleanFilename 
    : `Illustration: ${cleanFilename}`;
}

/**
 * Enhance image accessibility with additional markup
 * @param {string} imageMarkdown - Original image markdown
 * @param {string} altText - Alt text
 * @param {string} src - Image source
 * @param {string} title - Image title
 * @returns {string} - Enhanced image with accessibility features
 */
function enhanceImageAccessibility(imageMarkdown, altText, src, title) {
  // For complex images (stat blocks, tables, diagrams), add longdesc
  const needsLongDesc = ['stat', 'table', 'diagram', 'map', 'chart'].some(term => 
    src.toLowerCase().includes(term) || altText.toLowerCase().includes(term)
  );
  
  if (needsLongDesc) {
    const imageId = generateHeadingId(altText || 'image');
    return `<figure role="img" aria-labelledby="${imageId}-caption" aria-describedby="${imageId}-desc">
  ${imageMarkdown}
  <figcaption id="${imageId}-caption">${title || altText}</figcaption>
  <details id="${imageId}-desc">
    <summary>Detailed description</summary>
    <p>This is a complex image that may require detailed description. Consider adding a longer description here for screen reader users.</p>
  </details>
</figure>`;
  }
  
  return imageMarkdown;
}

// ============================================================================
// TABLE ACCESSIBILITY
// ============================================================================

/**
 * Enhance table accessibility
 * @param {string} markdown - The markdown content
 * @returns {Object} - Enhanced content and fixes
 */
function enhanceTableAccessibility(markdown) {
  if (!markdown) return { content: markdown, issues: [], fixes: [] };
  
  const issues = [];
  const fixes = [];
  let fixedMarkdown = markdown;
  
  // Find markdown tables
  const tablePattern = /^\|(.+)\|[ \t]*\n\|(.+)\|[ \t]*\n((?:\|.+\|[ \t]*\n?)+)/gm;
  
  let match;
  while ((match = tablePattern.exec(markdown)) !== null) {
    const [fullMatch, headerRow, separatorRow, bodyRows] = match;
    const start = match.index;
    const line = getLineNumber(markdown, start);
    
    // Parse headers
    const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
    
    // Generate accessible table
    const tableId = `table-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const accessibleTable = generateAccessibleTable(fullMatch, headers, bodyRows, tableId);
    
    fixedMarkdown = fixedMarkdown.replace(fullMatch, accessibleTable);
    
    fixes.push({
      type: 'table-accessibility-enhanced',
      message: `Enhanced table accessibility with proper headers and ARIA labels`,
      line,
      original: fullMatch,
      fixed: accessibleTable
    });
  }
  
  return {
    content: fixedMarkdown,
    issues,
    fixes
  };
}

/**
 * Generate accessible table markup
 * @param {string} originalTable - Original table markdown
 * @param {Array} headers - Table headers
 * @param {string} bodyRows - Table body rows
 * @param {string} tableId - Unique table ID
 * @returns {string} - Accessible table markup
 */
function generateAccessibleTable(originalTable, headers, bodyRows, tableId) {
  const hasNumericColumns = headers.some(header => 
    header.toLowerCase().includes('cost') || 
    header.toLowerCase().includes('damage') ||
    header.toLowerCase().includes('ac') ||
    header.toLowerCase().includes('hp')
  );
  
  const tableCaption = detectTableType(headers);
  
  return `<div class="accessible-table-wrapper">
  <table id="${tableId}" role="table" aria-label="${tableCaption}">
    <caption>${tableCaption}</caption>
    ${originalTable}
  </table>
</div>`;
}

/**
 * Detect table type for better captions
 * @param {Array} headers - Table headers
 * @returns {string} - Descriptive caption
 */
function detectTableType(headers) {
  const headerText = headers.join(' ').toLowerCase();
  
  if (headerText.includes('damage') && headerText.includes('weapon')) {
    return 'Weapon statistics table';
  }
  if (headerText.includes('spell') && headerText.includes('level')) {
    return 'Spell reference table';
  }
  if (headerText.includes('encounter') || headerText.includes('roll')) {
    return 'Random encounter table';
  }
  if (headerText.includes('cost') && headerText.includes('item')) {
    return 'Equipment pricing table';
  }
  if (headerText.includes('ability') || headerText.includes('modifier')) {
    return 'Ability score table';
  }
  
  return `Data table with ${headers.length} columns`;
}

// ============================================================================
// SEMANTIC STRUCTURE ENHANCEMENT
// ============================================================================

/**
 * Add semantic structure to content blocks
 * @param {string} markdown - The markdown content
 * @returns {Object} - Enhanced content with semantic structure
 */
function addSemanticStructure(markdown) {
  if (!markdown) return { content: markdown, issues: [], fixes: [] };
  
  const fixes = [];
  let fixedMarkdown = markdown;
  
  // Enhance stat blocks with semantic roles
  const statBlockPattern = /___\s*>\s*##\s*(.+?)\n([\s\S]*?)___/g;
  fixedMarkdown = fixedMarkdown.replace(statBlockPattern, (match, title, content) => {
    const id = generateHeadingId(title);
    const enhanced = `<section role="complementary" aria-labelledby="${id}" class="statblock-section">
${match}
</section>`;
    
    fixes.push({
      type: 'semantic-structure-added',
      message: `Added semantic structure to stat block: ${title}`,
      element: 'statblock'
    });
    
    return enhanced;
  });
  
  // Enhance boxed text with semantic roles
  const boxedTextPattern = />\s*(.+(?:\n>\s*.+)*)/g;
  fixedMarkdown = fixedMarkdown.replace(boxedTextPattern, (match) => {
    if (match.includes('##### ')) {
      const titleMatch = match.match(/>\s*#####\s*(.+)/);
      const title = titleMatch ? titleMatch[1] : 'Boxed content';
      const id = generateHeadingId(title);
      
      return `<aside role="note" aria-labelledby="${id}" class="boxed-text-section">
${match}
</aside>`;
    }
    return match;
  });
  
  return {
    content: fixedMarkdown,
    issues: [],
    fixes
  };
}

// ============================================================================
// ARIA LABELS AND LANDMARKS
// ============================================================================

/**
 * Add ARIA labels and landmarks
 * @param {string} markdown - The markdown content
 * @returns {Object} - Enhanced content with ARIA features
 */
function addAriaLabelsAndLandmarks(markdown) {
  if (!markdown) return { content: markdown, issues: [], fixes: [] };
  
  const fixes = [];
  let fixedMarkdown = markdown;
  
  // Add navigation landmarks for page sections
  const sectionPattern = /^(#{1,3})\s+(.+)$/gm;
  fixedMarkdown = fixedMarkdown.replace(sectionPattern, (match, hashes, title) => {
    const level = hashes.length;
    const id = generateHeadingId(title);
    
    // Determine appropriate landmark role
    let role = '';
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('encounter')) role = 'region';
    if (lowerTitle.includes('combat')) role = 'region'; 
    if (lowerTitle.includes('treasure')) role = 'region';
    if (lowerTitle.includes('npc')) role = 'region';
    if (lowerTitle.includes('location')) role = 'region';
    
    const roleAttr = role ? ` role="${role}"` : '';
    const ariaLevel = ` aria-level="${level}"`;
    
    fixes.push({
      type: 'aria-landmark-added',
      message: `Added ARIA landmark to section: ${title}`,
      element: 'heading'
    });
    
    return `${hashes} <span id="${id}"${roleAttr}${ariaLevel}>${title}</span>`;
  });
  
  return {
    content: fixedMarkdown,
    issues: [],
    fixes
  };
}

// ============================================================================
// MAIN ACCESSIBILITY PROCESSOR
// ============================================================================

/**
 * Main function to enhance content accessibility
 * @param {string} markdown - Original markdown content
 * @param {Object} options - Enhancement options
 * @returns {Object} - Enhanced content and accessibility report
 */
function enhanceAccessibility(markdown, options = {}) {
  if (!markdown) return { content: markdown, report: { issues: [], fixes: [] } };
  
  const {
    fixHeadings = true,
    improveImages = true,
    enhanceTables = true,
    addSemantics = true,
    addAria = true
  } = options;
  
  let processedContent = markdown;
  const allIssues = [];
  const allFixes = [];
  
  try {
    // Process heading hierarchy
    if (fixHeadings) {
      const headingResult = analyzeAndFixHeadings(processedContent);
      processedContent = headingResult.content;
      allIssues.push(...headingResult.issues);
      allFixes.push(...headingResult.fixes);
    }
    
    // Improve image accessibility
    if (improveImages) {
      const imageResult = analyzeAndImproveImages(processedContent);
      processedContent = imageResult.content;
      allIssues.push(...imageResult.issues);
      allFixes.push(...imageResult.fixes);
    }
    
    // Enhance table accessibility
    if (enhanceTables) {
      const tableResult = enhanceTableAccessibility(processedContent);
      processedContent = tableResult.content;
      allIssues.push(...tableResult.issues);
      allFixes.push(...tableResult.fixes);
    }
    
    // Add semantic structure
    if (addSemantics) {
      const semanticResult = addSemanticStructure(processedContent);
      processedContent = semanticResult.content;
      allFixes.push(...semanticResult.fixes);
    }
    
    // Add ARIA labels and landmarks
    if (addAria) {
      const ariaResult = addAriaLabelsAndLandmarks(processedContent);
      processedContent = ariaResult.content;
      allFixes.push(...ariaResult.fixes);
    }
    
    return {
      content: processedContent,
      report: {
        issues: allIssues,
        fixes: allFixes,
        summary: {
          totalIssues: allIssues.length,
          totalFixes: allFixes.length,
          errorCount: allIssues.filter(i => i.severity === 'error').length,
          warningCount: allIssues.filter(i => i.severity === 'warning').length,
          infoCount: allIssues.filter(i => i.severity === 'info').length
        }
      }
    };
    
  } catch (error) {
    console.error('Error enhancing accessibility:', error);
    return {
      content: markdown,
      report: {
        issues: [{
          type: 'processing-error',
          message: `Accessibility enhancement failed: ${error.message}`,
          severity: 'error'
        }],
        fixes: [],
        summary: { totalIssues: 1, totalFixes: 0, errorCount: 1, warningCount: 0, infoCount: 0 }
      }
    };
  }
}

// ============================================================================
// ACCESSIBILITY VALIDATION
// ============================================================================

/**
 * Validate accessibility compliance of content
 * @param {string} markdown - Content to validate
 * @returns {Object} - Accessibility compliance report
 */
function validateAccessibilityCompliance(markdown) {
  const result = enhanceAccessibility(markdown, {
    fixHeadings: false,
    improveImages: false,
    enhanceTables: false,
    addSemantics: false,
    addAria: false
  });
  
  // Additional validation checks
  const additionalIssues = [];
  
  // Check for adequate color contrast warnings
  const colorPattern = /color\s*:\s*#?([a-fA-F0-9]{3,6})/gi;
  let colorMatch;
  while ((colorMatch = colorPattern.exec(markdown)) !== null) {
    additionalIssues.push({
      type: 'color-contrast-check',
      message: `Manual color contrast check required for color: #${colorMatch[1]}`,
      severity: 'info',
      line: getLineNumber(markdown, colorMatch.index)
    });
  }
  
  // Check for keyboard navigation hints
  if (markdown.includes('<button') || markdown.includes('onclick')) {
    additionalIssues.push({
      type: 'keyboard-navigation',
      message: 'Interactive elements detected - ensure keyboard accessibility',
      severity: 'warning'
    });
  }
  
  return {
    ...result.report,
    issues: [...result.report.issues, ...additionalIssues],
    wcagLevel: calculateWCAGLevel(result.report.issues),
    recommendations: generateAccessibilityRecommendations(result.report.issues)
  };
}

/**
 * Calculate WCAG compliance level
 * @param {Array} issues - Accessibility issues found
 * @returns {string} - WCAG compliance level
 */
function calculateWCAGLevel(issues) {
  const criticalIssues = issues.filter(i => 
    i.severity === 'error' || 
    ['missing-alt-text', 'heading-skip', 'missing-alt-attribute'].includes(i.type)
  );
  
  if (criticalIssues.length === 0) return 'AA';
  if (criticalIssues.length <= 2) return 'A';
  return 'Below A';
}

/**
 * Generate accessibility improvement recommendations
 * @param {Array} issues - Accessibility issues found
 * @returns {Array} - Prioritized recommendations
 */
function generateAccessibilityRecommendations(issues) {
  const recommendations = [];
  
  const issueTypes = issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(issueTypes).forEach(([type, count]) => {
    switch (type) {
      case 'missing-alt-text':
        recommendations.push({
          priority: 'high',
          issue: 'Missing alt text',
          count,
          solution: 'Add descriptive alt text to all images',
          wcagReference: 'WCAG 2.2 SC 1.1.1'
        });
        break;
      case 'heading-skip':
        recommendations.push({
          priority: 'medium',
          issue: 'Heading hierarchy problems',
          count,
          solution: 'Use proper heading levels (h1, h2, h3...) in sequence',
          wcagReference: 'WCAG 2.2 SC 1.3.1'
        });
        break;
      case 'alt-text-too-short':
        recommendations.push({
          priority: 'medium',
          issue: 'Inadequate alt text',
          count,
          solution: 'Make alt text more descriptive and meaningful',
          wcagReference: 'WCAG 2.2 SC 1.1.1'
        });
        break;
    }
  });
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  enhanceAccessibility,
  validateAccessibilityCompliance,
  analyzeAndFixHeadings,
  analyzeAndImproveImages,
  enhanceTableAccessibility,
  addSemanticStructure,
  addAriaLabelsAndLandmarks,
  generateHeadingId,
  WCAG_COMPLIANCE,
  SEMANTIC_ROLES
};