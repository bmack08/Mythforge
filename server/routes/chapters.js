import express from 'express';
import { getModels } from '../models/index.js';

const router = express.Router({ mergeParams: true });

// List all chapters for a project
router.get('/', async (req, res) => {
	try {
		const { Chapter } = getModels();
		const chapters = await Chapter.findAll({
			where: { projectId: req.params.projectId },
			order: [['orderIndex', 'ASC']],
			attributes: ['id', 'slug', 'title', 'orderIndex', 'level']
		});
		res.json(chapters);
	} catch (error) {
		console.error('Error fetching chapters:', error);
		res.status(500).json({ error: 'Failed to fetch chapters' });
	}
});

// Get single chapter by ID or slug
router.get('/:chapterIdOrSlug', async (req, res) => {
	try {
		const { Chapter } = getModels();
		const { projectId, chapterIdOrSlug } = req.params;

		const chapter = await Chapter.findOne({
			where: {
				projectId,
				[getModels().sequelize.Sequelize.Op.or]: [
					{ id: chapterIdOrSlug },
					{ slug: chapterIdOrSlug }
				]
			}
		});

		if (!chapter) {
			return res.status(404).json({ error: 'Chapter not found' });
		}

		res.json(chapter);
	} catch (error) {
		console.error('Error fetching chapter:', error);
		res.status(500).json({ error: 'Failed to fetch chapter' });
	}
});

// Create new chapter
router.post('/', async (req, res) => {
	try {
		const { Chapter } = getModels();
		const { title, slug, orderIndex, content, level, chapterType } = req.body;

		const chapter = await Chapter.create({
			projectId: req.params.projectId,
			title,
			slug,
			orderIndex: orderIndex || 0,
			content: content || { type: 'doc', content: [] },
			level: level || 1,
			chapterType: chapterType || 'adventure'
		});

		res.status(201).json(chapter);
	} catch (error) {
		console.error('Error creating chapter:', error);
		res.status(500).json({ error: 'Failed to create chapter' });
	}
});

// Update chapter
router.put('/:chapterId', async (req, res) => {
	try {
		const { Chapter } = getModels();
		const chapter = await Chapter.findByPk(req.params.chapterId);

		if (!chapter) {
			return res.status(404).json({ error: 'Chapter not found' });
		}

		// Update only provided fields
		const allowedFields = ['title', 'slug', 'content', 'orderIndex', 'level', 'chapterType', 'description'];
		allowedFields.forEach(field => {
			if (req.body[field] !== undefined) {
				chapter[field] = req.body[field];
			}
		});

		await chapter.save();
		res.json(chapter);
	} catch (error) {
		console.error('Error updating chapter:', error);
		res.status(500).json({ error: 'Failed to update chapter' });
	}
});

// Delete chapter
router.delete('/:chapterId', async (req, res) => {
	try {
		const { Chapter } = getModels();
		const chapter = await Chapter.findByPk(req.params.chapterId);

		if (!chapter) {
			return res.status(404).json({ error: 'Chapter not found' });
		}

		await chapter.destroy();
		res.json({ success: true });
	} catch (error) {
		console.error('Error deleting chapter:', error);
		res.status(500).json({ error: 'Failed to delete chapter' });
	}
});

export default router;
