import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/storybook-static/**',
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
      // Les SFC du DS portent des noms d'éléments simples (VButton, VInput…) : voulu.
      'vue/multi-word-component-names': 'off',
      // VMenu est un nom voulu ; la casse distingue <VMenu> du <menu> natif dans les SFC.
      'vue/no-reserved-component-names': 'off',
    },
  },
  {
    // TypeScript vérifie déjà les identifiants ; no-undef produit des faux
    // positifs sur les globals DOM (HTMLDialogElement, MouseEvent…).
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-undef': 'off',
    },
  },
  prettier,
)
