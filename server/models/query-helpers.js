// Dialect-portable `where` fragments.
//
// SQLite and Postgres disagree on two things this app's brew lookups rely on:
//
//   * LIKE is case-insensitive for ASCII on SQLite but case-sensitive on
//     Postgres, which spells the insensitive form ILIKE. A username search
//     that worked on SQLite would silently stop matching on Postgres.
//
//   * A JSON column can be LIKE-matched directly on SQLite, because the JSON
//     type is stored as TEXT there. Postgres's `json` type has no LIKE (or
//     ILIKE) operator at all, so the column has to be cast to text first or
//     the query fails outright with
//     `operator does not exist: json ~~* unknown`.
//
// Note on wildcards: a search term containing % or _ is still treated as a
// LIKE pattern, exactly as it was before Postgres support was added. That is
// pre-existing behaviour and is deliberately left alone here.
import { Op, Sequelize } from 'sequelize';
import database from '../database.js';

// Case-insensitive "contains" on a plain text/varchar column, either dialect.
const textContains = (value)=>({
	[database.isPostgres() ? Op.iLike : Op.like] : `%${value}%`
});

// Case-insensitive "contains" against the serialised contents of a JSON
// column.
//
// Returns a fragment meant to go inside an [Op.and] array rather than a
// `{ column: ... }` property: on Postgres it is a Sequelize.where() wrapper,
// which cannot be used as an object value.
const jsonContains = (column, value)=>{
	if(!database.isPostgres()) {
		return { [column]: { [Op.like]: `%${value}%` } };
	}
	return Sequelize.where(
		Sequelize.cast(Sequelize.col(column), 'text'),
		{ [Op.iLike]: `%${value}%` }
	);
};

// True when `extra` carries any condition worth adding to an [Op.and] list.
// Operator keys are symbols, so Object.keys alone would miss them.
const hasConditions = (extra)=>
	Boolean(extra) && typeof extra === 'object'
	&& (Object.keys(extra).length > 0 || Object.getOwnPropertySymbols(extra).length > 0);

// A plain `{...}` literal, as opposed to a Sequelize.where() wrapper.
const isPlainObject = (value)=>
	Object.prototype.toString.call(value) === '[object Object]'
	&& (value.constructor === Object || value.constructor === undefined);

// Combine where-fragments under [Op.and], dropping the empty ones. Fragments
// that are not plain objects - a Sequelize.where() wrapper, for instance - are
// always kept, since their conditions are not visible as own keys.
const allOf = (...fragments)=>({
	[Op.and] : fragments.filter((fragment)=>{
		if(fragment == null) return false;
		if(isPlainObject(fragment)) return hasConditions(fragment);
		return true;
	})
});

export { textContains, jsonContains, hasConditions, allOf };
export default { textContains, jsonContains, hasConditions, allOf };
