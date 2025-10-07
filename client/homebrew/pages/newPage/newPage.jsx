/*eslint max-lines: ["warn", {"max": 300, "skipBlankLines": true, "skipComments": true}]*/
import './newPage.less';
import React from 'react';
import createClass from 'create-react-class';
import request from '../../utils/request-middleware.js';

// Removed: import Markdown from 'naturalcrit/markdown.js';
// Validation disabled for TipTap - editor handles it

import Nav from 'naturalcrit/nav/nav.jsx';
import PrintNavItem from '../../navbar/print.navitem.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import ErrorNavItem from '../../navbar/error-navitem.jsx';
import { both as RecentNavItem } from '../../navbar/recent.navitem.jsx';
import HelpNavItem from '../../navbar/help.navitem.jsx';

import SplitPane from 'client/components/splitPane/splitPane.jsx';
import Editor from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';
import MythwrightProjectWizard from '../../components/project-creation/mythwright-project-wizard.jsx';

import { DEFAULT_BREW } from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle } from '../../../../shared/helpers.js';

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';
let SAVEKEY;


const NewPage = createClass({
	displayName     : 'NewPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW
		};
	},

	getInitialState : function() {
		const brew = this.props.brew;

		return {
			brew                       : brew,
			isSaving                   : false,
			saveGoogle                 : (global.account && global.account.googleId ? true : false),
			error                      : null,
			htmlErrors                 : [], // Validation disabled for TipTap
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			themeBundle                : {}
		};
	},

	editor : React.createRef(null),
	mythwrightWizard : React.createRef(null),

	componentDidMount : function() {
		document.addEventListener('keydown', this.handleControlKeys);

		const brew = this.state.brew;

		if(!this.props.brew.shareId && typeof window !== 'undefined') { //Load from localStorage if in client browser
			const brewStorage  = localStorage.getItem(BREWKEY);
			const styleStorage = localStorage.getItem(STYLEKEY);
			const metaStorage = JSON.parse(localStorage.getItem(METAKEY));

			brew.text  = brewStorage  ?? brew.text;
			brew.style = styleStorage ?? brew.style;
			// brew.title = metaStorage?.title || this.state.brew.title;
			// brew.description = metaStorage?.description || this.state.brew.description;
			brew.renderer = metaStorage?.renderer ?? brew.renderer;
			brew.theme    = metaStorage?.theme    ?? brew.theme;
			brew.lang     = metaStorage?.lang     ?? brew.lang;
		}

		SAVEKEY = `HOMEBREWERY-DEFAULT-SAVE-LOCATION-${global.account?.username || ''}`;
		const saveStorage = localStorage.getItem(SAVEKEY) || 'HOMEBREWERY';

		this.setState({
			brew       : brew,
			saveGoogle : (saveStorage == 'GOOGLE-DRIVE' && this.state.saveGoogle)
		});

		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);

		localStorage.setItem(BREWKEY, brew.text);
		if(brew.style)
			localStorage.setItem(STYLEKEY, brew.style);
		localStorage.setItem(METAKEY, JSON.stringify({ 'renderer': brew.renderer, 'theme': brew.theme, 'lang': brew.lang }));
		if(window.location.pathname != '/new') {
			window.history.replaceState({}, window.location.title, '/new/');
		}
	},
	componentWillUnmount : function() {
		document.removeEventListener('keydown', this.handleControlKeys);
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.save();
		if(e.keyCode == P_KEY) printCurrentBrew();
		if(e.keyCode == P_KEY || e.keyCode == S_KEY){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	handleSplitMove : function(){
		this.editor.current.update();
	},

	handleEditorViewPageChange : function(pageNumber){
		this.setState({ currentEditorViewPageNum: pageNumber });
	},

	handleEditorCursorPageChange : function(pageNumber){
		this.setState({ currentEditorCursorPageNum: pageNumber });
	},

	handleBrewRendererPageChange : function(pageNumber){
		this.setState({ currentBrewRendererPageNum: pageNumber });
	},

	handleTextChange : function(text){
		// Validation disabled for TipTap
		let htmlErrors = [];

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, text: text },
			htmlErrors : htmlErrors,
		}));
		localStorage.setItem(BREWKEY, text);
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, style: style },
		}));
		localStorage.setItem(STYLEKEY, style);
	},

	handleSnipChange : function(snippet){
		// Validation disabled for TipTap
		let htmlErrors = [];

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, snippets: snippet },
			htmlErrors : htmlErrors,
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleMetaChange : function(metadata, field=undefined){
		if(field == 'theme' || field == 'renderer')	// Fetch theme bundle only if theme or renderer was changed
			fetchThemeBundle(this, metadata.renderer, metadata.theme);

		this.setState((prevState)=>({
			brew : { ...prevState.brew, ...metadata },
		}), ()=>{
			localStorage.setItem(METAKEY, JSON.stringify({
				// 'title'       : this.state.brew.title,
				// 'description' : this.state.brew.description,
				'renderer' : this.state.brew.renderer,
				'theme'    : this.state.brew.theme,
				'lang'     : this.state.brew.lang
			}));
		});
		;
	},

	save : async function(){
		this.setState({
			isSaving : true
		});

		const brew = this.state.brew;
		
		// Note: CSS extraction from text no longer supported with TipTap JSON
		// Users should use the Style tab directly
		
		// Create new brew using /api/brews endpoint
		const payload = {
			title: brew.title,
			text: brew.text, // Send TipTap JSON directly
			style: brew.style,
			renderer: brew.renderer,
			theme: brew.theme,
			description: brew.description
		};

		console.log('[NewPage Save] Creating brew with payload:', {
			textType: typeof payload.text,
			textLength: typeof payload.text === 'object' ? JSON.stringify(payload.text).length : payload.text?.length
		});

		const res = await request
			.post(`/api/brews${this.state.saveGoogle ? '?saveToGoogle=true' : ''}`)
			.send(payload)
			.catch((err)=>{
				console.error('[NewPage Save] Error:', err);
				this.setState({ isSaving: false, error: err });
			});
			
		if(!res) return;

		console.log('[NewPage Save] Success:', res.body);
		
		// Clear localStorage
		localStorage.removeItem(BREWKEY);
		localStorage.removeItem(STYLEKEY);
		localStorage.removeItem(METAKEY);
		
		// Navigate to edit page
		const editId = res.body.brew?.editId || res.body.editId;
		window.location = `/edit/${editId}`;
	},

	renderSaveButton : function(){
		if(this.state.isSaving){
			return <Nav.item icon='fas fa-spinner fa-spin' className='save'>
				save...
			</Nav.item>;
		} else {
			return <Nav.item icon='fas fa-save' className='save' onClick={this.save}>
				save
			</Nav.item>;
		}
	},

	renderNavbar : function(){
		return <Navbar>

			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title}</Nav.item>
			</Nav.section>

			<Nav.section>
				<Nav.item color='purple' icon='fas fa-dragon' onClick={() => this.mythwrightWizard.current?.openModal()}>
					✨ New AI Campaign
				</Nav.item>
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					this.renderSaveButton()
				}
				<PrintNavItem />
				<HelpNavItem />
				<RecentNavItem />
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	},

	render : function(){
		return <div className='newPage sitePage'>
			{this.renderNavbar()}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}>
					<Editor
						ref={this.editor}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onMetaChange={this.handleMetaChange}
						onSnipChange={this.handleSnipChange}
						renderer={this.state.brew.renderer}
						userThemes={this.props.userThemes}
						themeBundle={this.state.themeBundle}
						onCursorPageChange={this.handleEditorCursorPageChange}
						onViewPageChange={this.handleEditorViewPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
					/>
					<BrewRenderer
						text={this.state.brew.text}
						style={this.state.brew.style}
						renderer={this.state.brew.renderer}
						theme={this.state.brew.theme}
						themeBundle={this.state.themeBundle}
						errors={this.state.htmlErrors}
						lang={this.state.brew.lang}
						onPageChange={this.handleBrewRendererPageChange}
						currentEditorViewPageNum={this.state.currentEditorViewPageNum}
						currentEditorCursorPageNum={this.state.currentEditorCursorPageNum}
						currentBrewRendererPageNum={this.state.currentBrewRendererPageNum}
						allowPrint={true}
					/>
				</SplitPane>
			</div>
			
			<MythwrightProjectWizard ref={this.mythwrightWizard} />
		</div>;
	}
});

export default NewPage;
