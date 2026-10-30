import _ from 'lodash';

// Default properties for newly-created brews
const DEFAULT_BREW = {
	title       : '',
	text        : { type: 'doc', content: [] }, // TipTap JSON format (empty document)
	style       : undefined,
	description : '',
	editId      : undefined,
	shareId     : undefined,
	createdAt   : undefined,
	updatedAt   : undefined,
	renderer    : 'V3',
	// UNIT M8: the owner picked Inkmarch (the splash variant) as the default
	// output theme, so this is where a brew now starts. It replaces Tome, which
	// M2 put here for BUILD-BRIEF section 9's "the preview uses the proposed
	// Tome default". Tome is still built and still selectable.
	//
	// Existing brews keep whatever theme they were saved with; this is only
	// the starting point for a brew that has never chosen one.
	theme       : 'Inkmarch',
	authors     : [],
	tags        : [],
	systems     : [],
	lang        : 'en',
	thumbnail   : '',
	views       : 0,
	published   : false,
	pageCount   : 1,
	gDrive      : false,
	trashed     : false

};
// Default values for older brews with missing properties
// e.g., missing "renderer" is assumed to be "legacy"
const DEFAULT_BREW_LOAD = _.defaults(
	{
		renderer : 'legacy',
	},
	DEFAULT_BREW);

export {
	DEFAULT_BREW,
	DEFAULT_BREW_LOAD
};
