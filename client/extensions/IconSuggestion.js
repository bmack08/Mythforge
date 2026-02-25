/**
 * IconSuggestion — TipTap extension providing inline icon autocomplete
 *
 * Watches for `:` followed by 1+ characters typed by the user and opens
 * a suggestion popup powered by the icon registry.
 *
 * Implementation uses a raw ProseMirror plugin (no @tiptap/suggestion
 * dependency) so we avoid adding extra packages.
 *
 * The popup lifecycle is managed through a "decorationManager" object
 * that the TipTapEditor mounts via a React portal. This extension
 * emits events on window so the React component can subscribe.
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { searchIcons } from '../data/iconRegistry.js';

// ── Constants ──────────────────────────────────────────────────────
const PLUGIN_KEY = new PluginKey('iconSuggestion');
const INDEX_META = 'iconSuggestion-index';
const MIN_QUERY_LENGTH = 1;
const MAX_RESULTS = 10;

// Characters that signal the user is NOT trying to type an icon colon
// (e.g. `:)` smiley, `::` in markdown, etc.)
const CANCEL_CHARS = /[)\s]/;

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Walk backwards from `pos` (exclusive) looking for an unmatched `:`
 * that starts the query. Returns `{ from, query }` or null.
 *
 * Rules:
 *  - The `:` must be at position 0 of the text block or preceded by
 *    whitespace / start-of-node so we don't trigger on `http:`.
 *  - If we encounter a second `:` (closing colon) that means the user
 *    already typed a full `:name:` pattern — let the InputRule handle
 *    it instead (return null).
 *  - Query must be >= MIN_QUERY_LENGTH characters.
 */
function resolveQuery(state) {
  const { $from } = state.selection;
  // Only works inside a textblock (paragraph, heading, etc.)
  if (!$from.parent.isTextblock) return null;

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, null, '\ufffc');

  // Scan backwards for the trigger `:` character
  for (let i = textBefore.length - 1; i >= 0; i--) {
    const ch = textBefore[i];

    // Skip non-colon characters (these become part of the query)
    if (ch !== ':') continue;

    // Found a `:`. Everything after it is the candidate query.
    const query = textBefore.slice(i + 1);

    // Need at least MIN_QUERY_LENGTH characters after the `:`
    if (query.length < MIN_QUERY_LENGTH) return null;

    // If the query contains whitespace or cancel chars, the user
    // isn't typing an icon reference
    if (CANCEL_CHARS.test(query)) return null;

    // If there's another `:` inside the query text, the user has
    // typed a full `:name:` pattern — let IconMark's InputRules
    // handle it instead
    if (query.includes(':')) return null;

    // The `:` must be at position 0 of the block or preceded by
    // whitespace so we don't trigger on `http:`, `width:`, etc.
    if (i > 0 && !/\s/.test(textBefore[i - 1])) return null;

    // Compute absolute document positions
    const from = $from.start() + i;
    const to = $from.pos;
    return { from, to, query };
  }

  return null;
}

// ── Custom Event Bus ───────────────────────────────────────────────
// We use simple custom DOM events on `document` so the React popup
// component can subscribe without any coupling to ProseMirror.

function emitSuggestion(type, detail = {}) {
  document.dispatchEvent(
    new CustomEvent('icon-suggestion', { detail: { type, ...detail } })
  );
}

// ── Extension ──────────────────────────────────────────────────────

const IconSuggestion = Extension.create({
  name: 'iconSuggestion',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: PLUGIN_KEY,

        state: {
          init() {
            return { active: false, query: '', from: 0, to: 0, items: [], selectedIndex: 0 };
          },
          apply(tr, prev, _oldState, newState) {
            // If the transaction came from the suggestion command itself, close
            if (tr.getMeta(PLUGIN_KEY) === 'close') {
              return { active: false, query: '', from: 0, to: 0, items: [], selectedIndex: 0 };
            }

            // Preserve selected index if set via meta
            const metaIndex = tr.getMeta(INDEX_META);

            // Only re-evaluate on document or selection changes
            if (!tr.docChanged && !tr.selectionSet) {
              if (typeof metaIndex === 'number') {
                return { ...prev, selectedIndex: metaIndex };
              }
              return prev;
            }

            const match = resolveQuery(newState);
            if (!match) {
              return { active: false, query: '', from: 0, to: 0, items: [], selectedIndex: 0 };
            }

            const items = searchIcons(match.query, { limit: MAX_RESULTS });
            if (items.length === 0) {
              return { active: false, query: match.query, from: match.from, to: match.to, items: [], selectedIndex: 0 };
            }

            // Preserve selection index if query hasn't changed
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
          // Decorate the query range so we can style it
          decorations(state) {
            const pluginState = PLUGIN_KEY.getState(state);
            if (!pluginState || !pluginState.active) return DecorationSet.empty;

            return DecorationSet.create(state.doc, [
              Decoration.inline(pluginState.from, pluginState.to, {
                class: 'icon-suggestion-query',
              }),
            ]);
          },

          handleKeyDown(view, event) {
            const pluginState = PLUGIN_KEY.getState(view.state);
            if (!pluginState || !pluginState.active) return false;

            const { items, selectedIndex } = pluginState;

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              const next = (selectedIndex + 1) % items.length;
              view.dispatch(view.state.tr.setMeta(INDEX_META, next));
              emitSuggestion('update', { ...pluginState, selectedIndex: next });
              return true;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              const next = (selectedIndex - 1 + items.length) % items.length;
              view.dispatch(view.state.tr.setMeta(INDEX_META, next));
              emitSuggestion('update', { ...pluginState, selectedIndex: next });
              return true;
            }

            if (event.key === 'Enter' || event.key === 'Tab') {
              event.preventDefault();
              const icon = items[selectedIndex];
              if (icon) {
                selectIcon(editor, pluginState.from, pluginState.to, icon);
              }
              return true;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              view.dispatch(view.state.tr.setMeta(PLUGIN_KEY, 'close'));
              emitSuggestion('close');
              return true;
            }

            return false;
          },
        },

        view() {
          return {
            update(view) {
              const pluginState = PLUGIN_KEY.getState(view.state);
              if (!pluginState) return;

              if (pluginState.active) {
                // Compute cursor coordinates for popup positioning
                const coords = view.coordsAtPos(pluginState.to);
                emitSuggestion('update', {
                  ...pluginState,
                  coords: {
                    top: coords.bottom,
                    left: coords.left,
                  },
                });
              } else {
                emitSuggestion('close');
              }
            },
            destroy() {
              emitSuggestion('close');
            },
          };
        },
      }),
    ];
  },
});

// ── Command: insert the selected icon ──────────────────────────────

function selectIcon(editor, from, to, icon) {
  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.setMeta(PLUGIN_KEY, 'close');
      return true;
    })
    .deleteRange({ from, to })
    .insertContent({
      type: 'iconMark',
      attrs: { name: icon.id },
    })
    .run();

  emitSuggestion('close');
}

// Export the selectIcon helper so the React popup can call it
export { selectIcon, PLUGIN_KEY };
export default IconSuggestion;
