/*
 * The docs theme. It is a FULL custom theme: `vitepress/theme` is never imported, and
 * that is not a preference. The default theme exposes no slot able to replace the
 * sidebar or the navbar wholesale, and its stylesheet is unlayered — so it would win
 * over every `@layer vectis.*` rule and the site would stop looking like the design
 * system it documents. `Content`, `useData()`, `useRouter()` and `withBase()` come from
 * vitepress's core, which is theme-agnostic.
 */
import type { Theme } from 'vitepress'
import { setIconResolver } from '@vectis/ui'

import Layout from './Layout.vue'
import DocsDemo from './components/DocsDemo.vue'
import { docsIconResolver } from './iconResolver'

// The DS core: reset, tokens, tones, floating, panel, control-size, utilities. Each
// component's own sheet rides along with its module.
import '@vectis/ui/styles.css'
// Docs styles, deliberately UNLAYERED: CLAUDE.md makes a non-layered consumer style the
// intended override mechanism, and this site is the first real consumer.
import './styles/index.css'

/*
 * Module level, and this file is evaluated on the server AND on the client — which is
 * the requirement: a resolver installed inside a `setup()`, or only on the client, would
 * make the two renders diverge and produce a hydration mismatch on every icon.
 */
setIconResolver(docsIconResolver)

export default {
  Layout,
  enhanceApp({ app }) {
    // Global so a markdown page can frame a demo without an import; the components being
    // demonstrated stay page-local imports, or every page would pull in the whole library.
    app.component('DocsDemo', DocsDemo)
  },
} satisfies Theme
