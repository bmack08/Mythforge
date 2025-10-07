/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
import './editor.less';
import React from 'react';
import createClass from 'create-react-class';
import _ from 'lodash';
import dedent from 'dedent-tabs';
// Removed: import Markdown from '../../../shared/naturalcrit/markdown.js';
// No longer needed - TipTap handles emoji rendering internally

import CodeEditor from 'naturalcrit/codeEditor/codeEditor.jsx';
import TipTapEditor from 'client/components/TipTapEditor.jsx';
import SnippetBar from './snippetbar/snippetbar.jsx';
import MetadataEditor from './metadataEditor/metadataEditor.jsx';
// const GraphPanel = require('./graphPanel/graphPanel.jsx');
// const InlineEditor = require('./inlineEditor/inlineEditor.jsx');

const EDITOR_THEME_KEY = 'HOMEBREWERY-EDITOR-THEME';

const PAGEBREAK_REGEX_V3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
const SNIPPETBREAK_REGEX_V3 = /^\\snippet\ .*$/;
const DEFAULT_STYLE_TEXT = dedent`
				/*=======---  Example CSS styling  ---=======*/
				/* Any CSS here will apply to your document! */

				.myExampleClass {
					color: black;
				}`;

const DEFAULT_SNIPPET_TEXT = dedent`
				\snippet example snippet
				
				The text between \`\snippet title\` lines will become a snippet of name \`title\` as this example provides.
				
				This snippet is accessible in the brew tab, and will be inherited if the brew is used as a theme.
`;
let isJumping = false;

const Editor = createClass({
	displayName     : 'Editor',
	
	codeEditor   : React.createRef(null),
	tipTapEditor : React.createRef(null), // Add ref for TipTap editor
	
	getDefaultProps : function() {
		return {
			brew : {
				text  : '',
				style : ''
			},

			onTextChange  : ()=>{},
			onStyleChange : ()=>{},
			onMetaChange  : ()=>{},
			onSnipChange  : ()=>{},
			reportError   : ()=>{},

			onCursorPageChange : ()=>{},
			onViewPageChange   : ()=>{},

			editorTheme : 'default',
			renderer    : 'legacy',

			currentEditorCursorPageNum : 1,
			currentEditorViewPageNum   : 1,
			currentBrewRendererPageNum : 1,
		};
	},
	getInitialState : function() {
		return {
			editorTheme      : this.props.editorTheme,
			view             : 'text', //'text', 'style', 'meta', 'snippet'
			snippetbarHeight : 25
		};
	},

	editor     : React.createRef(null),

	isText  : function() {return this.state.view == 'text';},
	isStyle : function() {return this.state.view == 'style';},
	isMeta  : function() {return this.state.view == 'meta';},
	isSnip  : function() {return this.state.view == 'snippet';},

	componentDidMount : function() {

		this.highlightCustomMarkdown();
		document.getElementById('BrewRenderer').addEventListener('keydown', this.handleControlKeys);
		document.addEventListener('keydown', this.handleControlKeys);

		// CodeMirror handlers are only relevant when CodeMirror is mounted (style/snippet tabs)
		// Text tab now uses TipTap editor which handles its own events
		try {
			if (!this.isText()) {
				this.codeEditor.current?.codeMirror?.on('cursorActivity', (cm)=>{this.updateCurrentCursorPage(cm.getCursor());});
				this.codeEditor.current?.codeMirror?.on('scroll', _.throttle(()=>{this.updateCurrentViewPage(this.codeEditor.current.getTopVisibleLine());}, 200));
			}
		} catch(_) {}

		const editorTheme = window.localStorage.getItem(EDITOR_THEME_KEY);
		if(editorTheme) {
			this.setState({
				editorTheme : editorTheme
			});
		}
		this.setState({ snippetbarHeight: document.querySelector('.editor > .snippetBar').offsetHeight });
	},

	componentDidUpdate : function(prevProps, prevState, snapshot) {

		this.highlightCustomMarkdown();
		if(prevProps.moveBrew !== this.props.moveBrew)
			this.brewJump();

		if(prevProps.moveSource !== this.props.moveSource)
			this.sourceJump();

		if(this.props.liveScroll) {
			if(prevProps.currentBrewRendererPageNum !== this.props.currentBrewRendererPageNum) {
				this.sourceJump(this.props.currentBrewRendererPageNum, false);
			} else if(prevProps.currentEditorViewPageNum !== this.props.currentEditorViewPageNum) {
				this.brewJump(this.props.currentEditorViewPageNum, false);
			} else if(prevProps.currentEditorCursorPageNum !== this.props.currentEditorCursorPageNum) {
				this.brewJump(this.props.currentEditorCursorPageNum, false);
			}
		}
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey && e.metaKey && e.shiftKey)) return;
		const LEFTARROW_KEY = 37;
		const RIGHTARROW_KEY = 39;
		if(e.keyCode == RIGHTARROW_KEY) this.brewJump();
		if(e.keyCode == LEFTARROW_KEY) this.sourceJump();
		if(e.keyCode == LEFTARROW_KEY || e.keyCode == RIGHTARROW_KEY) {
			e.stopPropagation();
			e.preventDefault();
		}
	},

	updateCurrentCursorPage : function(cursor) {
		// Skip if brew.text is TipTap JSON (not markdown string)
		if (typeof this.props.brew.text !== 'string') return;
		
		const lines = this.props.brew.text.split('\n').slice(1, cursor.line + 1);
		const pageRegex = this.props.brew.renderer == 'V3' ? PAGEBREAK_REGEX_V3 : /\\page/;
		const currentPage = lines.reduce((count, line)=>count + (pageRegex.test(line) ? 1 : 0), 1);
		this.props.onCursorPageChange(currentPage);
	},

	updateCurrentViewPage : function(topScrollLine) {
		// Skip if brew.text is TipTap JSON (not markdown string)
		if (typeof this.props.brew.text !== 'string') return;
		
		const lines = this.props.brew.text.split('\n').slice(1, topScrollLine + 1);
		const pageRegex = this.props.brew.renderer == 'V3' ? PAGEBREAK_REGEX_V3 : /\\page/;
		const currentPage = lines.reduce((count, line)=>count + (pageRegex.test(line) ? 1 : 0), 1);
		this.props.onViewPageChange(currentPage);
	},

	handleInject : function(injectText){
		// For TipTap text editor, use the editor's insertContent method
		if (this.state.view === 'text' && this.tipTapEditor.current) {
			this.tipTapEditor.current.insertContent(injectText);
		} else if (this.codeEditor.current?.injectText) {
			// CodeMirror for style/snippet tabs
			this.codeEditor.current.injectText(injectText, false);
		}
	},

	handleViewChange : function(newView){
		this.props.setMoveArrows(newView === 'text');
		
		this.setState({
			view : newView
		}, ()=>{
			// Only focus CodeMirror for style/snippet tabs, not text tab (using TipTap)
			if (newView !== 'text') {
				this.codeEditor.current?.codeMirror?.focus();
			}
		});
	},

	handleAiContentGenerate : function(content, replaceAll = false) {
		// Handle both content insertion and full document replacement
		const editor = this.codeEditor.current;
		if (editor) {
			if (replaceAll) {
				// Replace entire document with new content
				this.props.onTextChange(content);
			} else {
				// Insert AI-generated content at current cursor position (original behavior)
				const currentText = this.props.brew.text;
				const newText = currentText + '\n\n' + content + '\n\n';
				this.props.onTextChange(newText);
			}
		}
	},

	handleInlineEdit : function(selectionStart, selectionEnd, newText) {
		// Handle inline text replacement
		const currentText = this.props.brew.text;
		const beforeSelection = currentText.substring(0, selectionStart);
		const afterSelection = currentText.substring(selectionEnd);
		const updatedText = beforeSelection + newText + afterSelection;
		this.props.onTextChange(updatedText);
	},

	getText : function() {
		return this.props.brew.text || '';
	},

	setText : function(newText) {
		this.props.onTextChange(newText);
	},

	highlightCustomMarkdown : function(){
		// Skip highlighting for text view (now using TipTap) - only apply to snippet view
		if(!this.codeEditor.current) return;
		if(this.state.view === 'snippet') {
			const codeMirror = this.codeEditor.current.codeMirror;

			codeMirror.operation(()=>{ // Batch CodeMirror styling

				const foldLines = [];

				//reset custom text styles
				const customHighlights = codeMirror.getAllMarks().filter((mark)=>{
					// Record details of folded sections
					if(mark.__isFold) {
						const fold = mark.find();
						foldLines.push({ from: fold.from?.line, to: fold.to?.line });
					}
					return !mark.__isFold;
				}); //Don't undo code folding

				for (let i=customHighlights.length - 1;i>=0;i--) customHighlights[i].clear();

				let userSnippetCount = 1; // start snippet count from snippet 1
				let editorPageCount = 1; // start page count from page 1

				const whichSource = this.state.view === 'text' ? this.props.brew.text : this.props.brew.snippets;
				_.forEach(whichSource?.split('\n'), (line, lineNumber)=>{

					const tabHighlight = this.state.view === 'text' ? 'pageLine' : 'snippetLine';
					const textOrSnip = this.state.view === 'text';

					//reset custom line styles
					codeMirror.removeLineClass(lineNumber, 'background', 'pageLine');
					codeMirror.removeLineClass(lineNumber, 'background', 'snippetLine');
					codeMirror.removeLineClass(lineNumber, 'text');
					codeMirror.removeLineClass(lineNumber, 'wrap', 'sourceMoveFlash');

					// Don't process lines inside folded text
					// If the current lineNumber is inside any folded marks, skip line styling
					if(foldLines.some((fold)=>lineNumber >= fold.from && lineNumber <= fold.to))
						return;

					// Styling for \page breaks
					if((this.props.renderer == 'legacy' && line.includes('\\page')) ||
				     (this.props.renderer == 'V3'     && line.match(textOrSnip ? PAGEBREAK_REGEX_V3 : SNIPPETBREAK_REGEX_V3))) {

						if((lineNumber > 0) && (textOrSnip))      // Since \page is optional on first line of document,
							editorPageCount += 1; // don't use it to increment page count; stay at 1
						else if(this.state.view !== 'text')	userSnippetCount += 1;

						// add back the original class 'background' but also add the new class '.pageline'
						codeMirror.addLineClass(lineNumber, 'background', tabHighlight);
						const pageCountElement = Object.assign(document.createElement('span'), {
							className   : 'editor-page-count',
							textContent : textOrSnip ? editorPageCount : userSnippetCount
						});
						codeMirror.setBookmark({ line: lineNumber, ch: line.length }, pageCountElement);
					};


					// New Codemirror styling for V3 renderer
					if(this.props.renderer === 'V3') {
						if(line.match(/^\\column(?:break)?$/)){
							codeMirror.addLineClass(lineNumber, 'text', 'columnSplit');
						}

						// definition lists
						if(line.includes('::')){
							if(/^:*$/.test(line) == true){ return; };
							const regex = /^([^\n]*?:?\s?)(::[^\n]*)(?:\n|$)/ymd;  // the `d` flag, for match indices, throws an ESLint error.
							let match;
							while ((match = regex.exec(line)) != null){
								codeMirror.markText({ line: lineNumber, ch: match.indices[0][0] }, { line: lineNumber, ch: match.indices[0][1] }, { className: 'dl-highlight' });
								codeMirror.markText({ line: lineNumber, ch: match.indices[1][0] }, { line: lineNumber, ch: match.indices[1][1] }, { className: 'dt-highlight' });
								codeMirror.markText({ line: lineNumber, ch: match.indices[2][0] }, { line: lineNumber, ch: match.indices[2][1] }, { className: 'dd-highlight' });
								const ddIndex = match.indices[2][0];
								const colons = /::/g;
								const colonMatches = colons.exec(match[2]);
								if(colonMatches !== null){
									codeMirror.markText({ line: lineNumber, ch: colonMatches.index + ddIndex }, { line: lineNumber, ch: colonMatches.index + colonMatches[0].length + ddIndex }, { className: 'dl-colon-highlight' });
								}
							}
						}

						// Subscript & Superscript
						if(line.includes('^')) {
							let startIndex = line.indexOf('^');
							const superRegex = /\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^/gy;
							const subRegex   = /\^\^(?!\s)(?=([^\n\^]*[^\s\^]))\1\^\^/gy;

							while (startIndex >= 0) {
								superRegex.lastIndex = subRegex.lastIndex = startIndex;
								let isSuper = false;
								const match = subRegex.exec(line) || superRegex.exec(line);
								if(match) {
									isSuper = !subRegex.lastIndex;
									codeMirror.markText({ line: lineNumber, ch: match.index }, { line: lineNumber, ch: match.index + match[0].length }, { className: isSuper ? 'superscript' : 'subscript' });
								}
								startIndex = line.indexOf('^', Math.max(startIndex + 1, subRegex.lastIndex, superRegex.lastIndex));
							}
						}

						// Highlight injectors {style}
						if(line.includes('{') && line.includes('}')){
							const regex = /(?:^|[^{\n])({(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\2})/gm;
							let match;
							while ((match = regex.exec(line)) != null) {
								codeMirror.markText({ line: lineNumber, ch: line.indexOf(match[1]) }, { line: lineNumber, ch: line.indexOf(match[1]) + match[1].length }, { className: 'injection' });
							}
						}
						// Highlight inline spans {{content}}
						if(line.includes('{{') && line.includes('}}')){
							const regex = /{{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1 *|}}/g;
							let match;
							let blockCount = 0;
							while ((match = regex.exec(line)) != null) {
								if(match[0].startsWith('{')) {
									blockCount += 1;
								} else {
									blockCount -= 1;
								}
								if(blockCount < 0) {
									blockCount = 0;
									continue;
								}
								codeMirror.markText({ line: lineNumber, ch: match.index }, { line: lineNumber, ch: match.index + match[0].length }, { className: 'inline-block' });
							}
						} else if(line.trimLeft().startsWith('{{') || line.trimLeft().startsWith('}}')){
							// Highlight block divs {{\n Content \n}}
							let endCh = line.length+1;

							const match = line.match(/^ *{{(?=((?:[:=](?:"[\w,\-()#%. ]*"|[\w\-()#%.]*)|[^"':={}\s]*)*))\1 *$|^ *}}$/);
							if(match)
								endCh = match.index+match[0].length;
							codeMirror.markText({ line: lineNumber, ch: 0 }, { line: lineNumber, ch: endCh }, { className: 'block' });
						}

						// Emojis
						if(line.match(/:[^\s:]+:/g)) {
							let startIndex = line.indexOf(':');
							const emojiRegex = /:[^\s:]+:/gy;

							while (startIndex >= 0) {
								emojiRegex.lastIndex = startIndex;
								const match = emojiRegex.exec(line);
								if(match) {
									// Note: Markdown.marked.lexer removed with markdown.js migration
									// Emoji syntax highlighting disabled for CodeMirror
									// TipTap handles emoji rendering in the text editor
									// This code only affects style/snippet tabs which still use CodeMirror
								}
								startIndex = line.indexOf(':', Math.max(startIndex + 1, emojiRegex.lastIndex));
							}
						}
					}
				});
			});
		}
	},

	brewJump : function(targetPage=this.props.currentEditorCursorPageNum, smooth=true){
		if(!window || !this.isText() || isJumping)
			return;

		// Get current brewRenderer scroll position and calculate target position
		const brewRenderer = window.frames['BrewRenderer'].contentDocument.getElementsByClassName('brewRenderer')[0];
		const currentPos = brewRenderer.scrollTop;
		const targetPos = window.frames['BrewRenderer'].contentDocument.getElementById(`p${targetPage}`).getBoundingClientRect().top;

		const checkIfScrollComplete = ()=>{
			let scrollingTimeout;
			clearTimeout(scrollingTimeout); // Reset the timer every time a scroll event occurs
			scrollingTimeout = setTimeout(()=>{
				isJumping = false;
				brewRenderer.removeEventListener('scroll', checkIfScrollComplete);
			}, 150);	// If 150 ms pass without a brewRenderer scroll event, assume scrolling is done
		};

		isJumping = true;
		checkIfScrollComplete();
		brewRenderer.addEventListener('scroll', checkIfScrollComplete);

		if(smooth) {
			const bouncePos   = targetPos >= 0 ? -30 : 30; //Do a little bounce before scrolling
			const bounceDelay = 100;
			const scrollDelay = 500;

			if(!this.throttleBrewMove) {
				this.throttleBrewMove = _.throttle((currentPos, bouncePos, targetPos)=>{
					brewRenderer.scrollTo({ top: currentPos + bouncePos, behavior: 'smooth' });
					setTimeout(()=>{
						brewRenderer.scrollTo({ top: currentPos + targetPos, behavior: 'smooth', block: 'start' });
					}, bounceDelay);
				}, scrollDelay, { leading: true, trailing: false });
			};
			this.throttleBrewMove(currentPos, bouncePos, targetPos);
		} else {
			brewRenderer.scrollTo({ top: currentPos + targetPos, behavior: 'instant', block: 'start' });
		}
	},

	sourceJump : function(targetPage=this.props.currentBrewRendererPageNum, smooth=true){
		if(!this.isText() || isJumping)
			return;

		// TipTap editor doesn't have the same line-based API as CodeMirror
		// For now, we'll skip page jumping in text view
		console.log('TipTap sourceJump not yet implemented - target page:', targetPage);
		// TODO: Implement page jumping for TipTap editor
		return;
	},

	//Called when there are changes to the editor's dimensions
	update : function(){
		this.codeEditor.current?.updateSize();
		const snipHeight = document.querySelector('.editor > .snippetBar').offsetHeight;
		if(snipHeight !== this.state.snippetbarHeight)
			this.setState({ snippetbarHeight: snipHeight });
	},

	updateEditorTheme : function(newTheme){
		window.localStorage.setItem(EDITOR_THEME_KEY, newTheme);
		this.setState({
			editorTheme : newTheme
		});
	},

	//Called by CodeEditor after document switch, so Snippetbar can refresh UndoHistory
	rerenderParent : function (){
		this.forceUpdate();
	},

	renderEditor : function(){
		if(this.isText()){
			return <>
				<div style={{ height: `calc(100% - ${this.state.snippetbarHeight}px)` }}>
					<TipTapEditor
						ref={this.tipTapEditor}
						value={this.props.brew.text || { type: 'doc', content: [{ type: 'paragraph' }] }}
						onChange={this.props.onTextChange}
						onCursorPageChange={this.props.onCursorPageChange}
						onViewPageChange={this.props.onViewPageChange}
						renderer={this.props.renderer}
					/>
				</div>
			</>;
		}
		if(this.isStyle()){
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='css'
					view={this.state.view}
					value={this.props.brew.style ?? DEFAULT_STYLE_TEXT}
					onChange={this.props.onStyleChange}
					enableFolding={true}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent}
					style={{  height: `calc(100% - ${this.state.snippetbarHeight}px)` }} />
			</>;
		}
		if(this.isMeta()){
			return <>
				<CodeEditor key='codeEditor'
					view={this.state.view}
					style={{ display: 'none' }}
					rerenderParent={this.rerenderParent} />
				<MetadataEditor
					metadata={this.props.brew}
					themeBundle={this.props.themeBundle}
					onChange={this.props.onMetaChange}
					reportError={this.props.reportError}
					userThemes={this.props.userThemes}/>
			</>;
		}

		if(this.isSnip()){
			if(!this.props.brew.snippets) { this.props.brew.snippets = DEFAULT_SNIPPET_TEXT; }
			return <>
				<CodeEditor key='codeEditor'
					ref={this.codeEditor}
					language='gfm'
					view={this.state.view}
					value={this.props.brew.snippets}
					onChange={this.props.onSnipChange}
					enableFolding={true}
					editorTheme={this.state.editorTheme}
					rerenderParent={this.rerenderParent}
					style={{  height: `calc(100% - ${this.state.snippetbarHeight}px)` }} />
			</>;
		}
	},

	redo : function(){
	return this.codeEditor.current?.redo?.();
	},

	historySize : function(){
	return this.codeEditor.current?.historySize?.();
	},

	undo : function(){
	return this.codeEditor.current?.undo?.();
	},

	foldCode : function(){
	return this.codeEditor.current?.foldAllCode?.();
	},

	unfoldCode : function(){
	return this.codeEditor.current?.unfoldAllCode?.();
	},

	onAiContentGenerate: function(newText) {
		try {
			if (this.props.onTextChange) {
				this.props.onTextChange(newText);
			} else if (window.editor && window.editor.setValue) {
				window.editor.setValue(newText);
			}
		} catch (e) {
			console.error('AI content generate failed:', e);
		}
	},

	render : function(){
		return (
			<div className='editor'>
				<SnippetBar
					brew={this.props.brew}
					view={this.state.view}
					onViewChange={this.handleViewChange}
					onInject={this.handleInject}
					showEditButtons={this.props.showEditButtons}
					renderer={this.props.renderer}
					theme={this.props.brew.theme}
					undo={this.undo}
					redo={this.redo}
					foldCode={this.foldCode}
					unfoldCode={this.unfoldCode}
					historySize={this.historySize()}
					currentEditorTheme={this.state.editorTheme}
					updateEditorTheme={this.updateEditorTheme}
					themeBundle={this.props.themeBundle}
					cursorPos={this.codeEditor.current?.getCursorPosition() || {}}
					updateBrew={this.props.updateBrew}
				/>

				{/* Temporarily disabled for debugging
				<GraphPanel
					brew={this.props.brew}
				/>

				<InlineEditor
					brew={this.props.brew}
					getText={this.getText}
					setText={this.setText}
					onInlineEdit={this.handleInlineEdit}
				/>
				*/}

				{this.renderEditor()}
		</div>
	);
	}
});

export default Editor;
