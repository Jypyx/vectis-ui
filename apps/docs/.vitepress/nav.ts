import type { DocsNavItem, DocsSidebarSection } from './theme/types'

/**
 * The site's navigation, in one place.
 *
 * Every `link` is site-relative, extension-less and without `base` — the canonical
 * spelling `useActiveLink()` derives from `page.relativePath`, so a section index keeps
 * its trailing slash. `useDocsHref()` is the single place a link becomes an href, which
 * is where `base` and `cleanUrls` are applied.
 *
 * A link here must point at a page that exists: vitepress fails the build on a dead link,
 * which is exactly the behaviour that keeps this file honest.
 */
export const nav: DocsNavItem[] = [
  { text: 'Guide', link: '/guide/' },
  { text: 'Components', link: '/components/button' },
]

export const sidebar: Record<string, DocsSidebarSection[]> = {
  '/guide/': [
    {
      label: 'Getting started',
      items: [
        { text: 'What is Vectis UI?', link: '/guide/' },
        { text: 'Installation', link: '/guide/installation' },
      ],
    },
    {
      label: 'Foundations',
      items: [
        { text: 'Theming', link: '/guide/theming' },
        { text: 'Icons', link: '/guide/icons' },
        { text: 'Internationalization', link: '/guide/i18n' },
      ],
    },
    {
      label: 'Guarantees',
      items: [
        { text: 'Accessibility', link: '/guide/accessibility' },
        { text: 'Security model', link: '/guide/security' },
      ],
    },
  ],
  '/components/': [
    {
      label: 'Actions',
      items: [{ text: 'Button', link: '/components/button' }],
    },
    {
      label: 'Navigation',
      items: [{ text: 'Side navigation', link: '/components/side-navigation' }],
    },
    {
      label: 'Form',
      items: [{ text: 'Combobox', link: '/components/combobox' }],
    },
  ],
}
