import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { searchIcons, ICON_SETS, getCategories } from '../data/iconRegistry';
import './IconPicker.less';

const BATCH_SIZE = 100;

const SET_TABS = [
  { key: null, label: 'All' },
  ...Object.entries(ICON_SETS).map(([key, meta]) => ({ key, label: meta.label })),
];

/**
 * IconPicker — A floating panel for browsing and inserting icons into the TipTap editor.
 *
 * Props:
 *   editor    — TipTap editor instance
 *   onClose   — callback to close the picker
 *   anchorRef — ref to the toolbar button (used for positioning)
 */
export default function IconPicker({ editor, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const panelRef = useRef(null);
  const searchRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside the panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Don't close if clicking on the toolbar trigger button wrapper
        if (e.target.closest('.tiptap-toolbar__icon-picker-wrap')) {
          return;
        }
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Categories for the current set
  const categories = useMemo(() => {
    return getCategories(selectedSet || undefined);
  }, [selectedSet]);

  // Reset category when switching sets
  useEffect(() => {
    setSelectedCategory('');
    setVisibleCount(BATCH_SIZE);
  }, [selectedSet]);

  // Reset visible count when search/category changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [query, selectedCategory]);

  // Search results — get a large batch, then paginate on the client
  const allResults = useMemo(() => {
    return searchIcons(query, {
      set: selectedSet || undefined,
      category: selectedCategory || undefined,
      limit: 3000,
    });
  }, [query, selectedSet, selectedCategory]);

  const visibleResults = useMemo(() => {
    return allResults.slice(0, visibleCount);
  }, [allResults, visibleCount]);

  const hasMore = visibleCount < allResults.length;

  // ---- Handlers ----

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value);
    setSelectedIcon(null);
  }, []);

  const handleSetTab = useCallback((setKey) => {
    setSelectedSet(setKey);
    setSelectedIcon(null);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
    setSelectedIcon(null);
  }, []);

  const handleSelectIcon = useCallback((icon) => {
    setSelectedIcon(icon);
  }, []);

  const handleInsert = useCallback(() => {
    if (!selectedIcon || !editor) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: 'iconMark', attrs: { name: selectedIcon.id } })
      .run();
    onClose();
  }, [selectedIcon, editor, onClose]);

  const handleDoubleClick = useCallback(
    (icon) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent({ type: 'iconMark', attrs: { name: icon.id } })
        .run();
      onClose();
    },
    [editor, onClose]
  );

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  }, []);

  return (
    <div className="icon-picker" ref={panelRef}>
      {/* ── Header: Search + Close ── */}
      <div className="icon-picker__header">
        <div className="icon-picker__search-wrap">
          <i className="fas fa-search icon-picker__search-icon" />
          <input
            ref={searchRef}
            className="icon-picker__search"
            type="text"
            placeholder="Search icons..."
            value={query}
            onChange={handleSearch}
          />
        </div>
        <button
          className="icon-picker__close"
          onClick={onClose}
          title="Close (Esc)"
          type="button"
        >
          <i className="fas fa-times" />
        </button>
      </div>

      {/* ── Set Tabs ── */}
      <div className="icon-picker__tabs">
        {SET_TABS.map((tab) => (
          <button
            key={tab.key || 'all'}
            className={`icon-picker__tab${
              selectedSet === tab.key ? ' is-active' : ''
            }`}
            onClick={() => handleSetTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Category Dropdown ── */}
      <div className="icon-picker__category-bar">
        <label className="icon-picker__category-label" htmlFor="icon-picker-category">
          Category:
        </label>
        <select
          id="icon-picker-category"
          className="icon-picker__category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* ── Icon Grid ── */}
      <div className="icon-picker__grid-area">
        {visibleResults.length === 0 ? (
          <div className="icon-picker__empty">
            No icons found{query ? ` for "${query}"` : ''}.
          </div>
        ) : (
          <>
            <div className="icon-picker__grid">
              {visibleResults.map((icon) => (
                <button
                  key={icon.id}
                  className={`icon-picker__cell${
                    selectedIcon?.id === icon.id ? ' is-selected' : ''
                  }`}
                  title={`${icon.name}  —  :${icon.id}:`}
                  onClick={() => handleSelectIcon(icon)}
                  onDoubleClick={() => handleDoubleClick(icon)}
                  type="button"
                >
                  <i className={icon.cssClass} />
                  <span className="icon-picker__cell-name">{icon.name}</span>
                </button>
              ))}
            </div>
            {hasMore && (
              <button
                className="icon-picker__show-more"
                onClick={handleShowMore}
                type="button"
              >
                Show more ({allResults.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="icon-picker__footer">
        {selectedIcon ? (
          <div className="icon-picker__selected-info">
            <i className={selectedIcon.cssClass} />
            <span className="icon-picker__selected-label">
              <strong>{selectedIcon.name}</strong>
              <code>:{selectedIcon.id}:</code>
            </span>
          </div>
        ) : (
          <span className="icon-picker__hint">Click an icon to select it</span>
        )}
        <button
          className="icon-picker__insert-btn"
          disabled={!selectedIcon}
          onClick={handleInsert}
          type="button"
        >
          Insert
        </button>
      </div>
    </div>
  );
}
