/**
 * HeadingFold — collapsible heading sections for the TipTap editor.
 *
 * Adds a fold chevron to every heading; clicking it collapses that heading's
 * section (everything from the end of the heading down to the next heading of
 * the same-or-higher level). Folding is a pure VIEW concern — it is implemented
 * entirely with ProseMirror decorations (a widget chevron + `display:none` node
 * decorations). The document is NEVER mutated, so `editor.getJSON()` is
 * identical whether a section is folded or not.
 *
 * Mirrors the raw-Plugin pattern used by IconSuggestion.js (no extra deps).
 * Fold state is keyed by heading id (the same slug HeadingWithId/OutlinePanel
 * use) so it survives body edits; editing a heading's own text changes its
 * slug and safely drops that fold.
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import slugify from './slugify.js';

export const HEADING_FOLD_KEY = new PluginKey('headingFold');

// Folding is a closed-alpha feature: gate it on the same localStorage flags the
// editor shell uses (master MF_UX_POLISH + MF_UX_FOLD). When off, the plugin
// emits no decorations at all, so non-alpha users see no chevrons.
function foldEnabled() {
  try {
    const master = window.localStorage.getItem('MF_UX_POLISH');
    const fold = window.localStorage.getItem('MF_UX_FOLD');
    const devDefault = (() => { try { return !!(import.meta.env && import.meta.env.DEV); } catch { return false; } })();
    const masterOn = master === null ? devDefault : master === '1';
    const foldOn = fold === null ? true : fold === '1';
    return masterOn && foldOn;
  } catch { return false; }
}

const headingId = (node) => node.attrs.id || slugify(node.textContent);

// Collect the doc's direct children with absolute start/end positions.
function topLevelBlocks(doc) {
  const blocks = [];
  doc.forEach((node, offset) => {
    blocks.push({ node, start: offset, end: offset + node.nodeSize });
  });
  return blocks;
}

// For the heading at block index `i`, return the content range it owns:
// from the end of the heading node to the start of the next same-or-higher
// heading (or end of doc), plus the inclusive block-index span to hide.
function sectionFor(blocks, i, doc) {
  const level = blocks[i].node.attrs.level || 1;
  let endIndex = blocks.length; // exclusive
  for (let j = i + 1; j < blocks.length; j++) {
    const n = blocks[j].node;
    if (n.type.name === 'heading' && (n.attrs.level || 1) <= level) { endIndex = j; break; }
  }
  const contentFrom = blocks[i].end;
  const contentTo = endIndex < blocks.length ? blocks[endIndex].start : doc.content.size;
  return { firstHidden: i + 1, lastHidden: endIndex - 1, contentFrom, contentTo };
}

function buildChevron(view, isFolded, id, headingStart) {
  const span = document.createElement('span');
  span.className = `mf-fold-chevron${isFolded ? ' is-folded' : ''}`;
  span.setAttribute('contenteditable', 'false');
  span.title = isFolded ? 'Expand section' : 'Collapse section';
  const icon = document.createElement('i');
  icon.className = isFolded ? 'fas fa-chevron-right' : 'fas fa-chevron-down';
  span.appendChild(icon);
  span.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const willFold = !isFolded;
    let tr = view.state.tr.setMeta(HEADING_FOLD_KEY, { toggle: id });
    // When folding, park the cursor on the heading so it isn't trapped in
    // the now-hidden body (which would immediately auto-unfold it).
    if (willFold) {
      try { tr = tr.setSelection(TextSelection.create(tr.doc, headingStart + 1)); } catch (_) {}
    }
    view.dispatch(tr);
  });
  return span;
}

const HeadingFold = Extension.create({
  name: 'headingFold',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: HEADING_FOLD_KEY,

        state: {
          init() { return { folded: new Set() }; },
          apply(tr, value, _oldState, newState) {
            let folded = value.folded;
            const meta = tr.getMeta(HEADING_FOLD_KEY);

            if (meta) {
              folded = new Set(folded);
              if (meta.toggle) {
                folded.has(meta.toggle) ? folded.delete(meta.toggle) : folded.add(meta.toggle);
              } else if (meta.unfold) {
                folded.delete(meta.unfold);
              } else if (meta.clear) {
                folded.clear();
              }
            }

            // Auto-unfold any section the cursor moves into (e.g. via arrow
            // keys) — but never on the same transaction that did the fold.
            if (!meta && folded.size && (tr.selectionSet || tr.docChanged)) {
              const sel = newState.selection;
              const blocks = topLevelBlocks(newState.doc);
              let next = null;
              blocks.forEach((b, i) => {
                if (b.node.type.name !== 'heading') return;
                const id = headingId(b.node);
                if (!folded.has(id)) return;
                const { contentFrom, contentTo } = sectionFor(blocks, i, newState.doc);
                if (sel.from > contentFrom && sel.from < contentTo) {
                  if (!next) next = new Set(folded);
                  next.delete(id);
                }
              });
              if (next) folded = next;
            }

            return { folded };
          },
        },

        props: {
          decorations(state) {
            if (!foldEnabled()) return DecorationSet.empty;
            const pluginState = HEADING_FOLD_KEY.getState(state);
            const folded = pluginState ? pluginState.folded : null;
            const blocks = topLevelBlocks(state.doc);
            const decos = [];

            blocks.forEach((b, i) => {
              if (b.node.type.name !== 'heading') return;
              const id = headingId(b.node);
              const isFolded = !!folded && folded.has(id);

              // Chevron widget at the start of the heading content. Key encodes
              // fold state so it only re-renders when the state flips (stable
              // across ordinary keystrokes elsewhere in the doc).
              decos.push(
                Decoration.widget(
                  b.start + 1,
                  (view) => buildChevron(view, isFolded, id, b.start),
                  { side: -1, key: `fold-${id}-${isFolded ? 'f' : 'o'}`, ignoreSelection: true, stopEvent: () => true }
                )
              );

              if (isFolded) {
                const { firstHidden, lastHidden } = sectionFor(blocks, i, state.doc);
                for (let k = firstHidden; k <= lastHidden; k++) {
                  decos.push(Decoration.node(blocks[k].start, blocks[k].end, { class: 'mf-folded-hidden' }));
                }
              }
            });

            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});

export default HeadingFold;
