/* The path this server serves the app under. Root, because that is where
 * server/app.js registers its routes; MYTHFORGE_BASE_PATH overrides it for a
 * deployment that mounts Mythforge under a prefix. Same env name the Vite
 * config reads, so dev and production are configured from one place. */
const mountPath = (() => {
  const trimmed = (process.env.MYTHFORGE_BASE_PATH || '').replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '/';
})();

const template = async function (name, title = '', props = {}) {
  const ogTags = [];
  const ogMeta = props.ogMeta ?? {};
  Object.entries(ogMeta).forEach(([key, value]) => {
    if (!value) return;
    const tag = `<meta property="og:${key}" content="${value}">`;
    ogTags.push(tag);
  });
  const ogMetaTags = ogTags.join('\n');

  return `<!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, height=device-height, interactive-widget=resizes-visual" />
      <link href="//fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
      <link href="/${name}/bundle.css" type="text/css" rel="stylesheet" />
      <link rel="icon" href="/assets/favicon.ico" type="image/x-icon" />
      ${ogMetaTags}
      <meta name="twitter:card" content="summary">
      <title>${title.length ? `${title} - Mythforge` : 'Mythforge'}</title>
    </head>
    <body>
      <!-- React root will be hydrated by client-side bundle -->
      <main id="reactRoot"></main>
      <script>
        /* UNIT M5 prerequisite. This page did not run its own bundle.
         *
         * Two faults, both visible as a blank white page on the
         * production-style server (\`node server.js\`), which is the one the
         * owner looks at:
         *
         *   1. \`npm run build\` is \`vite build\`, which emits an ES MODULE. The
         *      script tag below had no \`type="module"\`, so the browser
         *      refused it with "Cannot use import statement outside a module"
         *      and React never mounted. Every route rendered nothing.
         *   2. \`start_app\` was called here and has never existed anywhere in
         *      the bundle (noted in UNIT M4 as found-not-fixed), so the inline
         *      call threw \`start_app is not defined\` on top of that.
         *
         * A module script is DEFERRED, so this classic script runs first and
         * the bundle cannot be the thing that defines \`start_app\`. It is
         * defined here instead, as what the name always implied: the server
         * handing its props to the client. Nothing reads them yet -
         * client/homebrew/homebrew-entry.jsx mounts from window.location and
         * its own defaults, which is the behaviour units M1-M4 were verified
         * against - so wiring these through is a separate change with the
         * editor re-tested, not something to slip in behind an icon swap. */
        window.start_app = function(props){ window.__MYTHFORGE_SERVER_PROPS__ = props; };
        start_app(${JSON.stringify(props)})

        /* Where this server actually mounts the app.
         *
         * client/homebrew/utils/basePath.js reads this and falls back to
         * '/mythforge' - the sub-path Mythforge takes when it is embedded in
         * TaleForge. \`node server.js\` mounts at the ROOT (/vault is 200,
         * /mythforge/vault is 404), so taking the fallback made React Router
         * refuse to match any URL:
         *
         *   <Router basename="/mythforge"> is not able to match the URL "/"
         *   because it does not start with the basename, so the <Router>
         *   won't render anything.
         *
         * Blank page, no error. Now the server states its own mount point,
         * overridable for an embedded deployment. */
        window.__MYTHFORGE_BASE_PATH__ = ${JSON.stringify(mountPath)};
      </script>
      <script type="module" src="/${name}/bundle.js"></script>
    </body>
  </html>`;
};

export default template;
