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

/**
 * Declared once per emitted sheet — see `shipComponentCss`. Kept in sync by hand with
 * `src/styles/index.css`, the only other place the order is written.
 */
const LAYER_ORDER = '@layer vectis.reset, vectis.tokens, vectis.components, vectis.utilities;\n'

/**
 * Names each split `<style>` after its SFC — `dist/components/VButton/VButton.css`,
 * the sibling of the `VButton.js` that imports it. Left to Rollup it would land at
 * `VButton.vue_vue_type_style_index_0_lang.css`, and that `X.js` ↔ `X.css` pairing is
 * exactly what `shipComponentCss` and `scripts/check-css-split.ts` rely on.
 * `src/styles/index.css` keeps the historical `styles.css` name: the exports map, the
 * README and every consumer import stay untouched.
 */
function cssAssetFileName(asset: { originalFileNames?: string[] }): string {
  // `src/components/VButton/VButton.vue?vue&type=style&index=0&lang.css`
  const source = asset.originalFileNames?.[0] ?? ''
  const sfc = /^src\/(.+)\.vue(?:[?#]|$)/.exec(source)
  if (sfc) return `${sfc[1]}.css`
  if (/^src\/styles\/index\.css/.test(source)) return 'styles.css'
  return '[name].[ext]'
}

/**
 * Puts back the CSS import that Vite removes, and stamps the layer order on every sheet.
 *
 * TRAP — `vite:css-post` DELETES the `<style>` chunk once it has emitted the asset and
 * replaces the import with an "empty css" marker comment, because an app injects its
 * `<link>` tags from the HTML instead. A library has no HTML: without this hook the sheets
 * ship unreferenced and a consumer gets an unstyled component, silently. The pairing is
 * derived from the file names (`X.js` ↔ `X.css`, see `cssAssetFileName`) rather than from
 * `viteMetadata.importedCss`, which is transitive — on the `index.js` barrel it lists all
 * 54 sheets, and importing them there would put the whole stylesheet back into every
 * consumer's bundle, defeating the split.
 *
 * The layer order is re-declared at the top of every component sheet because the order in
 * which the consumer's bundler concatenates them is not ours to fix: a
 * `@layer vectis.components{}` block parsed before the order statement would pin that
 * layer FIRST, i.e. under the reset, and no later statement can move it. Re-declaring an
 * existing order is a no-op, so whichever sheet lands first sets it correctly. Cost: ~40
 * bytes gzip. `styles.css` is left alone — it already opens with the same statement.
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
 * Gives every relative specifier in the emitted `.d.ts` its explicit `.js` extension.
 *
 * TRAP — the source is written for `moduleResolution: bundler`, where
 * `export … from './i18n/state'` is legal, and TypeScript emits specifiers VERBATIM.
 * A consumer on `node16`/`nodenext` resolution — the setting for anything targeting
 * Node rather than a bundler — then fails to resolve those imports and silently gets
 * NO TYPES AT ALL: not an error, just a package that appears untyped. `bundler`
 * consumers (Vite, Nuxt) never see it, which is exactly why it survives unnoticed.
 * `pnpm check:package` (@arethetypeswrong/cli) is what now keeps it fixed.
 *
 * It runs at `closeBundle` and `enforce: 'post'`, so vite-plugin-dts has written its
 * files: the directory test below reads the real tree rather than guessing.
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
            // Already carries an extension (`.js`, `.json`, `.css`): leave it alone.
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
    // Pinned rather than left to Vite's shifting `'modules'` default: a published
    // library's output floor is a contract, and this one mirrors tsconfig's `target`.
    target: 'es2022',
    /*
     * TRAP — `cssTarget` defaults to `build.target`, and esbuild reads an ES version
     * as a very old BROWSER baseline for CSS: setting `target` alone silently
     * de-optimizes every sheet (measured: the core went from 4.06 to 4.99 kB gzip).
     * The floor here is the one the README documents, so modern-CSS minification
     * stays on and nothing this design system relies upon gets lowered.
     */
    cssTarget: ['chrome125', 'edge125', 'safari26', 'firefox128'],
    // A consumer stepping into @vectis/ui otherwise lands in renamed identifiers with
    // nothing mapping back to the SFC.
    sourcemap: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'tokens/index': fileURLToPath(new URL('./src/tokens/index.ts', import.meta.url)),
      },
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      /*
       * Regexes, not the bare string: a string external matches the specifier EXACTLY,
       * so a single `vue/server-renderer` or `@vue/shared` import would be bundled into
       * `dist/` in silence, duplicating the runtime in the consumer's graph. Nothing
       * imports those today — which is precisely why the mistake would go unnoticed.
       */
      external: [/^vue$/, /^vue\//, /^@vue\//],
      output: {
        // One JS module per source file → per-component tree-shaking for the consumer
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: cssAssetFileName,
      },
    },
  },
})
