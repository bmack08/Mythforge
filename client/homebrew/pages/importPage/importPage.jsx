import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import AccountNavItem from '../../navbar/account.navitem.jsx';
import MythforgeBar from '../../components/mythforgeBar/mythforgeBar.jsx';
import SrdFooter from '../../components/srdFooter/srdFooter.jsx';
import { startFromTemplate } from '../../components/templatePicker/templatePicker.jsx';
import { prefixPath } from '../../utils/basePath.js';
import { ART, cssUrl } from '../../../art/tidewatch/art.js';

/*
 * THE IMPORT PATH - /legacy.
 *
 * BUILD-BRIEF section 9: "legacy should be a hidden import path". The route
 * was a SECOND home page rendered with the legacy renderer and linked from
 * the top bar, which is why the before shots show what looks like the home
 * page with its styling broken. Unit M1 took it out of the nav and pointed
 * the library's "Import from Markdown" action at it; this gives it the one
 * job its name implies.
 *
 * It creates nothing of its own. Pasted or uploaded Markdown goes into the
 * same three localStorage keys the template picker writes and /new reads, so
 * an import is a pre-filled new brew rather than a second creation path that
 * could drift away from the real one.
 */

/* 2 MB. localStorage is the transport to /new and browsers give it about 5 MB
 * for the whole origin, so a larger file would be accepted here and then fail
 * to arrive. Refusing it up front says why. */
const MAX_BYTES = 2 * 1024 * 1024;

const prettySize = (bytes)=>{
	if(bytes < 1024) return `${bytes} B`;
	if(bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/* The brew's title, in order of preference: the document's own first heading,
 * then the file it came from, then nothing. Never invented. */
const titleFrom = (text, filename)=>{
	const heading = text.match(/^#{1,3}\s+(.+?)\s*$/m);
	if(heading) return heading[1].replace(/[*_`]/g, '').trim().slice(0, 100);
	if(filename) return filename.replace(/\.(md|markdown|txt)$/i, '').trim().slice(0, 100);
	return '';
};

const ImportPage = createClass({
	displayName     : 'ImportPage',
	getInitialState : function(){
		return { text: '', filename: null, error: null, reading: false };
	},

	onPickFile : function(event){
		const file = event.target.files && event.target.files[0];
		// Re-selecting the same file has to fire change again, or a reader who
		// clears and re-picks gets nothing.
		event.target.value = '';
		if(!file) return;

		if(file.size > MAX_BYTES) {
			this.setState({
				error : `${file.name} is ${prettySize(file.size)}. The limit is ${prettySize(MAX_BYTES)} — paste the part you need instead.`
			});
			return;
		}

		this.setState({ reading: true, error: null });
		const reader = new FileReader();
		reader.onerror = ()=>{
			this.setState({ reading: false, error: `Could not read ${file.name}.` });
		};
		reader.onload = ()=>{
			const text = String(reader.result ?? '');
			// A .md picked out of a folder of PDFs is the common mistake, and a
			// NUL byte is the cheapest reliable tell that this is not text.
			if(text.includes('\u0000')) {
				this.setState({ reading: false, error: `${file.name} does not look like a text file.` });
				return;
			}
			this.setState({ text, filename: file.name, reading: false, error: null });
		};
		reader.readAsText(file);
	},

	clear : function(){
		this.setState({ text: '', filename: null, error: null });
	},

	open : function(){
		const text = this.state.text;
		if(!text.trim()) return;
		startFromTemplate({
			id   : 'import',
			name : titleFrom(text, this.state.filename),
			md   : text
		});
	},

	render : function(){
		const { text, filename, error, reading } = this.state;
		const chars = text.length;

		return <div className='homebrew tide-page importPage'>
			<div className='tide-page-stack'>
				<Navbar>
					<Nav.section>
						<AccountNavItem />
					</Nav.section>
				</Navbar>
				<MythforgeBar active='new' />

				<div
					className='tide-art'
					style={{ '--tide-art-src': cssUrl(ART.workshop) }}
					role='presentation'
				/>

				<main className='tide-page-body'>
					<div className='tide-eyebrow'>Mythforge</div>
					<h1>Import from Markdown</h1>
					<p className='tide-lede'>
						Bring a document in from another editor. Paste it, or pick a
						<code> .md </code> file — then it opens as a new brew you can edit.
					</p>

					<section className='tide-solid tide-panel'>
						<div className='tide-upload'>
							<label>
								<i className='fas fa-file-import' aria-hidden='true' />
								<span>{reading ? 'Reading…' : 'Choose a Markdown file'}</span>
								<input
									type='file'
									accept='.md,.markdown,.txt,text/markdown,text/plain'
									onChange={this.onPickFile}
									style={{ display: 'none' }}
								/>
							</label>
						</div>
						<p className='tide-hint'>
							{`Markdown or plain text, up to ${prettySize(MAX_BYTES)}.`}
						</p>

						{error
							? <div className='tide-note tide-note-error'>
								<strong>That file didn&rsquo;t import.</strong> {error}
							</div>
							: null}

						<label className='tide-field'>
							<span className='tide-label'>Or paste the document</span>
							<textarea
								className='tide-textarea'
								rows={14}
								value={text}
								placeholder={'# Chapter one\n\nPaste the Markdown you want to bring in.'}
								onChange={(e)=>this.setState({ text: e.target.value, error: null })}
							/>
						</label>
						<p className='tide-hint'>
							{filename
								? `From ${filename} — ${chars.toLocaleString()} characters.`
								: `${chars.toLocaleString()} characters.`}
						</p>

						<div className='tide-wizard-foot'>
							<a className='tide-btn-ghost' href={prefixPath('/')}>Cancel</a>
							<div className='tide-actions'>
								<button
									type='button'
									className='tide-btn-quiet'
									disabled={!text}
									onClick={this.clear}
								>
									Clear
								</button>
								<button
									type='button'
									className='tide-btn-primary'
									disabled={!text.trim()}
									onClick={this.open}
								>
									Open in the editor
								</button>
							</div>
						</div>
					</section>
				</main>

				<SrdFooter />
			</div>
		</div>;
	}
});

export default ImportPage;
