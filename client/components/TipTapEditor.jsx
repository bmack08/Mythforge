import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as TipTapCore from '@tiptap/core';
import './tiptap.less';
import createIcon from 'client/extensions/Icon.js';
import { markdownToTiptap } from 'shared/helpers/markdownToTiptap.js';

// Load TipTap Icon extension at module level
let IconExtension;
try {
  IconExtension = createIcon(TipTapCore);
} catch(err) {
  console.error('Failed to load TipTap Icon extension:', err);
}


// value: TipTap JSON doc OR legacy markdown string
// onChange: emits TipTap JSON as source of truth
const TipTapEditor = ({ value, onChange = () => {}, onCursorPageChange = () => {}, onViewPageChange = () => {}, renderer = 'V3' }) => {
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

  // Configure StarterKit for TipTap v3
  const starterKitOptions = {
    heading: { levels: [1, 2] },
    horizontalRule: true,
  };

  const resolvedExtensions = [
    StarterKit.configure(starterKitOptions)
  ];
  if (IconExtension) resolvedExtensions.push(IconExtension);

  // Use the recommended useEditor hook (TipTap v3 React way)
  const editor = useEditor({
    extensions: resolvedExtensions,
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
};

export default TipTapEditor;
