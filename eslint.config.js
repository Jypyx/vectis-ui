/*
 * ESLint covers only what Oxlint (`vp lint`) cannot: Vue `<template>` blocks, which Oxlint does
 * not parse. Script blocks and every other file are linted by Oxlint; the few script rules the
 * Vue preset also carries may report a violation twice.
 */
import prettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['**/dist/**', '**/storybook-static/**', '**/.nuxt/**', '**/.output/**'],
  },
  ...pluginVue.configs['flat/recommended'],
  /*
   * Static a11y. It does NOT replace axe (which runs after every play function, in both themes,
   * on real computed styles): it catches at author time what axe only sees when a story puts it
   * on screen, such as a `@click` on a non-interactive element, a missing `alt` or an invalid
   * `aria-*`.
   */
  ...vueA11y.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
    rules: {
      // Oxlint skips `<script setup>` bindings because it cannot see their template uses; this
      // rule reads the template, and vue-tsc's noUnusedLocals cannot (tsconfig.base.json).
      '@typescript-eslint/no-unused-vars': 'error',
      // The DS SFCs carry simple element names (VButton, VInput…): intended.
      'vue/multi-word-component-names': 'off',
      // VMenu is an intended name; the casing distinguishes <VMenu> from the native <menu>.
      'vue/no-reserved-component-names': 'off',

      /*
       * The a11y rules this design system structurally cannot satisfy. axe stays the authority
       * and the suite is at 0 violations; these are the places where the static rule and the
       * real audit disagree.
       */

      // A `<label>` WRAPPING its control is the DS's wrapper-root pattern (VCheckbox, VRadio,
      // VSwitch): the association is by nesting, and the hidden input keeps no id of its own.
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
      // Fires on DELEGATION containers (VPagination, VSideNavigation, VTabs, VTooltip, VCombobox,
      // VTimePicker): the handler is on the container by design and the real controls are its
      // children. It also fires on `.v-side-nav-end`, whose handler cancels a click.
      'vuejs-accessibility/no-static-element-interactions': 'off',
      // Same sites: a keyboard listener beside a delegated or cancelling click would create a
      // second, unwanted activation path.
      'vuejs-accessibility/click-events-have-key-events': 'off',
      // Fires on composite-widget containers (`role="menu"`, `role="tablist"`) whose CHILDREN
      // carry the roving tabindex, which is the ARIA pattern axe accepts.
      'vuejs-accessibility/interactive-supports-focus': 'off',
    },
  },
  {
    /*
     * The documentation site writes no inline style: its sheets ship as render-blocking `<link>`s
     * (`features.inlineStyles: false`), so a class is ready as early and is written once. Scoped
     * to the site: the library legitimately binds `:style` for values a stylesheet cannot know.
     */
    files: ['apps/docs/**/*.vue'],
    rules: {
      'vue/no-static-inline-styles': 'error',
    },
  },
  prettier,
]
