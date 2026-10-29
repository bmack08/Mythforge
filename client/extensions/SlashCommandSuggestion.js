/**
 * SlashCommandSuggestion — TipTap extension for "/" generator commands.
 *
 * Watches for `/` followed by 0+ word chars and opens a popup listing the
 * in-editor generators (/shop, /npc, /item, /encounter, /quest, /location).
 * On Enter/click the React popup (SlashCommandList) takes over: it shows a
 * quick options form, calls POST /api/generate/:type, and inserts the returned
 * Homebrewery markdown at the cursor.
 *
 * Mirrors IconSuggestion.js (raw ProseMirror plugin + DOM-event bus, no
 * @tiptap/suggestion dependency).
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { searchCommands } from '../data/generatorCommands.js';

const PLUGIN_KEY = new PluginKey('slashCommandSuggestion');
const INDEX_META = 'slashCommand-index';
const EVENT = 'slash-command';

const EMPTY = { active: false, query: '', from: 0, to: 0, items: [], selectedIndex: 0 };

// Walk back from the cursor for a `/` at block-start or after whitespace.
// Returns { from, to, query } or null. Query must be word-ish (no spaces).
function resolveQuery(state) {
  const { $from } = state.selection;
  if (!$from.parent.isTextblock) return null;

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '￼');

  for (let i = textBefore.length - 1; i >= 0; i--) {
    const ch = textBefore[i];
    if (ch !== '/') continue;

    const query = textBefore.slice(i + 1);
    // Stop at whitespace (the user finished / moved on) or a second slash.
    if (/[\s/]/.test(query)) return null;
    // The `/` must start the block or follow whitespace (avoid http://, and/or).
    if (i > 0 && !/\s/.test(textBefore[i - 1])) return null;

    const from = $from.start() + i;
    const to = $from.pos;
    return { from, to, query };
  }
  return null;
}

function emit(type, detail = {}) {
  document.dispatchEvent(new CustomEvent(EVENT, { detail: { type, ...detail } }));
}

const SlashCommandSuggestion = Extension.create({
  name: 'slashCommandSuggestion',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PLUGIN_KEY,

        state: {
          init() { return { ...EMPTY }; },
          apply(tr, prev, _oldState, newState) {
            if (tr.getMeta(PLUGIN_KEY) === 'close') return { ...EMPTY };

            const metaIndex = tr.getMeta(INDEX_META);
            if (!tr.docChanged && !tr.selectionSet) {
              return typeof metaIndex === 'number' ? { ...prev, selectedIndex: metaIndex } : prev;
            }

            const match = resolveQuery(newState);
            if (!match) return { ...EMPTY };

            const items = searchCommands(match.query);
            if (items.length === 0) {
              return { active: false, query: match.query, from: match.from, to: match.to, items: [], selectedIndex: 0 };
            }

            let selectedIndex = 0;
            if (prev.active && prev.query === match.query && typeof metaIndex !== 'number') {
              selectedIndex = prev.selectedIndex;
            } else if (typeof metaIndex === 'number') {
              selectedIndex = metaIndex;
            }

            return {
              active: true,
              query: match.query,
              from: match.from,
              to: match.to,
              items,
              selectedIndex: Math.min(selectedIndex, items.length - 1),
            };
          },
        },

        props: {
          decorations(state) {
            const ps = PLUGIN_KEY.getState(state);
            if (!ps || !ps.active) return DecorationSet.empty;
            return DecorationSet.create(state.doc, [
              Decoration.inline(ps.from, ps.to, { class: 'slash-command-query' }),
            ]);
          },

          handleKeyDown(view, event) {
            const ps = PLUGIN_KEY.getState(view.state);
            if (!ps || !ps.active) return false;
            const { items, selectedIndex } = ps;

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              const next = (selectedIndex + 1) % items.length;
              view.dispatch(view.state.tr.setMeta(INDEX_META, next));
              emit('update', { ...ps, selectedIndex: next });
              return true;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              const next = (selectedIndex - 1 + items.length) % items.length;
              view.dispatch(view.state.tr.setMeta(INDEX_META, next));
              emit('update', { ...ps, selectedIndex: next });
              return true;
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
              event.preventDefault();
              const command = items[selectedIndex];
              if (command) {
                // Hand off to the React popup's form; keep the "/query" text in
                // the doc (the popup deletes [from,to] when it inserts).
                view.dispatch(view.state.tr.setMeta(PLUGIN_KEY, 'close'));
                emit('select', { command, from: ps.from, to: ps.to });
              }
              return true;
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              view.dispatch(view.state.tr.setMeta(PLUGIN_KEY, 'close'));
              emit('close');
              return true;
            }
            return false;
          },
        },

        view() {
          return {
            update(view) {
              const ps = PLUGIN_KEY.getState(view.state);
              if (!ps) return;
              if (ps.active) {
                const coords = view.coordsAtPos(ps.to);
                emit('update', { ...ps, coords: { top: coords.bottom, left: coords.left } });
              } else {
                emit('close');
              }
            },
            destroy() { emit('close'); },
          };
        },
      }),
    ];
  },
});

export { PLUGIN_KEY };
export default SlashCommandSuggestion;
