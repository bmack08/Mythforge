import { spawn } from 'child_process';
import buildThemeIndex from './buildThemeIndex.js';

const processes = [];

const spawnTask = (label, scriptPath, extraArgs = [])=>{
	const args = ['--experimental-require-module', scriptPath, ...extraArgs];
	const child = spawn(process.execPath, args, {
		stdio : 'inherit',
		env   : process.env
	});

	child.on('exit', (code, signal)=>{
		if(code !== 0) {
			console.error(`dY"; ${label} exited with code ${code ?? 'null'}${signal ? ` (signal ${signal})` : ''}`);
		}
	});

	processes.push({ label, child });
};

const shutdown = (signal)=>{
	console.log(`dY"< Caught ${signal}. Shutting down dev processes...`);
	for (const { child } of processes) {
		child.kill('SIGINT');
	}
	process.exit(0);
};

process.on('SIGINT', ()=>shutdown('SIGINT'));
process.on('SIGTERM', ()=>shutdown('SIGTERM'));

(async ()=>{
	console.time('dev');
	try {
		await buildThemeIndex();

		spawnTask('homebrew', 'scripts/buildHomebrew.js', ['--dev']);
		spawnTask('admin', 'scripts/buildAdmin.js', ['--dev']);

		console.timeEnd('dev');
	} catch (error) {
		console.error('dY"? Failed to start dev workflow.', error);
		process.exit(1);
	}
})();
