/* eslint-disable max-lines */

// Import original PHB specific generators
import MagicGen from './snippets/magic.gen.js';
import ClassTableGen from './snippets/classtable.gen.js';
import MonsterBlockGen from './snippets/monsterblock.gen.js';
import scriptGen from './snippets/script.gen.js';
import ClassFeatureGen from './snippets/classfeature.gen.js';
import CoverPageGen from './snippets/coverpage.gen.js';
import QuoteGen from './snippets/quote.gen.js';

// Re‑use shared/Blank theme generators so we don't duplicate code
import WatercolorGen from '../Blank/snippets/watercolor.gen.js';
import ImageMaskGen from '../Blank/snippets/imageMask.gen.js';
import FooterGen from '../Blank/snippets/footer.gen.js';
import TableOfContentsGen from '../Blank/snippets/tableOfContents.gen.js';
import indexGen from '../Blank/snippets/index.gen.js';

import dedent from 'dedent-tabs';

// Order intentionally mirrors upstream Homebrewery: Text Editor, Images, Tables, Fonts, PHB, (Brew Snippets auto), Style/Print
export default [
	/**************** TEXT EDITOR (utility & structural) *************/
	{
		groupName : 'Text Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'text',
		snippets  : [
			{ name : 'Column Break', icon : 'fas fa-columns', gen : '\n\\column\n' },
			{ name : 'New Page', icon : 'fas fa-file-alt', gen : '\n\\page\n' },
			{
				name        : 'Page Numbering',
				icon        : 'fas fa-bookmark',
				subsnippets : [
					{ name : 'Page Number', icon : 'fas fa-bookmark', gen : '{{pageNumber 1}}\n' },
					{ name : 'Auto-incrementing Page Number', icon : 'fas fa-sort-numeric-down', gen : '{{pageNumber,auto}}\n' },
					{ name : 'Variable Auto Page Number', icon : 'fas fa-sort-numeric-down', gen : '{{pageNumber $[HB_pageNumber]}}\n' },
					{ name : 'Skip Page Number Increment this Page', icon : 'fas fa-xmark', gen : '{{skipCounting}}\n' },
					{ name : 'Restart Numbering', icon : 'fas fa-arrow-rotate-left', gen : '{{resetCounting}}\n' },
				]
			},
			{
				name        : 'Footer',
				icon        : 'fas fa-shoe-prints',
				gen         : FooterGen.createFooterFunc(),
				subsnippets : [1,2,3,4,5,6].map((h)=>({
					name : `Footer from H${h}`,
					icon : `fas fa-dice-${['one','two','three','four','five','six'][h-1]}`,
					gen  : FooterGen.createFooterFunc(h)
				}))
			},
			{ name : 'Vertical Spacing', icon : 'fas fa-arrows-alt-v', gen : '\n::::\n' },
			{ name : 'Horizontal Spacing', icon : 'fas fa-arrows-alt-h', gen : ' {{width:100px}}\n' },
			{ name : 'Wide Block', icon : 'fas fa-window-maximize', gen : dedent`\n{{wide\nEverything in here will be extra wide. Tables, text, everything!\nYou may have to manually place column breaks with \`\column\` to get ideal flow.\n}}\n` },
			{ name : 'QR Code', icon : 'fas fa-qrcode', gen : (brew)=>`![](https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`https://homebrewery.naturalcrit.com${brew?.shareId ? `/share/${brew.shareId}` : ''}`)}&size=100x100){width:100px;mix-blend-mode:multiply}` },
			{ name : 'Link to page', icon : 'fas fa-link', gen : '[Click here](#p3) to go to page 3\n' },
			{ name : 'Add Comment', icon : 'fas fa-code', gen : '<!-- This is a comment that will not be rendered into your brew. -->' },
			{ name : 'Homebrewery Credit', icon : 'fas fa-dice-d20', gen : function(){ return dedent`{{homebreweryCredits\nMade With\n\n{{homebreweryIcon}}\n\nThe Homebrewery\n[Homebrewery.Naturalcrit.com](https://homebrewery.naturalcrit.com)\n}}\n\n`; } },
			{
				name        : 'Table of Contents',
				icon        : 'fas fa-book',
				gen         : TableOfContentsGen,
				experimental: true,
				subsnippets : [3,4,5,6].map((depth)=>({
					name : `Include in ToC up to H${depth}`,
					icon : `fas fa-dice-${['three','four','five','six'][depth-3]}`,
					gen  : dedent`\n{{tocDepthH${depth}}}\n`
				}))
			},
			{ name : 'Index', icon : 'fas fa-bars', gen : indexGen, experimental : true }
		]
	},

	/*********************** IMAGES *******************/
	{
		groupName : 'Images',
		icon      : 'fas fa-images',
		view      : 'text',
		snippets  : [
			{ name : 'Image', icon : 'fas fa-image', gen : dedent`![cat warrior](https://s-media-cache-ak0.pinimg.com/736x/4a/81/79/4a8179462cfdf39054a418efd4cb743e.jpg) {width:325px,mix-blend-mode:multiply}` },
			{ name : 'Image Wrap Left', icon : 'fac image-wrap-left', gen : dedent`![homebrewery_mug](http://i.imgur.com/hMna6G0.png) {width:280px,margin-right:-3cm,wrapLeft}` },
			{ name : 'Image Wrap Right', icon : 'fac image-wrap-right', gen : dedent`![homebrewery_mug](http://i.imgur.com/hMna6G0.png) {width:280px,margin-left:-3cm,wrapRight}` },
			{ name : 'Background Image', icon : 'fas fa-tree', gen : dedent`![homebrew mug](http://i.imgur.com/hMna6G0.png) {position:absolute,top:50px,right:30px,width:280px}` },
			{ name : 'Watercolor Splatter', icon : 'fas fa-fill-drip', gen : WatercolorGen },
			{ name : 'Watercolor Center', icon : 'fac mask-center', gen : ImageMaskGen.center, experimental : true },
			{
				name        : 'Watercolor Edge',
				icon        : 'fac mask-edge',
				gen         : ImageMaskGen.edge('bottom'),
				experimental: true,
				subsnippets : ['top','right','bottom','left'].map((pos)=>({
					name : pos.charAt(0).toUpperCase()+pos.slice(1),
					icon : `fac position-${pos}`,
					gen  : ImageMaskGen.edge(pos)
				}))
			},
			{
				name        : 'Watercolor Corner',
				icon        : 'fac mask-corner',
				gen         : ImageMaskGen.corner,
				experimental: true,
				subsnippets : [
					{ name : 'Top-Left', icon : 'fac position-top-left', gen : ImageMaskGen.corner('top','left') },
					{ name : 'Top-Right', icon : 'fac position-top-right', gen : ImageMaskGen.corner('top','right') },
					{ name : 'Bottom-Left', icon : 'fac position-bottom-left', gen : ImageMaskGen.corner('bottom','left') },
					{ name : 'Bottom-Right', icon : 'fac position-bottom-right', gen : ImageMaskGen.corner('bottom','right') }
				]
			},
			{ name : 'Watermark', icon : 'fas fa-id-card', gen : dedent`{{watermark Homebrewery}}\n` }
		]
	},

	/*********************  TABLES *********************/
	{
		groupName : 'Tables',
		icon      : 'fas fa-table',
		view      : 'text',
		snippets  : [
			{ // Basic markdown example table
				name : 'Table',
				icon : 'fas fa-th-list',
				gen  : function(){
					return dedent`##### Character Advancement\n| Experience Points | Level | Proficiency Bonus |\n|:------------------|:-----:|:-----------------:|\n| 0                 | 1     | +2                |\n| 300               | 2     | +2                |\n| 900               | 3     | +2                |\n| 2,700             | 4     | +2                |\n| 6,500             | 5     | +3                |\n| 14,000            | 6     | +3                |\n`;
				}
			},
			{ // Wide table
				name : 'Wide Table',
				icon : 'fas fa-list',
				gen  : function(){
					return dedent`{{wide\n##### Weapons\n| Name | Cost | Damage | Weight | Properties |\n|:-----|:----:|:-------|-------:|:----------|\n| Club | 1 sp | 1d4 bludgeoning | 2 lb. | Light |\n| Dagger | 2 gp | 1d4 piercing | 1 lb. | Finesse |\n}}\n`;
				}
			},
			{ // Split table
				name : 'Split Table',
				icon : 'fas fa-th-large',
				gen  : function(){
					return dedent`##### Typical Difficulty Classes\n{{column-count:2\n| Task Difficulty | DC |\n|:----------------|:--:|\n| Very easy | 5 |\n| Easy | 10 |\n| Medium | 15 |\n\n| Task Difficulty | DC |\n|:----------------|:--:|\n| Hard | 20 |\n| Very hard | 25 |\n| Nearly impossible | 30 |\n}}\n`;
				}
			},
			{ // Original complex class tables with sub options
				name        : 'Class Tables',
				icon        : 'fas fa-table',
				gen         : ClassTableGen.full('classTable,frame,decoration,wide'),
				subsnippets : [
					{ name : 'Martial Class Table', icon : 'fas fa-table', gen : ClassTableGen.non('classTable,frame,decoration') },
					{ name : 'Martial Class Table (unframed)', icon : 'fas fa-border-none', gen : ClassTableGen.non('classTable') },
					{ name : 'Full Caster Class Table', icon : 'fas fa-table', gen : ClassTableGen.full('classTable,frame,decoration,wide') },
					{ name : 'Full Caster Class Table (unframed)', icon : 'fas fa-border-none', gen : ClassTableGen.full('classTable,wide') },
					{ name : 'Half Caster Class Table', icon : 'fas fa-list-alt', gen : ClassTableGen.half('classTable,frame,decoration,wide') },
					{ name : 'Half Caster Class Table (unframed)', icon : 'fas fa-border-none', gen : ClassTableGen.half('classTable,wide') },
					{ name : 'Third Caster Spell Table', icon : 'fas fa-border-all', gen : ClassTableGen.third('classTable,frame,decoration') },
					{ name : 'Third Caster Spell Table (unframed)', icon : 'fas fa-border-none', gen : ClassTableGen.third('classTable') }
				]
			},
			{
				name         : 'Rune Table',
				icon         : 'fas fa-language',
				gen          : scriptGen.dwarvish,
				experimental : true,
				subsnippets  : [
					{ name : 'Dwarvish', icon : 'fac davek', gen : scriptGen.dwarvish },
					{ name : 'Elvish', icon : 'fac rellanic', gen : scriptGen.elvish },
					{ name : 'Draconic', icon : 'fac iokharic', gen : scriptGen.draconic },
				]
			},
		]
	},

	/**************** FONTS *************/
	{
		groupName : 'Fonts',
		icon      : 'fas fa-keyboard',
		view      : 'text',
		snippets  : [
			{ name : 'Open Sans', icon : 'font OpenSans', gen : dedent`{{font-family:OpenSans Dummy Text}}` },
			{ name : 'Code Bold', icon : 'font CodeBold', gen : dedent`{{font-family:CodeBold Dummy Text}}` },
			{ name : 'Code Light', icon : 'font CodeLight', gen : dedent`{{font-family:CodeLight Dummy Text}}` },
			{ name : 'Scaly Sans', icon : 'font ScalySansRemake', gen : dedent`{{font-family:ScalySansRemake Dummy Text}}` },
			{ name : 'Book Insanity', icon : 'font BookInsanityRemake', gen : dedent`{{font-family:BookInsanityRemake Dummy Text}}` },
			{ name : 'Mr Eaves', icon : 'font MrEavesRemake', gen : dedent`{{font-family:MrEavesRemake Dummy Text}}` },
			{ name : 'Pagella', icon : 'font Pagella', gen : dedent`{{font-family:Pagella Dummy Text}}` },
			{ name : 'Solbera Imitation', icon : 'font SolberaImitationRemake', gen : dedent`{{font-family:SolberaImitationRemake Dummy Text}}` },
			{ name : 'Scaly Sans Small Caps', icon : 'font ScalySansSmallCapsRemake', gen : dedent`{{font-family:ScalySansSmallCapsRemake Dummy Text}}` },
			{ name : 'Walter Turncoat', icon : 'font WalterTurncoat', gen : dedent`{{font-family:WalterTurncoat Dummy Text}}` },
			{ name : 'Lato', icon : 'font Lato', gen : dedent`{{font-family:Lato Dummy Text}}` },
			{ name : 'Courier', icon : 'font Courier', gen : dedent`{{font-family:Courier Dummy Text}}` },
			{ name : 'Nodesto Caps Condensed', icon : 'font NodestoCapsCondensed', gen : dedent`{{font-family:NodestoCapsCondensed Dummy Text}}` },
			{ name : 'Overpass', icon : 'font Overpass', gen : dedent`{{font-family:Overpass Dummy Text}}` },
			{ name : 'Davek', icon : 'font Davek', gen : dedent`{{font-family:Davek Dummy Text}}` },
			{ name : 'Iokharic', icon : 'font Iokharic', gen : dedent`{{font-family:Iokharic Dummy Text}}` },
			{ name : 'Rellanic', icon : 'font Rellanic', gen : dedent`{{font-family:Rellanic Dummy Text}}` },
			{ name : 'Times New Roman', icon : 'font TimesNewRoman', gen : dedent`{{font-family:"Times New Roman" Dummy Text}}` },
		]
	},

	/************************* PHB CONTENT BLOCKS ********************/
	{
		groupName : 'PHB',
		icon      : 'fas fa-book',
		view      : 'text',
		snippets  : [
			{ name : 'Spell', icon : 'fas fa-magic', gen : MagicGen.spell },
			{ name : 'Spell List', icon : 'fas fa-scroll', gen : MagicGen.spellList },
			{ name : 'Class Feature', icon : 'fas fa-mask', gen : ClassFeatureGen },
			{ name : 'Quote', icon : 'fas fa-quote-right', gen : QuoteGen },
			{ name : 'Note', icon : 'fas fa-sticky-note', gen : ()=>dedent`{{note\n##### Time to Drop Knowledge\nUse notes to point out some interesting information.\n\n**Tables and lists** both work within a note.\n}}\n` },
			{ name : 'Descriptive Text Box', icon : 'fas fa-comment-alt', gen : ()=>dedent`{{descriptive\n##### Time to Drop Knowledge\nUse descriptive boxes to highlight text that should be read aloud.\n\n**Tables and lists** both work within a descriptive box.\n}}\n` },
			{ name : 'Monster Stat Block (unframed)', icon : 'fas fa-paw', gen : MonsterBlockGen.monster('monster',2) },
			{ name : 'Monster Stat Block', icon : 'fas fa-spider', gen : MonsterBlockGen.monster('monster,frame',2) },
			{ name : 'Wide Monster Stat Block', icon : 'fas fa-dragon', gen : MonsterBlockGen.monster('monster,frame,wide',4) },
			{ name : 'Front Cover Page', icon : 'fac book-front-cover', gen : CoverPageGen.front, experimental : true },
			{ name : 'Inside Cover Page', icon : 'fac book-inside-cover', gen : CoverPageGen.inside, experimental : true },
			{ name : 'Part Cover Page', icon : 'fac book-part-cover', gen : CoverPageGen.part, experimental : true },
			{ name : 'Back Cover Page', icon : 'fac book-back-cover', gen : CoverPageGen.back, experimental : true },
			{ name : 'Magic Item', icon : 'fas fa-hat-wizard', gen : MagicGen.item },
			{ name : 'Artist Credit', icon : 'fas fa-signature', gen : ()=>dedent`{{artist,top:90px,right:30px\n##### Starry Night\n[Van Gogh](https://www.vangoghmuseum.nl/en)\n}}\n` },
		]
	},

	/**************** STYLE OVERRIDES / PRINT UTILITIES *************/
	{
		groupName : 'Style Editor',
		icon      : 'fas fa-pencil-alt',
		view      : 'style',
		snippets  : [
			{ name : 'Remove Drop Cap', icon : 'fas fa-remove-format', gen : dedent`/* Removes Drop Caps */\n.page h1+p:first-letter {\n\tall: unset;\n}\n\n/* Removes Small-Caps in first line */\n.page h1+p:first-line {\n\tall: unset;\n}` },
			{ name : 'Tweak Drop Cap', icon : 'fas fa-sliders-h', gen : dedent`/* Drop Cap settings */\n.page h1 + p::first-letter {\n\tfont-family: SolberaImitationRemake;\n\tfont-size: 3.5cm;\n\tbackground-image: linear-gradient(-45deg, #322814, #998250, #322814);\n\tline-height: 1em;\n}\n\n` },
		]
	},
	{
		groupName : 'Print',
		icon      : 'fas fa-print',
		view      : 'style',
		snippets  : [
			{ name : 'Ink Friendly', icon : 'fas fa-tint', gen : dedent`/* Ink Friendly */\n*:is(.page,.monster,.note,.descriptive) {\n\tbackground : white !important;\n\tbox-shadow : 1px 4px 14px #888 !important;\n}\n\n.page img {\n\tvisibility : hidden;\n}\n\n` },
		]
	}
];
