/**
 * The site's identity: the two constants everything that has to name the site reads.
 * `SITE_NAME` is the product, so it is deliberately not translated.
 */

/** The product's name, as it should appear in a browser tab and in a search listing. */
export const SITE_NAME = 'Vectis UI'

/** The origin the site is served from, without a trailing slash. */
export const SITE_URL = 'https://vectis-ui.com'

/**
 * The locale segment the i18n strategy puts in front of a route. `prefix_except_default` means
 * the default locale keeps the bare paths; every URL the site has ever published stays valid;
 * and the other language lives under its own segment.
 */
export const LOCALE_PREFIXES = ['', '/fr']

/**
 * The site's pages besides the home page and the documentation, without their locale prefix.
 * The theme builder's preview frame is not one: it is prerendered, but kept out of the sitemap.
 */
export const SITE_PAGES = ['/theme']

/** Pages rendered only to be framed by another page. */
export const FRAMED_PAGES = ['/theme/preview']

/** Where the project lives besides this site: its repository and its published package. */
export const SITE_REPO_URL = 'https://github.com/Jypyx/vectis-ui'
export const SITE_NPM_URL = 'https://www.npmjs.com/package/vectis-ui'
