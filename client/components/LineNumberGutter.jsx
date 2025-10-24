import React, { useEffect, useRef, useState } from 'react';

// CodeMirror-style line number gutter for TipTap
// Counts block-level nodes (paragraphs, headings, etc.) as "lines" to match HB behavior
export default function LineNumberGutter({ contentEl, editorRoot, enabled=true }){
  const [lines, setLines] = useState([]);
  const resizeObsRef = useRef(null);
  const mutationObsRef = useRef(null);

  const recompute = ()=>{
    if(!enabled || !editorRoot) {
      setLines([]);
      return;
    }

    const rootStyle = window.getComputedStyle(editorRoot);
    const paddingTop = parseFloat(rootStyle.paddingTop || '0');

    // Get all direct block children (TipTap renders each top-level node as a child)
    const blocks = Array.from(editorRoot.children || []);
    const next = [];

    console.log('[LineNumberGutter] Recomputing', blocks.length, 'blocks');

    blocks.forEach((block, index) => {
      if(!(block instanceof HTMLElement)) return;

      // Use offsetTop for positioning - this gives us the top of the block relative to the parent
      const blockTop = block.offsetTop;

      // Position the line number at the top of the block (no additional offset needed)
      const top = blockTop;

      next.push({
        num: index + 1,
        top: top
      });
    });

    console.log('[LineNumberGutter] Generated', next.length, 'line numbers');
    setLines(next);
  };

  useEffect(()=>{
    if(!contentEl) {
      console.log('[LineNumberGutter] No contentEl for scroll listener');
      return;
    }

    console.log('[LineNumberGutter] Setting up scroll listener on contentEl:', contentEl);

    let rafId = null;
    const onScroll = ()=> {
      if(rafId) return;
      rafId = requestAnimationFrame(()=>{
        console.log('[LineNumberGutter] Scroll event - recomputing');
        recompute();
        rafId = null;
      });
    };

    contentEl.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return ()=>{
      if(rafId) cancelAnimationFrame(rafId);
      contentEl.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [contentEl, enabled, editorRoot]);

  useEffect(()=>{
    if(!editorRoot) {
      console.log('[LineNumberGutter] No editorRoot yet');
      return;
    }

    console.log('[LineNumberGutter] Setting up observers for editorRoot:', editorRoot);

    const ro = new ResizeObserver(()=> recompute());
    ro.observe(editorRoot);
    resizeObsRef.current = ro;

    const mo = new MutationObserver(()=> recompute());
    mo.observe(editorRoot, { childList: true, subtree: true, characterData: true });
    mutationObsRef.current = mo;

    // Initial compute
    setTimeout(() => recompute(), 100); // Small delay to ensure DOM is ready

    return ()=>{
      ro.disconnect();
      mo.disconnect();
    };
  }, [editorRoot, enabled, contentEl]);

  if(!enabled) return null;

  console.log('[LineNumberGutter] Rendering with', lines.length, 'lines');

  return (
    <div className="CodeMirror-gutters">
      <div className="CodeMirror-gutter CodeMirror-linenumbers">
        {lines.map((line, idx)=> (
          <div key={idx} className="CodeMirror-linenumber" style={{ top: `${line.top}px` }}>
            {line.num}
          </div>
        ))}
      </div>
    </div>
  );
}