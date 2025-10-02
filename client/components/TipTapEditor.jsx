const React = require('react');
const { useEffect, useState, useRef } = React;

// Simple rich text editor that works immediately - no complex dependencies
const TipTapEditor = ({
  value = '',
  onChange = () => {},
  onCursorPageChange = () => {},
  onViewPageChange = () => {},
  renderer = 'V3',
}) => {
  const [content, setContent] = useState(value);
  const editorRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isLoaded) {
      editorRef.current.innerHTML = markdownToHtml(value);
      setIsLoaded(true);
    }
  }, [value, isLoaded]);

  // Update content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== content) {
      setContent(value);
      editorRef.current.innerHTML = markdownToHtml(value);
    }
  }, [value, content]);

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown) => {
    if (!markdown) return '<p><br></p>';
    
    return markdown
      .split('\n\n')
      .map(paragraph => {
        if (!paragraph.trim()) return '<p><br></p>';
        
        // Headers
        if (paragraph.startsWith('# ')) {
          return `<h1>${paragraph.slice(2)}</h1>`;
        }
        if (paragraph.startsWith('## ')) {
          return `<h2>${paragraph.slice(3)}</h2>`;
        }
        if (paragraph.startsWith('### ')) {
          return `<h3>${paragraph.slice(4)}</h3>`;
        }
        
        // Horizontal rule
        if (paragraph.trim() === '---') {
          return '<hr>';
        }
        
        // Regular paragraph with basic formatting
        let text = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        
        return `<p>${text}</p>`;
      })
      .join('');
  };

  // Simple HTML to markdown converter
  const htmlToMarkdown = (html) => {
    if (!html) return '';
    
    return html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<hr\s*\/?>/g, '---\n\n')
      .replace(/<p><br><\/p>/g, '\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '_$1_')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = htmlToMarkdown(html);
      setContent(markdown);
      onChange(markdown);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
        ? range.commonAncestorContainer.parentElement 
        : range.commonAncestorContainer;
      
      if (element.tagName && element.tagName.match(/^H[1-6]$/)) {
        // Change existing heading
        element.outerHTML = `<h${level}>${element.textContent}</h${level}>`;
      } else {
        // Create new heading
        document.execCommand('formatBlock', false, `<h${level}>`);
      }
    }
    handleInput();
    editorRef.current?.focus();
  };

  const insertHorizontalRule = () => {
    document.execCommand('insertHTML', false, '<hr>');
    handleInput();
    editorRef.current?.focus();
  };

  return (
    <div className='tiptap-editor' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className='tiptap-editor__toolbar' style={{
        padding: '8px',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        gap: '4px',
        flexShrink: 0
      }}>
        <button 
          onClick={() => insertHeading(1)} 
          title='Heading 1'
          style={{ padding: '4px 8px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
        >
          H1
        </button>
        <button 
          onClick={() => insertHeading(2)} 
          title='Heading 2'
          style={{ padding: '4px 8px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
        >
          H2
        </button>
        <button 
          onClick={() => formatText('bold')} 
          title='Bold'
          style={{ padding: '4px 8px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
        >
          <strong>B</strong>
        </button>
        <button 
          onClick={() => formatText('italic')} 
          title='Italic'
          style={{ padding: '4px 8px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
        >
          <em>I</em>
        </button>
        <button 
          onClick={insertHorizontalRule} 
          title='Horizontal Rule'
          style={{ padding: '4px 8px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
        >
          ---
        </button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          flex: 1,
          padding: '10px',
          border: 'none',
          outline: 'none',
          overflow: 'auto',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

module.exports = TipTapEditor;
module.exports.default = TipTapEditor;
