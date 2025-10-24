// PDF Processing Service for Story IDE
// Extracts text content and style rules from D&D sourcebooks and references

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFProcessor {
    constructor() {
        this.sourcebooksPath = path.join(__dirname, '../../../docs/sourcebooks');
        this.dialogsPath = path.join(__dirname, '../../../docs/Dialogs-20250811T204535Z-1-001');
        this.cache = new Map();
    }

    // Extract text from all PDFs in the sourcebooks directory
    async extractSourcebookContent() {
        console.log('📚 Extracting content from D&D sourcebooks...');
        
        const sourcebooks = [];
        
        if (fs.existsSync(this.sourcebooksPath)) {
            const files = fs.readdirSync(this.sourcebooksPath)
                .filter(file => file.toLowerCase().endsWith('.pdf'));
            
            for (const file of files) {
                try {
                    const filePath = path.join(this.sourcebooksPath, file);
                    const content = await this.extractPDFText(filePath);
                    
                    sourcebooks.push({
                        filename: file,
                        path: filePath,
                        content: content,
                        rules: this.extractStyleRules(content),
                        entities: this.extractEntities(content)
                    });
                    
                    console.log(`✅ Processed: ${file} (${content.length} chars)`);
                } catch (error) {
                    console.warn(`⚠️ Could not process ${file}:`, error.message);
                }
            }
        }
        
        return sourcebooks;
    }

    // Extract dialog examples
    async extractDialogExamples() {
        console.log('💬 Extracting dialog examples...');
        
        const dialogs = [];
        
        if (fs.existsSync(this.dialogsPath)) {
            const files = fs.readdirSync(this.dialogsPath, { withFileTypes: true })
                .filter(dirent => dirent.isFile())
                .map(dirent => dirent.name);
            
            for (const file of files) {
                try {
                    const filePath = path.join(this.dialogsPath, file);
                    let content = '';
                    
                    if (file.toLowerCase().endsWith('.pdf')) {
                        content = await this.extractPDFText(filePath);
                    } else if (file.toLowerCase().endsWith('.txt') || file.toLowerCase().endsWith('.md')) {
                        content = fs.readFileSync(filePath, 'utf8');
                    }
                    
                    if (content) {
                        dialogs.push({
                            filename: file,
                            path: filePath,
                            content: content,
                            examples: this.extractDialogPatterns(content)
                        });
                        
                        console.log(`✅ Processed dialog file: ${file}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not process dialog file ${file}:`, error.message);
                }
            }
        }
        
        return dialogs;
    }

    // Extract text from a single PDF file
    async extractPDFText(filePathOrBuffer) {
        // Check if input is a buffer or file path
        let dataBuffer;
        let cacheKey;
        
        if (Buffer.isBuffer(filePathOrBuffer)) {
            // It's a buffer from uploaded file
            dataBuffer = filePathOrBuffer;
            cacheKey = `buffer_${dataBuffer.length}_${dataBuffer.slice(0, 100).toString('hex')}`;
        } else {
            // It's a file path
            cacheKey = filePathOrBuffer;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            dataBuffer = fs.readFileSync(filePathOrBuffer);
        }
        
        // Check cache for buffers too
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const data = await pdf(dataBuffer);
        
        // Clean up the extracted text
        let text = data.text
            .replace(/\f/g, '\n') // Form feeds to newlines
            .replace(/\r\n/g, '\n') // Windows line endings
            .replace(/\r/g, '\n') // Mac line endings
            .replace(/\n{3,}/g, '\n\n') // Multiple newlines
            .trim();
        
        this.cache.set(cacheKey, text);
        return text;
    }

    // Extract style rules (not copyrighted content)
    extractStyleRules(content) {
        const rules = {
            headings: [],
            statBlocks: [],
            callouts: [],
            tables: [],
            lists: []
        };
        
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Heading patterns
            if (/^[A-Z][A-Z\s]+$/.test(line) && line.length < 50) {
                rules.headings.push({ type: 'all-caps', example: 'CHAPTER TITLE' });
            } else if (/^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/.test(line) && line.length < 30) {
                rules.headings.push({ type: 'title-case', example: 'Section Title' });
            }
            
            // Stat block patterns
            if (line.includes('Armor Class') || line.includes('Hit Points') || line.includes('Challenge')) {
                rules.statBlocks.push({ type: 'stat-field', field: line.split(':')[0] || line });
            }
            
            // Callout patterns
            if (line.match(/^[A-Z][a-z]+(?: [A-Z][a-z]+)*[:\.]$/)) {
                rules.callouts.push({ type: 'bold-header', example: line });
            }
        }
        
        return rules;
    }

    // Extract entities (characters, locations, etc.) for reference
    extractEntities(content) {
        const entities = {
            characters: [],
            locations: [],
            items: [],
            spells: []
        };
        
        // Simple pattern matching for common D&D entities
        const characterPattern = /\b[A-Z][a-z]+ (?:the )?[A-Z][a-z]+\b/g;
        const locationPattern = /\b(?:City|Town|Village|Castle|Keep|Tower) (?:of )?[A-Z][a-z]+\b/g;
        
        const characters = content.match(characterPattern) || [];
        const locations = content.match(locationPattern) || [];
        
        // Remove duplicates and common false positives
        entities.characters = [...new Set(characters)]
            .filter(name => !['Armor Class', 'Hit Points', 'Saving Throws'].includes(name))
            .slice(0, 20);
            
        entities.locations = [...new Set(locations)].slice(0, 10);
        
        return entities;
    }

    // Extract dialog patterns for writing style
    extractDialogPatterns(content) {
        const patterns = {
            formal: [],
            casual: [],
            accents: [],
            emotional: []
        };
        
        // Look for quoted dialog
        const dialogRegex = /"([^"]+)"/g;
        const dialogs = [];
        let match;
        
        while ((match = dialogRegex.exec(content)) !== null) {
            if (match[1].length > 10 && match[1].length < 200) {
                dialogs.push(match[1]);
            }
        }
        
        // Categorize dialog examples (simple heuristics)
        dialogs.forEach(dialog => {
            if (dialog.match(/\b(thee|thou|thy|thine|verily|hast|doth)\b/i)) {
                patterns.formal.push(dialog);
            } else if (dialog.match(/\b(ain't|gonna|wanna|yeah|nah)\b/i)) {
                patterns.casual.push(dialog);
            } else if (dialog.match(/[!]{2,}|[?]{2,}|[A-Z]{3,}/)) {
                patterns.emotional.push(dialog);
            }
        });
        
        return patterns;
    }

    // Build comprehensive style rules JSON
    async buildStyleRulesJSON() {
        console.log('🎨 Building comprehensive style rules...');
        
        const sourcebooks = await this.extractSourcebookContent();
        const dialogs = await this.extractDialogExamples();
        
        const styleRules = {
            headings: {
                chapter: "# ALL CAPS CHAPTER TITLE",
                section: "## Title Case Section",
                subsection: "### Lowercase subsection"
            },
            statBlocks: {
                order: ["Name", "Size/Type/Alignment", "Armor Class", "Hit Points", "Speed", "STR", "DEX", "CON", "INT", "WIS", "CHA", "Saving Throws", "Skills", "Senses", "Languages", "Challenge"],
                format: "**Field Name** value"
            },
            callouts: {
                format: "**Bold Title:** followed by content",
                types: ["Adventure Hooks", "DM Notes", "Sidebar", "Optional Rules"]
            },
            dialog: {
                formal: dialogs.length > 0 ? dialogs[0].examples.formal.slice(0, 3) : [],
                casual: dialogs.length > 0 ? dialogs[0].examples.casual.slice(0, 3) : [],
                emotional: dialogs.length > 0 ? dialogs[0].examples.emotional.slice(0, 3) : []
            },
            layout: {
                pageBreaks: "Use \\page between major sections",
                columns: "Use {{wide}} for full-width content",
                frontMatter: "Use {{frontCover}} and {{backCover}} tokens"
            },
            extractedFrom: sourcebooks.map(sb => sb.filename)
        };
        
        // Save to file
        const outputPath = path.join(__dirname, '../../../style/wotc.rules.json');
        const styleDir = path.dirname(outputPath);
        
        if (!fs.existsSync(styleDir)) {
            fs.mkdirSync(styleDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(styleRules, null, 2));
        
        console.log(`✅ Style rules saved to: ${outputPath}`);
        return styleRules;
    }

    // Search PDF content for specific queries
    async searchPDFContent(query, maxResults = 5) {
        const results = [];
        
        if (fs.existsSync(this.sourcebooksPath)) {
            const files = fs.readdirSync(this.sourcebooksPath)
                .filter(file => file.toLowerCase().endsWith('.pdf'));
            
            for (const file of files.slice(0, 3)) { // Limit to first 3 PDFs to avoid long processing
                try {
                    const filePath = path.join(this.sourcebooksPath, file);
                    const content = await this.extractPDFText(filePath);
                    
                    // Simple text search
                    const lines = content.split('\n');
                    const queryLower = query.toLowerCase();
                    
                    lines.forEach((line, index) => {
                        if (line.toLowerCase().includes(queryLower) && line.trim().length > 10) {
                            results.push({
                                source: file,
                                content: line.trim(),
                                context: lines.slice(Math.max(0, index - 1), index + 2).join(' ')
                            });
                        }
                    });
                } catch (error) {
                    console.warn(`Could not search ${file}:`, error.message);
                }
            }
        }
        
        return results.slice(0, maxResults);
    }
}

export default PDFProcessor;