/* eslint-disable max-lines */
import './editPage.less';
import React from 'react';
import _ from 'lodash';
import createClass from 'create-react-class';
// Removed: import * as diffMatchPatch, md5, gzipSync - no longer needed with JSON-based saves

import request from '../../utils/request-middleware.js';
import { prefixPath, stripPrefix } from '../../utils/basePath.js';
import { Meta } from 'vitreum/headtags';
import { ensureJson, toPlainText } from 'shared/contentAdapter.js';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';

import ErrorNavItem from '../../navbar/error-navitem.jsx';
import Account from '../../navbar/account.navitem.jsx';
import MythwrightProjectWizard from '../../components/project-creation/mythwright-project-wizard.jsx';

// Tidewatch editor chrome. New Brew / Help / Get PDF / Vault / Recent brews all
// used to be items in the global top bar; BUILD-BRIEF section 9 puts Mythforge's
// navigation in the sticky sub-bar and Share / Export PDF on its right-hand end,
// so they are imported from there now instead of crowding the global nav.
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import ShareDialog from '../../components/shareDialog/shareDialog.jsx';
import { ART, cssUrl } from '../../../art/tidewatch/art.js';

import SplitPane from 'client/components/splitPane/splitPane.jsx';
import ToastHost from 'client/components/toast.jsx';
import Editor from '../../editor/editor.jsx';
import BrewRenderer from '../../brewRenderer/brewRenderer.jsx';
import AiSidebar from '../../editor/aiSidebar/aiSidebar.jsx';

import LockNotification from './lockNotification/lockNotification.jsx';

// Removed: import Markdown from 'naturalcrit/markdown.js';
// Now using contentAdapter for TipTap JSON compatibility

import { DEFAULT_BREW_LOAD } from '../../../../server/brewDefaults.js';
import { printCurrentBrew, fetchThemeBundle } from '../../../../shared/helpers.js';
import { markdownToTiptap } from '../../../../shared/helpers/markdownToTiptap.js';

import { updateHistory, versionHistoryGarbageCollection } from '../../utils/versionHistory.js';

import googleDriveIcon from '../../googleDrive.svg';
import Icon from 'client/components/Icon.jsx';

const SAVE_TIMEOUT = 10000;

const EditPage = createClass({
	displayName     : 'EditPage',
	getDefaultProps : function() {
		return {
			brew : DEFAULT_BREW_LOAD
		};
	},

	getInitialState : function() {
		return {
			brew                       : this.props.brew,
			isSaving                   : false,
			unsavedChanges             : false,
			alertTrashedGoogleBrew     : this.props.brew.trashed,
			alertLoginToTransfer       : false,
			saveGoogle                 : this.props.brew.googleId ? true : false,
			confirmGoogleTransfer      : false,
			error                      : null,
			htmlErrors                 : [], // Validation disabled for TipTap
			url                        : '',
			autoSave                   : true,
			autoSaveWarning            : false,
			unsavedTime                : new Date(),
			currentEditorViewPageNum   : 1,
			currentEditorCursorPageNum : 1,
			currentBrewRendererPageNum : 1,
			displayLockMessage         : this.props.brew.lock || false,
			themeBundle                : {},
			_loadingBrew               : false,
			// The share dialog - what "Collaborate" became. Opens from the
			// Mythforge bar's Share button, or straight away when the page was
			// reached through /collaborate/:id.
			showShare                  : this.props.openShare || false
		};
	},

	editor    : React.createRef(null),
	mythwrightWizard : React.createRef(null),
	savedBrew : null,

	// Derive nearest section (H1) title for current cursor page
	getCurrentSectionHint : function(){
		try {
			const text = this.state.brew?.text;
			if (!text) return this.state.brew?.title || '';

			// TipTap JSON - extract headings from document nodes
			if (typeof text === 'object' && text.type === 'doc') {
				const headings = [];
				const nodes = text.content || [];
				let pageCount = 0;
				const targetPage = (this.state.currentEditorCursorPageNum || 1) - 1;
				for (const node of nodes) {
					if (node.type === 'pageBreak') pageCount++;
					if (pageCount > targetPage) break;
					if (node.type === 'heading' && node.attrs?.level === 1) {
						const headingText = (node.content || []).map((n) => n.text || '').join('');
						if (headingText.trim()) headings.push(headingText.trim());
					}
				}
				return headings.length > 0 ? headings[headings.length - 1] : (this.state.brew?.title || '');
			}

			// Legacy string-based content
			const renderer = this.state.brew?.renderer || 'V3';
			const pageRegexV3 = /^(?=\\page(?:break)?(?: *{[^\n{}]*})?$)/m;
			const splitPattern = renderer === 'V3' ? pageRegexV3 : /\\page/;
			const pages = String(text).split(splitPattern);
			const idx = Math.max(0, (this.state.currentEditorCursorPageNum||1) - 1);
			const uptoText = pages.slice(0, Math.min(pages.length, idx+1)).join('\n');
			const headingRegex = /^#\s+(.+)$/gm;
			let match, last = null;
			while((match = headingRegex.exec(uptoText))){ last = match[1]; }
			return (last && last.trim()) || (this.state.brew?.title || '');
		} catch (_) { return this.state.brew?.title || ''; }
	},

	// --- Mythwright Orchestrator (Beta) ---
	orchestrateAiEdit : async function(){
		try {
			const message = window.prompt('What should the AI do? (e.g., "Add an encounter with 3 goblins")');
			if(!message || !message.trim()) return;
			const defaultHint = this.getCurrentSectionHint();
			const sectionHint = window.prompt('Section hint (e.g., "Glintstone Cave" or "Chapter 3")', defaultHint) || '';

			// Call orchestrator
			const postRes = await request
				.post(`/api/story/orchestrate/${this.state.brew.editId}`)
				.send({ message, cursor: { sectionHint } })
				.catch((err)=>{
					console.error('Orchestrator error', err);
					this.setState({ error: err });
				});
			if(!postRes || !postRes.body?.success){ return; }
			// Prefer direct fullText from orchestrator for immediate UX
			if(postRes.body.fullText && typeof postRes.body.fullText === 'string'){
				this.handleTextChange(postRes.body.fullText);
				this.trySave(true);
				const applied = postRes.body.applied ?? 0;
				try {
					if (applied > 0) {
						if (window.NCToast && typeof window.NCToast.show === 'function') {
							window.NCToast.show({ message: `AI applied ${applied} action(s).`, type: 'success', duration: 3000 });
						}
					}
				} catch(_) { /* no-op in non-window env */ }
				return;
			}

			// Fetch the active version's full text
			const verRes = await request
				.get(`/api/story/version/${this.state.brew.editId}/active`)
				.catch((err)=>{
					console.error('Fetch active version error', err);
					this.setState({ error: err });
				});
			const newText = verRes?.body?.version?.fullText;
			if(newText && typeof newText === 'string'){
				// Update editor text and persist via normal save flow
				this.handleTextChange(newText);
				this.trySave(true);
			}
		} catch (e){
			console.error('AI orchestrate failed:', e);
			this.setState({ error: e });
		}
	},

	componentDidMount : function(){
		this.setState({
			url : window.location.href
		});

		this.savedBrew = JSON.parse(JSON.stringify(this.props.brew)); //Deep copy

		// In dev mode (Vite), /edit/:id loads client-only. Ensure we fetch the brew before autosave triggers.
		// /collaborate/:id is the same page with the share dialog open, so it
		// needs the same brew - without it the dialog offered to share an
		// empty untitled document.
		const pathMatch = stripPrefix(window.location.pathname).match(/^\/(?:edit|collaborate)\/([^/]+)$/);
		if (pathMatch && (!this.props.brew || !this.props.brew.editId)) {
			const editId = pathMatch[1];
			this.setState({ _loadingBrew: true });
			request.get(`/api/brews/${editId}`)
				.then((res)=>{
					if (res && res.body && res.body.success && res.body.brew) {
						this.savedBrew = JSON.parse(JSON.stringify(res.body.brew));
						this.setState({ brew: res.body.brew, _loadingBrew: false }, ()=>{
							this.initializeAutosave();
							fetchThemeBundle(this, res.body.brew.renderer, res.body.brew.theme);
						});
					} else {
						this.setState({ _loadingBrew: false }, ()=>{
							this.initializeAutosave();
						});
					}
				})
				.catch((err)=>{
					console.error('Failed to fetch brew for edit:', err);
					this.setState({ _loadingBrew: false }, ()=>{
						this.initializeAutosave();
					});
				});
		}

		this.initializeAutosave();

		window.onbeforeunload = ()=>{
			if(this.state.isSaving || this.state.unsavedChanges){
				return 'You have unsaved changes!';
			}
		};

		// Validation disabled for TipTap
		this.setState({
			htmlErrors : []
		});

		fetchThemeBundle(this, this.props.brew.renderer, this.props.brew.theme);

		document.addEventListener('keydown', this.handleControlKeys);
	},

	initializeAutosave: function(){
		this.setState({ autoSave: JSON.parse(localStorage.getItem('AUTOSAVE_ON')) ?? true }, ()=>{
			if(this.state.autoSave){
				// Only attempt a save if we already have an editId or id
				const brewId = this.state.brew?.editId || this.state.brew?._id || this.state.brew?.id;
				if (brewId) this.trySave();
			} else {
				this.setState({ autoSaveWarning: true });
			}
		});
	},
	componentWillUnmount : function() {
		window.onbeforeunload = function(){};
		document.removeEventListener('keydown', this.handleControlKeys);
	},
	componentDidUpdate : function(){
		const hasChange = this.hasChanges();
		if(this.state.unsavedChanges != hasChange){
			this.setState({
				unsavedChanges : hasChange
			});
		}
	},

	handleControlKeys : function(e){
		if(!(e.ctrlKey || e.metaKey)) return;
		const S_KEY = 83;
		const P_KEY = 80;
		if(e.keyCode == S_KEY) this.trySave(true);
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
		// text can be TipTap JSON or legacy string
		const isJSON = (typeof text === 'object');
		
		// Validation disabled for TipTap - we trust the editor's output
		let htmlErrors = [];

		this.setState((prevState)=>({
			brew           : { ...prevState.brew, text: text },
			htmlErrors     : htmlErrors,
			unsavedChanges : true,
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleSnipChange : function(snippet){
		// Validation disabled for TipTap
		let htmlErrors = [];

		this.setState((prevState)=>({
			brew       : { ...prevState.brew, snippets: snippet },
			htmlErrors : htmlErrors,
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleStyleChange : function(style){
		this.setState((prevState)=>({
			brew : { ...prevState.brew, style: style }
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	handleMetaChange : function(metadata, field=undefined){
		if(field == 'theme' || field == 'renderer')	// Fetch theme bundle only if theme or renderer was changed
			fetchThemeBundle(this, metadata.renderer, metadata.theme);

		this.setState((prevState)=>({
			brew : {
				...prevState.brew,
				...metadata
			}
		}), ()=>{if(this.state.autoSave) this.trySave();});
	},

	hasChanges : function(){
		return !_.isEqual(this.state.brew, this.savedBrew);
	},

	updateBrew : function(newData){
		this.setState((prevState)=>({
			brew : {
				...prevState.brew,
				style    : newData.style,
				text     : newData.text,
				snippets : newData.snippets
			}
		}));
	},

	trySave : function(immediate=false){
		if (this.state._loadingBrew) return; // do nothing while loading
		if(!this.debounceSave) this.debounceSave = _.debounce(this.save, SAVE_TIMEOUT);
		if(this.state.isSaving)
			return;

		if(immediate) {
			this.debounceSave();
			this.debounceSave.flush();
			return;
		}
		
		if(this.hasChanges())
			this.debounceSave();
		else
			this.debounceSave.cancel();
	},

	handleGoogleClick : function(){
		if(!global.account?.googleId) {
			this.setState({
				alertLoginToTransfer : true
			});
			return;
		}
		this.setState((prevState)=>({
			confirmGoogleTransfer : !prevState.confirmGoogleTransfer
		}));
		this.setState({
			error    : null
		});
	},

	closeAlerts : function(event){
		event.stopPropagation();	//Only handle click once so alert doesn't reopen
		this.setState({
			alertTrashedGoogleBrew : false,
			alertLoginToTransfer   : false,
			confirmGoogleTransfer  : false
		});
	},

	toggleGoogleStorage : function(){
		this.setState((prevState)=>({
			saveGoogle : !prevState.saveGoogle,
			error      : null
		}), ()=>this.trySave(true));
	},

	save : async function(){
		if(this.debounceSave && this.debounceSave.cancel) this.debounceSave.cancel();

		if (this.state._loadingBrew) {
			console.warn('[Save] Blocked while brew is loading.');
			return;
		}

		const brewState       = this.state.brew; // freeze the current state
		const preSaveSnapshot = { ...brewState };

		// Validation disabled for TipTap
		this.setState({
			isSaving   : true,
			error      : null,
			htmlErrors : []
		});

		await updateHistory(this.state.brew).catch(console.error);
		await versionHistoryGarbageCollection().catch(console.error);

		// Get the brewId - prefer editId, fallback to _id
		const brewId = brewState.editId || brewState._id || brewState.id;
		
		// If no brewId exists, only allow create when not already on /edit/:id
		if (!brewId) {
			console.log('[Save] No brewId - creating new brew');
			console.log('[Save] brewState.text:', brewState.text);
			console.log('[Save] brewState.text type:', typeof brewState.text);

			const isEditRoute = /^\/edit\//.test(stripPrefix(window.location.pathname));
			if (isEditRoute) {
				console.warn('[Save] Refusing to create a new brew while on /edit route with missing id.');
				try { window.NCToast?.show?.({ message: 'Cannot save yet—loading project…', type: 'error', duration: 2500 }); } catch(_) {}
				this.setState({ isSaving: false });
				return;
			}
			
			const payload = {
				title: brewState.title || 'Untitled Brew',
				text: brewState.text,
				renderer: brewState.renderer || 'V3',
				theme: brewState.theme || 'Tome',
				style: brewState.style || '',
				description: brewState.description || ''
			};

			console.log('[Save] Payload:', JSON.stringify(payload, null, 2));

			const res = await request
				.post('/api/brews')
				.send(payload)
				.catch((err)=>{
					console.error('[Save] Error creating new brew:', err);
					console.error('[Save] Error details:', err.response?.body);
					this.setState({ error: err, isSaving: false });
				});
				
			if(!res) return;

			console.log('[Save] New brew created:', res.body);

			// Navigate to the edit page for the new brew
			const editId = res.body.brew?.editId || res.body.editId;
			// Reset unsaved changes & remove beforeunload handler to prevent prompt
			this.setState({ unsavedChanges: false, isSaving: false }, ()=>{
				window.onbeforeunload = null; // explicitly clear
				// Use replace so back button doesn't go to temporary unsaved page
				window.location.replace(prefixPath(`/edit/${editId}`));
			});
			return;
		}

		//Prepare content to send to server
		const payload = {
			title: brewState.title,
			text: brewState.text, // Send TipTap JSON directly, no conversion
			renderer: brewState.renderer,
			theme: brewState.theme,
			style: brewState.style,
			description: brewState.description
		};

		console.log('[Save] Sending to /api/brews/' + brewId, {
			textType: typeof payload.text,
			textLength: typeof payload.text === 'object' ? JSON.stringify(payload.text).length : payload.text?.length
		});

		const res = await request
			.put(`/api/brews/${brewId}`)
			.send(payload)
			.catch((err)=>{
				console.error('[Save] Error updating brew:', err);
				this.setState({ error: err, isSaving: false });
			});
			
		if(!res) return;

		console.log('[Save] Success:', res.body);

		this.savedBrew = {
			...preSaveSnapshot,
			_id      : res.body.brew._id,
			editId   : res.body.brew.editId,
			shareId  : res.body.brew.shareId,
			googleId : res.body.brew.googleId || null
		};

		this.setState((prevState) => ({
			brew: {
				...prevState.brew,
				_id      : res.body.brew._id,
				editId   : res.body.brew.editId,
				shareId  : res.body.brew.shareId,
				googleId : res.body.brew.googleId || null
			},
			isSaving    : false,
			unsavedTime : new Date()
		}), ()=>{
			const hasChanges = this.hasChanges();
			this.setState({ unsavedChanges : hasChanges });
			if(!hasChanges){
				window.onbeforeunload = null; // no prompt needed after clean save
			}
		});

		history.replaceState(null, null, prefixPath(`/edit/${this.savedBrew.editId}`));
	},

	renderGoogleDriveIcon : function(){
		return <Nav.item className='googleDriveStorage' onClick={this.handleGoogleClick}>
			<img src={googleDriveIcon} className={this.state.saveGoogle ? '' : 'inactive'} alt='Google Drive icon'/>

			{this.state.confirmGoogleTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					{ this.state.saveGoogle
						?	`Would you like to transfer this brew from your Google Drive storage back to the Homebrewery?`
						: `Would you like to transfer this brew from the Homebrewery to your personal Google Drive storage?`
					}
					<br />
					<div className='confirm' onClick={this.toggleGoogleStorage}>
						Yes
					</div>
					<div className='deny'>
						No
					</div>
				</div>
			}

			{this.state.alertLoginToTransfer &&
				<div className='errorContainer' onClick={this.closeAlerts}>
					You must be signed in to a Google account to transfer
					between the homebrewery and Google Drive!
					<a target='_blank' rel='noopener noreferrer'
						href={`https://www.naturalcrit.com/login?redirect=${this.state.url}`}>
						<div className='confirm'>
							Sign In
						</div>
					</a>
					<div className='deny'>
						Not Now
					</div>
				</div>
			}

			{this.state.alertTrashedGoogleBrew &&
				<div className='errorContainer' onClick={this.closeAlerts}>
				This brew is currently in your Trash folder on Google Drive!<br />If you want to keep it, make sure to move it before it is deleted permanently!<br />
					<div className='confirm'>
						OK
					</div>
				</div>
			}
		</Nav.item>;
	},

	renderSaveButton : function(){

		// #1 - Currently saving, show SAVING
		if(this.state.isSaving){
			return <Nav.item className='save' icon='fas fa-spinner fa-spin'>saving...</Nav.item>;
		}

		// #2 - Unsaved changes exist, autosave is OFF and warning timer has expired, show AUTOSAVE WARNING
		if(this.state.unsavedChanges && this.state.autoSaveWarning){
			this.setAutosaveWarning();
			const elapsedTime = Math.round((new Date() - this.state.unsavedTime) / 1000 / 60);
			const text = elapsedTime == 0 ? 'Autosave is OFF.' : `Autosave is OFF, and you haven't saved for ${elapsedTime} minutes.`;

			return <Nav.item className='save error' icon='fas fa-exclamation-circle'>
			Reminder...
				<div className='errorContainer'>
					{text}
				</div>
			</Nav.item>;
		}

		// #3 - Unsaved changes exist, click to save, show SAVE NOW
		// Use trySave(true) instead of save() to use debounced save function
		if(this.state.unsavedChanges){
			return <Nav.item className='save' onClick={()=>this.trySave(true)} color='blue' icon='fas fa-save'>Save Now</Nav.item>;
		}
		// #4 - No unsaved changes, autosave is ON, show AUTO-SAVED
		if(this.state.autoSave){
			return <Nav.item className='save saved'>auto-saved.</Nav.item>;
		}
		// DEFAULT - No unsaved changes, show SAVED
		return <Nav.item className='save saved'>saved.</Nav.item>;
	},

	handleAutoSave : function(){
		if(this.warningTimer) clearTimeout(this.warningTimer);
		this.setState((prevState)=>({
			autoSave        : !prevState.autoSave,
			autoSaveWarning : prevState.autoSave
		}), ()=>{
			localStorage.setItem('AUTOSAVE_ON', JSON.stringify(this.state.autoSave));
		});
	},

	setAutosaveWarning : function(){
		setTimeout(()=>this.setState({ autoSaveWarning: false }), 4000);                           // 4 seconds to display
		this.warningTimer = setTimeout(()=>{this.setState({ autoSaveWarning: true });}, 900000);   // 15 minutes between warnings
		this.warningTimer;
	},

	errorReported : function(error) {
		this.setState({
			error
		});
	},

	renderAutoSaveButton : function(){
		return <Nav.item onClick={this.handleAutoSave}>
			Autosave <Icon icon={this.state.autoSave ? 'fas fa-power-off active' : 'fas fa-power-off'}/>
		</Nav.item>;
	},

	processShareId : function() {
		return this.state.brew.googleId && !this.state.brew.stubbed ?
					 this.state.brew.googleId + this.state.brew.shareId :
					 this.state.brew.shareId;
	},

	getRedditLink : function(){

		const shareLink = this.processShareId();
		const systems = this.props.brew.systems && this.props.brew.systems.length > 0 ? ` [${this.props.brew.systems.join(' - ')}]` : '';
		const title = `${this.props.brew.title} ${systems}`;
		// global.config.baseUrl is only filled in by a server render. In dev it
		// is undefined, which used to put the literal string "undefined" in
		// front of every shared link; the share dialog puts these URLs on
		// screen, so a wrong one is now visible rather than merely posted.
		const origin = global.config?.baseUrl
			|| (typeof window !== 'undefined' ? window.location.origin : '');
		const text = `Hey guys! I've been working on this homebrew. I'd love your feedback. Check it out.

**[Mythforge link](${origin}${prefixPath(`/share/${shareLink}`)})**`;

		return `https://www.reddit.com/r/UnearthedArcana/submit?title=${encodeURIComponent(title.toWellFormed())}&text=${encodeURIComponent(text)}`;
	},

	/* The status line under the writing pane, as the mock has it:
	 * "Markdown · 1,284 words · Page 1 of 14". Every number is measured from
	 * the document that is open - none of them is decorative. */
	getBrewStats : function(){
		const text = this.state.brew?.text;
		let words = 0;
		let pages = 1;

		try {
			if(text && typeof text === 'object' && text.type === 'doc'){
				pages = 1 + (text.content || []).filter((n)=>n.type === 'pageBreak').length;
				words = toPlainText(text).split(/\s+/).filter(Boolean).length;
			} else if(typeof text === 'string'){
				// A V3 page break is a `\page` on its own line; the legacy
				// renderer accepts it anywhere.
				pages = text.split(this.state.brew?.renderer === 'V3' ? /^\\page\b/m : /\\page/).length;
				words = text.split(/\s+/).filter(Boolean).length;
			}
		} catch (err) {
			// A malformed document must not take the status line - and with it
			// the whole editor - down with it.
			console.error('Could not measure the brew:', err);
		}

		return { words, pages };
	},

	toggleShare : function(open){
		this.setState((prev)=>({ showShare: open ?? !prev.showShare }));
	},

	/* The global top bar.
	 *
	 * BUILD-BRIEF section 9 splits the chrome in two: the global bar carries
	 * TaleForge's own identity and the account, and everything Mythforge owns
	 * moves to the sticky sub-bar below it. New Brew, Help, Get PDF, Vault and
	 * Recent brews all used to sit up here - at 1440 the row wrapped onto a
	 * second line and the items collided. They are in the sub-bar now.
	 *
	 * What stays: save state and the error item, because both report on the
	 * document you are editing right now and must never be a scroll away. */
	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<Nav.item className='brewTitle'>{this.state.brew.title || 'Untitled brew'}</Nav.item>
			</Nav.section>

			<Nav.section>
				{this.renderGoogleDriveIcon()}
				{this.state.error ?
					<ErrorNavItem error={this.state.error} parent={this}></ErrorNavItem> :
					<Nav.dropdown className='save-menu'>
						{this.renderSaveButton()}
						{this.renderAutoSaveButton()}
					</Nav.dropdown>
				}
				<Account />
			</Nav.section>

		</Navbar>;
	},

	/* The Mythforge sub-bar, with the editor's own actions on its right-hand
	 * end - "Share / Export PDF sit in the Mythforge bar" (section 9).
	 *
	 * The AI menu lost three items here: "AI Content Generator", "Budget
	 * Engine" and "Collaboration Tools" were all labels with no handler and no
	 * href behind them, so every one of them was a dead control. The first two
	 * have no implemented screen to point at; the third is this unit's share
	 * dialog, which now has its own button two places to the right. */
	renderMythforgeBar : function(){
		return <MythforgeBar active={this.props.mbarActive || 'brews'}>
			<Nav.dropdown className='mythwright-tools'>
				<button type='button' className='tide-mbar-tool'>
					<Icon icon='fas fa-wand-magic-sparkles' aria-hidden='true' />
					Mythforge AI
				</button>
				<Nav.item color='purple' icon='fas fa-dragon' onClick={()=>this.mythwrightWizard.current?.openModal()}>
					New AI campaign
				</Nav.item>
				<Nav.item color='blue' icon='fas fa-wand-magic-sparkles' onClick={this.orchestrateAiEdit}>
					AI orchestrate (beta)
				</Nav.item>
			</Nav.dropdown>

			<button
				type='button'
				className='tide-btn-quiet tide-mbar-action'
				onClick={()=>this.toggleShare(true)}
			>
				<Icon icon='fas fa-share-nodes' aria-hidden='true' />
				Share
			</button>
			<button
				type='button'
				className='tide-btn-primary tide-mbar-action'
				onClick={printCurrentBrew}
			>
				<Icon icon='far fa-file-pdf' aria-hidden='true' />
				Export PDF
			</button>
		</MythforgeBar>;
	},

	render : function(){
		// With the share dialog open the editor behind it is decoration: a
		// reader should not be able to tab into it, and a screen reader should
		// not walk it. Same treatment the template picker gets in M1, and it
		// is also what makes the contrast pass meaningful - text under a 72%
		// scrim is not text anybody is being asked to read.
		const behind = this.state.showShare
			? { 'aria-hidden': 'true', inert: '' }
			: {};

		return <div className='editPage sitePage tide-editor'>
			<Meta name='robots' content='noindex, nofollow' />

			<div className='tide-editor-stack' {...behind}>
				{/* The art band. Section 9: "Art appears only as a ~110px chrome
				  * band behind the top bar and the Mythforge bar." It stops at
				  * the writing surface - a texture behind body copy is exactly
				  * the parchment habit this redesign removes. */}
				<div
					className='tide-art tide-art-band'
					style={{
						'--tide-art-src'    : cssUrl(ART.workshop),
						'--tide-art-height' : '112px',
						'--tide-scrim'      : 'linear-gradient(180deg, rgba(9,13,16,.50), rgba(9,13,16,.72) 110px, var(--tide-bg) 112px)'
					}}
					role='presentation'
				/>

				{this.renderNavbar()}
				{this.renderMythforgeBar()}

				{this.props.brew.lock && <LockNotification shareId={this.props.brew.shareId} message={this.props.brew.lock.editMessage} reviewRequested={this.props.brew.lock.reviewRequested} />}
			<div className='content'>
				<SplitPane onDragFinish={this.handleSplitMove}>
					<Editor
						ref={this.editor}
						brewStats={this.getBrewStats()}
						brew={this.state.brew}
						onTextChange={this.handleTextChange}
						onStyleChange={this.handleStyleChange}
						onSnipChange={this.handleSnipChange}
						onMetaChange={this.handleMetaChange}
						reportError={this.errorReported}
						renderer={this.state.brew.renderer}
						userThemes={this.props.userThemes}
						themeBundle={this.state.themeBundle}
						updateBrew={this.updateBrew}
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
				<AiSidebar
					brew={this.state.brew}
					onContentGenerate={(content, replaceAll) => {
						if (replaceAll) {
							// Content from AI is a markdown string — convert to TipTap JSON
							if (typeof content === 'string') {
								this.handleTextChange(markdownToTiptap(content));
							} else {
								this.handleTextChange(content);
							}
						} else {
							// Append mode: convert AI content to TipTap JSON and merge content arrays
							const currentDoc = this.state.brew.text;
							if (typeof currentDoc === 'object' && currentDoc.type === 'doc') {
								const newDoc = typeof content === 'string' ? markdownToTiptap(content) : content;
								const mergedDoc = {
									type    : 'doc',
									content : [...(currentDoc.content || []), ...(newDoc.content || [])]
								};
								this.handleTextChange(mergedDoc);
							} else {
								// Fallback for legacy string text
								const newText = (currentDoc || '') + '\n\n' + content + '\n\n';
								this.handleTextChange(newText);
							}
						}
					}}
					onMetaChange={this.handleMetaChange}
				/>
			</div>
			
				<MythwrightProjectWizard ref={this.mythwrightWizard} />
				<ToastHost />
			</div>

			{this.state.showShare && <ShareDialog
				brew={this.state.brew}
				shareLink={this.processShareId()}
				redditLink={this.getRedditLink()}
				onClose={()=>this.toggleShare(false)}
			/>}
		</div>;
	}
});

export default EditPage;
