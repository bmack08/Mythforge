import './campaignWizard.less';
import React from 'react';
import createClass from 'create-react-class';
import Nav from '../../navbar/navbar.jsx';

const ADVENTURE_TYPES = [
	{ id: 'dungeon',    label: 'Dungeon Crawl',       icon: 'fas fa-dungeon',       desc: 'Classic dungeon exploration with traps, puzzles, and combat encounters.' },
	{ id: 'mystery',    label: 'Mystery',              icon: 'fas fa-search',        desc: 'Investigation-focused adventure with clues, suspects, and revelations.' },
	{ id: 'intrigue',   label: 'Political Intrigue',   icon: 'fas fa-chess-queen',   desc: 'Social encounters, faction politics, and power struggles.' },
	{ id: 'wilderness', label: 'Wilderness Exploration', icon: 'fas fa-mountain',    desc: 'Survival and exploration through dangerous terrain and environments.' },
	{ id: 'city',       label: 'Urban Adventure',      icon: 'fas fa-city',          desc: 'City-based quests with NPCs, shops, guilds, and urban dangers.' },
	{ id: 'planar',     label: 'Planar Travel',        icon: 'fas fa-globe',         desc: 'Adventures across multiple planes of existence.' }
];

const THEMES = [
	{ id: 'classic-fantasy', label: 'Classic Fantasy',  desc: 'Heroic adventures in a medieval fantasy world.' },
	{ id: 'dark-fantasy',    label: 'Dark Fantasy',     desc: 'Gothic horror and gritty, dangerous settings.' },
	{ id: 'high-fantasy',    label: 'High Fantasy',     desc: 'Epic heroism with powerful magic and grand stakes.' },
	{ id: 'steampunk',       label: 'Steampunk',        desc: 'Industrial era with magical technology.' },
	{ id: 'modern',          label: 'Modern Fantasy',   desc: 'Contemporary world with hidden magic.' },
	{ id: 'sci-fi',          label: 'Sci-Fi Fantasy',   desc: 'Space opera meets fantasy elements.' }
];

const LEVEL_RANGES = [
	{ id: 'low',  label: 'Levels 1-5',   desc: 'Local Heroes — Learning the ropes, small-scale threats' },
	{ id: 'mid',  label: 'Levels 6-10',  desc: 'Regional Champions — Growing power, larger threats' },
	{ id: 'high', label: 'Levels 11-16', desc: 'Masters of the Realm — World-shaping events' },
	{ id: 'epic', label: 'Levels 17-20', desc: 'Epic Legends — Planar threats and godlike power' }
];

const COMPLEXITY = [
	{ id: 'simple',   label: 'Simple',   desc: '1 main plot thread, clear objectives, straightforward morality.' },
	{ id: 'moderate', label: 'Moderate',  desc: '2-3 plot threads, nuanced NPCs, some moral grey areas.' },
	{ id: 'complex',  label: 'Complex',   desc: '4-5 interwoven plot threads, deep NPCs, ambiguous choices.' }
];

const CAMPAIGN_LENGTHS = [
	{ id: 'oneshot',  sessions: 1,  label: 'One-Shot (1 session)' },
	{ id: 'short',    sessions: 4,  label: 'Short Arc (3-5 sessions)' },
	{ id: 'medium',   sessions: 10, label: 'Medium Campaign (6-12 sessions)' },
	{ id: 'long',     sessions: 20, label: 'Long Campaign (13-25 sessions)' },
	{ id: 'epic',     sessions: 40, label: 'Epic Campaign (26-50 sessions)' }
];

const CampaignWizard = createClass({
	displayName : 'CampaignWizard',

	getInitialState : function() {
		return {
			step           : 1,
			// Step 1: Campaign Basics
			title          : '',
			theme          : 'classic-fantasy',
			campaignLength : 'medium',
			// Step 2: World & Players
			partySize      : 4,
			level          : 'low',
			complexity     : 'moderate',
			// Step 3: Adventure Type
			adventureType  : 'dungeon',
			tone           : '',
			// Step 4: Reference Materials
			references     : [],
			additionalContext : '',
			// Generation state
			isGenerating   : false,
			generationPhase: '',
			error          : null
		};
	},

	readFileAsBase64 : function(file) {
		return new Promise((resolve, reject)=>{
			const reader = new FileReader();
			reader.onload = ()=>{
				const base64 = reader.result.split(',')[1];
				resolve(base64);
			};
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
		this.setState({ isGenerating: true, generationPhase: 'Preparing campaign parameters...', error: null });

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
			// Read reference files
			if (this.state.references.length > 0) {
				this.setState({ generationPhase: 'Processing reference materials...' });
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

			this.setState({ generationPhase: 'Generating campaign outline and chapters...' });

			const response = await fetch('/api/mythwright/generate', {
				method  : 'POST',
				headers : { 'Content-Type': 'application/json' },
				body    : JSON.stringify(params)
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || 'Campaign generation failed');
			}

			this.setState({ generationPhase: 'Campaign created! Redirecting to editor...' });

			// Redirect to the editor with the new brew
			setTimeout(()=>{
				window.location.href = `/edit/${data.editId}`;
			}, 1000);

		} catch (err) {
			console.error('Campaign generation error:', err);
			this.setState({
				isGenerating   : false,
				generationPhase: '',
				error          : err.message || 'An error occurred during generation.'
			});
		}
	},

	handleFileSelect : function(event) {
		const files = Array.from(event.target.files);
		const MAX_SIZE = 1024 * 1024 * 30; // 30 MB
		const newRefs = [];

		files.forEach((file)=>{
			if (file.size > MAX_SIZE) return;
			if (this.state.references.length + newRefs.length >= 8) return;
			newRefs.push({ name: file.name, size: file.size, file });
		});

		this.setState({ references: [...this.state.references, ...newRefs] });
	},

	removeReference : function(index) {
		const refs = [...this.state.references];
		refs.splice(index, 1);
		this.setState({ references: refs });
	},

	nextStep : function() {
		if (this.state.step < 5) this.setState({ step: this.state.step + 1 });
	},

	prevStep : function() {
		if (this.state.step > 1) this.setState({ step: this.state.step - 1 });
	},

	renderStepIndicator : function() {
		const steps = ['Basics', 'World', 'Adventure', 'References', 'Generate'];
		return <div className='step-indicator'>
			{steps.map((label, i)=>{
				const num = i + 1;
				const isActive = num === this.state.step;
				const isDone = num < this.state.step;
				return <div key={num}
					className={`step-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
					onClick={()=>{ if (isDone || isActive) this.setState({ step: num }); }}>
					<span className='step-num'>{isDone ? '\u2713' : num}</span>
					<span className='step-label'>{label}</span>
				</div>;
			})}
		</div>;
	},

	renderStep1 : function() {
		return <div className='wizard-step'>
			<h2>Campaign Basics</h2>
			<p className='step-desc'>Set the foundation for your campaign.</p>

			<label>Campaign Name</label>
			<input
				type='text'
				placeholder='The Lost Mines of Phandelver...'
				value={this.state.title}
				onChange={(e)=>this.setState({ title: e.target.value })}
				maxLength={100}
			/>

			<label>Fantasy Style</label>
			<div className='option-grid'>
				{THEMES.map((t)=>
					<div key={t.id}
						className={`option-card ${this.state.theme === t.id ? 'selected' : ''}`}
						onClick={()=>this.setState({ theme: t.id })}>
						<strong>{t.label}</strong>
						<span>{t.desc}</span>
					</div>
				)}
			</div>

			<label>Campaign Length</label>
			<div className='option-list'>
				{CAMPAIGN_LENGTHS.map((l)=>
					<div key={l.id}
						className={`option-row ${this.state.campaignLength === l.id ? 'selected' : ''}`}
						onClick={()=>this.setState({ campaignLength: l.id })}>
						{l.label}
					</div>
				)}
			</div>
		</div>;
	},

	renderStep2 : function() {
		return <div className='wizard-step'>
			<h2>World & Players</h2>
			<p className='step-desc'>Define the scope and difficulty.</p>

			<label>Number of Players</label>
			<div className='number-input'>
				<button onClick={()=>this.setState({ partySize: Math.max(1, this.state.partySize - 1) })}>-</button>
				<span className='number-display'>{this.state.partySize}</span>
				<button onClick={()=>this.setState({ partySize: Math.min(8, this.state.partySize + 1) })}>+</button>
			</div>

			<label>Level Range</label>
			<div className='option-list'>
				{LEVEL_RANGES.map((l)=>
					<div key={l.id}
						className={`option-row ${this.state.level === l.id ? 'selected' : ''}`}
						onClick={()=>this.setState({ level: l.id })}>
						<strong>{l.label}</strong> — {l.desc}
					</div>
				)}
			</div>

			<label>Complexity</label>
			<div className='option-list'>
				{COMPLEXITY.map((c)=>
					<div key={c.id}
						className={`option-row ${this.state.complexity === c.id ? 'selected' : ''}`}
						onClick={()=>this.setState({ complexity: c.id })}>
						<strong>{c.label}</strong> — {c.desc}
					</div>
				)}
			</div>
		</div>;
	},

	renderStep3 : function() {
		return <div className='wizard-step'>
			<h2>Adventure Type</h2>
			<p className='step-desc'>What kind of adventure are you running?</p>

			<div className='option-grid adventure-grid'>
				{ADVENTURE_TYPES.map((a)=>
					<div key={a.id}
						className={`option-card adventure-card ${this.state.adventureType === a.id ? 'selected' : ''}`}
						onClick={()=>this.setState({ adventureType: a.id })}>
						<i className={a.icon} />
						<strong>{a.label}</strong>
						<span>{a.desc}</span>
					</div>
				)}
			</div>

			<label>Tone / Additional Style (optional)</label>
			<input
				type='text'
				placeholder='e.g., "gritty noir", "lighthearted romp", "cosmic horror"'
				value={this.state.tone}
				onChange={(e)=>this.setState({ tone: e.target.value })}
			/>
		</div>;
	},

	renderStep4 : function() {
		return <div className='wizard-step'>
			<h2>Reference Materials (Optional)</h2>
			<p className='step-desc'>Upload existing campaign notes, world docs, or source material to inform generation.</p>

			<div className='file-upload-zone'>
				<input
					type='file'
					multiple
					accept='.pdf,.docx,.doc,.txt,.md,.rtf'
					onChange={this.handleFileSelect}
					id='campaign-file-input'
					style={{ display: 'none' }}
				/>
				<label htmlFor='campaign-file-input' className='upload-label'>
					<i className='fas fa-cloud-upload-alt' />
					<span>Click to upload files (PDF, DOCX, TXT, MD)</span>
					<span className='upload-hint'>Max 8 files, 30 MB each</span>
				</label>
			</div>

			{this.state.references.length > 0 &&
				<div className='reference-list'>
					{this.state.references.map((ref, i)=>
						<div key={i} className='reference-item'>
							<i className='fas fa-file-alt' />
							<span>{ref.name}</span>
							<span className='ref-size'>{(ref.size / 1024).toFixed(0)} KB</span>
							<button className='ref-remove' onClick={()=>this.removeReference(i)}>
								<i className='fas fa-times' />
							</button>
						</div>
					)}
				</div>
			}

			<label>Additional Context</label>
			<textarea
				placeholder='e.g., "This takes place in my homebrew world of Thaldara, where magic was banned 100 years ago..."'
				value={this.state.additionalContext}
				onChange={(e)=>this.setState({ additionalContext: e.target.value })}
				rows={4}
			/>
		</div>;
	},

	renderStep5 : function() {
		const lengthConfig = CAMPAIGN_LENGTHS.find((l)=>l.id === this.state.campaignLength);
		const themeConfig = THEMES.find((t)=>t.id === this.state.theme);
		const adventureConfig = ADVENTURE_TYPES.find((a)=>a.id === this.state.adventureType);

		return <div className='wizard-step'>
			<h2>Review & Generate</h2>
			<p className='step-desc'>Review your settings and generate your campaign.</p>

			<div className='summary-grid'>
				<div className='summary-row'><span>Title:</span><strong>{this.state.title || 'Untitled Campaign'}</strong></div>
				<div className='summary-row'><span>Style:</span><strong>{themeConfig?.label}</strong></div>
				<div className='summary-row'><span>Length:</span><strong>{lengthConfig?.label}</strong></div>
				<div className='summary-row'><span>Players:</span><strong>{this.state.partySize}</strong></div>
				<div className='summary-row'><span>Levels:</span><strong>{LEVEL_RANGES.find((l)=>l.id === this.state.level)?.label}</strong></div>
				<div className='summary-row'><span>Complexity:</span><strong>{this.state.complexity}</strong></div>
				<div className='summary-row'><span>Adventure:</span><strong>{adventureConfig?.label}</strong></div>
				{this.state.tone && <div className='summary-row'><span>Tone:</span><strong>{this.state.tone}</strong></div>}
				{this.state.references.length > 0 && <div className='summary-row'><span>References:</span><strong>{this.state.references.length} file(s)</strong></div>}
			</div>

			{this.state.error &&
				<div className='generation-error'>
					<i className='fas fa-exclamation-triangle' /> {this.state.error}
				</div>
			}

			{this.state.isGenerating &&
				<div className='generation-progress'>
					<div className='spinner' />
					<span>{this.state.generationPhase}</span>
				</div>
			}
		</div>;
	},

	render : function() {
		return <div className='campaignWizard'>
			<Nav />
			<div className='wizard-container'>
				<div className='wizard-header'>
					<h1><i className='fas fa-hat-wizard' /> Campaign Generator</h1>
					<p>Create an AI-generated D&D 5e campaign sourcebook</p>
				</div>

				{this.renderStepIndicator()}

				<div className='wizard-body'>
					{this.state.step === 1 && this.renderStep1()}
					{this.state.step === 2 && this.renderStep2()}
					{this.state.step === 3 && this.renderStep3()}
					{this.state.step === 4 && this.renderStep4()}
					{this.state.step === 5 && this.renderStep5()}
				</div>

				<div className='wizard-footer'>
					{this.state.step > 1 &&
						<button className='btn-prev' onClick={this.prevStep} disabled={this.state.isGenerating}>
							<i className='fas fa-arrow-left' /> Back
						</button>
					}
					<div className='spacer' />
					{this.state.step < 5 &&
						<button className='btn-next' onClick={this.nextStep}>
							Next <i className='fas fa-arrow-right' />
						</button>
					}
					{this.state.step === 5 &&
						<button className='btn-generate' onClick={this.handleGenerate} disabled={this.state.isGenerating}>
							{this.state.isGenerating
								? <><div className='spinner-small' /> Generating...</>
								: <><i className='fas fa-magic' /> Generate Campaign</>
							}
						</button>
					}
				</div>
			</div>
		</div>;
	}
});

export default CampaignWizard;
