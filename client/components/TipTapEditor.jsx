import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import './tiptap.less';
import extensions from 'client/extensions/index.js';
import { markdownToTiptap } from 'shared/helpers/markdownToTiptap.js';
import { normalizeTipTapDoc } from 'shared/helpers/normalizeDoc.js';
import LineNumberGutter from './LineNumberGutter.jsx';
import TipTapToolbar from './TipTapToolbar.jsx';
import IconSuggestionList from './IconSuggestionList.jsx';
import SlashCommandList from './SlashCommandList.jsx';
import OutlinePanel from './OutlinePanel.jsx';
import EntityPopup from './EntityPopup.jsx';
import { setEntities } from 'client/extensions/EntityHighlight.js';

// ── UX-polish feature flags (closed-alpha) ────────────────────────────────
// Read from localStorage so testers can flip features by clicking the View
// toggles (which persist here) — no page.evaluate injection needed. The master
// flag (MF_UX_POLISH) defaults ON in dev so the alpha surface is visible while
// building; in prod it stays off until a tester opts in.
const isDevBuild = (() => { try { return !!import.meta.env?.DEV; } catch { return false; } })();
const readUxFlag = (key, dflt) => {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? dflt : v === '1';
  } catch { return dflt; }
};
const initialUxFlags = () => {
  const master = readUxFlag('MF_UX_POLISH', isDevBuild);
  return {
    master,
    outline: readUxFlag('MF_UX_OUTLINE', true),
    fold: readUxFlag('MF_UX_FOLD', true),
    entities: readUxFlag('MF_UX_ENTITIES', false),
  };
};
const UX_FLAG_KEYS = { master: 'MF_UX_POLISH', outline: 'MF_UX_OUTLINE', fold: 'MF_UX_FOLD', entities: 'MF_UX_ENTITIES' };


// value: TipTap JSON doc OR legacy markdown string
// onChange: emits TipTap JSON as source of truth
const TipTapEditor = forwardRef(({ value, onChange = () => {}, onCursorPageChange = () => {}, onViewPageChange = () => {}, renderer = 'V3', brewId = null, srdSafe = false }, ref) => {
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
  const [inkFriendly, setInkFriendly] = useState(false);
  const [proseMirrorRoot, setProseMirrorRoot] = useState(null);
  const [uxFlags, setUxFlags] = useState(initialUxFlags);
  const [entityGraph, setEntityGraph] = useState(null); // { nodes, edges } from the knowledge graph

  // Toggle a UX-polish flag and persist it so the choice sticks across reloads.
  const toggleUxFlag = (key) => setUxFlags((prev) => {
    const next = { ...prev, [key]: !prev[key] };
    try { window.localStorage.setItem(UX_FLAG_KEYS[key], next[key] ? '1' : '0'); } catch (_) {}
    return next;
  });

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

  // Load the brew's knowledge graph and feed entity names to EntityHighlight.
  // Only runs in the closed alpha (master + entities flags) and when we have a
  // brewId. On-demand indexing: if the graph is empty (brew never indexed), we
  // process it once, then re-fetch — so "enable Entities → see highlights"
  // works in a single action without per-save latency.
  useEffect(() => {
    if (!editor || !brewId) return;
    if (!(uxFlags.master && uxFlags.entities)) {
      setEntities(editor, []); // clear highlights if the flag was turned off
      return;
    }
    let cancelled = false;
    const id = encodeURIComponent(brewId);
    const getGraph = () => fetch(`/api/story/graph/${id}`)
      .then((r) => r.json())
      .then((d) => (d && d.success && d.graph ? d.graph : { nodes: [], edges: [] }));

    (async () => {
      try {
        let graph = await getGraph();
        if (!cancelled && (!graph.nodes || graph.nodes.length === 0)) {
          // Index this brew on demand, then re-fetch.
          await fetch(`/api/story/graph/process/${id}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
          }).catch(() => {});
          if (!cancelled) graph = await getGraph();
        }
        if (cancelled) return;
        setEntityGraph(graph);
        setEntities(editor, graph.nodes || []);
      } catch (_) {
        if (!cancelled) setEntityGraph({ nodes: [], edges: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [editor, brewId, uxFlags.master, uxFlags.entities]);

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

  // Ink Friendly: inject/remove CSS in the BrewRenderer iframe
  useEffect(() => {
    const INK_FRIENDLY_ID = 'mythforge-ink-friendly';
    const INK_FRIENDLY_CSS = `
      /* Ink Friendly — strips backgrounds and images for printer-friendly output */
      *:is(.page, .monster, .note, .descriptive) {
        background: white !important;
        box-shadow: 1px 4px 14px #888 !important;
      }
      .page img {
        visibility: hidden;
      }
    `;

    try {
      const frameEl = document.getElementById('BrewRenderer');
      const frameDoc = frameEl?.contentDocument;
      if (!frameDoc) return;

      const existing = frameDoc.getElementById(INK_FRIENDLY_ID);

      if (inkFriendly && !existing) {
        const style = frameDoc.createElement('style');
        style.id = INK_FRIENDLY_ID;
        style.textContent = INK_FRIENDLY_CSS;
        frameDoc.head.appendChild(style);
      } else if (!inkFriendly && existing) {
        existing.remove();
      }
    } catch (_) {
      // Silently fail if iframe not accessible
    }
  }, [inkFriendly]);

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
    <div className={`tiptap-editor${uxFlags.master ? ' mf-ux-polish' : ''}`}>
      <TipTapToolbar
        editor={editor}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={() => setShowLineNumbers((v) => !v)}
        inkFriendly={inkFriendly}
        onToggleInkFriendly={() => setInkFriendly((v) => !v)}
        uxFlags={uxFlags}
        onToggleUxFlag={toggleUxFlag}
      />
      <div className='tiptap-editor__body'>
        <div className='tiptap-editor__content' ref={contentRef}>
          <LineNumberGutter
            contentEl={contentRef.current}
            editorRoot={proseMirrorRoot}
            enabled={showLineNumbers}
          />
          <EditorContent editor={editor} />
          <IconSuggestionList editor={editor} />
          <SlashCommandList editor={editor} srdSafe={srdSafe} />
          {uxFlags.master && uxFlags.entities && (
            <EntityPopup editor={editor} graph={entityGraph} />
          )}
        </div>
        {uxFlags.master && uxFlags.outline && (
          <OutlinePanel editor={editor} enabled={uxFlags.outline} foldEnabled={uxFlags.master && uxFlags.fold} />
        )}
      </div>
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

export default TipTapEditor;
