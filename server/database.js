// Database configuration and connection using Sequelize.
//
// Two dialects are served by the same code path:
//   * Postgres - used when DATABASE_URL is a postgres:// or postgresql:// URL
//                (Neon in production).
//   * SQLite   - the default for local development and for tests.
//
// Nothing about the SQLite behaviour changes while DATABASE_URL is unset.
import { Sequelize } from 'sequelize';
import path from 'path';

const POSTGRES_PREFIXES = ['postgres://', 'postgresql://'];

// Hosts reachable without TLS, so SSL defaults to off for them.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

const TRUTHY = /^(1|true|yes|on)$/i;
const FALSY = /^(0|false|no|off)$/i;

const resolveNodeEnv = (config = null, env = process.env)=>config?.get?.('node_env') || env.NODE_ENV || 'local';

// The connection URL, when one is configured. nconf is consulted first so a
// config/*.json entry keeps working, then the environment.
const getDatabaseUrl = (config = null, env = process.env)=>config?.get?.('database_url') || env.DATABASE_URL || '';

const isPostgresUrl = (url)=>typeof url === 'string' && POSTGRES_PREFIXES.some((prefix)=>url.startsWith(prefix));

// Which dialect a config/environment resolves to, without opening a connection.
const resolveDialect = (config = null, env = process.env)=>isPostgresUrl(getDatabaseUrl(config, env)) ? 'postgres' : 'sqlite';

// SQLite storage location. Unchanged from the pre-Postgres behaviour.
const getDatabasePath = (config = null, env = process.env)=>{
	if(resolveNodeEnv(config, env) === 'test') {
		return ':memory:'; // Use in-memory database for tests
	}
	// Use project root to resolve DB file to avoid relying on import.meta.url in test runners
	return path.join(process.cwd(), 'mythwright.sqlite');
};

// Translate a libpq sslmode into the `ssl` option node-postgres expects.
//
// An explicit sslmode in the URL wins, then PGSSLMODE, then a host-based
// default: localhost gets no TLS, anything remote (Neon) is required and
// verified. Modes we do not model ('prefer', typos) fall back to that same
// host-based default rather than quietly disabling verification.
const resolveSslOption = (url, env = process.env)=>{
	let host = '';
	let mode = '';
	try {
		const parsed = new URL(url);
		host = (parsed.hostname || '').toLowerCase();
		mode = parsed.searchParams.get('sslmode') || '';
	} catch {
		// Unparseable URL: leave it to pg to report, but still pick a safe default.
	}
	if(!mode) mode = env.PGSSLMODE || '';
	mode = String(mode).trim().toLowerCase();

	if(mode === 'disable' || mode === 'allow') return false;
	if(mode === 'require' || mode === 'verify-ca' || mode === 'verify-full') {
		return { require: true, rejectUnauthorized: true };
	}

	const isLocal = LOCAL_HOSTS.has(host) || host.endsWith('.localhost');
	return isLocal ? false : { require: true, rejectUnauthorized: true };
};

const resolvePoolMax = (env = process.env)=>{
	const parsed = Number.parseInt(env.DB_POOL_MAX ?? '', 10);
	// Serverless Postgres charges for connections, so the pool stays small.
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
};

// Shared `define` block so both dialects name the timestamp columns alike.
const DEFINE = {
	// Use camelCase for automatically added timestamp fields
	createdAt : 'createdAt',
	updatedAt : 'updatedAt'
};

// Build the Sequelize constructor arguments for the resolved dialect.
// Exported so the resolution can be asserted in tests without connecting.
const buildSequelizeOptions = (config = null, env = process.env)=>{
	const url = getDatabaseUrl(config, env);
	if(isPostgresUrl(url)) {
		return {
			dialect : 'postgres',
			url     : url,
			options : {
				dialect        : 'postgres',
				logging        : false,
				define         : { ...DEFINE },
				pool           : { max: resolvePoolMax(env), min: 0, idle: 10000, acquire: 30000 },
				dialectOptions : { ssl: resolveSslOption(url, env) }
			}
		};
	}

	const nodeEnv = resolveNodeEnv(config, env);
	return {
		dialect : 'sqlite',
		url     : null,
		options : {
			dialect : 'sqlite',
			storage : getDatabasePath(config, env),
			logging : nodeEnv === 'local' ? console.log : false,
			define  : { ...DEFINE }
		}
	};
};

let sequelize = null;

const createSequelize = (config = null, env = process.env)=>{
	const { dialect, url, options } = buildSequelizeOptions(config, env);
	return dialect === 'postgres' ? new Sequelize(url, options) : new Sequelize(options);
};

// Whether sync() should run as part of application boot.
//
// DB_SYNC_ON_BOOT is authoritative in both directions when set. Otherwise
// production-on-Postgres never syncs at boot - schema changes go through
// `npm run db:setup` - while every other combination, notably SQLite local
// dev and tests, keeps syncing exactly as it did before.
const shouldSyncOnBoot = (config = null, env = process.env)=>{
	const flag = String(env.DB_SYNC_ON_BOOT ?? '').trim();
	if(flag !== '') {
		if(TRUTHY.test(flag)) return true;
		if(FALSY.test(flag)) return false;
	}
	const isProduction = resolveNodeEnv(config, env) === 'production';
	return !(isProduction && resolveDialect(config, env) === 'postgres');
};

// A log-safe description of the target. Never includes the URL: it has the
// password in it.
const describeConnection = (config = null, env = process.env)=>{
	if(resolveDialect(config, env) === 'postgres') {
		const url = getDatabaseUrl(config, env);
		const ssl = resolveSslOption(url, env);
		let host = 'unknown host';
		try { host = new URL(url).host; } catch { /* keep the placeholder */ }
		return `Postgres (${host}, ssl=${ssl ? 'require' : 'disabled'}, pool max ${resolvePoolMax(env)})`;
	}
	return `SQLite (${getDatabasePath(config, env)})`;
};

const connect = async (config = null)=>{
	try {
		sequelize = createSequelize(config);

		// Test the connection
		await sequelize.authenticate();
		console.log(`Database connection established successfully: ${describeConnection(config)}`);

		// Sync all models (create tables if they don't exist)
		if(shouldSyncOnBoot(config)) {
			await sequelize.sync({ alter: false });
			console.log('Database synchronized successfully.');
		} else {
			console.log('Skipping schema sync at boot; set DB_SYNC_ON_BOOT=true to override.');
		}

		return sequelize;
	} catch (error) {
		console.error(`Unable to connect to database [${describeConnection(config)}]:`, error);
		throw error;
	}
};

const connectWithoutSync = async (config = null)=>{
	try {
		sequelize = createSequelize(config);

		// Test the connection
		await sequelize.authenticate();
		console.log(`Database connection established successfully: ${describeConnection(config)}`);

		return sequelize;
	} catch (error) {
		console.error(`Unable to connect to database [${describeConnection(config)}]:`, error);
		throw error;
	}
};

const disconnect = async ()=>{
	if(sequelize) {
		await sequelize.close();
		console.log('Database connection closed.');
	}
};

const getSequelize = ()=>{
	if(!sequelize) {
		throw new Error('Database not connected. Call connect() first.');
	}
	return sequelize;
};

// Dialect of the live connection when there is one, otherwise the dialect the
// current config/environment would resolve to. Call sites use this to choose
// between dialect-specific operators without needing a connection first.
const getDialect = (config = null)=>{
	if(sequelize) return sequelize.getDialect();
	return resolveDialect(config);
};

const isPostgres = (config = null)=>getDialect(config) === 'postgres';

const api = {
	connect,
	connectWithoutSync,
	disconnect,
	getSequelize,
	getDialect,
	isPostgres,
	shouldSyncOnBoot,
	buildSequelizeOptions,
	resolveDialect,
	resolveSslOption,
	resolvePoolMax,
	isPostgresUrl,
	getDatabaseUrl,
	getDatabasePath
};

export {
	connect,
	connectWithoutSync,
	disconnect,
	getSequelize,
	getDialect,
	isPostgres,
	shouldSyncOnBoot,
	buildSequelizeOptions,
	resolveDialect,
	resolveSslOption,
	resolvePoolMax,
	isPostgresUrl,
	getDatabaseUrl,
	getDatabasePath
};

export default api;
