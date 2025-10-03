require('./navbar.less');
require('./mythwright-navbar.less');
const React = require('react');
const createClass = require('create-react-class');

const Nav = require('naturalcrit/nav/nav.jsx');
const PatreonNavItem = require('./patreon.navitem.jsx');
const ProjectCreationNavItem = require('./project-creation.navitem.jsx');
const ProjectDashboardNavItem = require('./project-dashboard.navitem.jsx');
const CollaborationNavItem = require('./collaboration.navitem.jsx');
const MythwrightSettingsNavItem = require('./mythwright-settings.navitem.jsx');

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
