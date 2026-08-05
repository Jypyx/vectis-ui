import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/storybook-static/**',
      // The v8 HTML report ships its own bundled JS (prettify.js, block-navigation.js)
      '**/coverage/**',
      '**/node_modules/**',
      'packages/ui/src/styles/tokens.css',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
    },
  },
  {
    rules: {
      // The DS SFCs carry simple element names (VButton, VInput…): intended.
      'vue/multi-word-component-names': 'off',
      // VMenu is an intended name; the casing distinguishes <VMenu> from the native <menu>.
      'vue/no-reserved-component-names': 'off',
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
