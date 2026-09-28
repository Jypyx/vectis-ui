# Agent guide

## Project and architecture

- Vectis UI is a Vue 3 + TypeScript design system, compatible with Nuxt SSR, in a pnpm monorepo.
- Use English for code, comments and documentation source. Storybook and the documentation site support English and French.
- `packages/ui/src/components/VX/`: component SFCs, component-owned helpers, unit tests, stories and MDX documentation.
- `packages/ui/src/composables/`: shared reactive or DOM behaviour. `src/utils/`: pure, stateless helpers.
- `packages/ui/src/types.ts`: types shared across unrelated components. Component-owned types stay with their component.
- `packages/ui/src/tokens/`: typed DTCG token sources and themes. `src/styles/`: shared CSS recipes and layer ordering.
- `packages/ui/src/i18n/`: typed message dictionaries and reactive locale configuration.
- `packages/ui/src/index.ts`: public exports. `src/icons.ts`: importable built-in icons.
- `packages/ui/scripts/`: generators and package, CSS and size checks. `.storybook/`: Storybook configuration.
- `apps/docs/`: statically generated Nuxt documentation site consuming the built library through `vectis-ui`.

## Component conventions

- Prefer semantic HTML and native behaviour: `<button>`, `<a href>`, `<dialog>`, Popover API and `<details>`. Justify behavioural JavaScript with a concise comment explaining the native limitation or invariant.
- Keep Vue as the library's only runtime dependency. Add browser API fallbacks only when explicitly requested.
- Use Vue 3 SFCs with `<script setup lang="ts">`, typed `defineProps` + `withDefaults`, `defineSlots`, `defineModel` for v-model and `defineEmits` for custom events.
- Name components `V` + PascalCase and classes `.v-<name>`. Use `data-variant`, `data-tone` and `data-size` for variants.
- Give public prop unions named, exported types owned by their component. Types and helper modules have no `V` or `Vectis` prefix.
- Boolean props default to `false`; keep explicit defaults for documentation extraction. Name opt-out props accordingly (`hide*`, `no*`, `readonly`, `bare`). Preserve deliberate `undefined` defaults used for inheritance.
- Native attributes use fallthrough. Wrapper roots disable automatic inheritance, keep `class`/`style` on the wrapper and forward form and ARIA attributes to the functional element.
- Bind component-owned ARIA states before forwarded attributes so consumer attributes retain precedence.
- Declare and explicitly relay a composed component's documented events: declared emits are removed from `$attrs`. Wrapper controls expose `focus(options?)` and `el` for the functional element.
- Use `*Label` for accessible names and `*Text` for visible text; loading states consistently use `loadingText`. Obtain user-facing text from the dictionary; integrator warnings may be hardcoded.
- Keep browser API access in mounted hooks, watchers or event handlers. Perform feature detection client-side and generate IDs with Vue's `useId()`.
- Use post-flush effects for DOM properties without HTML attributes. Use `useSlotNodes` for reactive slot inspection; `slots` alone is not reactive.
- Preserve visible focus and reduced-motion alternatives. Hidden native inputs remain focusable and form-submittable; never hide them with `display: none`.

## CSS and tokens

- Library SFCs have one non-scoped `<style>` wrapped in `@layer vectis.components`. Keep component-specific variables and rules in that SFC.
- Preserve the layer order declared before imports in `src/styles/index.css`:
  `vectis.reset, vectis.tokens, vectis.components, vectis.utilities`.
- Consumer styles override the library through unlayered CSS. Never depend on the order of separate component stylesheets; qualify conflicting selectors by specificity.
- Shared tone tables belong to `vectis.tokens`; rules painting variants belong to `vectis.components`. Keep custom-colour rows after tone rows.
- Consume semantic `var(--vectis-*)` tokens for colour, spacing, radius, typography, shadows and motion. Use complete typography recipes and dedicated dimension tokens instead of spacing tokens for component dimensions.
- Permitted literals include `1px` borders, opacity and local sibling `z-index` values from 0 to 4. Page overlays use the top layer.
- Long looping animations may reference the duration primitive matching their period. Preserve documented exceptions to semantic typography.
- Public tokens use `--vectis-*`. Private variables are qualified by component or shared contract (`--control-*`, `--tone-*`); avoid generic inheritable names. Anchor identifiers are private, and their CSS and TypeScript spellings must agree.
- Token pipeline: `src/tokens/*.ts` → `scripts/build-tokens.ts` → `src/styles/tokens.css` + `src/tokens/tokens.json`. Edit the TypeScript source and run `pnpm tokens`; never hand-edit generated output.
- Dark themes override existing semantic keys only. Preserve generated order: primitives, light semantics on `:root, [data-theme='light']`, then dark overrides.
- Generated icon registries are updated through their `icons` scripts, on demand. Builds must not require icon downloads.
- Packaging uses ESM, `preserveModules` and one stylesheet per component. Keep CSS imports and `sideEffects: ["**/*.css"]`. Evaluate shared recipes against the core CSS size cost paid by every consumer.

## Comments and documentation

- Describe current behaviour and non-obvious reasons. Remove dead code, temporary notes, development history, section banners and comments that repeat the code.
- Keep concise JSDoc on public props, slots, emits, types and exported functions; Storybook and IDE descriptions depend on it.
- Preserve tool directives, licence notices and explanations of subtle guards, cascade dependencies or synchronization requirements.
- Behavioural tags use only `@core`, `@a11y`, `@keyboard`, `@ssr`, `@fallback`, `@devwarn`. Place tags on separate `//` lines outside JSDoc; place the least specific tag last. Pure domain modules may use one module-level tag.
- Public components include `VX.vue`, `VX.test.ts`, `VX.stories.ts` and `VX.mdx`, with a named export from `src/index.ts`. Internal components are documented with their consumer.
- Storybook titles and MDX headings omit the `V` prefix; prose and code use the actual component name. MDX covers component behaviour and accessibility without duplicating token values.
- Story-authored prose uses `storyText({ en, fr })`; return the computed ref from setup. Play functions assert English strings. Preserve accented data used to test filtering.

## Documentation site and internationalization

- Use package imports, real anchors inside `NuxtLink custom`, `localePath()` for internal destinations and `switchLocalePath()` for locale switching.
- Site CSS is unlayered. Shared layout lives in `assets/css/docs-layout.css`; component state styles may be scoped. Use classes instead of static inline styles.
- Write English first, then update typed French catalogues in `i18n/locales/`. Keep heading IDs and sample/demo content English in both locales. Reader-facing prose is concise, contains no development history and uses no em dashes.
- Library messages have two-level namespaces and typed functions for parameters. Read reactive messages in computed values or templates. Locale configuration is process-wide; per-request multilingual SSR requires explicit text props.
- Docs locale entrypoints default-export the `defineI18nLocale` macro. Never spell its call form in comments: the locale transform also scans comments.
- Docs messages use a pass-through compiler; parameterized messages are TypeScript functions. Render authored inline HTML through `DocsProse` / `DocsProseList`.
- Set the library locale in the universal plugin body for each route. Theme state settles after hydration; keep the pre-paint theme script aligned with theme configuration.
- Preserve `vite.ssr.noExternal: ['vectis-ui']`, Vue deduplication, the auto-import exclusion of library `dist` and `features.inlineStyles: false`.
- API metadata in `apps/docs/content/api/` is generated; change source contracts or `scripts/build-api.ts`, then run `pnpm --filter vectis-docs api`.

## Commands and validation

Run commands from the repository root without a leading `cd` or `Set-Location`. Use the package manager pinned in `package.json` through Corepack.

```sh
pnpm lint
pnpm format                       # Prettier check; format:fix writes changes
pnpm typecheck
pnpm test                         # Vitest unit project, jsdom
pnpm build                        # Library, then static docs and postbuild checks
pnpm build-storybook
pnpm tokens
pnpm --filter vectis-ui run tokens:check
pnpm --filter vectis-ui run check:package  # Run after build, never in postbuild
pnpm --filter vectis-ui exec vitest run --project unit src/components/VButton/VButton.test.ts
pnpm storybook                    # Port 6006
pnpm --filter vectis-docs dev
pnpm --filter vectis-docs build
pnpm --filter vectis-docs preview  # Verify the generated artefact and base URL
```

- Before completion, run lint, typecheck, unit tests, build and Storybook build; check formatting. Run `check:package` separately after building: `attw --pack` invokes `prepack`, so putting it in `postbuild` causes recursion.
- Unit tests cover logic, emitted events, models, ARIA attributes and fallthrough. Keep automatic cleanup enabled. jsdom cannot validate layout or native browser interaction.
- Storybook play functions cover browser behaviour and axe accessibility checks. Use `waitFor` after asynchronous model updates and leave the relevant UI visible for axe.
- Changes to play functions, browser behaviour, colour tokens or role-bearing markup require browser tests in both themes. Install Chromium if needed with `pnpm --filter vectis-ui exec playwright install chromium`.

```powershell
pnpm test:stories
$env:VECTIS_THEME = 'dark'
pnpm test:stories
Remove-Item Env:VECTIS_THEME
```

- `pnpm test:coverage` merges unit and browser coverage and requires Chromium. Keep accessibility violations blocking; exclusions require a demonstrated tool limitation.
- Keep the browser floor in `README.md` and `vite.config.ts` consistent.
