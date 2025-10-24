// SQLite database configuration and connection using Sequelize
import { Sequelize } from 'sequelize';
import path from 'path';

// Database configuration
const getDatabasePath = (config = null) => {
	const nodeEnv = config?.get('node_env') || process.env.NODE_ENV || 'local';
	if (nodeEnv === 'test') {
		return ':memory:'; // Use in-memory database for tests
	}
	// Use project root to resolve DB file to avoid relying on import.meta.url in test runners
	return path.join(process.cwd(), 'mythwright.sqlite');
};

let sequelize = null;

const connect = async (config = null) => {
	try {
		const dbPath = getDatabasePath(config);
		const nodeEnv = config?.get('node_env') || process.env.NODE_ENV || 'local';
		
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: dbPath,
			logging: nodeEnv === 'local' ? console.log : false,
			define: {
				// Use camelCase for automatically added timestamp fields
				createdAt: 'createdAt',
				updatedAt: 'updatedAt'
			}
		});

		// Test the connection
		await sequelize.authenticate();
		console.log('SQLite database connection established successfully.');

		// Sync all models (create tables if they don't exist)
		await sequelize.sync({ alter: false });
		console.log('Database synchronized successfully.');

		return sequelize;
	} catch (error) {
		console.error('Unable to connect to SQLite database:', error);
		throw error;
	}
};

const connectWithoutSync = async (config = null) => {
	try {
		const dbPath = getDatabasePath(config);
		const nodeEnv = config?.get('node_env') || process.env.NODE_ENV || 'local';
		
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: dbPath,
			logging: nodeEnv === 'local' ? console.log : false,
			define: {
				// Use camelCase for automatically added timestamp fields
				createdAt: 'createdAt',
				updatedAt: 'updatedAt'
			}
		});

		// Test the connection
		await sequelize.authenticate();
		console.log('SQLite database connection established successfully.');

		return sequelize;
	} catch (error) {
		console.error('Unable to connect to SQLite database:', error);
		throw error;
	}
};

const disconnect = async () => {
	if (sequelize) {
		await sequelize.close();
		console.log('SQLite database connection closed.');
	}
};

const getSequelize = () => {
	if (!sequelize) {
		throw new Error('Database not connected. Call connect() first.');
	}
	return sequelize;
};

export default {
	connect,
	connectWithoutSync,
	disconnect,
	getSequelize
};
