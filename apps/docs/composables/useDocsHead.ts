import { SITE_NAME, SITE_URL } from '~/content/site'
import type { DocsMessages } from '~/i18n/locales/en'

/**
 * Derive page metadata and breadcrumbs from the typed catalogue namespace to keep visible prose
 * and search descriptions aligned.
 */
type DocsPage = {
  [K in keyof DocsMessages]: DocsMessages[K] extends { title: string; lead: string } ? K : never
}[keyof DocsMessages]

const DESCRIPTION_LIMIT = 200

const ENTITIES: Record<string, string> = { '&lt;': '<', '&gt;': '>', '&amp;': '&' }

/** The document title: a page's own, followed by the product, or the product on its own. */
export function documentTitle(title?: string): string {
  return title ? `${title} · ${SITE_NAME}` : SITE_NAME
}

/**
 * Strip tags before decoding entities so escaped element names remain text. Replace br with a
 * space to preserve word boundaries.
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

/** Set localized title, description and breadcrumb metadata from the page catalogue. */
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
        // Og:title carries the FULL title, suffix included: a link preview has no tab to sit in
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
