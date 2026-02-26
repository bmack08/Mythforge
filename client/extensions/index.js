/**
 * TipTap Extensions Registry
 * Central export for all TipTap extensions used in Mythforge
 * This registry is shared by both the Editor and the Preview Renderer
 */

import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import ImageWithAttributes from './ImageWithAttributes.js';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell as BaseTableCell } from '@tiptap/extension-table-cell';
import { TableHeader as BaseTableHeader } from '@tiptap/extension-table-header';

// Extend TableCell and TableHeader with textAlign support for markdown alignment syntax
const TableCell = BaseTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {};
          return { style: `text-align: ${attributes.textAlign}` };
        },
      },
    };
  },
});

const TableHeader = BaseTableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      textAlign: {
        default: null,
        parseHTML: (element) => element.style.textAlign || null,
        renderHTML: (attributes) => {
          if (!attributes.textAlign) return {};
          return { style: `text-align: ${attributes.textAlign}` };
        },
      },
    };
  },
});
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';

// Custom heading with auto-ID for anchor links (D&D Beyond style)
import HeadingWithId from './HeadingWithId.js';

// Block extensions - D&D 5e PHB content blocks
import QuoteBlock from './QuoteBlock.js';
import SidebarBlock from './SidebarBlock.js';
import NoteBlock from './NoteBlock.js';
import WideBlock from './WideBlock.js';
import PageBreak from './PageBreak.js';
import ColumnBreak from './ColumnBreak.js';
import ColumnContainer from './ColumnContainer.js';
import Header from './Header.js';
import Footer from './Footer.js';
import PageNumber from './PageNumber.js';
import VerticalSpacing from './VerticalSpacing.js';
import SkipCounting from './SkipCounting.js';
import ResetCounting from './ResetCounting.js';
import FootnoteBlock from './FootnoteBlock.js';
import CoverBlock from './CoverBlock.js';
import CreditsBlock from './CreditsBlock.js';
import MustacheSpan from './MustacheSpan.js';
import MustacheBlock from './MustacheBlock.js';
import Comment from './Comment.js';

// D&D content blocks
import SpellBlock from './SpellBlock.js';
import FeatureBlock from './FeatureBlock.js';
import MonsterBlock from './MonsterBlock.js';

// Decorative elements
import WatercolorBlock from './WatercolorBlock.js';
import WatermarkBlock from './WatermarkBlock.js';
import ArtistCreditBlock from './ArtistCreditBlock.js';
import ImageMaskBlock from './ImageMaskBlock.js';

// Table-wrapper blocks (class progression & rune/script tables)
import ClassTableBlock from './ClassTableBlock.js';
import RuneTableBlock from './RuneTableBlock.js';

// Table of Contents
import TocBlock from './TocBlock.js';

// Legacy PHB blocks (from Phase 9)
import ClassFeature from './ClassFeature.js';
import IndexBlock from './IndexBlock.js';
import Spell from './Spell.js';
import SpellList from './SpellList.js';

// Table extension (PHB-styled, extends base Tiptap Table)
import TableBlock from './TableBlock.js';

// Inline marks - D&D reference marks
import IconMark from './IconMark.js';
import IconSuggestion from './IconSuggestion.js';
import Emoji from './Emoji.js';
import SpellMark from './SpellMark.js';
import AbilityMark from './AbilityMark.js';
import SkillMark from './SkillMark.js';
import ConditionMark from './ConditionMark.js';
import DamageMark from './DamageMark.js';
// LineNumbers - Now using React component instead of ProseMirror plugin

// Definition lists for spell stats
import { DefinitionList, DefinitionTerm, DefinitionDescription } from './DefinitionList.js';

/**
 * Extension Configuration
 * Configure StarterKit and other core extensions
 */
const baseExtensions = [
  // Core TipTap extensions
  StarterKit.configure({
    heading: false, // Disable default heading, we'll use HeadingWithId instead
    horizontalRule: true,
    bulletList: true,
    orderedList: true,
    blockquote: true,
    codeBlock: true,
  }),

  // Custom heading with auto-generated IDs for anchor links
  HeadingWithId.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  
  // Media & Styling
  Image,
  ImageWithAttributes,
  TableBlock.configure({ resizable: true }), // Custom PHB-styled table (extends Tiptap Table)
  TableRow,
  TableCell,
  TableHeader,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  // LineNumbers removed - using React component instead

  // Layout & Structure
  PageBreak,
  ColumnBreak,
  ColumnContainer,
  WideBlock,
  Header,
  Footer,
  PageNumber,
  VerticalSpacing,
  SkipCounting,
  ResetCounting,
  MustacheSpan,
  MustacheBlock,
  Comment,

  // PHB Content Blocks
  QuoteBlock,
  SidebarBlock,
  NoteBlock,
  TocBlock,
  FootnoteBlock,
  CoverBlock,
  CreditsBlock,

  // Decorative Elements
  WatercolorBlock,
  WatermarkBlock,
  ArtistCreditBlock,
  ImageMaskBlock,

  // D&D Specific Blocks
  SpellBlock,
  FeatureBlock,
  MonsterBlock,
  ClassTableBlock,
  RuneTableBlock,
  ClassFeature,
  IndexBlock,
  Spell,
  SpellList,
  
  // Inline Marks & Nodes
  IconMark,
  IconSuggestion,
  Emoji,
  SpellMark,
  AbilityMark,
  SkillMark,
  ConditionMark,
  DamageMark,
  
  // Definition lists (for spell stats)
  DefinitionList,
  DefinitionTerm,
  DefinitionDescription,
];

// Deduplicate by extension name to avoid duplicate plugin keys or warnings
const dedupeByName = (list) => {
  const seen = new Set();
  return list.filter((ext) => {
    const name = ext && ext.name;
    if (!name) return true;
    if (seen.has(name)) return false;
    seen.add(name);
    return true;
  });
};

const configuredExtensions = dedupeByName(baseExtensions);

/**
 * Export as default for easy import
 * Usage: 
 *   import extensions from 'client/extensions/index.js'
 *   const editor = useEditor({ extensions })
 */
export default configuredExtensions;

/**
 * Export individual extensions for selective use
 */
export {
  // Core
  StarterKit,
  Image,
  ImageWithAttributes,
  TableBlock, // PHB-styled table extension
  TableRow,
  TableCell,
  TableHeader,
  TextStyle,
  Color,
  Highlight,
  
  // Layout
  PageBreak,
  ColumnBreak,
  ColumnContainer,
  WideBlock,
  Header,
  Footer,
  PageNumber,
  VerticalSpacing,
  SkipCounting,
  ResetCounting,
  MustacheSpan,
  MustacheBlock,
  Comment,

  // Content Blocks
  QuoteBlock,
  SidebarBlock,
  NoteBlock,
  TocBlock,
  FootnoteBlock,
  CoverBlock,
  CreditsBlock,
  
  // Decorative Elements
  WatercolorBlock,
  WatermarkBlock,
  ArtistCreditBlock,
  ImageMaskBlock,

  // D&D Blocks
  SpellBlock,
  FeatureBlock,
  MonsterBlock,
  ClassTableBlock,
  RuneTableBlock,
  ClassFeature,
  IndexBlock,
  Spell,
  SpellList,

  // Inline Marks
  IconMark,
  IconSuggestion,
  Emoji,
  SpellMark,
  AbilityMark,
  SkillMark,
  ConditionMark,
  DamageMark,
  
  // Definition Lists
  DefinitionList,
  DefinitionTerm,
  DefinitionDescription,
};
