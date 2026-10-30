import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * MYTHFORGE SETTINGS - the 09 layout (mocks/09-profile-settings.html).
 *
 * BUILD-BRIEF section 9 routing fix: "settings should become a Mythforge tab
 * in TaleForge Settings (09 layout), or be removed". It was a top-bar item
 * pointing at a route that fell through to the home page - so clicking
 * Settings looked like the app had ignored you. Unit M1 took the item out of
 * the global bar; this gives the route something to be.
 *
 * EVERY SWITCH ON THIS PAGE IS A PREFERENCE SOME EXISTING CODE ALREADY
 * READS. That is the whole design rule here, and it is why the list is five
 * rows rather than twenty: a settings page of controls that change nothing is
 * worse than no settings page, because it looks like it worked.
 *
 *   AUTOSAVE_ON             pages/editPage/editPage.jsx:233
 *   liveScroll              client/components/splitPane/splitPane.jsx:22
 *   MF_AI_SIDEBAR_EXPANDED  editor/aiSidebar/aiSidebar.jsx:15
 *   MF_AUTO_APPLY_PATCHES   editor/aiSidebar/aiSidebar.jsx:30
 *   MF_AUTO_INDEX_RETRIEVAL editor/aiSidebar/aiSidebar.jsx:32
 *
 * Each of those reads its key on mount, so a change here takes effect the
 * next time the editor or the assistant opens - which is what the hint under
 * each group says, rather than implying a live effect it does not have.
 *
 * The two encodings are not a style choice: AUTOSAVE_ON is stored as JSON
 * ("true"/"false") because editPage JSON.parses it, and the MF_* keys are
 * stored as "1"/"0" because the sidebar compares them to '1'. Writing the
 * wrong one would silently turn the setting off.
 */

const BOOL_JSON = {
	read : (raw, fallback)=>{
		if(raw === null) return fallback;
		try { return JSON.parse(raw) === true; } catch { return fallback; }
	},
	write : (on)=>JSON.stringify(on)
};
const BOOL_FLAG = {
	read  : (raw, fallback)=>(raw === null ? fallback : raw === '1'),
	write : (on)=>(on ? '1' : '0')
};

const GROUPS = [
	{
		id       : 'editor',
		label    : 'Editor',
		title    : 'Editor',
		blurb    : 'Applied the next time you open a brew.',
		settings : [
			{
				key      : 'AUTOSAVE_ON',
				codec    : BOOL_JSON,
				fallback : true,
				name     : 'Autosave while you write',
				hint     : 'Saves a few seconds after you stop typing. Turn this off to save only when you press Save.'
			},
			{
				/* splitPane compares this to the STRING 'true' and writes
				 * String(!liveScroll), so it is the JSON codec, not the 1/0
				 * one the MF_* keys use. Writing '1' here left the setting
				 * reading as off no matter which way the switch was thrown -
				 * caught by the spec, which asserts the stored value rather
				 * than the switch's own aria-checked. */
				key      : 'liveScroll',
				codec    : BOOL_JSON,
				fallback : false,
				name     : 'Sync the editor and the preview',
				hint     : 'Scrolling one scrolls the other to the same place in the document.'
			}
		]
	},
	{
		id       : 'assistant',
		label    : 'Assistant',
		title    : 'Writing assistant',
		blurb    : 'Applied the next time the assistant panel opens.',
		settings : [
			{
				key      : 'MF_AI_SIDEBAR_EXPANDED',
				codec    : BOOL_FLAG,
				fallback : false,
				name     : 'Open the assistant panel by default',
				hint     : 'The panel starts expanded instead of collapsed to its edge.'
			},
			{
				key      : 'MF_AUTO_APPLY_PATCHES',
				codec    : BOOL_FLAG,
				fallback : false,
				name     : 'Apply the assistant’s edits automatically',
				hint     : 'Off, every suggested change waits for you to accept it.'
			},
			{
				key      : 'MF_AUTO_INDEX_RETRIEVAL',
				codec    : BOOL_FLAG,
				fallback : false,
				name     : 'Let the assistant read the rest of your brew',
				hint     : 'It searches your other chapters for context before answering.'
			}
		]
	},
	{
		id    : 'account',
		label : 'Account',
		title : 'Account'
	}
];

const ALL_SETTINGS = GROUPS.flatMap((g)=>g.settings || []);

const SettingsPage = createClass({
	displayName     : 'SettingsPage',
	getInitialState : function(){
		return { group: 'editor', values: {}, ready: false };
	},

	componentDidMount : function(){
		// localStorage is read in componentDidMount rather than in
		// getInitialState so this component stays renderable where there is no
		// window at all, and so a blocked store degrades to the defaults
		// instead of throwing on the way up.
		const values = {};
		for (const setting of ALL_SETTINGS) {
			let raw = null;
			try { raw = window.localStorage.getItem(setting.key); } catch { raw = null; }
			values[setting.key] = setting.codec.read(raw, setting.fallback);
		}
		this.setState({ values, ready: true });
	},

	toggle : function(setting){
		const next = !this.state.values[setting.key];
		this.setState((state)=>({ values: { ...state.values, [setting.key]: next } }));
		try {
			window.localStorage.setItem(setting.key, setting.codec.write(next));
		} catch (e) {
			// A full or blocked store must not leave the switch lying about
			// what it did.
			console.warn(`Could not save the ${setting.key} preference:`, e);
			this.setState((state)=>({ values: { ...state.values, [setting.key]: !next } }));
		}
	},

	renderSwitch : function(setting){
		const on = !!this.state.values[setting.key];
		return <div className='tide-setting' key={setting.key}>
			<div className='tide-setting-text'>
				<strong>{setting.name}</strong>
				<span>{setting.hint}</span>
			</div>
			<button
				type='button'
				role='switch'
				className='tide-switch'
				aria-checked={on ? 'true' : 'false'}
				aria-label={setting.name}
				disabled={!this.state.ready}
				onClick={()=>this.toggle(setting)}
			/>
		</div>;
	},

	renderAccount : function(){
		const account = global.account;
		const here = typeof window !== 'undefined' ? window.location.href : '';

		if(account?.username) {
			return <>
				<div className='tide-setting'>
					<div className='tide-setting-text'>
						<strong>{account.username}</strong>
						<span>Signed in. Your brews are saved to this account.</span>
					</div>
					<a className='tide-btn-quiet' href={prefixPath(`/user/${encodeURIComponent(account.username)}`)}>
						Your brews
					</a>
				</div>
				<div className='tide-setting'>
					<div className='tide-setting-text'>
						<strong>Account details</strong>
						<span>Where new brews are saved, and which services are linked.</span>
					</div>
					<a className='tide-btn-quiet' href={prefixPath('/account')}>Open account</a>
				</div>
			</>;
		}

		/* Sign-in is naturalcrit's, and replacing it with TaleForge auth is out
		 * of this lane's scope (see laneM-auth-note.md). Saying so plainly
		 * beats a disabled form that looks like it is about to work. */
		return <div className='tide-setting'>
			<div className='tide-setting-text'>
				<strong>You are not signed in</strong>
				<span>Brews you write are kept in this browser until you sign in. Mythforge signs in through naturalcrit.</span>
			</div>
			<a className='tide-btn-quiet' href={`https://www.naturalcrit.com/login?redirect=${encodeURIComponent(here)}`}>
				Sign in
			</a>
		</div>;
	},

	renderGroup : function(group){
		return <section className='tide-solid tide-panel' key={group.id}>
			<div className='tide-panel-head'>
				<h2>{group.title}</h2>
				{group.blurb ? <span className='tide-cap'>{group.blurb}</span> : null}
			</div>
			{group.id === 'account'
				? this.renderAccount()
				: group.settings.map((setting)=>this.renderSwitch(setting))}
		</section>;
	},

	render : function(){
		const current = GROUPS.find((g)=>g.id === this.state.group) || GROUPS[0];

		return <div className='homebrew tide-page settingsPage'>
			<div className='tide-page-stack'>
				<Navbar>
					<Nav.section>
						<AccountNavItem />
					</Nav.section>
				</Navbar>
				<MythforgeBar active='settings' />

				<div
					className='tide-art'
					style={{ '--tide-art-src': cssUrl(ART.campaignCover) }}
					role='presentation'
				/>

				<main className='tide-page-body'>
					<div className='tide-eyebrow'>Mythforge</div>
					<h1>Settings</h1>
					<p className='tide-lede'>
						Preferences for this browser. They are not tied to an account, so each
						device you write on keeps its own.
					</p>

					<div className='tide-two-col'>
						<nav className='tide-solid tide-sidenav' aria-label='Settings sections'>
							{GROUPS.map((group)=><button
								key={group.id}
								type='button'
								aria-current={group.id === this.state.group ? 'true' : undefined}
								onClick={()=>this.setState({ group: group.id })}
							>
								{group.label}
							</button>)}
						</nav>

						<div className='tide-col'>
							{this.renderGroup(current)}
						</div>
					</div>
				</main>

				<SrdFooter />
			</div>
		</div>;
	}
});

export { GROUPS };
export default SettingsPage;
