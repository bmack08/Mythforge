/**
 * SlashCommandList — popup for the "/" generator commands.
 *
 * Two phases:
 *   1. menu — lists generators (driven by SlashCommandSuggestion 'update' events).
 *   2. form — on select, shows that generator's quick options form; on submit
 *      POSTs /api/generate/:type, then inserts the returned Homebrewery markdown
 *      at the cursor (deleting the "/query" text first).
 *
 * Mount once as a sibling of <EditorContent /> in TipTapEditor, with the editor
 * instance as a prop (mirrors IconSuggestionList).
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { markdownToTiptap } from 'shared/helpers/markdownToTiptap.js';
import { GENERATOR_FORMS } from '../data/generatorCommands.js';

const PANEL_STYLE = {
  position: 'fixed', zIndex: 9999, background: '#fffdf6',
  border: '1px solid #c0b283', borderRadius: 6,
  boxShadow: '0 6px 24px rgba(0,0,0,0.25)', minWidth: 260, maxWidth: 340,
  fontFamily: 'sans-serif', fontSize: 13, color: '#1d1b16', overflow: 'hidden',
};
const ITEM_BASE = { display: 'flex', gap: 8, alignItems: 'center', padding: '7px 10px', cursor: 'pointer' };
const LABEL = { display: 'block', fontWeight: 600, fontSize: 11, margin: '8px 0 3px', color: '#5a4a2f' };
const INPUT = { width: '100%', boxSizing: 'border-box', padding: '5px 7px', border: '1px solid #c0b283', borderRadius: 4, fontSize: 13, background: '#fff' };

function defaultsFor(genType) {
  const fields = GENERATOR_FORMS[genType] || [];
  const out = {};
  for (const f of fields) out[f.name] = f.default;
  return out;
}

// Build the request body from form values: coerce numbers/bools, drop empties.
function buildParams(genType, values) {
  const fields = GENERATOR_FORMS[genType] || [];
  const body = {};
  for (const f of fields) {
    let v = values[f.name];
    if (f.type === 'number') v = (v === '' || v === null || v === undefined) ? undefined : Number(v);
    if (f.asBool) v = (v === 'Yes' || v === true);
    if (f.optional && (v === '' || v === undefined || v === null)) continue;
    if (v === undefined) continue;
    body[f.name] = v;
  }
  return body;
}

const SlashCommandList = ({ editor, srdSafe = false }) => {
  const [mode, setMode] = useState('hidden'); // hidden | menu | form
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [range, setRange] = useState({ from: 0, to: 0 });
  const [activeCmd, setActiveCmd] = useState(null);
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    function onEvent(e) {
      const { type, ...d } = e.detail;
      if (type === 'update') {
        // Don't let the menu stomp an open form.
        if (modeRef.current === 'form') return;
        setMode('menu');
        setItems(d.items || []);
        setSelectedIndex(typeof d.selectedIndex === 'number' ? d.selectedIndex : 0);
        if (d.coords) setCoords(d.coords);
        if (typeof d.from === 'number') setRange({ from: d.from, to: d.to });
      } else if (type === 'select') {
        // Keyboard Enter picked a command → open its form.
        if (d.command) openForm(d.command, { from: d.from, to: d.to });
      } else if (type === 'close') {
        if (modeRef.current !== 'form') setMode('hidden');
      }
    }
    document.addEventListener('slash-command', onEvent);
    return () => document.removeEventListener('slash-command', onEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = useCallback((cmd, rng) => {
    setActiveCmd(cmd);
    setValues(defaultsFor(cmd.genType));
    setError('');
    if (rng && typeof rng.from === 'number') setRange(rng);
    setMode('form');
  }, []);

  const cancel = useCallback(() => {
    setMode('hidden'); setActiveCmd(null); setError(''); setBusy(false);
  }, []);

  const submit = useCallback(async () => {
    if (!activeCmd || !editor) return;
    setBusy(true); setError('');
    try {
      const params = buildParams(activeCmd.genType, values);
      // In commercial-safe brews, ask the server to scrub Product Identity terms.
      const res = await fetch(`/api/generate/${activeCmd.genType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, srdSafe }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.markdown) {
        throw new Error(data.error || `Generation failed (HTTP ${res.status})`);
      }
      const doc = markdownToTiptap(data.markdown);
      const content = (doc && doc.content) ? doc.content : doc;
      editor.chain().focus().deleteRange(range).insertContent(content).run();
      cancel();
    } catch (err) {
      setError(err.message || 'Generation failed.');
      setBusy(false);
    }
  }, [activeCmd, values, editor, range, cancel, srdSafe]);

  if (mode === 'hidden') return null;

  // ── Menu ──
  if (mode === 'menu') {
    if (!items.length) return null;
    return (
      <div style={{ ...PANEL_STYLE, top: coords.top, left: coords.left }}>
        {items.map((cmd, i) => (
          <div
            key={cmd.key}
            style={{ ...ITEM_BASE, background: i === selectedIndex ? '#efe6cf' : 'transparent' }}
            onMouseDown={(e) => { e.preventDefault(); openForm(cmd, range); }}
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <i className={cmd.icon} style={{ width: 16, textAlign: 'center', color: '#8a6d3b' }} />
            <span style={{ fontWeight: 600 }}>/{cmd.key}</span>
            <span style={{ color: '#7a6a4a', fontSize: 11, marginLeft: 'auto' }}>{cmd.label}</span>
          </div>
        ))}
        <div style={{ padding: '5px 10px', fontSize: 10, color: '#9a8a6a', borderTop: '1px solid #e7dcc0' }}>
          ↑↓ to navigate · Enter to choose · Esc to dismiss
        </div>
      </div>
    );
  }

  // ── Form ──
  // NOTE: do NOT preventDefault mousedown on this container — it would block the
  // native <select> dropdowns and <input> focus. The form stays open via `mode`
  // state regardless of editor focus (the 'close' event is ignored in form mode),
  // so suppressing editor blur here isn't needed.
  const fields = GENERATOR_FORMS[activeCmd.genType] || [];
  return (
    <div
      style={{ ...PANEL_STYLE, top: coords.top, left: coords.left, padding: '4px 12px 12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 4px', borderBottom: '1px solid #e7dcc0' }}>
        <i className={activeCmd.icon} style={{ color: '#8a6d3b' }} />
        <strong>Generate {activeCmd.label}</strong>
      </div>

      {fields.map((f) => (
        <label key={f.name} style={{ display: 'block' }}>
          <span style={LABEL}>{f.label}{f.optional ? ' (optional)' : ''}</span>
          {f.type === 'select' ? (
            <select
              style={INPUT}
              value={values[f.name] ?? ''}
              onChange={(e) => setValues(v => ({ ...v, [f.name]: e.target.value }))}
            >
              {f.options.map(opt => <option key={opt} value={opt}>{opt === '' ? '— none —' : opt}</option>)}
            </select>
          ) : (
            <input
              style={INPUT}
              type={f.type === 'number' ? 'number' : 'text'}
              min={f.min} max={f.max}
              placeholder={f.placeholder || ''}
              value={values[f.name] ?? ''}
              onChange={(e) => setValues(v => ({ ...v, [f.name]: e.target.value }))}
            />
          )}
        </label>
      ))}

      {error && <div style={{ color: '#a33', fontSize: 11, marginTop: 8 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 4, background: busy ? '#b9a87f' : '#8a6d3b', color: '#fff', fontWeight: 600, cursor: busy ? 'wait' : 'pointer' }}
        >
          {busy ? 'Generating…' : 'Generate'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={cancel}
          style={{ padding: '7px 12px', border: '1px solid #c0b283', borderRadius: 4, background: '#fff', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SlashCommandList;
