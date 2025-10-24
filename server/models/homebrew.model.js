import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';
import zlib from 'zlib';
import database from '../database.js';

class Homebrew extends Model {
	// Static method to increase view count
	static async increaseView(query) {
		try {
			const brew = await this.findOne({ where: query });
			if (brew) {
				brew.lastViewed = new Date();
				brew.views = (brew.views || 0) + 1;
				await brew.save();
				return brew;
			}
			return null;
		} catch (err) {
			console.error('Error increasing view count:', err);
			throw err;
		}
	}

	// Static method to get a brew with text decompression
	static async get(query, fields = null) {
		try {
			const options = { where: query };
			if (fields && Array.isArray(fields)) {
				options.attributes = fields;
			}

			const brew = await this.findOne(options);
			if (!brew) {
				throw new Error('Can not find brew');
			}

			// Uncompress zipped text field if it exists
			if (brew.textBin && brew.textBin.length > 0) {
				try {
					const unzipped = zlib.inflateRawSync(brew.textBin);
					brew.text = unzipped.toString();
				} catch (decompressError) {
					console.warn('Failed to decompress textBin, using text field:', decompressError);
				}
			}

			return brew;
		} catch (error) {
			console.error('Error in Homebrew.get:', error);
			throw error;
		}
	}

	// Static method to get brews by user
	static async getByUser(username, allowAccess = false, fields = null, filter = {}) {
		try {
			const whereClause = { 
				authors: {
					[database.getSequelize().Sequelize.Op.like]: `%${username}%`
				},
				...filter
			};

			if (!allowAccess) {
				whereClause.published = true;
			}

			const options = { where: whereClause };
			if (fields && Array.isArray(fields)) {
				options.attributes = fields;
			}

			const brews = await this.findAll(options);
			return brews;
		} catch (error) {
			console.error('Error in Homebrew.getByUser:', error);
			throw new Error('Can not find brews');
		}
	}

	// Instance method to compress and save text
	async saveWithCompression() {
		if (this.text && !this.googleId) {
			// Compress text to binary before saving
			this.textBin = zlib.deflateRawSync(this.text);
			// Clear the text field to save space
			this.text = null;
		}
		return await this.save();
	}
}

// Initialize the model
const initHomebrewModel = (sequelize) => {
	Homebrew.init({
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		shareId: {
			type: DataTypes.STRING(12),
			defaultValue: () => nanoid(12),
			unique: true,
			allowNull: false
		},
		editId: {
			type: DataTypes.STRING(12),
			defaultValue: () => nanoid(12),
			unique: true,
			allowNull: false
		},
		googleId: {
			type: DataTypes.STRING,
			allowNull: true
		},
		title: {
			type: DataTypes.STRING,
			defaultValue: '',
			allowNull: false
		},
		text: {
			type: DataTypes.JSON, // Changed from TEXT to JSON to support TipTap JSON content
			defaultValue: {},
			allowNull: true
		},
		style: {
			type: DataTypes.TEXT, // CSS styles
			defaultValue: '',
			allowNull: true
		},
		snippets: {
			type: DataTypes.TEXT, // User snippets
			defaultValue: '',
			allowNull: true
		},
		theme: {
			type: DataTypes.STRING(50), // Theme name
			defaultValue: '5ePHB',
			allowNull: true
		},
		textBin: {
			type: DataTypes.BLOB,
			allowNull: true
		},
		pageCount: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			defaultValue: '',
			allowNull: false
		},
		tags: {
			type: DataTypes.JSON,
			defaultValue: [],
			allowNull: false
		},
		systems: {
			type: DataTypes.JSON,
			defaultValue: [],
			allowNull: false
		},
		lang: {
			type: DataTypes.STRING(10),
			defaultValue: 'en',
			allowNull: false
		},
		renderer: {
			type: DataTypes.STRING(50),
			defaultValue: '',
			allowNull: false
		},
		authors: {
			type: DataTypes.JSON,
			defaultValue: [],
			allowNull: false
		},
		invitedAuthors: {
			type: DataTypes.JSON,
			defaultValue: [],
			allowNull: false
		},
		published: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false
		},
		thumbnail: {
			type: DataTypes.STRING,
			defaultValue: '',
			allowNull: false
		},
		lastViewed: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false
		},
		views: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false
		},
		version: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false
		},
		lock: {
			type: DataTypes.JSON,
			allowNull: true
		}
	}, {
		sequelize,
		modelName: 'Homebrew',
		tableName: 'homebrews',
		timestamps: true,
		indexes: [
			{
				unique: true,
				fields: ['shareId']
			},
			{
				unique: true,
				fields: ['editId']
			},
			{
				fields: ['authors']
			},
			{
				fields: ['published']
			},
			{
				fields: ['createdAt']
			}
		]
	});

	return Homebrew;
};

export { Homebrew as model, initHomebrewModel };
