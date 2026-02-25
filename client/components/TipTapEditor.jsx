import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import './tiptap.less';
import extensions from 'client/extensions/index.js';
import { markdownToTiptap } from 'shared/helpers/markdownToTiptap.js';
import { normalizeTipTapDoc } from 'shared/helpers/normalizeDoc.js';
import LineNumberGutter from './LineNumberGutter.jsx';
import TipTapToolbar from './TipTapToolbar.jsx';
import IconSuggestionList from './IconSuggestionList.jsx';


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
      const json = normalizeTipTapDoc(editor.getJSON());
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

  // Refs to wire the gutter
  const contentRef = useRef(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [proseMirrorRoot, setProseMirrorRoot] = useState(null);

  // Capture ProseMirror root once the editor is ready
  useEffect(()=>{
    if (!editor) return;

    // Small delay to ensure the ProseMirror element is in the DOM
    const timer = setTimeout(() => {
      const pmElement = document.querySelector('.ProseMirror');
      if (pmElement) {
        console.log('[TipTap] Found ProseMirror element for line numbers:', pmElement);
        setProseMirrorRoot(pmElement);
      } else {
        console.warn('[TipTap] ProseMirror element not found');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [editor]);

  // Hydrate when external value changes (JSON or markdown string)
  useEffect(() => {
    if (!editor) return;
    
    let newContent;
    if (value && typeof value === 'object') {
      newContent = normalizeTipTapDoc(value);
    } else if (typeof value === 'string') {
      newContent = normalizeTipTapDoc(markdownToTiptap(value));
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
    
  const editorElement = contentRef.current || document.querySelector('.tiptap-editor__content');
    if (!editorElement) return;
    
    const handleScroll = () => {
      try {
        const brewRendererFrame = window.frames['BrewRenderer'];
        if (!brewRendererFrame || !brewRendererFrame.contentDocument) return;

        const previewElement = brewRendererFrame.contentDocument.querySelector('.brewRenderer');
        if (!previewElement) return;

        // Calculate scroll ratio from the container that actually scrolls
        const scrollRatio = editorElement.scrollTop / Math.max(1, (editorElement.scrollHeight - editorElement.clientHeight));

        if (!isNaN(scrollRatio)) {
          const targetScroll = scrollRatio * Math.max(1, (previewElement.scrollHeight - previewElement.clientHeight));
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

      try {
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
      } catch (err) {
        console.error('[TipTapEditor] Failed to insert content:', err);
      }
    },
    getJSON: () => editor?.getJSON(),
    setContent: (content) => editor?.commands.setContent(content),
    // Scroll editor to the Nth page (0-indexed). Finds the Nth pageBreak node and scrolls it into view.
    scrollToPage: (pageNum) => {
      if (!editor || pageNum <= 0) return;
      let breakCount = 0;
      let targetPos = null;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'pageBreak') {
          breakCount++;
          if (breakCount === pageNum && targetPos === null) {
            targetPos = pos;
            return false; // Stop traversal
          }
        }
      });
      if (targetPos !== null) {
        // Set cursor near the page break and scroll into view
        editor.commands.setTextSelection(targetPos);
        editor.commands.scrollIntoView();
      } else if (pageNum === 1) {
        // First page — scroll to top
        editor.commands.setTextSelection(0);
        editor.commands.scrollIntoView();
      }
    },
    // Get the current page number based on cursor position
    getCurrentPage: () => {
      if (!editor) return 1;
      const cursorPos = editor.state.selection.from;
      let pageNum = 1;
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'pageBreak' && pos < cursorPos) {
          pageNum++;
        }
      });
      return pageNum;
    },
  }), [editor]);

  // Render placeholder until editor is ready to avoid hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className='tiptap-editor'>
        <div className='tiptap-editor__toolbar' />
        <div className='tiptap-editor__content' ref={contentRef} />
      </div>
    );
  }

  return (
    <div className='tiptap-editor'>
      <TipTapToolbar
        editor={editor}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={() => setShowLineNumbers((v) => !v)}
      />
      <div className='tiptap-editor__content' ref={contentRef}>
        <LineNumberGutter
          contentEl={contentRef.current}
          editorRoot={proseMirrorRoot}
          enabled={showLineNumbers}
        />
        <EditorContent editor={editor} />
        <IconSuggestionList editor={editor} />
      </div>
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;
