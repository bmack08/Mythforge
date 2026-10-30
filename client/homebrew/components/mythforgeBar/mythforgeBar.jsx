import React from 'react';
import { prefixPath } from '../../utils/basePath.js';
import Icon from 'client/components/Icon.jsx';

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

/* Icon names are Lucide, vendored under client/icons/lucide and rendered
 * inline by <Icon>. UNIT M1 fixed the icon FONT; UNIT M5 stopped the chrome
 * depending on one, because twice now a single failed request has turned this
 * whole row into empty boxes. */
const ITEMS = [
	{ key: 'brews',     label: 'Brews',     href: '/',               icon: 'book' },
	{ key: 'new',       label: 'New brew',  href: '/create-project', icon: 'plus' },
	{ key: 'generator', label: 'Generator', href: '/new-campaign',   icon: 'wand-sparkles' },
	/* `library-big`, not Lucide's own `vault`. A bank-vault door reduces at
	 * 14px to a square with a cross in it, which is indistinguishable from
	 * the empty box this unit exists to remove - checked on a 4x capture of
	 * this bar. A shelf of books also says what the page IS: everybody's
	 * published brews. */
	{ key: 'vault',     label: 'Vault',     href: '/vault',          icon: 'library-big' },
	{ key: 'help',      label: 'Help',      href: '/faq',            icon: 'circle-help' }
];

/* Settings sits after the spacer, on the right, and not in the five-item list
 * above. In the mocks Mythforge is a section of TaleForge and Settings is in
 * TaleForge's own account menu - but standalone, and signed out, there is no
 * account menu to put it in, and unit M1 correctly took the item out of the
 * global top bar. A settings page nobody can reach is the same defect as a
 * nav item that goes nowhere, from the other end. */
const SETTINGS = { key: 'settings', label: 'Settings', href: '/settings', icon: 'sliders-horizontal' };

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
					<Icon icon={item.icon} />
					{item.label}
				</button>;
			}

			return <a
				key={item.key}
				href={prefixPath(item.href)}
				className={className}
				aria-current={isActive ? 'page' : undefined}
			>
				<Icon icon={item.icon} />
				{item.label}
			</a>;
		})}
		<span className='tide-mbar-spacer' />
		<a
			href={prefixPath(SETTINGS.href)}
			className={active === SETTINGS.key ? 'on' : undefined}
			aria-current={active === SETTINGS.key ? 'page' : undefined}
		>
			<Icon icon={SETTINGS.icon} />
			{SETTINGS.label}
		</a>
		{children}
	</div>;
};

export default MythforgeBar;
