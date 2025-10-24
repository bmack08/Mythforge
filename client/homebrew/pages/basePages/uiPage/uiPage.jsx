import './uiPage.less';
import React from 'react';
import createClass from 'create-react-class';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../../navbar/navbar.jsx';
import NewBrewItem from '../../../navbar/newbrew.navitem.jsx';
import HelpNavItem from '../../../navbar/help.navitem.jsx';
import { both as RecentNavItem } from '../../../navbar/recent.navitem.jsx';
import Account from '../../../navbar/account.navitem.jsx';


const UIPage = createClass({
	displayName : 'UIPage',

	render : function(){
		return <div className='uiPage sitePage'>
			<Navbar>
				<Nav.section>
					<Nav.item className='brewTitle'>{this.props.brew.title}</Nav.item>
				</Nav.section>

				<Nav.section>
					<NewBrewItem />
					<HelpNavItem />
					<RecentNavItem />
					<Account />
				</Nav.section>
			</Navbar>

			<div className='content'>
				{this.props.children}
			</div>
		</div>;
	}
});

export default UIPage;
