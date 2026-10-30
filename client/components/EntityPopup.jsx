/**
 * EntityPopup — hover card + click detail panel for inline story entities.
 *
 * Subscribes to the 'mf-entity' DOM events emitted by EntityHighlight.js:
 *   - hover     → small card (name, type, truncated description)
 *   - hoverEnd  → dismiss the card (unless a detail panel is pinned open)
 *   - click     → pin a read-only detail panel (description + connections)
 *
 * V1 is READ-ONLY. Writing edits back to the knowledge graph needs a new
 * PATCH endpoint (see plan) and is deliberately out of scope here.
 *
 * Mount as a sibling of <EditorContent /> in TipTapEditor (like SlashCommandList).
 * `graph` = { nodes, edges } from GET /api/story/graph/:brewId.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Icon from './Icon.jsx';

// Mirror graphPanel's palette/icons (kept local to avoid refactoring the
// legacy createClass GraphPanel; ~15 lines, same source of truth values).
const NODE_COLOR = {
  npc: '#8b5cf6', location: '#10b981', item: '#f59e0b', event: '#ef4444',
  faction: '#3b82f6', spell: '#ec4899', monster: '#dc2626',
};
const NODE_ICON = {
  npc: '👤', location: '🏰', item: '⚔️', event: '⚡', faction: '🛡️', spell: '✨', monster: '🐉',
};
const colorOf = (t) => NODE_COLOR[t] || '#6b7280';
const iconOf = (t) => NODE_ICON[t] || '📄';

const PANEL = {
  position: 'fixed', zIndex: 10000, background: '#fffdf6',
  border: '1px solid #c0b283', borderRadius: 6,
  boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#1d1b16',
};

// Clamp a fixed-position box into the viewport.
function clamp(coords, width, height) {
  const vw = window.innerWidth, vh = window.innerHeight, pad = 8;
  let left = coords.left, top = coords.top + 4;
  if (left + width + pad > vw) left = Math.max(pad, vw - width - pad);
  if (top + height + pad > vh) top = Math.max(pad, (coords.bottom ?? coords.top) - height - 4);
  return { left: Math.max(pad, left), top: Math.max(pad, top) };
}

const EntityPopup = ({ editor, graph }) => {
  const [hover, setHover] = useState(null);  // { entity, coords }
  const [panel, setPanel] = useState(null);  // { entity, coords }
  const panelRef = useRef(null);
  const panelOpenRef = useRef(false);
  useEffect(() => { panelOpenRef.current = !!panel; }, [panel]);

  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const findEntity = useCallback((id) => nodes.find((n) => String(n.id) === String(id)) || null, [nodes]);

  useEffect(() => {
    function onEntity(e) {
      const { type, id, coords } = e.detail || {};
      if (type === 'hover') {
        if (panelOpenRef.current) return;          // don't fight an open panel
        const entity = findEntity(id);
        if (entity) setHover({ entity, coords });
      } else if (type === 'hoverEnd') {
        setHover(null);
      } else if (type === 'click') {
        const entity = findEntity(id);
        if (entity) { setHover(null); setPanel({ entity, coords }); }
      }
    }
    document.addEventListener('mf-entity', onEntity);
    return () => document.removeEventListener('mf-entity', onEntity);
  }, [findEntity]);

  // Dismiss the pinned panel on outside click / Escape.
  useEffect(() => {
    if (!panel) return;
    const onDown = (ev) => { if (panelRef.current && !panelRef.current.contains(ev.target)) setPanel(null); };
    const onKey = (ev) => { if (ev.key === 'Escape') setPanel(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [panel]);

  const connectionsFor = useCallback((entity) => {
    return edges
      .filter((g) => g.source === entity.id || g.target === entity.id)
      .map((g) => {
        const otherId = g.source === entity.id ? g.target : g.source;
        const other = nodes.find((n) => n.id === otherId);
        return other ? { rel: g.type, other } : null;
      })
      .filter(Boolean);
  }, [edges, nodes]);

  // ── Pinned detail panel (read-only) ──
  if (panel) {
    const { entity } = panel;
    const pos = clamp(panel.coords, 300, 280);
    const conns = connectionsFor(entity);
    return (
      <div ref={panelRef} style={{ ...PANEL, ...pos, width: 300, maxHeight: 360, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #e7dcc0' }}>
          <span style={{ fontSize: 18 }}>{iconOf(entity.type)}</span>
          <strong style={{ flex: 1, fontSize: 14 }}>{entity.name}</strong>
          <button type="button" onClick={() => setPanel(null)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8a6d3b', fontSize: 14 }}
            title="Close"><Icon icon="fas fa-times" /></button>
        </div>
        <div style={{ padding: '10px 12px' }}>
          <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#fff', background: colorOf(entity.type), textTransform: 'capitalize' }}>
            {entity.type}
          </span>
          {entity.description && (
            <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: '#3a3328' }}>{entity.description}</p>
          )}
          {conns.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#6b5a37', marginBottom: 6 }}>
                Connections ({conns.length})
              </div>
              {conns.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '3px 0', color: '#4a4030' }}>
                  <span style={{ color: '#9a8a6a' }}>{c.rel}</span>
                  <span style={{ marginLeft: 'auto' }}>{iconOf(c.other.type)} {c.other.name}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #efe6cf', fontSize: 10, color: '#9a8a6a' }}>
            Read-only · inline editing coming soon
          </div>
        </div>
      </div>
    );
  }

  // ── Hover card ──
  if (hover) {
    const { entity } = hover;
    const pos = clamp(hover.coords, 240, 110);
    const desc = entity.description ? (entity.description.length > 140 ? entity.description.slice(0, 140) + '…' : entity.description) : '';
    return (
      <div style={{ ...PANEL, ...pos, width: 240, padding: '8px 10px', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span>{iconOf(entity.type)}</span>
          <strong style={{ fontSize: 13 }}>{entity.name}</strong>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#fff', background: colorOf(entity.type), padding: '1px 7px', borderRadius: 9, textTransform: 'capitalize' }}>
            {entity.type}
          </span>
        </div>
        {desc && <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.4, color: '#4a4030' }}>{desc}</div>}
        <div style={{ marginTop: 5, fontSize: 10, color: '#9a8a6a' }}>Click to view details</div>
      </div>
    );
  }

  return null;
};

export default EntityPopup;
