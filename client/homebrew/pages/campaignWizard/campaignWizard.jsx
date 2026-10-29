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
 * THE CAMPAIGN GENERATOR - unit M3 of the Tidewatch redesign.
 *
 * BUILD-BRIEF section 9, 12-mythforge-generator.html: "Same pattern as the
 * character wizard: a glass 5-step bar (Basics, World, Adventure, References,
 * Generate) over a solid panel, on campaign-cover."
 *
 * Three things the brief names explicitly, all gone from this file:
 *   - the purple gradient header (#8b5cf6 -> #7c3aed), which broke the palette
 *     rule and was the loudest thing on the page;
 *   - "D&D 5e", which is Wizards of the Coast's, replaced by "5E-compatible";
 *   - "The Lost Mines of Phandelver" as the name placeholder - a WotC adventure
 *     title sitting in a field the user is about to type their own title into.
 *     The mock's own invented example took its place.
 *
 * Behaviour is deliberately unchanged: the same five steps collect the same
 * parameters and POST the same body to /api/mythwright/generate. This unit is
 * the chrome and the wording, not the pipeline.
 */

const THEMES = [
	{ id: 'classic-fantasy', label: 'Classic fantasy', desc: 'Heroic adventure in a medieval world' },
	{ id: 'dark-fantasy',    label: 'Dark fantasy',    desc: 'Gothic horror, dangerous settings' },
	{ id: 'high-fantasy',    label: 'High fantasy',    desc: 'Powerful magic, grand stakes' },
	{ id: 'steampunk',       label: 'Steampunk',       desc: 'Industrial era with magical technology' },
	{ id: 'modern',          label: 'Modern fantasy',  desc: 'Today’s world with hidden magic' },
	{ id: 'sci-fi',          label: 'Sci-fi fantasy',  desc: 'Space opera meets sorcery' }
];

/* The ids and session counts are a contract: the server mirrors them in
 * content-generation-orchestrator.js (LENGTH_TO_SESSIONS) to size the chapter
 * loop. The mock draws four chips; keeping all five keeps that contract and
 * the user's existing choices intact, so only the labels changed. */
const CAMPAIGN_LENGTHS = [
	{ id: 'oneshot', sessions: 1,  label: 'One-shot' },
	{ id: 'short',   sessions: 4,  label: 'Short arc (3–5)' },
	{ id: 'medium',  sessions: 10, label: 'Campaign (6–12)' },
	{ id: 'long',    sessions: 20, label: 'Long (13–25)' },
	{ id: 'epic',    sessions: 40, label: 'Epic (26–50)' }
];

const LEVEL_RANGES = [
	{ id: 'low',  label: 'Levels 1–5',   desc: 'Local heroes — learning the ropes, small-scale threats' },
	{ id: 'mid',  label: 'Levels 6–10',  desc: 'Regional champions — growing power, larger threats' },
	{ id: 'high', label: 'Levels 11–16', desc: 'Masters of the realm — world-shaping events' },
	{ id: 'epic', label: 'Levels 17–20', desc: 'Epic legends — planar threats and godlike power' }
];

const COMPLEXITY = [
	{ id: 'simple',   label: 'Simple',   desc: 'One main plot thread, clear objectives, straightforward morality' },
	{ id: 'moderate', label: 'Moderate', desc: 'Two or three plot threads, nuanced NPCs, some moral grey areas' },
	{ id: 'complex',  label: 'Complex',  desc: 'Four or five interwoven threads, deep NPCs, ambiguous choices' }
];

const ADVENTURE_TYPES = [
	{ id: 'dungeon',    label: 'Dungeon crawl',   icon: 'fas fa-dungeon',     desc: 'Exploration with traps, puzzles and combat' },
	{ id: 'mystery',    label: 'Mystery',         icon: 'fas fa-search',      desc: 'Clues, suspects and revelations' },
	{ id: 'intrigue',   label: 'Political intrigue', icon: 'fas fa-chess-queen', desc: 'Social encounters, factions and power' },
	{ id: 'wilderness', label: 'Wilderness',      icon: 'fas fa-mountain',    desc: 'Survival across dangerous terrain' },
	{ id: 'city',       label: 'Urban adventure', icon: 'fas fa-city',        desc: 'Quests among NPCs, shops and guilds' },
	{ id: 'planar',     label: 'Planar travel',   icon: 'fas fa-globe',       desc: 'Adventures across several planes' }
];

const STEPS = ['Basics', 'World', 'Adventure', 'References', 'Generate'];
const LAST_STEP = STEPS.length;

const MAX_FILES = 8;
const MAX_FILE_BYTES = 1024 * 1024 * 30;   // 30 MB

const CampaignWizard = createClass({
	displayName : 'CampaignWizard',

	getInitialState : function() {
		return {
			step              : 1,
			// Step 1: basics
			title             : '',
			theme             : 'classic-fantasy',
			campaignLength    : 'medium',
			// Step 2: world and players
			partySize         : 4,
			level             : 'low',
			complexity        : 'moderate',
			// Step 3: adventure
			adventureType     : 'dungeon',
			tone              : '',
			// Step 4: references
			references        : [],
			additionalContext : '',
			rejected          : [],
			// Generation
			isGenerating      : false,
			generationPhase   : '',
			error             : null
		};
	},

	readFileAsBase64 : function(file) {
		return new Promise((resolve, reject)=>{
			const reader = new FileReader();
			reader.onload = ()=>resolve(reader.result.split(',')[1]);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	},

	readFileAsText : function(file) {
		return new Promise((resolve, reject)=>{
			const reader = new FileReader();
			reader.onload = ()=>resolve(reader.result.slice(0, 20000));
			reader.onerror = reject;
			reader.readAsText(file);
		});
	},

	handleGenerate : async function() {
		this.setState({ isGenerating: true, generationPhase: 'Preparing campaign parameters…', error: null });

		const lengthConfig = CAMPAIGN_LENGTHS.find((l)=>l.id === this.state.campaignLength);

		const params = {
			title             : this.state.title || 'Untitled Campaign',
			theme             : this.state.theme,
			sessionCount      : lengthConfig?.sessions || 10,
			partySize         : this.state.partySize,
			level             : this.state.level,
			complexity        : this.state.complexity,
			adventureType     : this.state.adventureType,
			tone              : this.state.tone || undefined,
			additionalContext : this.state.additionalContext || undefined
		};

		try {
			if(this.state.references.length > 0) {
				this.setState({ generationPhase: 'Processing reference materials…' });
				const textExts = ['.txt', '.md', '.markdown', '.json', '.yaml', '.yml', '.csv'];
				const refs = [];

				for (const ref of this.state.references) {
					const ext = ref.name.toLowerCase().slice(ref.name.lastIndexOf('.'));
					const isText = textExts.includes(ext);

					const content = isText
						? await this.readFileAsText(ref.file)
						: await this.readFileAsBase64(ref.file);

					refs.push({
						name     : ref.name,
						content,
						encoding : isText ? 'text' : 'base64',
						mimeType : ref.file.type || 'application/octet-stream',
						size     : ref.size
					});
				}

				params.references = refs;
			}

			this.setState({ generationPhase: 'Generating campaign outline and chapters…' });

			const response = await fetch('/api/mythwright/generate', {
				method  : 'POST',
				headers : { 'Content-Type': 'application/json' },
				body    : JSON.stringify(params)
			});

			const data = await response.json();

			if(!data.success)
				throw new Error(data.error || 'Campaign generation failed');

			this.setState({ generationPhase: 'Campaign created. Opening the editor…' });

			setTimeout(()=>{
				window.location.href = prefixPath(`/edit/${data.editId}`);
			}, 1000);

		} catch (err) {
			console.error('Campaign generation error:', err);
			this.setState({
				isGenerating    : false,
				generationPhase : '',
				error           : err.message || 'An error occurred during generation.'
			});
		}
	},

	/* A file the picker refused used to vanish without a word - over the size
	 * cap or past the eighth file and nothing appeared in the list. The reason
	 * is reported now instead. */
	handleFileSelect : function(event) {
		const files = Array.from(event.target.files);
		const accepted = [];
		const rejected = [];

		files.forEach((file)=>{
			if(file.size > MAX_FILE_BYTES) {
				rejected.push(`${file.name} is over 30 MB`);
				return;
			}
			if(this.state.references.length + accepted.length >= MAX_FILES) {
				rejected.push(`${file.name} — ${MAX_FILES} files is the limit`);
				return;
			}
			accepted.push({ name: file.name, size: file.size, file });
		});

		this.setState({ references: [...this.state.references, ...accepted], rejected });
		event.target.value = '';   // so re-picking the same file still fires onChange
	},

	removeReference : function(index) {
		const refs = [...this.state.references];
		refs.splice(index, 1);
		this.setState({ references: refs });
	},

	goToStep : function(step) {
		if(step >= 1 && step <= LAST_STEP) this.setState({ step });
	},

	nextStep : function() { this.goToStep(this.state.step + 1); },
	prevStep : function() { this.goToStep(this.state.step - 1); },

	// ── The glass 5-step bar ───────────────────────────────────────────────
	/* An <ol>, not a <nav>: the global top bar's rule is `body .homebrew nav`
	 * (0,0,1,2), which outranks `.tide-steps` (0,0,1,0), so a <nav> here
	 * arrived wearing the top bar's background, min-height and blur. An
	 * ordered list is also the honest element for "step 3 of 5". */
	renderSteps : function() {
		return <ol className='tide-steps'>
			{STEPS.map((label, i)=>{
				const num      = i + 1;
				const isActive = num === this.state.step;
				const isDone   = num < this.state.step;
				const classes  = ['tide-step', isActive ? 'on' : '', isDone ? 'done' : '']
					.filter(Boolean).join(' ');

				return <li key={label} className='tide-step-li'>
					<button
						type='button'
						className={classes}
						disabled={!isActive && !isDone}
						aria-current={isActive ? 'step' : undefined}
						onClick={()=>this.goToStep(num)}
					>
						<span className='tide-step-num' aria-hidden='true'>{isDone ? '✓' : num}</span>
						<span className='tide-step-label'>{label}</span>
					</button>
				</li>;
			})}
		</ol>;
	},

	/* Every option set on this page is "pick exactly one of these", so they all
	 * render through the same control. aria-pressed carries the selection, and
	 * the styling hangs off that attribute rather than off a `selected` class -
	 * one source of truth, and a screen reader is told the same thing the
	 * colour says. */
	renderChoices : function(key, options, { rows = false, icons = false } = {}) {
		const classes = `tide-choices${rows ? ' tide-choices-rows' : ''}`;
		return <div className={classes} role='group'>
			{options.map((opt)=><button
				key={opt.id}
				type='button'
				className='tide-choice'
				aria-pressed={this.state[key] === opt.id}
				onClick={()=>this.setState({ [key]: opt.id })}
			>
				{icons && <i className={`${opt.icon} tide-choice-icon`} aria-hidden='true' />}
				<strong>{opt.label}</strong>
				<span>{opt.desc}</span>
			</button>
			)}
		</div>;
	},

	renderStep1 : function() {
		return <div className='wizardStep'>
			<h2>Campaign basics</h2>
			<p className='tide-cap'>Set the foundation for your campaign.</p>

			<label className='tide-field'>
				<span className='tide-label'>Campaign name</span>
				<input
					className='tide-input'
					type='text'
					placeholder='The Lantern of Greywater'
					value={this.state.title}
					onChange={(e)=>this.setState({ title: e.target.value })}
					maxLength={100}
				/>
			</label>

			<div className='tide-field'>
				<span className='tide-label' id='fantasy-style-label'>Fantasy style</span>
				<div className='tide-choices' role='group' aria-labelledby='fantasy-style-label'>
					{THEMES.map((t)=><button
						key={t.id}
						type='button'
						className='tide-choice'
						aria-pressed={this.state.theme === t.id}
						onClick={()=>this.setState({ theme: t.id })}
					>
						<strong>{t.label}</strong>
						<span>{t.desc}</span>
					</button>
					)}
				</div>
			</div>

			<div className='tide-field'>
				<span className='tide-label' id='length-label'>Length</span>
				<div className='tide-seg' role='group' aria-labelledby='length-label'>
					{CAMPAIGN_LENGTHS.map((l)=><button
						key={l.id}
						type='button'
						className='tide-seg-btn'
						aria-pressed={this.state.campaignLength === l.id}
						onClick={()=>this.setState({ campaignLength: l.id })}
					>
						{l.label}
					</button>
					)}
				</div>
			</div>
		</div>;
	},

	renderStep2 : function() {
		return <div className='wizardStep'>
			<h2>World and players</h2>
			<p className='tide-cap'>Define the scope and the difficulty.</p>

			<div className='tide-field'>
				<span className='tide-label' id='party-size-label'>Number of players</span>
				<div className='tide-stepper' role='group' aria-labelledby='party-size-label'>
					<button
						type='button'
						aria-label='One fewer player'
						disabled={this.state.partySize <= 1}
						onClick={()=>this.setState({ partySize: Math.max(1, this.state.partySize - 1) })}
					>&minus;</button>
					<output aria-live='polite'>{this.state.partySize}</output>
					<button
						type='button'
						aria-label='One more player'
						disabled={this.state.partySize >= 8}
						onClick={()=>this.setState({ partySize: Math.min(8, this.state.partySize + 1) })}
					>+</button>
				</div>
			</div>

			<div className='tide-field'>
				<span className='tide-label' id='level-label'>Level range</span>
				<div className='tide-choices tide-choices-rows' role='group' aria-labelledby='level-label'>
					{LEVEL_RANGES.map((l)=><button
						key={l.id}
						type='button'
						className='tide-choice'
						aria-pressed={this.state.level === l.id}
						onClick={()=>this.setState({ level: l.id })}
					>
						<strong>{l.label}</strong>
						<span>{l.desc}</span>
					</button>
					)}
				</div>
			</div>

			<div className='tide-field'>
				<span className='tide-label' id='complexity-label'>Complexity</span>
				<div className='tide-choices tide-choices-rows' role='group' aria-labelledby='complexity-label'>
					{COMPLEXITY.map((c)=><button
						key={c.id}
						type='button'
						className='tide-choice'
						aria-pressed={this.state.complexity === c.id}
						onClick={()=>this.setState({ complexity: c.id })}
					>
						<strong>{c.label}</strong>
						<span>{c.desc}</span>
					</button>
					)}
				</div>
			</div>
		</div>;
	},

	renderStep3 : function() {
		return <div className='wizardStep'>
			<h2>Adventure type</h2>
			<p className='tide-cap'>What kind of adventure are you running?</p>

			<div className='tide-field'>
				<span className='tide-label' id='adventure-label'>Shape of the adventure</span>
				<div className='tide-choices' role='group' aria-labelledby='adventure-label'>
					{ADVENTURE_TYPES.map((a)=><button
						key={a.id}
						type='button'
						className='tide-choice'
						aria-pressed={this.state.adventureType === a.id}
						onClick={()=>this.setState({ adventureType: a.id })}
					>
						<i className={`${a.icon} tide-choice-icon`} aria-hidden='true' />
						<strong>{a.label}</strong>
						<span>{a.desc}</span>
					</button>
					)}
				</div>
			</div>

			<label className='tide-field'>
				<span className='tide-label'>Tone (optional)</span>
				<input
					className='tide-input'
					type='text'
					placeholder='gritty noir, lighthearted romp, cosmic horror…'
					value={this.state.tone}
					onChange={(e)=>this.setState({ tone: e.target.value })}
				/>
			</label>
		</div>;
	},

	renderStep4 : function() {
		return <div className='wizardStep'>
			<h2>Reference materials</h2>
			<p className='tide-cap'>Optional. Upload campaign notes, world docs or source
				material and the generator will read them first.</p>

			<div className='tide-field'>
				<span className='tide-label'>Files</span>
				<div className='tide-upload'>
					<input
						type='file'
						multiple
						accept='.pdf,.docx,.doc,.txt,.md,.rtf'
						onChange={this.handleFileSelect}
						id='campaign-file-input'
						style={{ display: 'none' }}
					/>
					<label htmlFor='campaign-file-input'>
						<i className='fas fa-cloud-arrow-up' aria-hidden='true' />
						<span>Choose files — PDF, DOCX, TXT or MD</span>
						<span className='tide-cap'>Up to {MAX_FILES} files, 30 MB each</span>
					</label>
				</div>
			</div>

			{this.state.rejected.length > 0 &&
				<div className='tide-note tide-note-error' role='status'>
					<strong>Not added:</strong> {this.state.rejected.join('; ')}.
				</div>
			}

			{this.state.references.length > 0 &&
				<ul className='tide-reflist'>
					{this.state.references.map((ref, i)=><li key={`${ref.name}-${i}`} className='tide-ref'>
						<i className='fas fa-file-lines' aria-hidden='true' />
						<span className='tide-ref-name'>{ref.name}</span>
						<span className='tide-ref-size'>{(ref.size / 1024).toFixed(0)} KB</span>
						<button
							type='button'
							className='tide-ref-remove'
							aria-label={`Remove ${ref.name}`}
							onClick={()=>this.removeReference(i)}
						>
							<i className='fas fa-xmark' aria-hidden='true' />
						</button>
					</li>
					)}
				</ul>
			}

			<label className='tide-field'>
				<span className='tide-label'>Additional context</span>
				<textarea
					className='tide-textarea'
					placeholder='This takes place in my homebrew world of Thaldara, where magic was banned a century ago…'
					value={this.state.additionalContext}
					onChange={(e)=>this.setState({ additionalContext: e.target.value })}
					rows={4}
				/>
			</label>
		</div>;
	},

	renderStep5 : function() {
		const lengthConfig    = CAMPAIGN_LENGTHS.find((l)=>l.id === this.state.campaignLength);
		const themeConfig     = THEMES.find((t)=>t.id === this.state.theme);
		const adventureConfig = ADVENTURE_TYPES.find((a)=>a.id === this.state.adventureType);
		const levelConfig     = LEVEL_RANGES.find((l)=>l.id === this.state.level);
		const complexityConfig = COMPLEXITY.find((c)=>c.id === this.state.complexity);

		const rows = [
			['Name',       this.state.title || 'Untitled campaign'],
			['Style',      themeConfig?.label],
			['Length',     lengthConfig?.label],
			['Players',    String(this.state.partySize)],
			['Levels',     levelConfig?.label],
			['Complexity', complexityConfig?.label],
			['Adventure',  adventureConfig?.label],
			this.state.tone ? ['Tone', this.state.tone] : null,
			this.state.references.length
				? ['References', `${this.state.references.length} file${this.state.references.length === 1 ? '' : 's'}`]
				: null
		].filter(Boolean);

		return <div className='wizardStep'>
			<h2>Review and generate</h2>
			<p className='tide-cap'>Mythforge drafts a 5E-compatible sourcebook from these
				settings and opens it in the editor. You can change anything afterwards.</p>

			<dl className='tide-summary'>
				{rows.map(([label, value])=><div key={label}>
					<dt>{label}</dt>
					<dd>{value}</dd>
				</div>
				)}
			</dl>

			{this.state.error &&
				<div className='tide-note tide-note-error' role='alert'>
					<strong>Generation failed.</strong> {this.state.error}
				</div>
			}

			{this.state.isGenerating &&
				<div className='tide-progress' role='status'>
					<div className='tide-spinner' aria-hidden='true' />
					<span>{this.state.generationPhase}</span>
				</div>
			}
		</div>;
	},

	renderFooter : function() {
		const { step, isGenerating } = this.state;

		return <div className='tide-wizard-foot'>
			<div className='tide-actions'>
				<a className='tide-btn-ghost' href={prefixPath('/')}>Cancel</a>
				{step > 1 &&
					<button className='tide-btn-quiet' type='button' onClick={this.prevStep} disabled={isGenerating}>
						<i className='fas fa-arrow-left' aria-hidden='true' /> Back
					</button>
				}
			</div>

			<span className='tide-cap'>Step {step} of {LAST_STEP}</span>

			<div className='tide-actions'>
				{step < LAST_STEP &&
					<button className='tide-btn-primary' type='button' onClick={this.nextStep}>
						Next step <i className='fas fa-arrow-right' aria-hidden='true' />
					</button>
				}
				{step === LAST_STEP &&
					<button className='tide-btn-primary' type='button' onClick={this.handleGenerate} disabled={isGenerating}>
						{isGenerating
							? <><span className='tide-spinner' aria-hidden='true' /> Generating…</>
							: <><i className='fas fa-wand-magic-sparkles' aria-hidden='true' /> Generate campaign</>
						}
					</button>
				}
			</div>
		</div>;
	},

	render : function() {
		const body = [
			this.renderStep1, this.renderStep2, this.renderStep3,
			this.renderStep4, this.renderStep5
		][this.state.step - 1];

		return <div className='homebrew tide-page campaignWizard'>
			<Navbar>
				<Nav.section>
					<AccountNavItem />
				</Nav.section>
			</Navbar>
			<MythforgeBar active='generator' />

			{/* The art is a band that fades to --tide-bg by 360px, the mock's own
			  * stop list - so the panel below always sits on a known colour and
			  * its contrast can be reasoned about without looking at the
			  * painting. */}
			<div
				className='tide-art'
				style={{ '--tide-art-src': cssUrl(ART.campaignCover) }}
				role='presentation'
			/>

			<div className='tide-page-body'>
				<div className='tide-eyebrow'>Mythforge</div>
				<h1>Campaign generator</h1>
				<p className='tide-lede'>Draft a 5E-compatible campaign sourcebook you can edit as a brew.</p>

				{this.renderSteps()}

				<section className='tide-panel'>
					{body()}
					{this.renderFooter()}
				</section>
			</div>

			<SrdFooter />
		</div>;
	}
});

export default CampaignWizard;
