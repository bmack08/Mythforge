import React, { useState, useCallback, useEffect } from 'react';
import IconPicker from './IconPicker';
import './TipTapToolbar.less';

/**
 * TipTapToolbar - Comprehensive grouped formatting toolbar for the TipTap editor.
 *
 * Groups:
 *   1. Text Formatting  (headings, bold, italic, strike, lists)
 *   2. Structure         (HR, page break, column break, wide block)
 *   3. D&D Blocks        (dropdown: quote, note, sidebar, monster, spell, feature, descriptive)
 *   4. Insert            (image, table, footnote, comment, link)
 *   5. View              (line-numbers toggle)
 *
 * Receives the TipTap `editor` instance and state callbacks as props.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Small wrapper so we can re-render when the editor selection changes. */
function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

function TBtn({ editor, onClick, isActive, title, children, disabled }) {
  return (
    <button
      className={`tiptap-toolbar__btn${isActive ? ' is-active' : ''}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dropdown wrapper (for D&D Blocks, etc.)
// ---------------------------------------------------------------------------

function ToolbarDropdown({ label, icon, children }) {
  const [open, setOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest('.tiptap-toolbar__dropdown')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`tiptap-toolbar__dropdown${open ? ' is-open' : ''}`}>
      <button
        className="tiptap-toolbar__btn tiptap-toolbar__dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        title={label}
        type="button"
      >
        {icon && <i className={icon} />}
        <span className="tiptap-toolbar__dropdown-label">{label}</span>
        <i className="fas fa-caret-down tiptap-toolbar__caret" />
      </button>
      {open && (
        <div className="tiptap-toolbar__dropdown-menu">
          {React.Children.map(children, (child) =>
            child
              ? React.cloneElement(child, {
                  onClick: (...args) => {
                    child.props.onClick?.(...args);
                    setOpen(false);
                  },
                })
              : null
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

function Divider() {
  return <span className="tiptap-toolbar__divider" />;
}

// ---------------------------------------------------------------------------
// Main Toolbar
// ---------------------------------------------------------------------------

export default function TipTapToolbar({ editor, showLineNumbers, onToggleLineNumbers, inkFriendly, onToggleInkFriendly }) {
  const forceUpdate = useForceUpdate();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Subscribe to editor transaction events so active-state buttons re-render
  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', forceUpdate);
    return () => {
      editor.off('transaction', forceUpdate);
    };
  }, [editor, forceUpdate]);

  if (!editor) return null;

  // Shorthand
  const chain = () => editor.chain().focus();
  const active = (name, attrs) => editor.isActive(name, attrs);
  const can = (cmd) => {
    try {
      return editor.can()[cmd]?.();
    } catch {
      return true; // If we can't check, assume it's available
    }
  };

  // ----- Link insert helper -----
  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL:', previousUrl || 'https://');
    if (url === null) return; // cancelled
    if (url === '') {
      chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    chain().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  };

  return (
    <div className="tiptap-toolbar">
      {/* ── Group 1: Text Formatting ──────────────────────────── */}
      <div className="tiptap-toolbar__group" data-group="text">
        <TBtn
          editor={editor}
          isActive={active('heading', { level: 1 })}
          onClick={() => chain().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          H1
        </TBtn>
        <TBtn
          editor={editor}
          isActive={active('heading', { level: 2 })}
          onClick={() => chain().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </TBtn>
        <TBtn
          editor={editor}
          isActive={active('heading', { level: 3 })}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          H3
        </TBtn>

        <Divider />

        <TBtn
          editor={editor}
          isActive={active('bold')}
          onClick={() => chain().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <i className="fas fa-bold" />
        </TBtn>
        <TBtn
          editor={editor}
          isActive={active('italic')}
          onClick={() => chain().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <i className="fas fa-italic" />
        </TBtn>
        <TBtn
          editor={editor}
          isActive={active('strike')}
          onClick={() => chain().toggleStrike().run()}
          title="Strikethrough"
        >
          <i className="fas fa-strikethrough" />
        </TBtn>

        <Divider />

        <TBtn
          editor={editor}
          isActive={active('bulletList')}
          onClick={() => chain().toggleBulletList().run()}
          title="Bullet List"
        >
          <i className="fas fa-list-ul" />
        </TBtn>
        <TBtn
          editor={editor}
          isActive={active('orderedList')}
          onClick={() => chain().toggleOrderedList().run()}
          title="Ordered List"
        >
          <i className="fas fa-list-ol" />
        </TBtn>
      </div>

      <Divider />

      {/* ── Group 2: Structure ─────────────────────────────────── */}
      <div className="tiptap-toolbar__group" data-group="structure">
        <TBtn
          editor={editor}
          onClick={() => chain().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <i className="fas fa-minus" />
        </TBtn>
        <TBtn
          editor={editor}
          onClick={() => chain().setPageBreak().run()}
          title="Page Break (\page)"
        >
          <i className="fas fa-file" />
          <span className="tiptap-toolbar__btn-label">Page</span>
        </TBtn>
        <TBtn
          editor={editor}
          onClick={() => chain().setColumnBreak().run()}
          title="Column Break (\column)"
        >
          <i className="fas fa-columns" />
          <span className="tiptap-toolbar__btn-label">Column</span>
        </TBtn>
        <TBtn
          editor={editor}
          onClick={() => chain().insertWide().run()}
          title="Wide Block (spans both columns)"
        >
          <i className="fas fa-arrows-alt-h" />
          <span className="tiptap-toolbar__btn-label">Wide</span>
        </TBtn>
      </div>

      <Divider />

      {/* ── Group: Images ─────────────────────────────────────── */}
      <div className="tiptap-toolbar__group" data-group="images">
        <ToolbarDropdown label="Images" icon="fas fa-image">
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => {
              const url = window.prompt('Image URL:');
              if (url) chain().setImage({ src: url }).run();
            }}
            title="Insert an image"
          >
            <i className="fas fa-image" />
            <span>Image</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => {
              const url = window.prompt('Image URL:');
              if (url) chain().insertImageWrapLeft(url).run();
            }}
            title="Insert image with text wrapping on left"
          >
            <i className="fas fa-align-left" />
            <span>Image Wrap Left</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => {
              const url = window.prompt('Image URL:');
              if (url) chain().insertImageWrapRight(url).run();
            }}
            title="Insert image with text wrapping on right"
          >
            <i className="fas fa-align-right" />
            <span>Image Wrap Right</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => {
              const url = window.prompt('Background image URL:');
              if (url) chain().insertBackgroundImage(url).run();
            }}
            title="Full-page background image (position: absolute)"
          >
            <i className="fas fa-expand" />
            <span>Background Image</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertWatercolor({ variant: Math.ceil(Math.random() * 12), top: '0px', left: '0px', width: '400px', opacity: '80%', backgroundColor: '#BBAD82' }).run()}
            title="Watercolor stain decoration (center, random variant)"
          >
            <i className="fas fa-paint-brush" />
            <span>Watercolor Center</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertImageMask({ maskType: 'edge', maskNumber: Math.ceil(Math.random() * 8), rotation: '0' }).run()}
            title="Image mask — edge mask for page borders"
          >
            <i className="fas fa-border-style" />
            <span>Watercolor Edge</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertImageMask({ maskType: 'corner', maskNumber: Math.ceil(Math.random() * 37), offsetX: '-50%', offsetY: '50%' }).run()}
            title="Image mask — corner mask for decorative corners"
          >
            <i className="fas fa-vector-square" />
            <span>Watercolor Corner</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertWatermark('DRAFT').run()}
            title="Add watermark text overlay"
          >
            <i className="fas fa-font" />
            <span>Watermark</span>
          </button>
        </ToolbarDropdown>
      </div>

      <Divider />

      {/* ── Group 3: D&D Blocks (dropdown) ─────────────────────── */}
      <div className="tiptap-toolbar__group" data-group="dnd">
        <ToolbarDropdown label="D&D Blocks" icon="fas fa-dragon">
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertQuote().run()}
            title="Quote / Callout block"
          >
            <i className="fas fa-quote-left" />
            <span>Quote Block</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertNote().run()}
            title="Note / Annotation block"
          >
            <i className="fas fa-sticky-note" />
            <span>Note Block</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertSidebar().run()}
            title="Sidebar info box"
          >
            <i className="fas fa-window-maximize" />
            <span>Sidebar Block</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertFramedMonster().run()}
            title="Monster stat block (framed — bordered with background)"
          >
            <i className="fas fa-skull-crossbones" />
            <span>Monster Block (Framed)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertUnframedMonster().run()}
            title="Monster stat block (unframed — stats only, no border)"
          >
            <i className="fas fa-skull-crossbones" style={{ opacity: 0.6 }} />
            <span>Monster Block (Unframed)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertWideMonster().run()}
            title="Monster stat block (wide — framed, spans both columns)"
          >
            <i className="fas fa-skull-crossbones" />
            <span>Monster Block (Wide)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertSpell().run()}
            title="Spell description block"
          >
            <i className="fas fa-magic" />
            <span>Spell Block</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertSpellList().run()}
            title="Spell list organized by level"
          >
            <i className="fas fa-list" />
            <span>Spell List</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertFeature().run()}
            title="Class/Race feature block"
          >
            <i className="fas fa-shield-alt" />
            <span>Feature</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertDescriptive().run()}
            title="Descriptive text block (PHB style read-aloud box)"
          >
            <i className="fas fa-scroll" />
            <span>Descriptive Block</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertClassTable().run()}
            title="Class progression table (framed)"
          >
            <i className="fas fa-th-list" />
            <span>Class Table</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertClassTable('frame', true).run()}
            title="Class progression table (framed, wide — spans both columns)"
          >
            <i className="fas fa-th-list" style={{ opacity: 0.6 }} />
            <span>Class Table (Wide)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertRuneTable('dwarvish').run()}
            title="Rune table — Dwarvish script (Davek font)"
          >
            <i className="fas fa-language" />
            <span>Rune Table (Dwarvish)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertRuneTable('elvish').run()}
            title="Rune table — Elvish script (Rellanic font)"
          >
            <i className="fas fa-language" style={{ opacity: 0.8 }} />
            <span>Rune Table (Elvish)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertRuneTable('draconic').run()}
            title="Rune table — Draconic script (Iokharic font)"
          >
            <i className="fas fa-language" style={{ opacity: 0.6 }} />
            <span>Rune Table (Draconic)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertToc().run()}
            title="Table of Contents page"
          >
            <i className="fas fa-book" />
            <span>Table of Contents</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertToc(true).run()}
            title="Table of Contents (wide — spans both columns)"
          >
            <i className="fas fa-book" style={{ opacity: 0.6 }} />
            <span>Table of Contents (Wide)</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertFrontCover().run()}
            title="Front cover — full-bleed cover with logo, title, banner"
          >
            <i className="fas fa-book-open" />
            <span>Front Cover</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertInsideCover().run()}
            title="Inside cover — title page with image mask and logo"
          >
            <i className="fas fa-book" />
            <span>Inside Cover</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertPartCover().run()}
            title="Part/chapter cover — divider page with header background"
          >
            <i className="fas fa-bookmark" />
            <span>Part Cover</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertBackCover().run()}
            title="Back cover — dark background with description and logo"
          >
            <i className="fas fa-book-reader" />
            <span>Back Cover</span>
          </button>
          <button
            className="tiptap-toolbar__dropdown-item"
            onClick={() => chain().insertImageMask().run()}
            title="Image mask — clip images with watercolor mask shapes"
          >
            <i className="fas fa-mask" />
            <span>Image Mask</span>
          </button>
        </ToolbarDropdown>
      </div>

      <Divider />

      {/* ── Group 4: Insert ────────────────────────────────────── */}
      <div className="tiptap-toolbar__group" data-group="insert">
        <TBtn
          editor={editor}
          onClick={() =>
            chain()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insert Table (3x3)"
        >
          <i className="fas fa-table" />
        </TBtn>
        <TBtn
          editor={editor}
          onClick={() => chain().insertFootnote().run()}
          title="Insert Footnote"
        >
          <i className="fas fa-superscript" />
        </TBtn>
        <TBtn
          editor={editor}
          onClick={() => chain().insertComment().run()}
          title="Insert Comment (hidden in preview)"
        >
          <i className="fas fa-comment" />
        </TBtn>
        <TBtn
          editor={editor}
          isActive={active('link')}
          onClick={handleInsertLink}
          title="Insert / Edit Link"
        >
          <i className="fas fa-link" />
        </TBtn>
        <div className="tiptap-toolbar__icon-picker-wrap">
          <TBtn
            editor={editor}
            isActive={iconPickerOpen}
            onClick={() => setIconPickerOpen((v) => !v)}
            title="Insert Icon"
          >
            <i className="fas fa-icons" />
          </TBtn>
          {iconPickerOpen && (
            <IconPicker
              editor={editor}
              onClose={() => setIconPickerOpen(false)}
            />
          )}
        </div>
      </div>

      <Divider />

      {/* ── Group 5: View ──────────────────────────────────────── */}
      <div className="tiptap-toolbar__group" data-group="view">
        <TBtn
          editor={editor}
          isActive={showLineNumbers}
          onClick={onToggleLineNumbers}
          title="Toggle Line Numbers"
        >
          <i className="fas fa-list-ol" style={{ opacity: 0.7 }} />
          <span className="tiptap-toolbar__btn-label">#</span>
        </TBtn>
        <TBtn
          editor={editor}
          isActive={inkFriendly}
          onClick={onToggleInkFriendly}
          title="Ink Friendly (strip backgrounds for printing)"
        >
          <i className="fas fa-tint" style={{ opacity: 0.7 }} />
          <span className="tiptap-toolbar__btn-label">Ink</span>
        </TBtn>
      </div>
    </div>
  );
}
