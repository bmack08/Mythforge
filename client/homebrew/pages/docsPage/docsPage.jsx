import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import Markdown from 'naturalcrit/markdown.js';
import { prefixPath } from '../../utils/basePath.js';
import { ART, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * THE DOCS PAGE - mocks/12-mythforge-docs.html.
 *
 * One template for three routes, which is what BUILD-BRIEF section 9 asks
 * for: "One docs template: a left TOC and a dark solid article column. App
 * docs never render on paper."
 *
 * TWO defects land here, and they are not the same defect:
 *
 *  1. The surface was wrong. changelog, faq and migrate were served as brews
 *     with theme 5ePHB, so help text about the app was styled as a page of a
 *     Player's Handbook - the exact trade dress section 9 retires.
 *
 *  2. They rendered BLANK, which is the before-shot defect. The cause is not
 *     in this file and is worth writing down: server/app.js renders the page
 *     through client/template.js, which emits `start_app(<props>)` as an
 *     inline script - and nothing in the bundle defines start_app. So the
 *     props carrying the markdown reach the browser and then throw a
 *     ReferenceError, and the app mounts with its defaults: an empty brew.
 *     Verified in this lane with `curl http://localhost:3104/changelog`,
 *     which shows the full changelog text inside that call.
 *
 * Rather than resurrect that path - which would start feeding server props to
 * the editor too, and that is unit M2's surface - the markdown is fetched
 * from /api/docs/:slug. One consequence worth having: it works identically
 * under the Vite dev server, which serves its own index.html and so has no
 * inline props at all.
 */

/* The TOC. The mock also lists "Markdown guide" and "Legal & credits"; this
 * checkout has no document for either, and a TOC entry that 404s is worse
 * than a TOC with three entries. Logged in laneM-progress.md instead. */
const DOCS = [
	{ slug: 'changelog', label: 'Changelog',                   href: '/changelog' },
	{ slug: 'faq',       label: 'FAQ',                         href: '/faq' },
	{ slug: 'migrate',   label: 'Migrate from another editor', href: '/migrate' }
];

/* Paper instructions and icon tokens, removed before rendering.
 *
 *  - \page and \column tell the PAGE RENDERER where to break. One dark
 *    column has nothing to break, and left in they print as stray text.
 *  - :fas_file_lines: and friends are the Markdown+ icon-emoji syntax, and
 *    markdown.js ships with the icon packs DISABLED ("TipTap handles icons",
 *    its own comment at the MarkedEmojiOptions block). So they render as
 *    literal `:fas_table_list:` in the middle of a sentence - 34 times in
 *    changelog.md alone. Stripping them leaves the author's words; mapping
 *    them to <i class> would re-introduce the empty-box icon bug this lane
 *    just fixed whenever a name did not resolve.
 */
const clean = (md)=>md
	.replace(/^\\(?:page|column)(?:break)?\s*$/gm, '')
	.replace(/:(?:fa[srb]?)_[a-z0-9_]+:\s?/g, '');

const DocsPage = createClass({
	displayName     : 'DocsPage',
	getDefaultProps : function(){
		return { slug: 'changelog' };
	},

	getInitialState : function(){
		return { title: null, html: null, error: null, loading: true };
	},

	componentDidMount : function(){
		this.load();
	},

	load : function(){
		const { slug } = this.props;
		this.setState({ loading: true, error: null });

		fetch(prefixPath(`/api/docs/${slug}`), { credentials: 'same-origin' })
			.then(async (res)=>{
				const body = await res.json().catch(()=>null);
				if(!res.ok) throw new Error(body?.error || `The server answered ${res.status}.`);
				return body;
			})
			.then((body)=>{
				// The markdown is this repository's own three files, served by
				// our own route, and it goes through the same renderer the brew
				// preview uses. It is not user input and never has been.
				this.setState({
					title   : body.title,
					html    : Markdown.render(clean(body.markdown || '')),
					loading : false
				});
			})
			.catch((err)=>{
				// Shown, not swallowed. A failed fetch and an empty document
				// look identical to a reader, and this page's whole history is
				// of looking empty for a reason nobody could see.
				this.setState({ error: err.message || 'The server could not load this document.', loading: false });
			});
	},

	renderToc : function(){
		return <nav className='tide-solid tide-sidenav' aria-label='Mythforge help'>
			{DOCS.map((doc)=><a
				key={doc.slug}
				href={prefixPath(doc.href)}
				aria-current={doc.slug === this.props.slug ? 'page' : undefined}
			>
				{doc.label}
			</a>)}
		</nav>;
	},

	renderArticle : function(){
		const { loading, error, html } = this.state;

		if(loading) return <div className='tide-note'>Loading…</div>;
		if(error) {
			return <div className='tide-note tide-note-error'>
				<strong>Couldn&rsquo;t load this document.</strong> {error}
				{' '}
				<button type='button' className='tide-btn-ghost' onClick={this.load}>Try again</button>
			</div>;
		}
		return <div
			className='tide-doc-article'

			dangerouslySetInnerHTML={{ __html: html }}
		/>;
	},

	render : function(){
		const current = DOCS.find((d)=>d.slug === this.props.slug);
		const heading = this.state.title || current?.label || 'Help';

		return <div className='homebrew tide-page docsPage'>
			<div className='tide-page-stack'>
				<Navbar>
					<Nav.section>
						<AccountNavItem />
					</Nav.section>
				</Navbar>
				<MythforgeBar active='help' />

				<div
					className='tide-art'
					style={{ '--tide-art-src': cssUrl(ART.workshop) }}
					role='presentation'
				/>

				<main className='tide-page-body'>
					<div className='tide-eyebrow'>Mythforge help</div>
					<h1>{heading}</h1>

					<div className='tide-two-col'>
						{this.renderToc()}
						<section className='tide-solid tide-doc'>
							{this.renderArticle()}
							<div className='tide-doc-foot'>
								<span>Mythforge documentation</span>
								<a className='tide-btn-ghost' href={prefixPath('/')}>Back to your brews</a>
							</div>
						</section>
					</div>
				</main>

				<SrdFooter />
			</div>
		</div>;
	}
});

export { DOCS };
export default DocsPage;
