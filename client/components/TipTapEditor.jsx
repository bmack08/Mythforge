import React, { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
// Load StarterKit via require to handle ESM/CJS interop in our bundler and v2/v3 shapes
const __SK = require('@tiptap/starter-kit');
const StarterKit = __SK.default || __SK;
import './tiptap.less' // your styles

// Include basic TipTap styles and our overrides
if (typeof window !== 'undefined') {
  try {
    const req = eval('require');
    req('./tiptap.css');
  } catch(_) {}
}
import createIcon from 'client/extensions/Icon.js'

// Load TipTap Icon extension at module level to ensure browserify bundles it
let IconExtension;
try {
  const core = require('@tiptap/core');
  IconExtension = createIcon(core);
} catch(err) {
  console.error('Failed to load TipTap Icon extension:', err);
}


// value: TipTap JSON doc OR legacy markdown string
// onChange: emits TipTap JSON as source of truth
const TipTapEditor = ({ value, onChange = () => {}, onCursorPageChange = () => {}, onViewPageChange = () => {}, renderer = 'V3' }) => {
  const initialContent = (() => {
    // If value is an object, assume TipTap JSON
    if (value && typeof value === 'object') return value;
    // Otherwise seed with a paragraph containing legacy markdown
    return { type: 'doc', content: [{ type: 'paragraph', content: value ? [{ type: 'text', text: String(value) }] : [] }] };
  })();

  // Client-only mount guard to prevent SSR hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Resolve StarterKit across v2/v3 shapes
  const starterKitOptions = {
    heading: { levels: [1, 2] },
    horizontalRule: true,
  };
  const StarterKitResolved = (typeof StarterKit === 'function')
    ? StarterKit(starterKitOptions)
    : (StarterKit && typeof StarterKit.configure === 'function')
      ? StarterKit.configure(starterKitOptions)
      : StarterKit;

  const resolvedExtensions = [];
  if (Array.isArray(StarterKitResolved)) resolvedExtensions.push(...StarterKitResolved);
  else if (StarterKitResolved) resolvedExtensions.push(StarterKitResolved);
  if (IconExtension) resolvedExtensions.push(IconExtension);

  // Use the recommended useEditor hook (TipTap v3 React way)
  const editor = useEditor({
    extensions: resolvedExtensions,
    content: initialContent,
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

  // Hydrate when external JSON changes
  useEffect(() => {
    if (!editor) return;
    if (value && typeof value === 'object') {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Render placeholder until editor is ready to avoid hydration mismatch
  if (!isMounted || !editor) {
    return (
      <div className='tiptap-editor' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className='tiptap-editor__toolbar' style={{ padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '4px', flexShrink: 0 }} />
        <div className='tiptap-editor__content' style={{ flex: 1 }} />
      </div>
    );
  }

  return (
    <div className='tiptap-editor' style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className='tiptap-editor__toolbar' style={{ padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '4px', flexShrink: 0 }}>
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
// Ensure CommonJS consumers using require() receive the component directly
// (our codebase mixes CJS and ESM in places)
module.exports = TipTapEditor;
