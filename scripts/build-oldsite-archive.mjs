/**
 * Build the original React scrape (commit 3b91138) into dist/oldsitearchive/
 * for side-by-side language comparison with the live site.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ARCHIVE_COMMIT = '3b91138f76fd81cb10df5e6115f959887e125f26';
const ARCHIVE_BASE = '/oldsitearchive';
const ARCHIVE_BASE_SLASH = `${ARCHIVE_BASE}/`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'oldsitearchive');

const HORSE_SLUGS = [
  'donnie',
  'buddy',
  'safran',
  'manuka',
  'rusty',
  'mcduff',
  'redwing',
  'brunner',
  'ice',
  'leonard',
  'chloe',
  'arnie',
  'jasper',
  'brown-acre',
];

const SPA_ROUTES = [
  '',
  'accommodation/',
  'holistic-horse-rides/',
  'hack-farm-trails/',
  'our-horses/',
  ...HORSE_SLUGS.map((slug) => `horse/${slug}/`),
  'learning-experiences/',
  'vaulting/',
  'special-events/',
  'horse-riding-holiday-gift-vouchers/',
  'contact/',
  'partners/',
  'privacy-policy-2/',
  'sitemap/',
];

const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json', '.svg', '.txt', '.xml']);

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit', env: process.env });
}

function rewriteRootAbsolutePaths(text) {
  return text
    .replaceAll('"/images/', `"${ARCHIVE_BASE_SLASH}images/`)
    .replaceAll("'/images/", `'${ARCHIVE_BASE_SLASH}images/`)
    .replaceAll('`/images/', `\`${ARCHIVE_BASE_SLASH}images/`)
    .replaceAll('(/images/', `(${ARCHIVE_BASE_SLASH}images/`)
    .replaceAll('"/FreshWDL/', `"${ARCHIVE_BASE_SLASH}FreshWDL/`)
    .replaceAll("'/FreshWDL/", `'${ARCHIVE_BASE_SLASH}FreshWDL/`)
    .replaceAll('`/FreshWDL/', `\`${ARCHIVE_BASE_SLASH}FreshWDL/`);
}

function walkFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, out);
    else out.push(full);
  }
  return out;
}

function rewriteTree(dir) {
  for (const file of walkFiles(dir)) {
    const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
    if (!TEXT_EXT.has(ext)) continue;
    const before = readFileSync(file, 'utf8');
    const after = rewriteRootAbsolutePaths(before);
    if (after !== before) writeFileSync(file, after);
  }
}

function patchWorktree(worktree) {
  writeFileSync(
    join(worktree, 'vite.config.ts'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '${ARCHIVE_BASE_SLASH}',
  build: {
    outDir: 'dist',
  },
});
`,
  );

  const appPath = join(worktree, 'src', 'App.tsx');
  let app = readFileSync(appPath, 'utf8');
  if (!app.includes('BrowserRouter basename=')) {
    app = app.replace('<BrowserRouter>', `<BrowserRouter basename="${ARCHIVE_BASE}">`);
    writeFileSync(appPath, app);
  }

  const indexPath = join(worktree, 'index.html');
  let indexHtml = readFileSync(indexPath, 'utf8');
  if (!indexHtml.includes('name="robots"')) {
    indexHtml = indexHtml.replace(
      '<head>',
      '<head>\n    <meta name="robots" content="noindex, nofollow" />',
    );
  }
  writeFileSync(indexPath, rewriteRootAbsolutePaths(indexHtml));

  rewriteTree(join(worktree, 'src'));
  rewriteTree(join(worktree, 'public'));

  // Header checks startsWith('/FreshWDL') for the weather station <a>
  const headerPath = join(worktree, 'src', 'components', 'Header.tsx');
  if (existsSync(headerPath)) {
    let header = readFileSync(headerPath, 'utf8');
    header = header.replaceAll(
      "item.to.startsWith('/FreshWDL')",
      `item.to.startsWith('${ARCHIVE_BASE_SLASH}FreshWDL')`,
    );
    writeFileSync(headerPath, header);
  }
}

function materializeSpaRoutes(archiveDist) {
  const indexHtml = readFileSync(join(archiveDist, 'index.html'), 'utf8');
  writeFileSync(join(archiveDist, '404.html'), indexHtml);

  for (const route of SPA_ROUTES) {
    if (!route) continue;
    const dir = join(archiveDist, route);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), indexHtml);
  }
}

function main() {
  mkdirSync(join(root, 'dist'), { recursive: true });

  const worktreeParent = mkdtempSync(join(tmpdir(), 'hackfarm-oldsite-'));
  const worktree = join(worktreeParent, 'tree');

  console.log(`Building oldsite archive from ${ARCHIVE_COMMIT}...`);

  try {
    run(`git worktree add --detach "${worktree}" ${ARCHIVE_COMMIT}`, root);
    patchWorktree(worktree);
    run('npm ci', worktree);
    run('npm run build', worktree);

    const built = join(worktree, 'dist');
    if (!existsSync(join(built, 'index.html'))) {
      throw new Error('Archive build did not produce dist/index.html');
    }

    rmSync(outDir, { recursive: true, force: true });
    cpSync(built, outDir, { recursive: true });

    for (const junk of ['CNAME', 'sitemap.xml']) {
      const p = join(outDir, junk);
      if (existsSync(p)) unlinkSync(p);
    }

    materializeSpaRoutes(outDir);

    writeFileSync(
      join(outDir, 'README.txt'),
      [
        'Hack Farm old site archive',
        '',
        `Source commit: ${ARCHIVE_COMMIT}`,
        'Purpose: archival language/copy reference for comparison with the live site.',
        `Served at: https://hackfarm.co.nz${ARCHIVE_BASE_SLASH}`,
        'This build is noindex and excluded from the live sitemap.',
        '',
      ].join('\n'),
    );

    console.log(`Wrote archive to ${outDir}`);
  } finally {
    try {
      run(`git worktree remove --force "${worktree}"`, root);
    } catch {
      try {
        run('git worktree prune', root);
      } catch {
        /* ignore */
      }
    }
    rmSync(worktreeParent, { recursive: true, force: true });
  }
}

main();
