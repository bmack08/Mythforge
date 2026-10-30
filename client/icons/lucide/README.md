# Lucide icons, vendored

These are the icons Mythforge's **chrome** draws with: the global nav, the
Mythforge sub-bar, both editor toolbars, the preview toolbar, the dialogs, the
generator, the vault, the docs pages, settings and the 404.

## Why they are here and not in `node_modules`

This checkout's `node_modules` is a junction into another tree that this work
may not add packages to, so Lucide is **not a dependency**. The SVG sources are
copied into the repo and that copy is the only thing the app reads. No npm
install, no CDN, no second network request that can fail.

That last point is the reason for the whole exercise. Mythforge's icons were an
icon font, and the font is what kept failing:

* **UNIT M1** - the dev proxy answered `/…/fa-solid-900.woff2` with
  `200 text/html`, and after that was fixed Vite's `server.fs` answered `403`,
  because `node_modules` is a junction whose real path is outside the workspace.
  Every icon in the top bar and the toolbars was an empty box.
* **UNIT M4** - the custom `/icons/*.svg` masks 404'd (nothing served the
  folder) and then 406'd (content negotiation refuses image-only `Accept`).

Both were one request away from rendering, and both rendered as tofu until
somebody measured. Path data compiled into the bundle has no request to fail.

## Provenance and licence

| | |
|---|---|
| package | `lucide-react` **0.487.0** |
| licence | **ISC** - full text in [`LICENSE`](./LICENSE), unmodified |
| upstream | <https://lucide.dev> / <https://github.com/lucide-icons/lucide> |
| icons here | 138 (see `../../../scripts/lucide-icons.txt`) |

Lucide is ISC: use, copy, modify and distribute are granted provided the
copyright notice and the permission notice travel with the copies. `LICENSE`
sits beside the files it covers, and every `.svg` carries a one-line provenance
comment naming the icon, the upstream version and the licence.

Portions of Lucide are Feather (MIT, Cole Bemis); the ISC text covers that.

## Files

| file | what it is |
|---|---|
| `*.svg` | the vendored icons - **the source of truth**, byte-for-byte Lucide geometry |
| `icons.generated.js` | the same geometry as a JS registry, built from the `.svg` files |
| `LICENSE` | Lucide's ISC licence, copied unchanged |

## Changing the set

1. Add or remove a name in `scripts/lucide-icons.txt`.
2. `node scripts/vendorLucideIcons.cjs --from <path>/node_modules/lucide-react`
   - writes the `.svg` files. Needs any checkout that has `lucide-react`; it is
   the only step that does.
3. `node scripts/buildLucideIcons.cjs` - rewrites `icons.generated.js` from the
   `.svg` files in this directory. Needs nothing but this repo.
4. Commit the `.svg` files **and** `icons.generated.js`.

Step 3 alone is enough after hand-editing an `.svg`, which is also how you would
drop in a non-Lucide icon: put a 24x24, `currentColor`, stroked `.svg` in here
and re-run it.

## House style

Set by `client/components/Icon.jsx`, not by these files: `viewBox="0 0 24 24"`,
`fill="none"`, `stroke="currentColor"`, `stroke-width="1.9"` (Lucide ships 2;
1.9 is inside the 1.75-2 the Tidewatch chrome asks for), round caps and joins,
`width`/`height` of `1em` so an icon tracks the `font-size` of the `<i>` that
hosts it.
