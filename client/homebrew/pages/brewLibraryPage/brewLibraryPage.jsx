import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import TemplatePicker, { TEMPLATES, startFromTemplate } from '../../components/templatePicker/templatePicker.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, coversFor, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * THE BREW LIBRARY - mocks/12-mythforge-home.html.
 *
 * BUILD-BRIEF section 9 maps this one page onto two routes:
 *   home      - "a brew library: recent brews with covers, then templates"
 *   projects  - "projects should become the 12-home library"
 * and a third entrance:
 *   create-project - "the 'New brew' action, opening the template picker",
 *                    which is this page with the picker already open.
 *
 * Before this, all three rendered the welcome-brew EDITOR (home) or an
 * unstyled list (projects), so "Projects" and "New Project" both looked like
 * they had failed.
 *
 * The art is a header BAND that fades to --tide-bg by 360px, not a full-bleed
 * hero: section 9 says "The art is a header band that fades to --bg by 360px.
 * No glass." The card grid therefore always sits on a known background colour
 * and its contrast does not depend on the painting.
 */

// What a brew card can say about a brew without inventing anything. The API
// returns no page count and no description, so neither is shown; a made-up
// "14 pages" is worse than no line at all.
const RELATIVE = [
	[60,              'just now',  null],
	[3600,            'm ago',     60],
	[86400,           'h ago',     3600],
	[86400 * 7,       'd ago',     86400]
];

const editedLabel = (iso)=>{
	if(!iso) return null;
	const then = new Date(iso);
	if(Number.isNaN(then.getTime())) return null;
	const secs = Math.max(0, (Date.now() - then.getTime()) / 1000);
	for (const [limit, suffix, divisor] of RELATIVE) {
		if(secs < limit) return divisor ? `edited ${Math.floor(secs / divisor)}${suffix}` : `edited ${suffix}`;
	}
	return `edited ${then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};

const BrewLibraryPage = createClass({
	displayName     : 'BrewLibraryPage',
	getDefaultProps : function(){
		return {
			// /create-project lands here with the picker already open.
			openPicker : false,
			active     : 'brews'
		};
	},

	getInitialState : function(){
		return {
			brews        : [],
			loading      : true,
			error        : null,
			pickerOpen   : this.props.openPicker
		};
	},

	componentDidMount : function(){
		this.loadBrews();
	},

	loadBrews : function(){
		this.setState({ loading: true, error: null });
		fetch(prefixPath('/api/projects'), { credentials: 'same-origin' })
			.then((res)=>{
				if(!res.ok) throw new Error(`The server answered ${res.status}.`);
				return res.json();
			})
			.then((data)=>{
				if(!data || data.success === false) throw new Error(data?.error || 'The server could not list your brews.');
				this.setState({ brews: Array.isArray(data.projects) ? data.projects : [], loading: false });
			})
			.catch((err)=>{
				// Shown, not swallowed: an empty grid and a failed fetch look
				// identical to a reader, and only one of them is their fault.
				this.setState({ error: err.message || 'The server could not list your brews.', loading: false });
			});
	},

	openPicker  : function(){ this.setState({ pickerOpen: true }); },
	closePicker : function(){ this.setState({ pickerOpen: false }); },

	renderNavbar : function(){
		return <Navbar>
			<Nav.section>
				<AccountNavItem />
			</Nav.section>
		</Navbar>;
	},

	renderBrewCard : function(brew, index, covers){
		const edited = editedLabel(brew.updatedAt || brew.createdAt);
		const href   = prefixPath(brew.editId ? `/edit/${brew.editId}` : (brew.url || '/'));
		return <a key={brew.editId || brew.shareId || brew.id} className='tide-card' href={href}>
			<div
				className='tide-card-cover'
				style={{ backgroundImage: cssUrl(covers[index]) }}
				role='presentation'
			/>
			<div className='tide-card-body'>
				<h3>{brew.title?.trim() || 'Untitled brew'}</h3>
				{edited ? <div className='tide-cap'>{edited}</div> : null}
			</div>
		</a>;
	},

	renderRecent : function(){
		const { loading, error, brews } = this.state;

		if(loading) {
			return <div className='tide-note'>Loading your brews…</div>;
		}
		if(error) {
			return <div className='tide-note tide-note-error'>
				<strong>Couldn&rsquo;t load your brews.</strong> {error}
				{' '}
				<button type='button' className='tide-btn-ghost' onClick={this.loadBrews}>Try again</button>
			</div>;
		}
		if(!brews.length) {
			// BUILD-BRIEF section 9 empty states: never a bare blank page.
			return <div className='tide-empty'>
				<h3>No brews yet</h3>
				<p>Start one from a template, or generate a campaign and edit what comes back.</p>
				<div className='tide-actions' style={{ justifyContent: 'center' }}>
					<button type='button' className='tide-btn-primary' onClick={this.openPicker}>New brew</button>
					<a className='tide-btn-quiet' href={prefixPath('/new-campaign')}>Generate a campaign</a>
				</div>
			</div>;
		}
		const shown  = brews.slice(0, 12);
		const covers = coversFor(shown.map((b)=>b.editId || b.shareId || b.id || b.title));
		return <div className='tide-grid'>
			{shown.map((brew, i)=>this.renderBrewCard(brew, i, covers))}
		</div>;
	},

	render : function(){
		// While the template picker is open the rest of the page is behind a
		// 72%-black scrim: it is not readable, not operable, and a screen
		// reader should not be able to walk into it. `inert` takes it out of
		// the tab order and the accessibility tree in one go. React 18 does
		// not know the attribute as a boolean prop, hence the empty string.
		const behind = this.state.pickerOpen
			? { 'aria-hidden': 'true', inert: '' }
			: {};

		return <div className='homebrew tide-page brewLibraryPage'>
			<div className='tide-page-stack' {...behind}>
			{this.renderNavbar()}
			<MythforgeBar active={this.props.active} onNewBrew={this.openPicker} />

			<div
				className='tide-art'
				style={{ '--tide-art-src': cssUrl(ART.workshop) }}
				role='presentation'
			/>

			<main className='tide-page-body'>
				<div className='tide-eyebrow'>Mythforge</div>
				<h1>Your brews</h1>
				<p className='tide-lede'>
					Write adventures, creatures and handouts, then export a print-ready PDF.
				</p>

				<div className='tide-actions'>
					<button type='button' className='tide-btn-primary' onClick={this.openPicker}>
						<i className='fas fa-plus' aria-hidden='true' /> New brew
					</button>
					<a className='tide-btn-quiet' href={prefixPath('/new-campaign')}>
						<i className='fas fa-hat-wizard' aria-hidden='true' /> Generate a campaign
					</a>
					<a className='tide-btn-ghost' href={prefixPath('/legacy')}>
						<i className='fas fa-file-import' aria-hidden='true' /> Import from Markdown
					</a>
				</div>

				<section className='tide-section'>
					<div className='tide-section-head'>
						<h2>Recent</h2>
						{this.state.brews.length > 12
							? <span className='tide-cap'>{`Showing 12 of ${this.state.brews.length}`}</span>
							: null}
					</div>
					{this.renderRecent()}
				</section>

				<section className='tide-section'>
					<h2>Start from a template</h2>
					<div className='tide-grid'>
						{TEMPLATES.map((t)=>
							<button
								key={t.id}
								type='button'
								className='tide-card tide-tile'
								onClick={()=>startFromTemplate(t)}
							>
								<div className='tide-card-body'>
									<h3>{t.name}</h3>
									<div className='tide-cap'>{t.blurb}</div>
								</div>
							</button>
						)}
					</div>
				</section>
			</main>

			<SrdFooter />
			</div>

			{this.state.pickerOpen ? <TemplatePicker onClose={this.closePicker} /> : null}
		</div>;
	}
});

export default BrewLibraryPage;
