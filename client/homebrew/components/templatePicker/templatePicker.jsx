import React, { useCallback, useEffect, useRef } from 'react';
import { prefixPath } from '../../utils/basePath.js';
import { markdownToTiptap } from '../../../../shared/helpers/markdownToTiptap.js';

/*
 * The template picker - what the "New brew" action opens.
 *
 * BUILD-BRIEF section 9 routing fix: "create-project should be the 'New brew'
 * action, opening the template picker". Before this, /create-project fell
 * through to the home page and the nav item did nothing a reader could see.
 *
 * Picking a template seeds the same localStorage keys /new already reads
 * (homebrewery-new / -style / -meta) and then navigates there, so a template
 * is a pre-filled new brew rather than a second creation path that could drift
 * away from the real one.
 *
 * WORDING. No "D&D", no "5e", no WotC names anywhere in here - section 9 asks
 * for "5E-compatible" and these templates are the first thing a new user reads.
 */

const TEMPLATES = [
	{
		id    : 'blank',
		name  : 'Blank page',
		blurb : 'Start from nothing',
		md    : ''
	},
	{
		id    : 'adventure',
		name  : 'Adventure',
		blurb : 'Chapters, encounters, handouts',
		md    : [
			'# Adventure title',
			'',
			'A one-paragraph pitch: who the party is, what is wrong, and what happens if nobody stops it.',
			'',
			'## Chapter 1: The hook',
			'',
			'Where the adventure opens and what pulls the party in.',
			'',
			'### Encounter: the first problem',
			'',
			'What the party meets, what it wants, and how the scene can end.',
			'',
			'## Chapter 2: The complication',
			'',
			'What the party learns that changes the job.',
			'',
			'## Handouts',
			'',
			'- Letter from the patron',
			'- Map of the approach'
		].join('\n')
	},
	{
		id    : 'creatures',
		name  : 'Creature pack',
		blurb : 'SRD-style stat blocks',
		md    : [
			'# Creature pack',
			'',
			'A short note on where these creatures live and how they fight together.',
			'',
			'## Creature name',
			'',
			'*Medium beast, unaligned*',
			'',
			'**Armour Class** 12',
			'**Hit Points** 22',
			'**Speed** 30 ft.',
			'',
			'### Actions',
			'',
			'***Bite.*** *Melee Weapon Attack:* +4 to hit, reach 5 ft., one target.'
		].join('\n')
	},
	{
		id    : 'items',
		name  : 'Item compendium',
		blurb : 'Tables and item cards',
		md    : [
			'# Item compendium',
			'',
			'## Contents',
			'',
			'| Item | Rarity | Attunement |',
			'|------|--------|------------|',
			'| Example blade | Uncommon | Yes |',
			'',
			'## Example blade',
			'',
			'*Weapon (any sword), uncommon (requires attunement)*',
			'',
			'What it does, what it costs the bearer, and who made it.'
		].join('\n')
	}
];

const BREWKEY  = 'homebrewery-new';
const STYLEKEY = 'homebrewery-new-style';
const METAKEY  = 'homebrewery-new-meta';

export const startFromTemplate = (template)=>{
	try {
		// /new parses this key as JSON first and only falls back to treating it
		// as legacy markdown, so TipTap JSON is what it actually wants.
		localStorage.setItem(BREWKEY, JSON.stringify(markdownToTiptap(template.md || '')));
		localStorage.setItem(STYLEKEY, '');
		localStorage.setItem(METAKEY, JSON.stringify({
			title    : template.id === 'blank' ? '' : template.name,
			renderer : 'V3',
			theme    : 'Tome'
		}));
	} catch (e) {
		// A blocked or full localStorage must not swallow the click: fall
		// through to /new and the reader gets an empty brew instead of nothing.
		console.warn('Could not seed the template into localStorage:', e);
	}
	window.location.href = prefixPath('/new');
};

const TemplatePicker = ({ onClose })=>{
	const cardRef = useRef(null);

	const handleKey = useCallback((e)=>{
		if(e.key === 'Escape') onClose?.();
	}, [onClose]);

	useEffect(()=>{
		document.addEventListener('keydown', handleKey);
		cardRef.current?.focus();
		return ()=>document.removeEventListener('keydown', handleKey);
	}, [handleKey]);

	return <div
		className='tide-modal-scrim'
		onClick={(e)=>{ if(e.target === e.currentTarget) onClose?.(); }}
	>
		<div
			className='tide-modal'
			role='dialog'
			aria-modal='true'
			aria-label='Start a new brew'
			tabIndex={-1}
			ref={cardRef}
		>
			<div className='tide-modal-head'>
				<div>
					<h2>Start a new brew</h2>
					<p className='tide-lede'>Pick a starting point. You can change everything later.</p>
				</div>
				<button
					type='button'
					className='tide-modal-close'
					aria-label='Close'
					onClick={()=>onClose?.()}
				>
					<i className='fas fa-times' aria-hidden='true' />
				</button>
			</div>

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
		</div>
	</div>;
};

export { TEMPLATES };
export default TemplatePicker;
