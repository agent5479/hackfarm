import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.BASE_URL || '/hackfarm/').replace(/\/?$/, '/');
const keep = base.split('/').filter(Boolean).length;

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hack n Stay Golden Bay</title>
    <script>
      var pathSegmentsToKeep = ${keep};
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
`;

writeFileSync(join(root, 'dist', '404.html'), html);
console.log(`Wrote dist/404.html with pathSegmentsToKeep=${keep} (base ${base})`);
