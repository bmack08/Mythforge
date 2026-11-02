import express from 'express';
import asyncHandler from 'express-async-handler';
import { getModels } from './models/index.js';
import { textContains, jsonContains, allOf } from './models/query-helpers.js';

const router = express.Router();

const buildSearchConditions = (query) => {
	const conditions = { published: true };

	if (query.title) {
		// Case-insensitive on both dialects: SQLite LIKE is already
		// insensitive for ASCII, Postgres needs ILIKE.
		conditions.title = textContains(query.title);
	}

	if (query.legacy === 'true' && query.v3 !== 'true') {
		conditions.renderer = 'legacy';
	} else if (query.v3 === 'true' && query.legacy !== 'true') {
		conditions.renderer = 'V3';
	}

	// authors is a JSON column, which Postgres will not LIKE-match without a
	// cast, so that fragment has to be combined under Op.and rather than set
	// as a property. See models/query-helpers.js.
	return allOf(conditions, query.author ? jsonContains('authors', query.author) : null);
};

router.get('/api/vault', asyncHandler(async (req, res) => {
	try {
		const { Homebrew } = getModels();
		
		const conditions = buildSearchConditions(req.query);
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.min(100, Math.max(1, parseInt(req.query.count) || 20));
		const offset = (page - 1) * limit;

		const { count, rows: brews } = await Homebrew.findAndCountAll({
			where: conditions,
			limit,
			offset,
			order: [['createdAt', 'DESC']],
			attributes: [
				'shareId',
				'title', 
				'description',
				'authors',
				'thumbnail',
				'views',
				'createdAt',
				'updatedAt',
				'tags',
				'systems'
			]
		});

		res.json({
			brews: brews.map(brew => brew.toJSON ? brew.toJSON() : brew),
			totalPages: Math.ceil(count / limit),
			currentPage: page,
			totalCount: count
		});
	} catch (error) {
		console.error('Vault search error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}));

export default router;
