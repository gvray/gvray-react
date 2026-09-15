import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// 加载 .env.[mode] 作为基底，再用 .env（本地覆盖、gitignore）override 覆盖，使 .env 优先级最高。
// 返回被 .env 覆盖过的 key 集合，便于打印时区分来源。
export const loadEnvFiles = (mode: string): Set<string> => {
  const overridden = new Set<string>();

  const modePath = path.resolve(process.cwd(), `.env.${mode}`);
  if (fs.existsSync(modePath)) {
    dotenv.config({ path: modePath, quiet: true });
  } else {
    console.warn(`⚠️ .env.${mode} file not found`);
  }

  const localPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(localPath)) {
    const before = { ...process.env };
    dotenv.config({ path: localPath, override: true, quiet: true });
    for (const k of Object.keys(process.env)) {
      if (process.env[k] !== before[k]) overridden.add(k);
    }
  }

  return overridden;
};

// ANSI 颜色（不引入额外依赖）
const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
};

// Slant 字体的项目名横幅（固定图案，避免引入 figlet）
const BANNER = [
  '   __ __           __      __      ',
  '  / //_/___ ______/ /____ / /____ _',
  ' / ,< / __ `/ ___/ __/ _ \\/ __/ -_)',
  '/_/|_|\\_,_/ /__/_/  \\___/\\__/\\__/',
  '                                   ',
].join('\n');

const ENV_KEYS = [
  'APP_ENV',
  'APP_API_URL',
  'APP_API_ORIGIN',
  'APP_API_TOKEN_KEY',
  'APP_API_TIMEOUT',
  'APP_CDN_URL',
  'APP_VERSION',
  'APP_BUILD_TIME',
  'APP_SENTRY_DSN',
  'APP_TRACKING_ID',
  'APP_MOCK_ENABLED',
  'APP_LOGGING_ENABLED',
  'APP_DEFAULT_LANGUAGE',
  'APP_DEFAULT_AVATAR_URL',
] as const;

const padRight = (s: string, n: number) =>
  s.length >= n ? s : s + ' '.repeat(n - s.length);

export const loadEnvFromEnv = (
  mode: string,
  opts: { port?: number | string; mock?: string } = {},
) => {
  const overridden = loadEnvFiles(mode);

  const { port, mock } = opts;
  const mockOn = (mock || process.env.APP_MOCK_ENABLED) === 'true';

  console.log(`\n${c.bold}${c.cyan}${BANNER}${c.reset}`);
  console.log(
    `  ${c.dim}➜${c.reset}  ${c.bold}mode${c.reset} ${c.gray}:${
      c.reset
    } ${mode}      ${c.dim}➜${c.reset}  ${c.bold}port${c.reset} ${c.gray}:${
      c.reset
    } ${port ?? '-'}      ${c.dim}➜${c.reset}  ${c.bold}mock${c.reset} ${
      c.gray
    }:${c.reset} ${
      mockOn ? `${c.green}on${c.reset}` : `${c.gray}off${c.reset}`
    }\n`,
  );

  const rows = ENV_KEYS.map((k) => [
    k,
    process.env[k] as string | undefined,
  ]).filter(([, v]) => v !== undefined && v !== '') as [string, string][];

  const overriddenCount = rows.filter(([k]) => overridden.has(k)).length;
  console.log(
    `  ${c.dim}Environment${c.reset} ${c.gray}(${rows.length})${c.reset}${
      overriddenCount > 0
        ? `  ${c.yellow}${overriddenCount} overridden by .env${c.reset}`
        : ''
    }`,
  );
  for (const [k, v] of rows) {
    const isOverridden = overridden.has(k);
    const valColor = isOverridden ? c.yellow : '';
    const valReset = isOverridden ? c.reset : '';
    const sourceTag = isOverridden ? ` ${c.gray}(.env)${c.reset}` : '';
    console.log(
      `  ${c.gray}•${c.reset} ${c.bold}${padRight(k, 24)}${
        c.reset
      } ${valColor}${v}${valReset}${sourceTag}`,
    );
  }
  console.log('');
};
