/**
 * OutlinePanel — live document outline / navigation for the TipTap editor.
 *
 * Reads h1–h6 headings straight from the editor doc (NOT the manual TocBlock),
 * renders them as an indented, clickable list, and jumps the editor to a
 * heading on click. Highlights the section the user is currently scrolled to.
 *
 * Pure VIEW concern: it never mutates the document — it only reads
 * `editor.state.doc` and calls scroll/selection commands.
 *
 * Mount as a flex sibling of `.tiptap-editor__content` (see TipTapEditor.jsx).
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import slugify from 'client/extensions/slugify.js';
import { HEADING_FOLD_KEY } from 'client/extensions/HeadingFold.js';
import './OutlinePanel.less';

function readFoldedSet(editor) {
  try {
    const st = HEADING_FOLD_KEY.getState(editor.state);
    return st && st.folded ? st.folded : new Set();
  } catch (_) { return new Set(); }
}

// Walk the doc once, collecting every heading with its level/text/id/pos.
function collectHeadings(editor) {
  const out = [];
  if (!editor) return out;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      const text = node.textContent || '';
      out.push({
        level: node.attrs.level || 1,
        text,
        id: node.attrs.id || slugify(text),
        pos,
      });
    }
    return true;
  });
  return out;
}

const OutlinePanel = ({ editor, enabled = true, foldEnabled = false }) => {
  const [headings, setHeadings] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [foldedIds, setFoldedIds] = useState(() => new Set());
  const rafRef = useRef(null);
  const foldRafRef = useRef(null);

  // ── Recompute the outline (debounced via RAF) whenever the doc changes ──
  const recompute = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setHeadings(collectHeadings(editor));
    });
  }, [editor]);

  useEffect(() => {
    if (!editor || !enabled) return;
    recompute();
    editor.on('update', recompute);
    return () => {
      editor.off('update', recompute);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [editor, enabled, recompute]);

  // ── Mirror fold state from the HeadingFold plugin (fold via meta tx, not
  // a doc change, so we track 'transaction' too) ──
  useEffect(() => {
    if (!editor || !enabled || !foldEnabled) return;
    const sync = () => {
      if (foldRafRef.current) cancelAnimationFrame(foldRafRef.current);
      foldRafRef.current = requestAnimationFrame(() => setFoldedIds(new Set(readFoldedSet(editor))));
    };
    sync();
    editor.on('transaction', sync);
    return () => {
      editor.off('transaction', sync);
      if (foldRafRef.current) cancelAnimationFrame(foldRafRef.current);
    };
  }, [editor, enabled, foldEnabled]);

  const toggleFold = useCallback((e, h) => {
    e.stopPropagation(); // don't also jump
    if (!editor) return;
    editor.view.dispatch(editor.state.tr.setMeta(HEADING_FOLD_KEY, { toggle: h.id }));
  }, [editor]);

  // ── Track the active section by scroll position ──
  useEffect(() => {
    if (!editor || !enabled) return;
    const scroller = editor.view.dom.closest('.tiptap-editor__content');
    if (!scroller) return;

    let scrollRaf = null;
    const onScroll = () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      scrollRaf = requestAnimationFrame(() => {
        const headingEls = Array.from(editor.view.dom.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const threshold = scroller.scrollTop + 80; // a little below the top edge
        let idx = -1;
        for (let i = 0; i < headingEls.length; i++) {
          if (headingEls[i].offsetTop <= threshold) idx = i;
          else break;
        }
        setActiveIndex(idx);
      });
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, [editor, enabled, headings.length]);

  const jumpTo = useCallback((h) => {
    if (!editor) return;
    // Prefer the DOM anchor written by HeadingWithId; fall back to a PM selection.
    let el = null;
    try {
      el = h.id ? editor.view.dom.querySelector('#' + CSS.escape(h.id)) : null;
    } catch (_) { el = null; }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      editor.chain().setTextSelection(h.pos + 1).scrollIntoView().focus().run();
    }
  }, [editor]);

  if (!enabled) return null;

  return (
    <aside className="tiptap-editor__outline" aria-label="Document outline">
      <div className="mf-outline__header">
        <i className="fas fa-stream" />
        <span>Outline</span>
      </div>
      {headings.length === 0 ? (
        <div className="mf-outline__empty">
          No headings yet.<br />Add a heading (H1–H3) to build your outline.
        </div>
      ) : (
        <ul className="mf-outline__list">
          {headings.map((h, i) => (
            <li
              key={h.pos}
              className={`mf-outline__item mf-outline__item--h${h.level}${i === activeIndex ? ' is-active' : ''}`}
              style={{ paddingLeft: 8 + (h.level - 1) * 12 }}
              title={h.text || '(untitled)'}
              onClick={() => jumpTo(h)}
            >
              {foldEnabled && (
                <button
                  type="button"
                  className={`mf-outline__fold${foldedIds.has(h.id) ? ' is-folded' : ''}`}
                  title={foldedIds.has(h.id) ? 'Expand section' : 'Collapse section'}
                  onClick={(e) => toggleFold(e, h)}
                >
                  <i className={foldedIds.has(h.id) ? 'fas fa-chevron-right' : 'fas fa-chevron-down'} />
                </button>
              )}
              <span className="mf-outline__label">{h.text || '(untitled)'}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default OutlinePanel;
