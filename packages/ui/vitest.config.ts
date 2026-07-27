import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

/**
 * Deux projets, un par couche de tests (répartition stricte, cf. CLAUDE.md) :
 * - `unit`   : la LOGIQUE des composants en jsdom (`pnpm test`) ;
 * - `storybook` : les play functions dans un vrai navigateur, seule couche qui
 *   couvre le comportement navigateur (popover, top-layer, :user-invalid…)
 *   — `pnpm test:stories`, exclu du checkpoint car il exige les binaires
 *   Playwright (`pnpm exec playwright install chromium`).
 *
 * Bruit connu du projet `storybook` : une ligne
 * « [@vue/compiler-core] decodeEntities option is passed » par template
 * compilé au runtime (les stories déclarent leurs templates en chaînes).
 * Émis par Vue, recopié par le transfert de console de Vite ; inoffensif.
 * Ni `onConsoleLog` (Vitest) ni un filtre littéral ne l'interceptent, et
 * couper `server.forwardConsole` masquerait TOUS les warnings navigateur —
 * on préfère le bruit à l'aveuglement.
 */
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [vue()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.ts'],
          setupFiles: ['./vitest.setup.ts'],
          // requis pour le cleanup automatique de @testing-library/vue entre les tests
          globals: true,
        },
      },
      {
        // `vue()` est indispensable ici : un projet Vitest n'hérite pas des
        // plugins de la racine, et storybookTest n'apporte que les plugins
        // Storybook — sans lui, les .vue importés par les stories partent en
        // « invalid JS syntax » à l'analyse d'imports.
        // Le plugin réutilise la config Storybook telle quelle et applique
        // lui-même les annotations de preview.ts (thème, direction) depuis
        // Storybook 10.3 : aucun fichier de setup à écrire ici.
        plugins: [vue(), storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
