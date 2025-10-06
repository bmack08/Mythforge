import './navbar.less';
import './mythwright-navbar.less';
import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';
import PatreonNavItem from './patreon.navitem.jsx';
import ProjectCreationNavItem from './project-creation.navitem.jsx';
import ProjectDashboardNavItem from './project-dashboard.navitem.jsx';
import CollaborationNavItem from './collaboration.navitem.jsx';
import MythwrightSettingsNavItem from './mythwright-settings.navitem.jsx';

const Navbar = createClass({
	displayName     : 'Navbar',
	getInitialState : function() {
		return {
			ver : global.version
		};
	},

	/*
	renderChromeWarning : function(){
		if(!this.state.showNonChromeWarning) return;
		return <Nav.item className='warning' icon='fa-exclamation-triangle'>
			Optimized for Chrome
			<div className='dropdown'>
				If you are experiencing rendering issues, use Chrome instead
			</div>
		</Nav.item>
	},
*/
	render : function(){
		return <Nav.base>
			<Nav.section>
				<Nav.logo />
				<Nav.item href='/' className='homebrewLogo'>
					<div>Mythwright</div>
				</Nav.item>
				<Nav.item newTab={true} href='/changelog' color='purple' icon='far fa-file-alt'>
					{`v${this.state.ver}`}
				</Nav.item>
				<ProjectCreationNavItem />
				<ProjectDashboardNavItem />
				<CollaborationNavItem />
				<MythwrightSettingsNavItem />
				<PatreonNavItem />
				{/*this.renderChromeWarning()*/}
			</Nav.section>
		{this.props.children}
	</Nav.base>;
	}
});

export default Navbar;
