// Local WordPress without Docker or PHP: WordPress Playground (PHP 8.3 in WebAssembly).
// Usage: npm run local  ->  http://127.0.0.1:9400  (fresh site, seeded, logged in as admin)
// The theme and plugin are mounted live, so edits (and `npm run watch`) show on reload.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve('@wp-playground/cli/package.json')), 'wp-playground.js');
const port = process.env.PORT || '9400';

const args = [
  cli, 'server',
  `--port=${port}`,
  '--php=8.3',
  '--login',
  '--mount-dir', join(root, 'theme/iim'), '/wordpress/wp-content/themes/iim',
  '--mount-dir', join(root, 'plugins/iim-core'), '/wordpress/wp-content/plugins/iim-core',
  '--blueprint', join(root, 'tools/playground.blueprint.json'),
];

const child = spawn(process.execPath, args, { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
