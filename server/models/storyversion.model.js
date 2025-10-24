// StoryVersion model: Simple event-sourced versions for Homebrew text (Phase 1)
import { DataTypes, Model } from 'sequelize';
import { nanoid } from 'nanoid';

class StoryVersion extends Model {}

export const initStoryVersionModel = (sequelize) => {
	StoryVersion.init({
		id: {
			type: DataTypes.STRING(12),
			primaryKey: true,
			defaultValue: () => nanoid(12),
			allowNull: false
		},
		brewId: {
			type: DataTypes.STRING(24), // editId or DB id
			allowNull: false,
			comment: 'Brew editId (preferred) or numeric id'
		},
		parentId: {
			type: DataTypes.STRING(12),
			allowNull: true
		},
		author: {
			type: DataTypes.ENUM('ai','user'),
			allowNull: false,
			defaultValue: 'ai'
		},
		patch: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Unified diff against parent fullText (optional)'
		},
		fullText: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: 'Snapshot of full document text at this version'
		},
		fullTextHash: {
			type: DataTypes.STRING(64),
			allowNull: false
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
		summary: {
			type: DataTypes.STRING(255),
			allowNull: true
		}
	}, {
		sequelize,
		modelName: 'StoryVersion',
		tableName: 'story_versions',
		timestamps: true,
		indexes: [
			{ fields: ['brewId', 'createdAt'] },
			{ fields: ['brewId', 'isActive'] },
			{ fields: ['parentId'] }
		]
	});

	return StoryVersion;
};

export { StoryVersion as model };
