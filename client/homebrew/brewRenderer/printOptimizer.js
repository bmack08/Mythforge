// Print Optimization Module for Homebrewery - Task 65
// Optimizes content layout for print media with proper page breaks and bleeds

// ============================================================================
// PRINT OPTIMIZATION CONSTANTS
// ============================================================================

const PRINT_CONFIG = {
  // Page dimensions in points (1 inch = 72 points)
  PAGE_WIDTH_LETTER: 612,  // 8.5 inches
  PAGE_HEIGHT_LETTER: 792, // 11 inches
  PAGE_WIDTH_A4: 595,      // 8.27 inches
  PAGE_HEIGHT_A4: 842,     // 11.69 inches
  
  // Margins and bleeds
  MARGIN_DEFAULT: 72,      // 1 inch
  BLEED_SIZE: 18,          // 0.25 inch
  SAFE_ZONE: 36,           // 0.5 inch from edge
  
  // Content limits
  MAX_LINES_PER_PAGE: 45,
  OPTIMAL_CHARS_PER_LINE: 80,
  
  // Break preferences
  AVOID_BREAK_ELEMENTS: ['statblock', 'sidebar', 'table', 'handout'],
  FORCE_BREAK_BEFORE: ['chapter', 'section'],
  
  // Typography
  BASE_FONT_SIZE: 11,      // 11pt
  LINE_HEIGHT: 1.4,
  HEADING_SCALE: [2.5, 2.0, 1.75, 1.5, 1.25, 1.1] // h1-h6 size multipliers
};

// ============================================================================
// PAGE BREAK ANALYSIS
// ============================================================================

/**
 * Analyze content for optimal page breaks
 * @param {string} markdown - The markdown content
 * @param {Object} options - Analysis options
 * @returns {Object} - Page break analysis results
 */
function analyzePageBreaks(markdown, options = {}) {
  if (!markdown) return { content: markdown, breaks: [], issues: [] };
  
  const {
    pageFormat = 'letter',
    preserveStatBlocks = true,
    optimizeImages = true,
    preventOrphans = true
  } = options;
  
  const lines = markdown.split('\n');
  const analysis = {
    breaks: [],
    issues: [],
    suggestions: [],
    estimatedPages: 0
  };
  
  let currentPage = 1;
  let currentLineCount = 0;
  let inStatBlock = false;
  let inTable = false;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Detect content types
    if (trimmedLine.startsWith('___')) {
      inStatBlock = !inStatBlock;
      if (inStatBlock && preserveStatBlocks) {
        // Suggest page break before stat block if near page end
        if (currentLineCount > PRINT_CONFIG.MAX_LINES_PER_PAGE * 0.7) {
          analysis.suggestions.push({
            type: 'page-break-before-statblock',
            line: index,
            message: 'Consider page break before stat block to keep it together'
          });
        }
      }
    }
    
    // Detect table boundaries
    if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
      if (!inTable) {
        inTable = true;
        if (currentLineCount > PRINT_CONFIG.MAX_LINES_PER_PAGE * 0.8) {
          analysis.suggestions.push({
            type: 'page-break-before-table',
            line: index,
            message: 'Consider page break before table'
          });
        }
      }
    } else if (inTable && !trimmedLine.includes('|')) {
      inTable = false;
    }
    
    // Count effective lines (empty lines count as 0.5)
    const lineWeight = trimmedLine.length === 0 ? 0.5 : 1;
    
    // Headings take more space
    if (trimmedLine.startsWith('#')) {
      const level = trimmedLine.match(/^#+/)[0].length;
      const headingWeight = 1 + (0.5 * (7 - level)); // Higher level = more weight
      currentLineCount += headingWeight;
    } else {
      currentLineCount += lineWeight;
    }
    
    // Check for page overflow
    if (currentLineCount >= PRINT_CONFIG.MAX_LINES_PER_PAGE) {
      analysis.breaks.push({
        type: 'automatic',
        line: index,
        reason: 'Page capacity reached',
        pageNumber: currentPage
      });
      
      currentPage++;
      currentLineCount = lineWeight;
    }
    
    // Check for manual page breaks
    if (trimmedLine.startsWith('\\page')) {
      analysis.breaks.push({
        type: 'manual',
        line: index,
        reason: 'Explicit page break',
        pageNumber: currentPage
      });
      currentPage++;
      currentLineCount = 0;
    }
    
    // Check for orphan/widow issues
    if (preventOrphans) {
      checkOrphanWidowIssues(lines, index, analysis, currentLineCount);
    }
  });
  
  analysis.estimatedPages = currentPage;
  
  return analysis;
}

/**
 * Check for orphan and widow issues
 * @param {Array} lines - All content lines
 * @param {number} currentIndex - Current line index
 * @param {Object} analysis - Analysis object to update
 * @param {number} currentLineCount - Current page line count
 */
function checkOrphanWidowIssues(lines, currentIndex, analysis, currentLineCount) {
  const line = lines[currentIndex];
  const nextLine = lines[currentIndex + 1];
  const prevLine = lines[currentIndex - 1];
  
  // Check for orphans (single line at top of page)
  if (currentLineCount === 1 && prevLine && prevLine.trim().length > 0) {
    analysis.issues.push({
      type: 'orphan',
      line: currentIndex,
      message: 'Potential orphan - single line at top of page',
      severity: 'warning'
    });
  }
  
  // Check for widows (single line at bottom of page)
  if (currentLineCount >= PRINT_CONFIG.MAX_LINES_PER_PAGE - 1 && 
      nextLine && nextLine.trim().length === 0) {
    analysis.issues.push({
      type: 'widow',
      line: currentIndex,
      message: 'Potential widow - single line at bottom of page',
      severity: 'warning'
    });
  }
  
  // Check for heading orphans (heading at bottom of page)
  if (line.trim().startsWith('#') && 
      currentLineCount >= PRINT_CONFIG.MAX_LINES_PER_PAGE - 2) {
    analysis.issues.push({
      type: 'heading-orphan',
      line: currentIndex,
      message: 'Heading orphan - heading at bottom of page',
      severity: 'error'
    });
  }
}

// ============================================================================
// PRINT LAYOUT OPTIMIZATION
// ============================================================================

/**
 * Optimize content layout for print
 * @param {string} markdown - Original markdown content
 * @param {Object} options - Optimization options
 * @returns {string} - Print-optimized markdown
 */
function optimizeForPrint(markdown, options = {}) {
  if (!markdown) return markdown;
  
  const {
    pageFormat = 'letter',
    addPageBreaks = true,
    preventOrphans = true,
    optimizeImages = true,
    addPrintCSS = true,
    preserveStatBlocks = true
  } = options;
  
  let optimized = markdown;
  
  try {
    // Analyze current page breaks
    const analysis = analyzePageBreaks(optimized, options);
    
    // Apply automatic page break improvements
    if (addPageBreaks) {
      optimized = applyOptimalPageBreaks(optimized, analysis);
    }
    
    // Optimize images for print
    if (optimizeImages) {
      optimized = optimizeImagesForPrint(optimized);
    }
    
    // Fix stat block placement
    if (preserveStatBlocks) {
      optimized = optimizeStatBlockPlacement(optimized);
    }
    
    // Add print-specific CSS classes
    if (addPrintCSS) {
      optimized = addPrintClasses(optimized);
    }
    
    // Fix orphan/widow issues
    if (preventOrphans) {
      optimized = fixOrphanWidowIssues(optimized);
    }
    
    return optimized;
    
  } catch (error) {
    console.error('Error optimizing for print:', error);
    return markdown;
  }
}

/**
 * Apply optimal page breaks based on analysis
 * @param {string} markdown - Content to optimize
 * @param {Object} analysis - Page break analysis
 * @returns {string} - Content with optimal page breaks
 */
function applyOptimalPageBreaks(markdown, analysis) {
  let lines = markdown.split('\n');
  
  // Apply suggestions from analysis
  analysis.suggestions.forEach(suggestion => {
    if (suggestion.type.includes('page-break-before')) {
      // Insert page break before the suggested line
      lines[suggestion.line] = `\\page\n${lines[suggestion.line]}`;
    }
  });
  
  // Fix heading orphans by adding page breaks before them
  analysis.issues.forEach(issue => {
    if (issue.type === 'heading-orphan') {
      lines[issue.line] = `\\page\n${lines[issue.line]}`;
    }
  });
  
  return lines.join('\n');
}

/**
 * Optimize images for print output
 * @param {string} markdown - Content with images
 * @returns {string} - Content with print-optimized images
 */
function optimizeImagesForPrint(markdown) {
  // Replace image markdown with print-optimized versions
  const imagePattern = /!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g;
  
  return markdown.replace(imagePattern, (match, altText, src, title) => {
    // Add print-specific classes and sizing
    const printClass = 'print-image';
    const sizeClass = determinePrintImageSize(src, altText);
    const breakClass = shouldImageBreakPage(src, altText) ? 'print-page-break-before' : '';
    
    const classes = [printClass, sizeClass, breakClass].filter(c => c).join(' ');
    
    return `<img src="${src}" alt="${altText}" ${title ? `title="${title}"` : ''} class="${classes}" />`;
  });
}

/**
 * Determine optimal print size for images
 * @param {string} src - Image source
 * @param {string} altText - Image alt text
 * @returns {string} - Size class for print
 */
function determinePrintImageSize(src, altText) {
  const content = `${src} ${altText}`.toLowerCase();
  
  if (content.includes('map') || content.includes('diagram')) {
    return 'print-image-large'; // Full width for maps/diagrams
  }
  if (content.includes('portrait') || content.includes('character')) {
    return 'print-image-small'; // Small for portraits
  }
  if (content.includes('scene') || content.includes('landscape')) {
    return 'print-image-medium'; // Medium for scene images
  }
  
  return 'print-image-medium'; // Default medium size
}

/**
 * Determine if image should force a page break
 * @param {string} src - Image source
 * @param {string} altText - Image alt text
 * @returns {boolean} - Whether to break page before image
 */
function shouldImageBreakPage(src, altText) {
  const content = `${src} ${altText}`.toLowerCase();
  
  // Large images should start on new page
  return content.includes('map') || 
         content.includes('full-page') || 
         content.includes('spread');
}

/**
 * Optimize stat block placement to avoid page breaks
 * @param {string} markdown - Content with stat blocks
 * @returns {string} - Content with optimized stat blocks
 */
function optimizeStatBlockPlacement(markdown) {
  // Add keep-together class to stat blocks
  const statBlockPattern = /(___\s*>\s*##\s*(.+?)\n[\s\S]*?___)/g;
  
  return markdown.replace(statBlockPattern, (match) => {
    return `<div class="print-keep-together">\n\n${match}\n\n</div>`;
  });
}

/**
 * Add print-specific CSS classes to content
 * @param {string} markdown - Content to enhance
 * @returns {string} - Content with print classes
 */
function addPrintClasses(markdown) {
  let enhanced = markdown;
  
  // Add classes to headings for better print breaks
  const headingPattern = /^(#{1,6})\s+(.+)$/gm;
  enhanced = enhanced.replace(headingPattern, (match, hashes, title) => {
    const level = hashes.length;
    const printClass = level <= 2 ? 'print-break-before' : '';
    const keepWithNext = level >= 3 ? 'print-keep-with-next' : '';
    
    const classes = [printClass, keepWithNext].filter(c => c).join(' ');
    
    if (classes) {
      return `<div class="${classes}">${match}</div>`;
    }
    return match;
  });
  
  // Add classes to tables
  const tablePattern = /(\|.+\|.*\n(?:\|.+\|.*\n)*)/g;
  enhanced = enhanced.replace(tablePattern, (match) => {
    return `<div class="print-keep-together print-table">\n\n${match}\n</div>`;
  });
  
  // Add classes to boxed text
  const boxedTextPattern = /(>\s*.+(?:\n>\s*.+)*)/g;
  enhanced = enhanced.replace(boxedTextPattern, (match) => {
    return `<div class="print-keep-together print-boxed-text">\n\n${match}\n\n</div>`;
  });
  
  return enhanced;
}

/**
 * Fix orphan and widow issues in content
 * @param {string} markdown - Content to fix
 * @returns {string} - Content with orphan/widow issues resolved
 */
function fixOrphanWidowIssues(markdown) {
  const lines = markdown.split('\n');
  const fixed = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    const prevLine = lines[i - 1];
    
    // Fix heading orphans by ensuring 2-3 lines follow
    if (line.trim().startsWith('#')) {
      fixed.push(line);
      
      // Look ahead to see if there's enough content following
      let followingContent = 0;
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        if (lines[j].trim().length > 0) followingContent++;
      }
      
      // If not enough following content, add a page break before the heading
      if (followingContent < 2 && i > 0) {
        fixed[fixed.length - 1] = `\\page\n${line}`;
      }
    } else {
      fixed.push(line);
    }
  }
  
  return fixed.join('\n');
}

// ============================================================================
// PRINT CSS GENERATION
// ============================================================================

/**
 * Generate CSS specifically for print media
 * @param {Object} options - CSS generation options
 * @returns {string} - Print-optimized CSS
 */
function generatePrintCSS(options = {}) {
  const {
    pageFormat = 'letter',
    bleedSize = PRINT_CONFIG.BLEED_SIZE,
    margins = PRINT_CONFIG.MARGIN_DEFAULT,
    fontSize = PRINT_CONFIG.BASE_FONT_SIZE,
    lineHeight = PRINT_CONFIG.LINE_HEIGHT
  } = options;
  
  const pageWidth = pageFormat === 'a4' ? PRINT_CONFIG.PAGE_WIDTH_A4 : PRINT_CONFIG.PAGE_WIDTH_LETTER;
  const pageHeight = pageFormat === 'a4' ? PRINT_CONFIG.PAGE_HEIGHT_A4 : PRINT_CONFIG.PAGE_HEIGHT_LETTER;
  
  return `
/* Print-Optimized Styles - Auto-generated for ${pageFormat.toUpperCase()} */

@media print {
  /* Page Setup */
  @page {
    size: ${pageFormat};
    margin: ${margins / 72}in;
    bleed: ${bleedSize / 72}in;
    marks: crop cross;
  }
  
  @page :first {
    margin-top: ${(margins + 36) / 72}in; /* Extra space for first page */
  }
  
  /* Typography */
  body {
    font-size: ${fontSize}pt !important;
    line-height: ${lineHeight} !important;
    font-family: "Times New Roman", Times, serif !important;
    color: #000 !important;
    background: #fff !important;
  }
  
  /* Headings */
  h1 { 
    font-size: ${fontSize * PRINT_CONFIG.HEADING_SCALE[0]}pt !important;
    break-after: avoid !important;
    keep-with-next: always !important;
    margin-top: 0.5in !important;
    margin-bottom: 0.25in !important;
  }
  
  h2 { 
    font-size: ${fontSize * PRINT_CONFIG.HEADING_SCALE[1]}pt !important;
    break-after: avoid !important;
    keep-with-next: always !important;
    margin-top: 0.4in !important;
    margin-bottom: 0.2in !important;
  }
  
  h3 { 
    font-size: ${fontSize * PRINT_CONFIG.HEADING_SCALE[2]}pt !important;
    break-after: avoid !important;
    keep-with-next: always !important;
    margin-top: 0.3in !important;
    margin-bottom: 0.15in !important;
  }
  
  h4, h5, h6 { 
    break-after: avoid !important;
    keep-with-next: always !important;
  }
  
  /* Print-specific classes */
  .print-keep-together {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  
  .print-break-before {
    break-before: page !important;
    page-break-before: always !important;
  }
  
  .print-break-after {
    break-after: page !important;
    page-break-after: always !important;
  }
  
  .print-keep-with-next {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  
  .print-page-break-before {
    break-before: page !important;
    page-break-before: always !important;
  }
  
  /* Images */
  .print-image {
    max-width: 100% !important;
    height: auto !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  
  .print-image-small {
    max-width: 2in !important;
    max-height: 2in !important;
  }
  
  .print-image-medium {
    max-width: 4in !important;
    max-height: 3in !important;
  }
  
  .print-image-large {
    max-width: 6in !important;
    max-height: 8in !important;
    break-before: page !important;
    page-break-before: always !important;
  }
  
  /* Tables */
  .print-table {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    font-size: ${fontSize - 1}pt !important;
  }
  
  table {
    border-collapse: collapse !important;
    width: 100% !important;
  }
  
  th, td {
    border: 1pt solid #000 !important;
    padding: 4pt !important;
    text-align: left !important;
  }
  
  th {
    background: #f0f0f0 !important;
    font-weight: bold !important;
  }
  
  /* Stat Blocks */
  .statblock,
  .statblock-section {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    border: 2pt solid #922610 !important;
    padding: 8pt !important;
    margin: 12pt 0 !important;
    background: #faf7ea !important;
  }
  
  /* Boxed Text */
  .print-boxed-text,
  .boxed-text,
  blockquote {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    border-left: 3pt solid #922610 !important;
    padding-left: 8pt !important;
    margin: 8pt 0 !important;
    background: #f9f9f9 !important;
  }
  
  /* Sidebars */
  .sidebar {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    border: 1pt solid #666 !important;
    padding: 8pt !important;
    margin: 8pt 0 !important;
    background: #f5f5f5 !important;
    float: none !important; /* Remove float for print */
    width: 100% !important;
  }
  
  /* Handouts */
  .handout {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    border: 2pt solid #8B4513 !important;
    padding: 12pt !important;
    margin: 12pt 0 !important;
    background: #fefcf0 !important;
  }
  
  /* Remove interactive elements */
  button, .button, input, textarea, select {
    display: none !important;
  }
  
  /* Navigation elements */
  nav, .nav, .navbar, .navigation {
    display: none !important;
  }
  
  /* Remove shadows and effects */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
    filter: none !important;
  }
  
  /* Ensure high contrast */
  .text-muted,
  .muted {
    color: #333 !important;
  }
  
  /* Links */
  a {
    color: #000 !important;
    text-decoration: underline !important;
  }
  
  a[href]:after {
    content: " (" attr(href) ")" !important;
    font-size: 8pt !important;
    color: #666 !important;
  }
  
  /* Code blocks */
  pre, code {
    font-family: "Courier New", Courier, monospace !important;
    font-size: ${fontSize - 1}pt !important;
    background: #f8f8f8 !important;
    border: 1pt solid #ccc !important;
    padding: 4pt !important;
  }
  
  /* Lists */
  ul, ol {
    margin: 8pt 0 !important;
    padding-left: 24pt !important;
  }
  
  li {
    margin: 2pt 0 !important;
  }
  
  /* Orphan and widow control */
  p {
    orphans: 3 !important;
    widows: 3 !important;
  }
  
  /* Chapter breaks */
  .chapter-break,
  .new-chapter {
    break-before: page !important;
    page-break-before: always !important;
  }
}

/* Print preview mode (when print styles are shown on screen) */
@media screen and (prefers-color-scheme: print) {
  /* Apply print styles to screen for preview */
  body {
    background: white;
    color: black;
    max-width: ${pageWidth - (margins * 2)}px;
    margin: 0 auto;
    padding: ${margins}px;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }
}
`;
}

// ============================================================================
// PRINT VALIDATION
// ============================================================================

/**
 * Validate content for print readiness
 * @param {string} markdown - Content to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation report
 */
function validatePrintReadiness(markdown, options = {}) {
  const analysis = analyzePageBreaks(markdown, options);
  const issues = [...analysis.issues];
  const warnings = [];
  const suggestions = [...analysis.suggestions];
  
  // Check for print-problematic elements
  const lines = markdown.split('\n');
  
  lines.forEach((line, index) => {
    // Check for very long lines that might not wrap well
    if (line.length > PRINT_CONFIG.OPTIMAL_CHARS_PER_LINE * 1.5) {
      warnings.push({
        type: 'long-line',
        line: index + 1,
        message: `Line may be too long for print (${line.length} chars)`,
        severity: 'info'
      });
    }
    
    // Check for color references that won't print well
    if (line.includes('color:') || line.includes('#') && /style/.test(line)) {
      warnings.push({
        type: 'color-dependency',
        line: index + 1,
        message: 'Color styling may not appear in print',
        severity: 'warning'
      });
    }
    
    // Check for interactive elements
    if (line.includes('<button') || line.includes('onclick') || line.includes('<input')) {
      warnings.push({
        type: 'interactive-element',
        line: index + 1,
        message: 'Interactive element will not work in print',
        severity: 'warning'
      });
    }
  });
  
  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    estimatedPages: analysis.estimatedPages,
    issues: issues.concat(warnings),
    suggestions,
    printScore: calculatePrintScore(issues, warnings, suggestions),
    recommendations: generatePrintRecommendations(issues, warnings)
  };
}

/**
 * Calculate print optimization score
 * @param {Array} issues - Critical issues
 * @param {Array} warnings - Warning issues
 * @param {Array} suggestions - Optimization suggestions
 * @returns {number} - Score from 0-100
 */
function calculatePrintScore(issues, warnings, suggestions) {
  let score = 100;
  
  // Deduct for errors and warnings
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;
  
  score -= errorCount * 20; // Major deduction for errors
  score -= warningCount * 10; // Minor deduction for warnings
  score -= suggestions.length * 2; // Small deduction for optimization opportunities
  
  return Math.max(0, score);
}

/**
 * Generate print optimization recommendations
 * @param {Array} issues - Critical issues
 * @param {Array} warnings - Warning issues
 * @returns {Array} - Prioritized recommendations
 */
function generatePrintRecommendations(issues, warnings) {
  const recommendations = [];
  const allIssues = [...issues, ...warnings];
  
  const issueTypes = allIssues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(issueTypes).forEach(([type, count]) => {
    switch (type) {
      case 'heading-orphan':
        recommendations.push({
          priority: 'high',
          issue: 'Heading orphans',
          count,
          solution: 'Add page breaks before orphaned headings or adjust content flow',
          impact: 'Improves readability and professional appearance'
        });
        break;
      case 'color-dependency':
        recommendations.push({
          priority: 'medium',
          issue: 'Color dependencies',
          count,
          solution: 'Ensure content works without color, add patterns or text alternatives',
          impact: 'Ensures content clarity in black and white print'
        });
        break;
      case 'long-line':
        recommendations.push({
          priority: 'low',
          issue: 'Long lines',
          count,
          solution: 'Break long lines or use responsive layout techniques',
          impact: 'Better readability and professional appearance'
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

export {
  optimizeForPrint,
  analyzePageBreaks,
  generatePrintCSS,
  validatePrintReadiness,
  applyOptimalPageBreaks,
  optimizeImagesForPrint,
  optimizeStatBlockPlacement,
  addPrintClasses,
  fixOrphanWidowIssues,
  PRINT_CONFIG
};