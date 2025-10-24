import React from 'react';

import Nav from 'naturalcrit/nav/nav.jsx';

const VaultNavItem = function (props) {
	return (
		<Nav.item
			color='purple'
			icon='fas fa-dungeon'
			href='/vault'
			newTab={false}
			rel='noopener noreferrer'
		>
			Vault
		</Nav.item>
	);
};

export default VaultNavItem;
