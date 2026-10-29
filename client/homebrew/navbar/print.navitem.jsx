import React from 'react';
import Nav from 'naturalcrit/nav/nav.jsx';
import { printCurrentBrew } from 'shared/helpers.js';

const PrintNavItem = function(){
	return <Nav.item onClick={printCurrentBrew} color='purple' icon='far fa-file-pdf'>
		Get PDF
	</Nav.item>;
};

export default PrintNavItem;
