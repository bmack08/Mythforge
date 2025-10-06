import React from 'react';
import createClass from 'create-react-class';
import './brewUtils.less';

import BrewCleanup from './brewCleanup/brewCleanup.jsx';
import BrewLookup from './brewLookup/brewLookup.jsx';
import BrewCompress from './brewCompress/brewCompress.jsx';
import Stats from './stats/stats.jsx';

const BrewUtils = createClass({
	render : function(){
		return <>
			<Stats />
			<hr />
			<BrewLookup />
			<hr />
			<BrewCleanup />
			<hr />
			<BrewCompress />
		</>;
	}
});

export default BrewUtils;
