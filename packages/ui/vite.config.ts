import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve as resolvePath } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

import { tokens } from './src/tokens'

/** Emits `dist/tokens.json` (export map `./tokens.json`) from the typed source. */
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

/** Keep the emitted layer order aligned with src/styles/index.css. */
const LAYER_ORDER = '@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;\n'

/** Name each component stylesheet beside the JS module that imports it. */
function cssAssetFileName(asset: { originalFileNames?: string[] }): string {
  const source = asset.originalFileNames?.[0] ?? ''
  const sfc = /^src\/(.+)\.vue(?:[?#]|$)/.exec(source)
  if (sfc) return `${sfc[1]}.css`
  if (/^src\/styles\/index\.css/.test(source)) return 'styles.css'
  return '[name].[ext]'
}

/**
 * Restore Vite's stripped CSS imports and prepend layer order; libraries have no HTML to attach
 * emitted stylesheets.
 */
function shipComponentCss(): Plugin {
  return {
    name: 'vectis:ship-component-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset') {
          if (file.fileName.endsWith('.css') && file.fileName !== 'styles.css')
            file.source = LAYER_ORDER + file.source
          continue
        }
        const css = file.fileName.replace(/\.js$/, '.css')
        if (css !== file.fileName && bundle[css])
          file.code = `import './${css.slice(css.lastIndexOf('/') + 1)}';\n` + file.code
      }
    },
  }
}

/**
 * Add explicit .js extensions to declaration imports so node16/nodenext consumers can resolve
 * package types.
 */
function dtsExtensions(): Plugin {
  return {
    name: 'vectis:dts-extensions',
    apply: 'build',
    enforce: 'post',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist', import.meta.url))
      if (!existsSync(dist)) return

      const files: string[] = []
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, entry.name)
          if (entry.isDirectory()) walk(full)
          else if (entry.name.endsWith('.d.ts')) files.push(full)
        }
      }
      walk(dist)

      for (const file of files) {
        const source = readFileSync(file, 'utf8')
        const patched = source.replace(
          /(\bfrom\s*|\bimport\s*\()(['"])(\.\.?\/[^'"]*)\2/g,
          (whole, head: string, quote: string, spec: string) => {
            if (/\.[a-z0-9]+$/i.test(spec)) return whole
            const target = resolvePath(dirname(file), spec)
            const suffix =
              existsSync(target) && existsSync(join(target, 'index.d.ts')) ? '/index.js' : '.js'
            return `${head}${quote}${spec}${suffix}${quote}`
          },
        )
        if (patched !== source) writeFileSync(file, patched)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.build.json', cleanVueFileName: true }),
    emitTokensJson(),
    shipComponentCss(),
    dtsExtensions(),
  ],
  build: {
    // Each SFC's <style> becomes its own asset, shipped with its module: a consumer
    // downloads the CSS of the components they import, not of the whole library.
    cssCodeSplit: true,
    // Keep the JavaScript output floor aligned with tsconfig's target.
    target: 'es2022',
    /*
     * Set a browser CSS target independently of the JS target; keep the documented floor to
     * avoid unnecessary lowering.
     */
    cssTarget: ['chrome134', 'edge134', 'safari26', 'firefox147'],
    // A consumer stepping into vectis-ui otherwise lands in renamed identifiers with
    // nothing mapping back to the SFC.
    sourcemap: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'tokens/index': fileURLToPath(new URL('./src/tokens/index.ts', import.meta.url)),
        icons: fileURLToPath(new URL('./src/icons.ts', import.meta.url)),
      },
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      /*
       * Externalize Vue subpaths as well as vue itself so library output cannot duplicate the
       * consumer's runtime.
       */
      external: [/^vue$/, /^vue\//, /^@vue\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: cssAssetFileName,
      },
    },
  },
})
