import { SITE_NAME, SITE_URL } from '~/content/site'
import type { DocsMessages } from '~/i18n/locales/en'

/**
 * The head every documentation page carries: its title, and the description a search engine or
 * a chat client shows underneath it.
 *
 * A page passes its catalogue namespace and nothing else. Both strings are read from the
 * message catalogue the page already renders — `title` is the one in its `<h1>`, and the
 * description is derived from the `lead` paragraph that opens it, which is a one sentence
 * summary of the page because that is what a lead is. Nothing here has to be written twice, so
 * a page's opening sentence and the sentence a search result prints cannot drift apart, and a
 * translated page is translated in its listing too.
 *
 * `DocsPage` is the namespaces that document a page, picked out by SHAPE rather than listed:
 * a catalogue module qualifies if it carries both a `title` and a `lead`, which the chrome
 * (`common`, `nav`), the error page and the home page do not. A typo in the argument is then a
 * typecheck failure instead of a page whose title renders as the raw key.
 */
type DocsPage = {
  [K in keyof DocsMessages]: DocsMessages[K] extends { title: string; lead: string } ? K : never
}[keyof DocsMessages]

/**
 * How much of a lead a description keeps, in characters.
 *
 * Whole sentences only, so this is a ceiling rather than a cut: a lead is kept up to the last
 * sentence that fits, and the first sentence is kept whatever its length. Google prints around
 * 160 characters and a chat client rather less, but neither penalises a longer one — what looks
 * bad in both is a sentence that stops mid-word.
 */
const DESCRIPTION_LIMIT = 200

const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&' }

/** The document title: a page's own, followed by the product, or the product on its own. */
export function documentTitle(title?: string): string {
  return title ? `${title} · ${SITE_NAME}` : SITE_NAME
}

/**
 * A page's lead, reduced to the plain text a `<meta name="description">` can carry.
 *
 * A lead is written for the page, so it holds the inline markup `DocsProse` renders: `<code>`
 * spans, the odd `<br>`, and the entities that let a tag name be printed as text.
 *
 * TRAP — the tags have to go BEFORE the entities are decoded, and not the other way round.
 * A lead that mentions an element writes it `&lt;button&gt;`, which decodes to `<button>`: decode
 * first and the tag stripper eats it, so the one sentence that names the element the component
 * renders loses the name. The `<br>` becomes a space because it separates two words; every other
 * tag becomes nothing, or the punctuation that follows one is left standing on its own.
 */
export function metaDescription(lead: string, limit = DESCRIPTION_LIMIT): string {
  const text = lead
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:lt|gt|amp);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim()

  let description = ''
  for (const sentence of text.split(/(?<=\.)\s+/)) {
    if (description && `${description} ${sentence}`.length > limit) break
    description = description ? `${description} ${sentence}` : sentence
  }

  return description
}

/**
 * Sets the title, the description and the breadcrumb of a documentation page from its catalogue
 * namespace.
 *
 * The `BreadcrumbList` is the site's hierarchy stated in the one form a search engine reads it
 * in: the rail expresses it in CSS and the URL in slashes, and neither is a claim about
 * structure. It is what puts a trail above the result instead of a bare address, and it is the
 * signal navigational sitelinks are picked from.
 *
 * Every URL is ABSOLUTE and localised, and all three are composed from `localePath('/')` and
 * the current path rather than written out: those are the same strings the canonical and the
 * `hreflang` alternates carry, trailing slash included, so a breadcrumb cannot name a page by an
 * address that redirects to it. The two labels are the header's own, deliberately — the trail
 * leads to the two destinations the header links to, and a second copy of "Home" and
 * "Documentation" in the catalogue would be a translation free to drift from the one on screen.
 *
 * The middle step points at `/docs/`, which is a redirect to the installation page rather than a
 * section index. That is the honest address of the section and it collides with no leaf, where
 * naming the installation page would make the trail of THAT page point twice at itself. A real
 * index there would make this correct rather than merely resolvable, and would need no change
 * here.
 */
export function useDocsHead(page: DocsPage): void {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()

  useHead(() => {
    const title = t(`${page}.title`)
    const description = metaDescription(t(`${page}.lead`))
    const home = `${SITE_URL}${localePath('/')}`

    return {
      title,
      meta: [
        { name: 'description', content: description },
        // og:title carries the FULL title, suffix included: a link preview has no tab to sit in
        // and no site name beside it, so the product has to be part of the line itself.
        { property: 'og:title', content: documentTitle(title) },
        { property: 'og:description', content: description },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: t('common.header.home'),
                item: home,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: t('common.header.docs'),
                item: `${home}docs/`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: title,
                item: `${SITE_URL}${route.path}`,
              },
            ],
          }),
        },
      ],
    }
  })
}
