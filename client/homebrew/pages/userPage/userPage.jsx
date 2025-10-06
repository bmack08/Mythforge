import React, { useState } from 'react';
import _ from 'lodash';

import ListPage from '../basePages/listPage/listPage.jsx';

import Nav from 'naturalcrit/nav/nav.jsx';
import Navbar from '../../navbar/navbar.jsx';
import { both as RecentNavItem } from '../../navbar/recent.navitem.jsx';
import Account from '../../navbar/account.navitem.jsx';
import NewBrew from '../../navbar/newbrew.navitem.jsx';
import HelpNavItem from '../../navbar/help.navitem.jsx';
import ErrorNavItem from '../../navbar/error-navitem.jsx';
import VaultNavitem from '../../navbar/vault.navitem.jsx';

const UserPage = (props)=>{
	props = {
		username : '',
		brews    : [],
		query    : '',
		...props
	};

	const [error, setError] = useState(null);

	const usernameWithS = props.username + (props.username.endsWith('s') ? `’` : `’s`);
	const groupedBrews = _.groupBy(props.brews, (brew)=>brew.published ? 'published' : 'private');

	const brewCollection = [
		{
			title : `${usernameWithS} published brews`,
			class : 'published',
			brews : groupedBrews.published || []
		},
		...(props.username === global.account?.username ? [{
			title : `${usernameWithS} unpublished brews`,
			class : 'unpublished',
			brews : groupedBrews.private || []
		}] : [])
	];

	const navItems = (
		<Navbar>
			<Nav.section>
				{error && (<ErrorNavItem error={error} parent={null}></ErrorNavItem>)}
				<NewBrew />
				<HelpNavItem />
				<VaultNavitem />
				<RecentNavItem />
				<Account />
			</Nav.section>
		</Navbar>
	);

	return (
		<ListPage brewCollection={brewCollection}  navItems={navItems} query={props.query} reportError={(err)=>setError(err)} />
	);
};

export default UserPage;
