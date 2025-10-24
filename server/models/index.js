// Model initialization and exports
import database from '../database.js';
import { initHomebrewModel } from './homebrew.model.js';
import { initNotificationModel } from './notification.model.js';
import { initProjectModel } from './project.model.js';
import { initChapterModel } from './chapter.model.js';
import { initSectionModel } from './section.model.js';
import { initEncounterModel } from './encounter.model.js';
import { initStatBlockModel } from './statblock.model.js';
import { initMagicItemModel } from './magicitem.model.js';
import { initNPCModel } from './npc.model.js';
import { initTemplateModel } from './template.model.js';
import { initVersionModel } from './version.model.js';
import { initStoryVersionModel } from './storyversion.model.js';
import { initStoryChunkModel } from './storychunk.model.js';

let models = null;

const initializeModels = async (config = null) => {
	// Connect to database (without sync)
	const sequelize = await database.connectWithoutSync(config);
	
	// Initialize all models
	const Homebrew = initHomebrewModel(sequelize);
	const Notification = initNotificationModel(sequelize);
	
	// Initialize Mythwright models
	const Project = initProjectModel(sequelize);
	const Chapter = initChapterModel(sequelize);
	const Section = initSectionModel(sequelize);
	const Encounter = initEncounterModel(sequelize);
	const StatBlock = initStatBlockModel(sequelize);
	const MagicItem = initMagicItemModel(sequelize);
	const NPC = initNPCModel(sequelize);
	const Template = initTemplateModel(sequelize);
	const Version = initVersionModel(sequelize);
		const StoryVersion = initStoryVersionModel(sequelize);
		const StoryChunk = initStoryChunkModel(sequelize);
	
	// Define associations
		setupAssociations({ 
			Project, Chapter, Section, Encounter, 
			StatBlock, MagicItem, NPC, Template, Version, StoryVersion, StoryChunk 
		});
	
	// Sync all models after they're all defined
	await sequelize.sync({ alter: false });
	console.log('All models synchronized successfully.');
	
		models = {
		// Legacy Homebrewery models
		Homebrew,
		Notification,
		
		// Mythwright models
		Project,
		Chapter,
		Section,
		Encounter,
		StatBlock,
		MagicItem,
		NPC,
		Template,
		Version,
		StoryVersion,
		StoryChunk,
		
		sequelize
	};
	
	return models;
};

// Set up model associations
const setupAssociations = ({ 
	Project, Chapter, Section, Encounter, 
	StatBlock, MagicItem, NPC, Template, Version 
}) => {
	// Project associations
	Project.hasMany(Chapter, {
		foreignKey: 'projectId',
		as: 'chapters',
		onDelete: 'CASCADE'
	});
	
	Project.hasMany(Encounter, {
		foreignKey: 'projectId',
		as: 'encounters',
		onDelete: 'CASCADE'
	});
	
	Project.hasMany(StatBlock, {
		foreignKey: 'projectId',
		as: 'statBlocks',
		onDelete: 'CASCADE'
	});
	
	Project.hasMany(MagicItem, {
		foreignKey: 'projectId',
		as: 'magicItems',
		onDelete: 'CASCADE'
	});
	
	Project.hasMany(NPC, {
		foreignKey: 'projectId',
		as: 'npcs',
		onDelete: 'CASCADE'
	});
	
	// Chapter associations
	Chapter.belongsTo(Project, {
		foreignKey: 'projectId',
		as: 'project'
	});
	
	Chapter.hasMany(Chapter, {
		foreignKey: 'parentId',
		as: 'children',
		onDelete: 'CASCADE'
	});
	
	Chapter.belongsTo(Chapter, {
		foreignKey: 'parentId',
		as: 'parent'
	});
	
	Chapter.hasMany(Section, {
		foreignKey: 'chapterId',
		as: 'sections',
		onDelete: 'CASCADE'
	});
	
	Chapter.hasMany(Encounter, {
		foreignKey: 'chapterId',
		as: 'encounters',
		onDelete: 'CASCADE'
	});
	
	Chapter.hasMany(StatBlock, {
		foreignKey: 'chapterId',
		as: 'statBlocks',
		onDelete: 'CASCADE'
	});
	
	Chapter.hasMany(MagicItem, {
		foreignKey: 'chapterId',
		as: 'magicItems',
		onDelete: 'CASCADE'
	});
	
	Chapter.hasMany(NPC, {
		foreignKey: 'chapterId',
		as: 'npcs',
		onDelete: 'CASCADE'
	});
	
	// Section associations
	Section.belongsTo(Chapter, {
		foreignKey: 'chapterId',
		as: 'chapter'
	});
	
	// Encounter associations
	Encounter.belongsTo(Project, {
		foreignKey: 'projectId',
		as: 'project'
	});
	
	Encounter.belongsTo(Chapter, {
		foreignKey: 'chapterId',
		as: 'chapter'
	});
	
	// StatBlock associations
	StatBlock.belongsTo(Project, {
		foreignKey: 'projectId',
		as: 'project'
	});
	
	StatBlock.belongsTo(Chapter, {
		foreignKey: 'chapterId',
		as: 'chapter'
	});
	
	// MagicItem associations
	MagicItem.belongsTo(Project, {
		foreignKey: 'projectId',
		as: 'project'
	});
	
	MagicItem.belongsTo(Chapter, {
		foreignKey: 'chapterId',
		as: 'chapter'
	});
	
	// NPC associations
	NPC.belongsTo(Project, {
		foreignKey: 'projectId',
		as: 'project'
	});
	
	NPC.belongsTo(Chapter, {
		foreignKey: 'chapterId',
		as: 'chapter'
	});
	
	// Template associations (self-referencing for parent templates)
	Template.belongsTo(Template, {
		foreignKey: 'parentTemplateId',
		as: 'parentTemplate'
	});
	
	Template.hasMany(Template, {
		foreignKey: 'parentTemplateId',
		as: 'childTemplates',
		onDelete: 'SET NULL'
	});
	
	// Version associations (self-referencing for version history)
	Version.belongsTo(Version, {
		foreignKey: 'parentVersionId',
		as: 'parentVersion'
	});
	
	Version.belongsTo(Version, {
		foreignKey: 'mergeSourceId',
		as: 'mergeSource'
	});
	
	Version.hasMany(Version, {
		foreignKey: 'parentVersionId',
		as: 'childVersions',
		onDelete: 'CASCADE'
	});
};

const getModels = () => {
	if (!models) {
		throw new Error('Models not initialized. Call initializeModels() first.');
	}
	return models;
};

export { initializeModels, getModels };
