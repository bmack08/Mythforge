/*eslint max-lines: ["warn", {"max": 500, "skipBlankLines": true, "skipComments": true}]*/
// Simplified admin API for SQLite - core functionality only
import { getModels } from './models/index.js';
import express from 'express';
import Moment from 'moment';
import HomebrewAPI from './homebrew.api.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin';
process.env.ADMIN_PASS = process.env.ADMIN_PASS || 'password3';

const mw = {
	adminOnly: (req, res, next) => {
		if (!req.get('authorization')) {
			return res
				.set('WWW-Authenticate', 'Basic realm="Authorization Required"')
				.status(401)
				.send('Authorization Required');
		}
		const [username, password] = Buffer.from(req.get('authorization').split(' ').pop(), 'base64')
			.toString('ascii')
			.split(':');
		if (process.env.ADMIN_USER === username && process.env.ADMIN_PASS === password) {
			return next();
		}
		throw { HBErrorCode: '52', code: 401, message: 'Access denied' };
	}
};

// Get count of old brews for cleanup (simplified version)
router.get('/admin/cleanup', mw.adminOnly, async (req, res) => {
	try {
		const { Homebrew } = getModels();
		const { Op } = getModels().sequelize.Sequelize;
		
		const thirtyDaysAgo = Moment().subtract(30, 'days').toDate();
		
		const count = await Homebrew.count({
			where: {
				updatedAt: { [Op.lt]: thirtyDaysAgo },
				lastViewed: { [Op.lt]: thirtyDaysAgo }
			}
		});
		
		res.json({ count });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Delete old brews (simplified version)
router.post('/admin/cleanup', mw.adminOnly, async (req, res) => {
	try {
		const { Homebrew } = getModels();
		const { Op } = getModels().sequelize.Sequelize;
		
		const thirtyDaysAgo = Moment().subtract(30, 'days').toDate();
		
		const result = await Homebrew.destroy({
			where: {
				updatedAt: { [Op.lt]: thirtyDaysAgo },
				lastViewed: { [Op.lt]: thirtyDaysAgo }
			},
			limit: 100
		});
		
		res.json({ count: result });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Lookup brew by ID
router.get('/admin/lookup/:id', mw.adminOnly, async (req, res) => {
	try {
		const { id } = req.params;
		const { Homebrew } = await getModels();
		const brew = await Homebrew.findById(id);
		
		if (!brew) {
			return res.status(404).json({ error: 'Brew not found' });
		}
		
		res.json({
			_id: brew._id,
			title: brew.title,
			text: brew.text,
			renderer: brew.renderer,
			theme: brew.theme,
			shareId: brew.shareId,
			editId: brew.editId,
			createdAt: brew.createdAt,
			updatedAt: brew.updatedAt
		});
	} catch (error) {
		console.error('Admin lookup error:', error);
		res.status(500).json({ error: 'Failed to lookup brew' });
	}
});

// Get basic stats
router.get('/admin/stats', mw.adminOnly, async (req, res) => {
	try {
		const { Homebrew } = getModels();
		
		const totalBrews = await Homebrew.count();
		const publishedBrews = await Homebrew.count({ where: { published: true } });
		const recentBrews = await Homebrew.count({
			where: {
				createdAt: {
					[getModels().sequelize.Sequelize.Op.gte]: Moment().subtract(7, 'days').toDate()
				}
			}
		});
		
		res.json({
			totalBrews,
			publishedBrews,
			recentBrews
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Notification management (simplified)
router.get('/admin/notifications', mw.adminOnly, async (req, res) => {
	try {
		const { Notification } = getModels();
		const notifications = await Notification.getAll();
		res.json(notifications);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

router.post('/admin/notifications', mw.adminOnly, async (req, res) => {
	try {
		const { Notification } = getModels();
		const notification = await Notification.addNotification(req.body);
		res.json(notification);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message || 'Internal Server Error' });
	}
});

router.delete('/admin/notifications/:dismissKey', mw.adminOnly, async (req, res) => {
	try {
		const { Notification } = getModels();
		await Notification.deleteNotification(req.params.dismissKey);
		res.json({ success: true });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message || 'Internal Server Error' });
	}
});

export default router;
