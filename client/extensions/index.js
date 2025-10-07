/**
 * TipTap Extensions Registry
 * Central export for all TipTap extensions used in Mythforge
 * This registry is shared by both the Editor and the Preview Renderer
 */

import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';

// Block extensions - D&D 5e PHB content blocks
import QuoteBlock from './QuoteBlock.js';
import SidebarBlock from './SidebarBlock.js';
import NoteBlock from './NoteBlock.js';
import WideBlock from './WideBlock.js';
import PageBreak from './PageBreak.js';
import ColumnBreak from './ColumnBreak.js';
import FootnoteBlock from './FootnoteBlock.js';
import CoverBlock from './CoverBlock.js';
import CreditsBlock from './CreditsBlock.js';

// D&D content blocks
import SpellBlock from './SpellBlock.js';
import FeatureBlock from './FeatureBlock.js';
import MonsterBlock from './MonsterBlock.js';

// Legacy PHB blocks (from Phase 9)
import ClassFeature from './ClassFeature.js';
import Spell from './Spell.js';
import SpellList from './SpellList.js';

// Table extension (PHB-styled)
import TableBlock from './TableBlock.js';

// Inline marks - D&D reference marks
import IconMark from './IconMark.js';
import SpellMark from './SpellMark.js';
import AbilityMark from './AbilityMark.js';
import SkillMark from './SkillMark.js';
import ConditionMark from './ConditionMark.js';
import DamageMark from './DamageMark.js';

/**
 * Extension Configuration
 * Configure StarterKit and other core extensions
 */
const configuredExtensions = [
  // Core TipTap extensions
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    horizontalRule: true,
    bulletList: true,
    orderedList: true,
    blockquote: true,
    codeBlock: true,
  }),
  
  // Media & Styling
  Image,
  Table.configure({ resizable: true }),
  TableRow,
  TableCell,
  TableHeader,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  
  // Layout & Structure
  PageBreak,
  ColumnBreak,
  WideBlock,
  
  // PHB Content Blocks
  QuoteBlock,
  SidebarBlock,
  NoteBlock,
  FootnoteBlock,
  CoverBlock,
  CreditsBlock,
  
  // D&D Specific Blocks
  SpellBlock,
  FeatureBlock,
  MonsterBlock,
  ClassFeature,
  Spell,
  SpellList,
  
  // Custom table styling
  TableBlock,
  
  // Inline Marks & Nodes
  IconMark,
  SpellMark,
  AbilityMark,
  SkillMark,
  ConditionMark,
  DamageMark,
];

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
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TextStyle,
  Color,
  Highlight,
  
  // Layout
  PageBreak,
  ColumnBreak,
  WideBlock,
  
  // Content Blocks
  QuoteBlock,
  SidebarBlock,
  NoteBlock,
  FootnoteBlock,
  CoverBlock,
  CreditsBlock,
  
  // D&D Blocks
  SpellBlock,
  FeatureBlock,
  MonsterBlock,
  ClassFeature,
  Spell,
  SpellList,
  TableBlock,
  
  // Inline Marks
  IconMark,
  SpellMark,
  AbilityMark,
  SkillMark,
  ConditionMark,
  DamageMark,
};
