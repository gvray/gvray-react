import { execSync } from 'child_process';
import minimist from 'minimist';
import { loadEnvFromEnv } from './load-env';

const args = minimist(process.argv.slice(2));

const mode = args.mode || 'dev';
const port = args.port || 8000;
const mock = args.mock;

loadEnvFromEnv(mode, { port, mock });

process.env.UMI_ENV = mode;
process.env.PORT = String(port);
process.env.APP_MOCK_ENABLED = mock || process.env.APP_MOCK_ENABLED || 'false';

// 启动 dev server（本地开发）
execSync(`npx umi dev`, { stdio: 'inherit' });
