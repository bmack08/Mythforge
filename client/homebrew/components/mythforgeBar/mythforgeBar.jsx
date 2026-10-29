import React from 'react';
import { prefixPath } from '../../utils/basePath.js';

/*
 * The Mythforge sub-bar: sticky under the global nav, on every Mythforge page
 * that is not the editor.
 *
 * BUILD-BRIEF section 9: "the .mbar row (Brews, New brew, Generator, Vault,
 * Help) is sticky under the global nav".
 *
 * "New brew" is an ACTION, not a link, when the page can open the template
 * picker itself (the library does). Everywhere else it falls back to the
 * /create-project route, which opens the same picker on arrival - so the
 * control is never dead, whichever page is hosting the bar.
 */

const ITEMS = [
	{ key: 'brews',     label: 'Brews',     href: '/',               icon: 'fas fa-book' },
	{ key: 'new',       label: 'New brew',  href: '/create-project', icon: 'fas fa-plus' },
	{ key: 'generator', label: 'Generator', href: '/new-campaign',   icon: 'fas fa-hat-wizard' },
	{ key: 'vault',     label: 'Vault',     href: '/vault',          icon: 'fas fa-dungeon' },
	{ key: 'help',      label: 'Help',      href: '/faq',            icon: 'fas fa-question-circle' }
];

const MythforgeBar = ({ active, onNewBrew, children })=>{
	return <div className='tide-mbar' role='navigation' aria-label='Mythforge'>
		<span className='tide-mbar-brand'>Mythforge</span>
		{ITEMS.map((item)=>{
			const isActive = item.key === active;
			const className = isActive ? 'on' : undefined;

			// The host page handles "New brew" itself where it can, so the
			// picker opens in place instead of costing a navigation.
			if(item.key === 'new' && onNewBrew) {
				return <button
					key={item.key}
					type='button'
					className={className}
					aria-current={isActive ? 'page' : undefined}
					onClick={onNewBrew}
				>
					<i className={item.icon} aria-hidden='true' />
					{item.label}
				</button>;
			}

			return <a
				key={item.key}
				href={prefixPath(item.href)}
				className={className}
				aria-current={isActive ? 'page' : undefined}
			>
				<i className={item.icon} aria-hidden='true' />
				{item.label}
			</a>;
		})}
		<span className='tide-mbar-spacer' />
		{children}
	</div>;
};

export default MythforgeBar;
