/**
 * EntityHighlight — decorate known story entities (NPCs, locations, items…)
 * inline in the editor, and emit hover/click events so a React popup can show
 * an entity card / detail panel.
 *
 * The entity list comes from the brew's knowledge graph
 * (GET /api/story/graph/:brewId → { graph: { nodes, edges } }). It is dynamic,
 * so the React layer pushes it into the plugin via `setEntities(editor, nodes)`
 * (a meta transaction) rather than baking it into the extension.
 *
 * This is a pure VIEW concern: inline decorations + DOM event bus, mirroring
 * IconSuggestion.js. The document is never modified. Highlighting only appears
 * once entities are pushed in (the editor only does that when the MF_UX_ENTITIES
 * alpha flag is on), so non-alpha users see nothing.
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const ENTITY_KEY = new PluginKey('entityHighlight');

const MAX_NAMES = 300;          // cap the alternation regex to stay cheap
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a single longest-match-first, word-boundary, case-insensitive regex
// plus a lowercase-name → id lookup.
function buildMatcher(entities) {
  const names = [];
  const lowerToId = new Map();
  for (const e of entities || []) {
    if (!e || !e.name || typeof e.name !== 'string') continue;
    const name = e.name.trim();
    if (name.length < 2) continue;        // skip 1-char names (too noisy)
    if (!lowerToId.has(name.toLowerCase())) {
      lowerToId.set(name.toLowerCase(), e.id);
      names.push(name);
    }
  }
  names.sort((a, b) => b.length - a.length);
  const capped = names.slice(0, MAX_NAMES);
  let regex = null;
  if (capped.length) {
    try {
      regex = new RegExp('(?:^|\\b)(' + capped.map(escapeRe).join('|') + ')(?=\\b|$)', 'gi');
    } catch (_) { regex = null; }
  }
  return { regex, lowerToId, count: capped.length };
}

function computeDecoSet(doc, matcher) {
  if (!matcher || !matcher.regex) return DecorationSet.empty;
  const { regex, lowerToId } = matcher;
  const decos = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return true;
    const text = node.text || '';
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(text)) !== null) {
      const matched = m[1];
      if (!matched) { regex.lastIndex = m.index + 1; continue; }
      const id = lowerToId.get(matched.toLowerCase());
      if (id == null) continue;
      const from = pos + m.index + (m[0].length - matched.length); // skip a leading boundary char if any
      const to = from + matched.length;
      decos.push(Decoration.inline(from, to, { class: 'mf-entity', 'data-entity-id': String(id) }));
    }
    return true;
  });
  return DecorationSet.create(doc, decos);
}

function emitEntity(type, detail = {}) {
  document.dispatchEvent(new CustomEvent('mf-entity', { detail: { type, ...detail } }));
}

function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { top: r.bottom, left: r.left, bottom: r.bottom, right: r.right, height: r.height };
}

const EntityHighlight = Extension.create({
  name: 'entityHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: ENTITY_KEY,

        state: {
          init() { return { matcher: null, decoSet: DecorationSet.empty }; },
          apply(tr, value, _oldState, newState) {
            let matcher = value.matcher;
            let recompute = false;
            const meta = tr.getMeta(ENTITY_KEY);
            if (meta && Array.isArray(meta.entities)) {
              matcher = buildMatcher(meta.entities);
              recompute = true;
            }
            if (tr.docChanged) recompute = true;

            let decoSet = value.decoSet;
            if (recompute) decoSet = computeDecoSet(newState.doc, matcher);
            return { matcher, decoSet };
          },
        },

        props: {
          decorations(state) {
            const ps = ENTITY_KEY.getState(state);
            return ps ? ps.decoSet : DecorationSet.empty;
          },

          handleDOMEvents: {
            mouseover(_view, event) {
              const el = event.target.closest && event.target.closest('.mf-entity');
              if (!el) return false;
              emitEntity('hover', { id: el.getAttribute('data-entity-id'), coords: rectOf(el) });
              return false;
            },
            mouseout(_view, event) {
              const el = event.target.closest && event.target.closest('.mf-entity');
              if (!el) return false;
              emitEntity('hoverEnd', {});
              return false;
            },
            click(_view, event) {
              const el = event.target.closest && event.target.closest('.mf-entity');
              if (!el) return false;
              emitEntity('click', { id: el.getAttribute('data-entity-id'), coords: rectOf(el) });
              return false; // let ProseMirror also place the caret
            },
          },
        },
      }),
    ];
  },
});

// Push the current entity list into the plugin (or clear it with []).
export function setEntities(editor, entities) {
  if (!editor || !editor.view) return;
  editor.view.dispatch(editor.state.tr.setMeta(ENTITY_KEY, { entities: entities || [] }));
}

export default EntityHighlight;
