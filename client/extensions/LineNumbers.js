import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const LINE_NUMBERS_KEY = new PluginKey('lineNumbers');

export default Extension.create({
  name: 'lineNumbers',

  addOptions() {
    return {
      enabled: true,
      width: 30,
      classNames: {
        gutters: 'CodeMirror-gutters',
        gutter: 'CodeMirror-gutter',
        linenumbers: 'CodeMirror-linenumbers',
        linenumber: 'CodeMirror-linenumber',
      },
    };
  },

  addCommands() {
    return {
      setLineNumbersEnabled:
        (enabled) => ({ tr, dispatch }) => {
          if (dispatch) {
            dispatch(tr.setMeta(LINE_NUMBERS_KEY, { type: 'toggle', enabled }));
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const opts = this.options;

    return [
      new Plugin({
        key: LINE_NUMBERS_KEY,
        state: {
          init() {
            return { enabled: !!opts.enabled };
          },
          apply(tr, value) {
            const meta = tr.getMeta(LINE_NUMBERS_KEY);
            if (meta && meta.type === 'toggle') {
              return { ...value, enabled: !!meta.enabled };
            }
            return value;
          },
        },
        view: (view) => {
          const pmRoot = view.dom; // .ProseMirror element
          const container = pmRoot.parentElement; // .tiptap-editor__content (position: relative)

          // Build gutter DOM
          const gutters = document.createElement('div');
          gutters.className = opts.classNames.gutters;
          gutters.style.width = `${opts.width}px`;

          const gutter = document.createElement('div');
          gutter.className = `${opts.classNames.gutter} ${opts.classNames.linenumbers}`;
          gutters.appendChild(gutter);

          // Append to container
          if (container) container.appendChild(gutters);

          let ro = null;
          let mo = null;
          let scrollTarget = container;
          let rafId = null;

          const recompute = () => {
            const pluginState = LINE_NUMBERS_KEY.getState(view.state);
            if (!pluginState?.enabled) {
              gutters.style.display = 'none';
              return;
            }
            gutters.style.display = '';

            if (!scrollTarget) return;
            const viewTop = scrollTarget.scrollTop;
            const viewBottom = viewTop + scrollTarget.clientHeight;
            const style = window.getComputedStyle(pmRoot);
            const paddingTop = parseFloat(style.paddingTop || '0');

            const blocks = Array.from(pmRoot.children || []);

            // Build HTML for visible lines only
            let html = '';
            for (let i = 0; i < blocks.length; i++) {
              const block = blocks[i];
              if (!(block instanceof HTMLElement)) continue;
              const rect = block.getBoundingClientRect();
              const contRect = scrollTarget.getBoundingClientRect();
              const blockTop = rect.top - contRect.top + viewTop;
              const blockHeight = block.offsetHeight;

              if (blockTop + blockHeight < viewTop - 100) continue;
              if (blockTop > viewBottom + 100) break; // blocks are in order

              const top = blockTop - viewTop + paddingTop;
              html += `<div class="${opts.classNames.linenumber}" style="top:${Math.round(top)}px">${i + 1}</div>`;
            }

            gutter.innerHTML = html;
          };

          const onScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
              rafId = null;
              recompute();
            });
          };

          // Observers and listeners
          if ('ResizeObserver' in window) {
            ro = new ResizeObserver(() => recompute());
            ro.observe(pmRoot);
          }
          mo = new MutationObserver(() => recompute());
          mo.observe(pmRoot, { childList: true, subtree: true, characterData: true });
          if (scrollTarget) scrollTarget.addEventListener('scroll', onScroll, { passive: true });
          window.addEventListener('resize', onScroll);

          // Initial draw
          setTimeout(recompute, 0);

          return {
            update() {
              recompute();
            },
            destroy() {
              if (rafId) cancelAnimationFrame(rafId);
              if (ro) ro.disconnect();
              if (mo) mo.disconnect();
              window.removeEventListener('resize', onScroll);
              if (scrollTarget) scrollTarget.removeEventListener('scroll', onScroll);
              gutters.remove();
            },
          };
        },
      }),
    ];
  },
});
