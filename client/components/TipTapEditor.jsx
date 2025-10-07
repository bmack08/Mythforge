import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import './tiptap.less';
import extensions from 'client/extensions/index.js';
import { markdownToTiptap } from 'shared/helpers/markdownToTiptap.js';


// value: TipTap JSON doc OR legacy markdown string
// onChange: emits TipTap JSON as source of truth
const TipTapEditor = forwardRef(({ value, onChange = () => {}, onCursorPageChange = () => {}, onViewPageChange = () => {}, renderer = 'V3' }, ref) => {
  const initialContent = (() => {
    // Debug logging
    console.log('[TipTap] Initial value type:', typeof value);
    console.log('[TipTap] Initial value length:', typeof value === 'string' ? value.length : 'N/A');
    
    // If value is an object, assume TipTap JSON
    if (value && typeof value === 'object') {
      console.log('[TipTap] Loading from JSON object');
      return value;
    }
    // If value is a string (markdown from database), convert to TipTap JSON
    if (typeof value === 'string') {
      console.log('[TipTap] Converting markdown to TipTap JSON');
      const converted = markdownToTiptap(value);
      console.log('[TipTap] Converted content nodes:', converted.content?.length);
      return converted;
    }
    // Empty document
    console.log('[TipTap] Creating empty document');
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  })();

  // Client-only mount guard to prevent SSR hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use the recommended useEditor hook (TipTap v3 React way)
  // Extensions are now imported from central registry
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: true, // Make editor editable by default
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
      onCursorPageChange(1);
      onViewPageChange(1);
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
        spellcheck: 'false',
      },
    },
  }, []); // Empty dependency array ensures editor is only created once

  // Hydrate when external value changes (JSON or markdown string)
  useEffect(() => {
    if (!editor) return;
    
    let newContent;
    if (value && typeof value === 'object') {
      newContent = value;
    } else if (typeof value === 'string') {
      newContent = markdownToTiptap(value);
    } else {
      return; // No valid content
    }
    
    // Only update if content actually changed (avoid cursor jumping)
    const currentJSON = JSON.stringify(editor.getJSON());
    const newJSON = JSON.stringify(newContent);
    if (currentJSON !== newJSON) {
      editor.commands.setContent(newContent);
    }
  }, [value, editor]);

  // Scroll sync: sync TipTap editor scroll with BrewRenderer preview
  useEffect(() => {
    if (!editor) return;
    
    const editorElement = document.querySelector('.ProseMirror');
    if (!editorElement) return;
    
    const handleScroll = () => {
      try {
        const brewRendererFrame = window.frames['BrewRenderer'];
        if (!brewRendererFrame || !brewRendererFrame.contentDocument) return;
        
        const previewElement = brewRendererFrame.contentDocument.querySelector('.brewRenderer');
        if (!previewElement) return;
        
        // Calculate scroll ratio
        const scrollRatio = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
        
        // Apply same ratio to preview (if not NaN)
        if (!isNaN(scrollRatio)) {
          const targetScroll = scrollRatio * (previewElement.scrollHeight - previewElement.clientHeight);
          previewElement.scrollTop = targetScroll;
        }
      } catch (e) {
        // Silently fail if iframe not accessible
      }
    };
    
    editorElement.addEventListener('scroll', handleScroll);
    return () => editorElement.removeEventListener('scroll', handleScroll);
  }, [editor]);

  // Expose editor instance and helper methods via ref
  useImperativeHandle(ref, () => ({
    editor,
    insertContent: (content) => {
      if (!editor) return;
      
      // Accept both structured JSON and legacy markdown strings
      let insertableContent;
      
      if (typeof content === 'string') {
        // Legacy markdown text - convert to TipTap JSON
        const doc = markdownToTiptap(content);
        insertableContent = doc.content;
      } else if (typeof content === 'object') {
        // Already structured TipTap JSON - use directly
        insertableContent = content;
      } else {
        return; // Invalid content type
      }
      
      // Insert content at current cursor position
      editor.chain().focus().insertContent(insertableContent).run();
    },
    getJSON: () => editor?.getJSON(),
    setContent: (content) => editor?.commands.setContent(content),
  }), [editor]);

  // Render placeholder until editor is ready to avoid hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className='tiptap-editor'>
        <div className='tiptap-editor__toolbar' />
        <div className='tiptap-editor__content' />
      </div>
    );
  }

  return (
    <div className='tiptap-editor'>
      <div className='tiptap-editor__toolbar'>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title='H1'>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title='H2'>H2</button>
        <button onClick={() => editor.chain().focus().toggleBold().run()} title='Bold'><strong>B</strong></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} title='Italic'><em>I</em></button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title='HR'>---</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;
