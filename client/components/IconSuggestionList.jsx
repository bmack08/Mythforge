/**
 * IconSuggestionList — Floating dropdown for inline icon autocomplete
 *
 * Subscribes to the `icon-suggestion` custom events dispatched by the
 * IconSuggestion ProseMirror plugin and renders a positioned dropdown
 * with matching icon results.
 *
 * Mount this component once, as a sibling of <EditorContent />, inside
 * the TipTapEditor. It manages its own visibility via the event bus.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { selectIcon } from '../extensions/IconSuggestion.js';
import { ICON_SETS } from '../data/iconRegistry.js';
import './IconSuggestionList.less';

// Map set key -> short badge label
const SET_BADGES = {
  elderberry:  'ei',
  game:        'gi',
  fontawesome: 'fa',
  dice:        'df',
};

const IconSuggestionList = ({ editor }) => {
  const [visible, setVisible] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [range, setRange] = useState({ from: 0, to: 0 });

  const listRef = useRef(null);

  // Keep a ref to the latest state for the click handler
  const stateRef = useRef({ items, selectedIndex, range });
  useEffect(() => {
    stateRef.current = { items, selectedIndex, range };
  }, [items, selectedIndex, range]);

  // Subscribe to icon-suggestion events from the ProseMirror plugin
  useEffect(() => {
    function handleEvent(e) {
      const { type, ...detail } = e.detail;

      if (type === 'update') {
        setVisible(true);
        setItems(detail.items || []);
        setSelectedIndex(typeof detail.selectedIndex === 'number' ? detail.selectedIndex : 0);
        if (detail.coords) setCoords(detail.coords);
        if (typeof detail.from === 'number') setRange({ from: detail.from, to: detail.to });
      }

      if (type === 'close') {
        setVisible(false);
        setItems([]);
        setSelectedIndex(0);
      }
    }

    document.addEventListener('icon-suggestion', handleEvent);
    return () => document.removeEventListener('icon-suggestion', handleEvent);
  }, []);

  // Scroll the selected item into view within the dropdown
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('.icon-suggestion__item--selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Click handler for individual items
  const handleSelect = useCallback(
    (icon, index) => {
      if (!editor) return;
      selectIcon(editor, range.from, range.to, icon);
    },
    [editor, range]
  );

  if (!visible || items.length === 0) return null;

  return (
    <div
      className="icon-suggestion"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      ref={listRef}
    >
      {items.map((icon, index) => (
        <div
          key={icon.id}
          className={`icon-suggestion__item${index === selectedIndex ? ' icon-suggestion__item--selected' : ''}`}
          onMouseDown={(e) => {
            // Use mousedown (not click) to fire before the editor blur
            e.preventDefault();
            handleSelect(icon, index);
          }}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          {/* Icon preview */}
          <span className="icon-suggestion__preview">
            <i className={icon.cssClass} />
          </span>

          {/* Name */}
          <span className="icon-suggestion__name">{icon.name}</span>

          {/* Set badge */}
          <span className={`icon-suggestion__badge icon-suggestion__badge--${icon.set}`}>
            {SET_BADGES[icon.set] || icon.set}
          </span>
        </div>
      ))}
    </div>
  );
};

export default IconSuggestionList;
