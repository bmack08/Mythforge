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

          console.log('[LineNumbers] Initializing...');
          console.log('[LineNumbers] ProseMirror root:', pmRoot);
          console.log('[LineNumbers] Container:', container);
          console.log('[LineNumbers] Container position:', container ? window.getComputedStyle(container).position : 'none');

          // Build gutter DOM
          const gutters = document.createElement('div');
          gutters.className = opts.classNames.gutters;
          gutters.style.width = `${opts.width}px`;

          const gutter = document.createElement('div');
          gutter.className = `${opts.classNames.gutter} ${opts.classNames.linenumbers}`;
          gutters.appendChild(gutter);

          // Append to container
          if (container) {
            container.appendChild(gutters);
            console.log('[LineNumbers] Gutter appended to container');
          } else {
            console.warn('[LineNumbers] No container found - gutter not attached!');
          }

          let ro = null;
          let mo = null;
          let scrollTarget = container;
          let rafId = null;

          const recompute = () => {
            const pluginState = LINE_NUMBERS_KEY.getState(view.state);
            if (!pluginState?.enabled) {
              gutters.style.display = 'none';
              console.log('[LineNumbers] Disabled - hiding gutter');
              return;
            }
            gutters.style.display = '';

            if (!scrollTarget) {
              console.warn('[LineNumbers] No scroll target');
              return;
            }
            const viewTop = scrollTarget.scrollTop || 0;
            const viewBottom = viewTop + (scrollTarget.clientHeight || 1000);
            const style = window.getComputedStyle(pmRoot);
            const paddingTop = parseFloat(style.paddingTop || '0');

            const blocks = Array.from(pmRoot.children || []);
            console.log(`[LineNumbers] Recomputing ${blocks.length} blocks (viewTop: ${viewTop}, viewBottom: ${viewBottom})`);

            // Build HTML for all lines (simplified - no viewport culling for now)
            let html = '';
            let visibleCount = 0;
            for (let i = 0; i < blocks.length; i++) {
              const block = blocks[i];
              if (!(block instanceof HTMLElement)) continue;

              // Calculate position relative to the container
              const blockTop = block.offsetTop;
              const top = blockTop + paddingTop;

              html += `<div class="${opts.classNames.linenumber}" style="top:${Math.round(top)}px">${i + 1}</div>`;
              visibleCount++;
            }

            gutter.innerHTML = html;
            console.log(`[LineNumbers] Generated ${visibleCount} line numbers from ${blocks.length} blocks`);
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
