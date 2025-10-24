import React, { useEffect, useRef, useState } from 'react';

// CodeMirror-style line number gutter for TipTap
// Counts block-level nodes (paragraphs, headings, etc.) as "lines" to match HB behavior
export default function LineNumberGutter({ contentEl, editorRoot, enabled=true }){
  const [lines, setLines] = useState([]);
  const resizeObsRef = useRef(null);
  const mutationObsRef = useRef(null);

  const recompute = ()=>{
    if(!enabled || !contentEl || !editorRoot) { 
      setLines([]); 
      return; 
    }

    const viewTop = contentEl.scrollTop;
    const viewBottom = viewTop + contentEl.clientHeight;
    const rootStyle = window.getComputedStyle(editorRoot);
    const paddingTop = parseFloat(rootStyle.paddingTop || '0');

    // Get all direct block children (TipTap renders each top-level node as a child)
    const blocks = Array.from(editorRoot.children || []);
    const next = [];
    
    blocks.forEach((block, index) => {
      if(!(block instanceof HTMLElement)) return;
      
      const rect = block.getBoundingClientRect();
      const containerRect = contentEl.getBoundingClientRect();
      
      // Calculate position relative to the scrollable container
      const blockTop = rect.top - containerRect.top + viewTop;
      const blockHeight = block.offsetHeight;
      
      // Only render visible line numbers (with buffer for smooth scrolling)
      if(blockTop + blockHeight < viewTop - 100) return;
      if(blockTop > viewBottom + 100) return;
      
      next.push({
        num: index + 1,
        top: blockTop - viewTop + paddingTop
      });
    });

    setLines(next);
  };

  useEffect(()=>{
    if(!contentEl) return;
    
    let rafId = null;
    const onScroll = ()=> {
      if(rafId) return;
      rafId = requestAnimationFrame(()=>{
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
  }, [contentEl, enabled]);

  useEffect(()=>{
    if(!editorRoot) return;
    
    const ro = new ResizeObserver(()=> recompute());
    ro.observe(editorRoot);
    resizeObsRef.current = ro;
    
    const mo = new MutationObserver(()=> recompute());
    mo.observe(editorRoot, { childList: true, subtree: true, characterData: true });
    mutationObsRef.current = mo;
    
    recompute();
    
    return ()=>{
      ro.disconnect();
      mo.disconnect();
    };
  }, [editorRoot, enabled]);

  if(!enabled) return null;

  return (
    <div className="CodeMirror-gutters">
      <div className="CodeMirror-gutter CodeMirror-linenumbers">
        {lines.map((line, idx)=> (
          <div key={idx} className="CodeMirror-linenumber" style={{ top: line.top }}>
            {line.num}
          </div>
        ))}
      </div>
    </div>
  );
}