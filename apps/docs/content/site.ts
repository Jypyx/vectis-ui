/**
 * The site's identity: the two constants everything that has to name the site reads.
 *
 * `SITE_NAME` is the product, so it is deliberately not translated. It reaches a search engine
 * by three routes, all of them from here: the suffix `documentTitle` puts on every page title,
 * the `og:site_name` meta in `app.vue`, and the `WebSite` structured data the home page carries.
 * Declared nowhere, a search engine falls back to the bare domain for the site name it prints
 * above a result — which is the difference between a listing headed "Vectis UI" and one headed
 * "vectis-ui.com".
 *
 * `SITE_URL` carries NO trailing slash: every composition appends a path that opens with one.
 * It is the base the canonical and the `hreflang` alternates are built from (`i18n.baseUrl` in
 * nuxt.config.ts), and the origin the two files under `server/routes/` write into their output.
 *
 * The file lives beside `content/nav.ts` for the same reason that one does: it is read from
 * NODE contexts (nuxt.config.ts, the server routes, the post-build check) as well as from the
 * application, so it can hold no Vue and no vue-i18n.
 */

/** The product's name, as it should appear in a browser tab and in a search listing. */
export const SITE_NAME = 'Vectis UI'

/** The origin the site is served from, without a trailing slash. */
export const SITE_URL = 'https://vectis-ui.com'

/**
 * The locale segment the i18n strategy puts in front of a route.
 *
 * `prefix_except_default` means the default locale keeps the bare paths — every URL the site has
 * ever published stays valid — and the other language lives under its own segment. The empty
 * string for `en` is not a placeholder: it is what `docRoutes()` prepends, so one call covers
 * both locales with no branch.
 *
 * `scripts/check-prerender.ts` keeps a copy of this list rather than importing it, and that is
 * deliberate: a check that derives its expectations from the file it is checking cannot fail.
 */
export const LOCALE_PREFIXES = ['', '/fr']

/**
 * Where the project lives besides this site: its repository and its published package.
 *
 * They are the `sameAs` of the `Organization` node the home page carries, which is the whole of
 * their job here — `sameAs` is how a search engine learns that a domain, a repository and a
 * package are one thing under three addresses rather than three unrelated ones, and that is the
 * signal a brand result is built on. So they are identity, which is what this file holds.
 *
 * The footer writes the repository URL a second time, inside its own message and once per
 * locale. That duplication is deliberate and the message says why: the anchor has to be part of
 * the sentence, and the site's pass-through message compiler leaves no way to parameterise one.
 */
export const SITE_REPO_URL = 'https://github.com/Jypyx/vectis-ui'
export const SITE_NPM_URL = 'https://www.npmjs.com/package/vectis-ui'
