import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

import { tokens } from './src/tokens'

/** Émet `dist/tokens.json` (export map `./tokens.json`) depuis la source typée. */
function emitTokensJson(): Plugin {
  return {
    name: 'vectis:emit-tokens-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'tokens.json',
        source: JSON.stringify(tokens, null, 2) + '\n',
      })
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.build.json', cleanVueFileName: true }),
    emitTokensJson(),
  ],
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'tokens/index': fileURLToPath(new URL('./src/tokens/index.ts', import.meta.url)),
      },
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // Un module JS par fichier source → tree-shaking par composant chez le consommateur
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
