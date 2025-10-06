// Custom Block Renderer Extension for Homebrewery - Task 63
// Extends the Homebrewery renderer to support Mythwright content blocks and TipTap block nodes
// Note: ContentBlockProcessor is not available in frontend context
// We'll create a simple fallback renderer for now

/**
 * Content Block Processor with TipTap block node support
 * Handles both custom Mythwright blocks and TipTap-generated block nodes
 */
const ContentBlockProcessor = {
  renderBlock: (type, content, metadata = {}) => {
    // Simple fallback renderer for frontend
    switch(type) {
      case 'position':
        return ''; // Position blocks don't render content
      case 'text':
        return content.content || '';
      case 'boxedtext':
        return `> ${content.content || ''}`;
      // TipTap block node types
      case 'paragraph':
        return content.content || '';
      case 'heading':
        const level = content.level || 1;
        const headingContent = content.content || '';
        return `${'#'.repeat(level)} ${headingContent}`;
      case 'codeBlock':
        const language = content.language || '';
        const code = content.content || '';
        return `\`\`\`${language}\n${code}\n\`\`\``;
      case 'blockquote':
        return `> ${content.content || ''}`;
      case 'bulletList':
      case 'orderedList':
        return content.content || '';
      case 'listItem':
        return `- ${content.content || ''}`;
      case 'horizontalRule':
        return '---';
      default:
        return `<!-- ${type} block: ${JSON.stringify(content)} -->`;
    }
  },

  /**
   * Validate TipTap block node structure
   * @param {string} type - Block type
   * @param {Object} content - Block content
   * @returns {Object} - Validation result
   */
  validateBlock: (type, content) => {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // TipTap node validation
    if (type === 'heading') {
      if (!content.level || content.level < 1 || content.level > 6) {
        result.errors.push('Heading level must be between 1 and 6');
        result.isValid = false;
      }
    }

    return result;
  }
};
import { enhanceAccessibility, validateAccessibilityCompliance } from './accessibilityEnhancer.js';
import { optimizeForPrint, generatePrintCSS, validatePrintReadiness } from './printOptimizer.js';

// ============================================================================
// CUSTOM BLOCK PROCESSING
// ============================================================================

/**
 * Process custom content blocks in markdown text
 * @param {string} markdown - The markdown text containing custom blocks
 * @param {Object} options - Rendering options
 * @returns {string} - Processed markdown with rendered blocks
 */
function processCustomBlocks(markdown, options = {}) {
  if (!markdown) return markdown;
  
  // Pattern to match custom block syntax: {{blocktype:content}}
  const blockPattern = /\{\{(\w+):(.*?)\}\}/gs;
  
  return markdown.replace(blockPattern, (match, blockType, contentStr) => {
    try {
      // Parse the content (JSON or simple string)
      let content;
      try {
        content = JSON.parse(contentStr);
      } catch {
        // If not JSON, treat as simple string content
        content = { content: contentStr };
      }
      
      // Render the block using our content block system
      const rendered = ContentBlockProcessor.renderBlock(blockType, content, options.metadata || {});
      
      // Add debugging info in dev mode
      if (options.debug) {
        console.log(`Rendered ${blockType} block:`, content);
      }
      
      return rendered;
    } catch (error) {
      console.error(`Error processing ${blockType} block:`, error);
      return `<!-- Error: Could not render ${blockType} block (${error.message}) -->`;
    }
  });
}

/**
 * Process inline content block references
 * @param {string} markdown - The markdown text
 * @param {Object} context - Context data (project, brew, etc.)
 * @returns {string} - Processed markdown
 */
function processInlineBlocks(markdown, context = {}) {
  if (!markdown) return markdown;
  
  // Pattern for inline block references: [blocktype:id] or [blocktype:id:param1=value1,param2=value2]
  const inlinePattern = /\[(\w+):([^:\]]+)(?::([^\]]+))?\]/g;
  
  return markdown.replace(inlinePattern, (match, blockType, blockId, params) => {
    try {
      // Parse parameters if provided
      const blockParams = {};
      if (params) {
        params.split(',').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            blockParams[key.trim()] = value.trim();
          }
        });
      }
      
      // For now, create a placeholder - in a full implementation,
      // this would fetch the block from database by ID
      const content = {
        blockId,
        type: blockType,
        params: blockParams,
        ...blockParams
      };
      
      const rendered = ContentBlockProcessor.renderBlock(blockType, content, context);
      return rendered;
    } catch (error) {
      console.error(`Error processing inline ${blockType} reference:`, error);
      return `<!-- Error: Could not resolve ${blockType}:${blockId} -->`;
    }
  });
}

/**
 * Enhanced stat block processing for Homebrewery
 * @param {string} markdown - The markdown text
 * @returns {string} - Processed markdown with enhanced stat blocks
 */
function enhanceStatBlocks(markdown) {
  if (!markdown) return markdown;
  
  // Enhance existing Homebrewery stat blocks with our custom features
  const statBlockPattern = /___\s*>\s*##\s*(.+?)\n([\s\S]*?)___/g;
  
  return markdown.replace(statBlockPattern, (match, title, content) => {
    // Add accessibility improvements
    let enhanced = `<div class="statblock" role="region" aria-labelledby="statblock-${title.toLowerCase().replace(/\s+/g, '-')}">\n\n`;
    enhanced += `___\n> ## <span id="statblock-${title.toLowerCase().replace(/\s+/g, '-')}">${title}</span>\n${content}___\n\n`;
    enhanced += `</div>`;
    
    return enhanced;
  });
}

/**
 * Process table blocks with enhanced features
 * @param {string} markdown - The markdown text
 * @returns {string} - Processed markdown with enhanced tables
 */
function enhanceTables(markdown) {
  if (!markdown) return markdown;
  
  // Add accessibility features to tables
  const tablePattern = /((\|.*\|.*\n){2,})/g;
  
  return markdown.replace(tablePattern, (match) => {
    // Wrap tables with proper accessibility attributes
    return `<div class="table-container" role="table" aria-label="Data table">\n\n${match}\n</div>`;
  });
}

/**
 * Process boxed text with custom styling
 * @param {string} markdown - The markdown text
 * @returns {string} - Processed markdown with enhanced boxed text
 */
function enhanceBoxedText(markdown) {
  if (!markdown) return markdown;
  
  // Enhance quote blocks (> text) with custom classes
  const quotePattern = /^(>\s*.+(?:\n>\s*.*)*)$/gm;
  
  return markdown.replace(quotePattern, (match) => {
    // Check for special boxed text types
    if (match.includes('##### ')) {
      // This is a titled box - enhance with proper structure
      const titleMatch = match.match(/>\s*#####\s*(.+)/);
      const title = titleMatch ? titleMatch[1] : '';
      const content = match.replace(/>\s*#####\s*.+\n/, '');
      
      return `<div class="boxed-text" role="complementary" aria-labelledby="box-${title.toLowerCase().replace(/\s+/g, '-')}">\n\n${match}\n\n</div>`;
    }
    
    return `<div class="boxed-text" role="complementary">\n\n${match}\n\n</div>`;
  });
}

// ============================================================================
// CSS INJECTION SYSTEM
// ============================================================================

/**
 * Generate custom CSS for content blocks
 * @param {Object} options - CSS generation options
 * @returns {string} - CSS styles for custom blocks
 */
function generateCustomBlockCSS(options = {}) {
  const {
    theme = 'default',
    printOptimized = false,
    accessibility = true,
    includeMediaQueries = true
  } = options;
  
  let css = `
/* Mythwright Custom Content Blocks - Auto-generated CSS */

/* Enhanced Stat Blocks */
.statblock {
  page-break-inside: avoid;
  break-inside: avoid;
}

.statblock[role="region"] {
  border: 2px solid #922610;
  border-radius: 4px;
  margin: 1em 0;
  ${printOptimized ? 'box-shadow: none;' : 'box-shadow: 0 0 8px rgba(0,0,0,0.3);'}
}

/* Enhanced Tables */
.table-container {
  overflow-x: auto;
  margin: 1em 0;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
}

.table-container[role="table"] {
  ${accessibility ? 'outline: 1px solid transparent;' : ''}
  ${accessibility ? 'outline-offset: 2px;' : ''}
}

.table-container[role="table"]:focus-within {
  ${accessibility ? 'outline-color: #4A90E2;' : ''}
}

/* Enhanced Boxed Text */
.boxed-text {
  margin: 1.5em 0;
  ${printOptimized ? '' : 'filter: drop-shadow(0 0 6px #0003);'}
}

.boxed-text[role="complementary"] {
  ${accessibility ? 'border-left: 4px solid #922610;' : ''}
  ${accessibility ? 'padding-left: 8px;' : ''}
}

/* Custom Block Types */
.sidebar {
  float: right;
  width: 300px;
  margin: 0 0 1em 1em;
  padding: 1em;
  background: #faf7ea;
  border: 1px solid #922610;
  border-radius: 4px;
  ${printOptimized ? 'break-inside: avoid;' : ''}
}

.sidebar-left {
  float: left;
  margin: 0 1em 1em 0;
}

.sidebar-narrow { width: 200px; }
.sidebar-wide { width: 400px; }

.sidebar-rules {
  background: #e8f4f8;
  border-color: #2E86AB;
}

.sidebar-lore {
  background: #f3e8ff;
  border-color: #8B5CF6;
}

.sidebar-mechanics {
  background: #fff7ed;
  border-color: #EA580C;
}

/* Handouts */
.handout {
  margin: 2em 0;
  padding: 2em;
  border: 2px solid #8B4513;
  ${printOptimized ? 'background: white;' : 'background: #fefcf0;'}
  ${printOptimized ? '' : 'box-shadow: 0 4px 8px rgba(0,0,0,0.2);'}
  page-break-inside: avoid;
}

.handout-parchment {
  ${printOptimized ? '' : 'background-image: url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="parchment" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0,0 Q50,25 100,0 Q75,50 100,100 Q50,75 0,100 Q25,50 0,0" fill="%23fefcf0" stroke="%23e8dcc0" stroke-width="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23parchment)"/%3E%3C/svg%3E");'}
}

.handout-aged {
  ${printOptimized ? 'border-color: #8B4513;' : 'border-color: #654321;'}
  ${printOptimized ? '' : 'filter: sepia(0.3) contrast(1.1);'}
}

.handout-torn {
  ${printOptimized ? '' : 'border-top: 3px solid #654321;'}
  ${printOptimized ? '' : 'border-top-style: dashed;'}
}

.handout-stained {
  ${printOptimized ? '' : 'background-image: radial-gradient(circle at 20% 30%, rgba(139,69,19,0.1) 0%, transparent 20%), radial-gradient(circle at 80% 70%, rgba(139,69,19,0.08) 0%, transparent 25%);'}
}

.handout-handwritten {
  font-family: 'Kalam', cursive;
  line-height: 1.6;
}

.handout-gothic {
  font-family: 'UnifrakturMaguntia', cursive;
  font-size: 1.1em;
}

.handout-ancient {
  font-family: 'Cinzel', serif;
  font-variant: small-caps;
}

/* Image Enhancements */
.image-float-left {
  float: left;
  margin: 0 1em 1em 0;
}

.image-float-right {
  float: right;
  margin: 0 0 1em 1em;
}

.image-center {
  display: block;
  margin: 1em auto;
}

.image-full-width {
  width: 100%;
  margin: 1em 0;
}

.image-small { max-width: 150px; }
.image-medium { max-width: 300px; }
.image-large { max-width: 500px; }

.image-border {
  border: 2px solid #922610;
  border-radius: 4px;
}

.image-shadow {
  ${printOptimized ? '' : 'box-shadow: 0 4px 8px rgba(0,0,0,0.3);'}
}

/* Print Optimizations */
${printOptimized ? `
@media print {
  .sidebar {
    float: none !important;
    width: 100% !important;
    margin: 1em 0 !important;
    box-shadow: none !important;
    break-inside: avoid;
  }
  
  .handout {
    box-shadow: none !important;
    background: white !important;
    break-inside: avoid;
  }
  
  .image-shadow,
  .image-border {
    box-shadow: none !important;
  }
  
  .boxed-text {
    break-inside: avoid;
  }
  
  .statblock {
    break-inside: avoid;
  }
}
` : ''}

/* Accessibility Enhancements */
${accessibility ? `
@media (prefers-reduced-motion: reduce) {
  .handout,
  .sidebar,
  .boxed-text {
    transition: none !important;
    animation: none !important;
  }
}

@media (prefers-high-contrast: high) {
  .sidebar,
  .handout,
  .boxed-text {
    border-width: 3px;
    background: white;
  }
  
  .sidebar-rules { border-color: #000; }
  .sidebar-lore { border-color: #000; }
  .sidebar-mechanics { border-color: #000; }
}

/* Focus indicators for keyboard navigation */
.table-container:focus-within,
.statblock:focus-within,
.sidebar:focus-within,
.handout:focus-within {
  outline: 2px solid #4A90E2;
  outline-offset: 2px;
}
` : ''}

/* Print-specific styles */
${includeMediaQueries && printOptimized ? generatePrintCSS(options) : ''}
`;

  return css;
}

// ============================================================================
// MAIN RENDERER EXTENSION
// ============================================================================

/**
 * Main function to extend Homebrewery renderer with custom blocks
 * @param {string} markdown - Original markdown content
 * @param {Object} options - Rendering options
 * @returns {string} - Enhanced markdown with custom blocks processed
 */
function extendHomebreweryRenderer(markdown, options = {}) {
  if (!markdown) return markdown;
  
  try {
    let processed = markdown;
    
    // Process custom content blocks
    processed = processCustomBlocks(processed, options);
    
    // Process inline block references
    processed = processInlineBlocks(processed, options.context || {});
    
    // Enhance existing Homebrewery elements
    processed = enhanceStatBlocks(processed);
    processed = enhanceTables(processed);
    processed = enhanceBoxedText(processed);
    
    // Apply accessibility enhancements
    if (options.accessibility !== false) {
      const accessibilityResult = enhanceAccessibility(processed, {
        fixHeadings: true,
        improveImages: true,
        enhanceTables: true,
        addSemantics: true,
        addAria: true
      });
      
      processed = accessibilityResult.content;
      
      // Log accessibility improvements in debug mode
      if (options.debug && accessibilityResult.report.fixes.length > 0) {
        console.log('Accessibility enhancements applied:', accessibilityResult.report.fixes);
      }
      
      // Store accessibility report for optional inspection
      if (options.onAccessibilityReport) {
        options.onAccessibilityReport(accessibilityResult.report);
      }
    }
    
    return processed;
  } catch (error) {
    console.error('Error in custom block renderer:', error);
    return `${markdown}\n\n<!-- Custom block rendering failed: ${error.message} -->`;
  }
}

/**
 * Inject custom CSS into Homebrewery
 * @param {Object} options - CSS injection options
 * @returns {string} - CSS to inject
 */
function getCustomBlockCSS(options = {}) {
  return generateCustomBlockCSS(options);
}

// ============================================================================
// BLOCK PARSING UTILITIES
// ============================================================================

/**
 * Parse content blocks from markdown
 * @param {string} markdown - The markdown to parse
 * @returns {Array} - Array of found blocks with metadata
 */
function parseContentBlocks(markdown) {
  const blocks = [];
  const blockPattern = /\{\{(\w+):(.*?)\}\}/gs;
  let match;
  
  while ((match = blockPattern.exec(markdown)) !== null) {
    const [fullMatch, blockType, contentStr] = match;
    
    try {
      let content;
      try {
        content = JSON.parse(contentStr);
      } catch {
        content = { content: contentStr };
      }
      
      blocks.push({
        type: blockType,
        content,
        raw: fullMatch,
        start: match.index,
        end: match.index + fullMatch.length
      });
    } catch (error) {
      console.warn(`Could not parse ${blockType} block:`, error);
    }
  }
  
  return blocks;
}

/**
 * Validate all content blocks in markdown
 * @param {string} markdown - The markdown to validate
 * @returns {Object} - Validation results
 */
function validateContentBlocks(markdown) {
  const blocks = parseContentBlocks(markdown);
  const results = {
    isValid: true,
    blocks: blocks.length,
    errors: [],
    warnings: []
  };
  
  blocks.forEach((block, index) => {
    const validation = ContentBlockProcessor.validateBlock(block.type, block.content);
    
    if (!validation.isValid) {
      results.isValid = false;
      results.errors.push({
        blockIndex: index,
        blockType: block.type,
        errors: validation.errors
      });
    }
    
    if (validation.warnings.length > 0) {
      results.warnings.push({
        blockIndex: index,
        blockType: block.type,
        warnings: validation.warnings
      });
    }
  });
  
  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  extendHomebreweryRenderer,
  getCustomBlockCSS,
  processCustomBlocks,
  processInlineBlocks,
  enhanceStatBlocks,
  enhanceTables,
  enhanceBoxedText,
  generateCustomBlockCSS,
  parseContentBlocks,
  validateContentBlocks,
  // Accessibility functions
  validateAccessibilityCompliance
};