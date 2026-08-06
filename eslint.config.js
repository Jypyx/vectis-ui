import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import prettier from 'eslint-config-prettier'
import storybook from 'eslint-plugin-storybook'
import pluginVue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/storybook-static/**',
      // The v8 HTML report ships its own bundled JS (prettify.js, block-navigation.js)
      '**/coverage/**',
      // VitePress's dev cache; its build output is already covered by `**/dist/**`.
      '**/.vitepress/cache/**',
      '**/node_modules/**',
      'packages/ui/src/styles/tokens.css',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  /*
   * Static a11y. It does NOT replace axe (which runs after every play function, in
   * both themes, on real computed styles): it catches at author time what axe can only
   * see if a story puts it on screen — a `@click` on a non-interactive element, a
   * missing `alt`, an invalid `aria-*`.
   */
  ...vueA11y.configs['flat/recommended'],
  // 41 story files: malformed CSF and bad exports are caught here rather than at run.
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  /*
   * TYPE-AWARE linting, on `.ts` only, and a HAND-PICKED set of rules rather than the
   * `recommendedTypeChecked` preset.
   *
   * The preset is unusable here, and not for a stylistic reason: a `.ts` story or test
   * imports `./VButton.vue`, which the TypeScript project service cannot type (that is
   * vue-tsc's job). Every value coming out of an SFC therefore reads as an error type,
   * and the `no-unsafe-*` family alone produced 1794 errors — none of them a defect.
   *
   * What is kept are the rules that reason about PROMISES, which need no SFC type at
   * all and cover the repo's real exposure: 41 story files whose async play functions
   * are made of `await userEvent…`, where a dropped promise is invisible.
   *
   * `.vue` stays out for the same typing reason; `pnpm typecheck` covers the SFCs.
   */
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      // NOT `require-await`: several `it(…, async () => …)` are declared async for
      // uniformity across their file. Stylistic, and the rule cannot tell the two apart.
    },
  },
  {
    /*
     * Storybook INSTRUMENTS `expect` so each assertion shows up as a step in the
     * Interactions panel, and the instrumented call returns a promise. A bare
     * `expect(…)` in a play function therefore reads as a floating promise — about
     * thirty of them here — without being one: verified by inverting an assertion,
     * which failed the run, so the instrumented matcher still throws SYNCHRONOUSLY and
     * nothing is silently skipped. Many of these also sit inside a synchronous
     * `waitFor` callback, where awaiting them would mean making the callback async and
     * changing how waitFor retries.
     *
     * `await-thenable` and `no-misused-promises` stay ON here — they are what caught
     * an `await` on the DOM's own `.click()` and an `expect` handed to `forEach`.
     */
    files: ['**/*.stories.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
  {
    files: ['**/*.test.ts'],
    plugins: { vitest },
    rules: {
      // A committed `.only` would silently green-light the whole suite.
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/no-identical-title': 'error',
    },
  },
  {
    rules: {
      // The DS SFCs carry simple element names (VButton, VInput…): intended.
      'vue/multi-word-component-names': 'off',
      // VMenu is an intended name; the casing distinguishes <VMenu> from the native <menu>.
      'vue/no-reserved-component-names': 'off',

      /*
       * The four a11y rules this design system structurally cannot satisfy. axe stays
       * the authority — it runs after every play function, in both themes, on real
       * computed styles, and the suite is at 0 violations. What follows is the list of
       * places where the static rule and the real audit disagree, and why the real one
       * is right.
       */

      // A `<label>` WRAPPING its control is the DS's wrapper-root pattern (VCheckbox,
      // VRadio, VSwitch): the association is by nesting, and the hidden input keeps no
      // id of its own. `nesting` alone is the accurate requirement here.
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],

      // Fires on DELEGATION containers: the nav of VPagination and VSideNavigation, the
      // tablist of VTabs, VTooltip's wrapper, the roots of VCombobox and VTimePicker.
      // The handler is on the container by design (arrow keys, focusout, click-to-open)
      // and the real controls are its children. It also fires on `.v-side-nav-end`,
      // whose handler CANCELS a click rather than performing an action.
      'vuejs-accessibility/no-static-element-interactions': 'off',
      // Same sites: adding a keyboard listener beside a delegated or cancelling click
      // would create a second, unwanted activation path.
      'vuejs-accessibility/click-events-have-key-events': 'off',
      // Fires on composite-widget containers (`role="menu"`, `role="tablist"`) whose
      // CHILDREN carry the roving tabindex — which is the ARIA pattern, and which axe
      // accepts.
      'vuejs-accessibility/interactive-supports-focus': 'off',
    },
  },
  {
    // TypeScript already checks the identifiers; no-undef produces false positives
    // on DOM globals (HTMLDialogElement, MouseEvent…).
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-undef': 'off',
    },
  },
  prettier,
)
