import './navbar.less';
import './mythwright-navbar.less';
import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';

/*
 * The global top bar.
 *
 * Three BUILD-BRIEF section 9 fixes land here:
 *
 *  1. The brand read "MYTHWRIGHT" with a "V3.19.3" chip beside it. The product
 *     is Mythforge, and a build number is not brand - both are gone.
 *
 *  2. "New Project", "Projects", "Collaborate" and "Settings" were top-bar
 *     items pointing at routes that fell through to the editor or the home
 *     page. Mythforge's own navigation now lives in ONE place, the sticky
 *     Mythforge sub-bar (components/mythforgeBar), which is where the mocks
 *     put it; Collaborate becomes a share dialog on the editor (unit M2) and
 *     Settings a Mythforge settings page (unit M4), so neither belongs in the
 *     global bar at all.
 *
 *  3. The Patreon "help out" item linked to patreon.com/NaturalCrit. That is
 *     upstream Homebrewery trade dress, not Mythforge's, and section 9 retires
 *     the inherited chrome.
 *
 * What is left is what the mock's top bar has: the TaleForge mark, the product
 * name, and whatever right-hand section the hosting page passes as children.
 */

const Navbar = createClass({
	displayName : 'Navbar',

	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>Mythforge</div>
				</Nav.item>
			</Nav.section>
			{this.props.children}
		</Nav.base>;
	}
});

export default Navbar;
