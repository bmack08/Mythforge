import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';
import zlib from 'zlib';
import { jsonContains, allOf } from './query-helpers.js';

// Coerce whatever the driver handed back for the textBin column into a Buffer.
//
// sqlite3 returns a BLOB as a Buffer and pg returns a BYTEA as a Buffer, so the
// common path is a no-op. The other shapes show up when a row has been through
// a JSON round-trip ({ type: 'Buffer', data: [...] }) or a driver returned a
// typed array. Anything we do not recognise is passed through untouched so the
// caller's existing error handling still sees it.
const toBinaryBuffer = (value)=>{
	if(value == null) return value;
	if(Buffer.isBuffer(value)) return value;
	if(value instanceof Uint8Array || Array.isArray(value)) return Buffer.from(value);
	if(typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
		return Buffer.from(value.data);
	}
	return value;
};

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

			// Uncompress zipped text field if it exists. textBin is a BLOB on
			// SQLite and a BYTEA on Postgres; both drivers hand it back as a
			// Buffer, which zlib takes directly.
			const compressed = toBinaryBuffer(brew.textBin);
			if (compressed && compressed.length > 0) {
				try {
					const unzipped = zlib.inflateRawSync(compressed);
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

	// Look a brew up by primary key, tolerating an id that is not a number.
	//
	// homebrews.id is an INTEGER, but several routes accept "either an editId
	// or an id" and fall back to a primary-key lookup after the editId lookup
	// misses. SQLite will happily compare its INTEGER column against a nanoid
	// like 'aB3dE6gH9jK2' and match nothing. Postgres rejects the comparison
	// outright with `invalid input syntax for type integer`, which turns what
	// should be a 404 into a 500 - including on /share, /source and /download.
	//
	// Screening the value first gives both dialects the answer SQLite always
	// gave: no such row.
	static async findByNumericPk(value, options = undefined) {
		if (value === null || value === undefined) return null;
		const candidate = String(value).trim();
		// Ids come from an auto-increment sequence, so only unsigned integers
		// can ever match.
		if (!/^\d+$/.test(candidate)) return null;
		const asNumber = Number(candidate);
		if (!Number.isSafeInteger(asNumber)) return null;
		return this.findByPk(asNumber, options);
	}

	// Static method to get brews by user
	static async getByUser(username, allowAccess = false, fields = null, filter = {}) {
		try {
			// authors is a JSON column, so the substring match has to be built
			// per dialect - see query-helpers.js. The fragments are combined
			// under Op.and because the Postgres form is a Sequelize.where()
			// wrapper and cannot sit in a `{ authors: ... }` property.
			const whereClause = allOf(
				jsonContains('authors', username),
				allowAccess ? null : { published: true },
				filter
			);

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
			// UNIT M8: Inkmarch is the default output theme. Rows already
			// written keep their stored value - a column default only applies
			// to an INSERT that omits the column.
			defaultValue: 'Inkmarch',
			allowNull: true
		},
		textBin: {
			// BLOB on SQLite, BYTEA on Postgres. Both drivers read it back as a
			// Buffer, which is what zlib.inflateRawSync/deflateRawSync want.
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
			// `authors` is a JSON column. SQLite stores JSON as TEXT, so a
			// btree index over it is at least legal there, and it has always
			// been declared. Postgres rejects it outright - the json type has
			// no default operator class for btree - which fails the whole
			// sync(), so the index is simply not declared on Postgres.
			//
			// Nothing is lost: the lookup it nominally backs is
			// `authors LIKE '%name%'`, and no btree index can serve a pattern
			// with a leading wildcard on either dialect.
			...(sequelize.getDialect() === 'postgres' ? [] : [{
				fields: ['authors']
			}]),
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
