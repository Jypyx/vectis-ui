# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Le projet

**Socle** (`@socle/ui`) : design system Vue 3 + TypeScript distribué en librairie npm, compatible Nuxt 3 (SSR). Monorepo pnpm — `packages/ui` contient tout ; `apps/` est réservé à une future app de theming temps réel qui manipulera la source des tokens programmatiquement et importera `@socle/ui` en `workspace:*`. Langue du projet : français (commentaires, stories, docs).

## Commandes

Tout se lance depuis la racine (pnpm activé via corepack) :

```bash
pnpm lint              # eslint (flat config racine)
pnpm format            # prettier --check   (format:fix pour corriger)
pnpm typecheck         # vue-tsc -r
pnpm test              # vitest run -r
pnpm build             # build lib (régénère les tokens en prebuild)
pnpm tokens            # régénère tokens.css + tokens.json depuis la source TS
pnpm storybook         # dev server port 6006
pnpm build-storybook
```

Un seul test : `pnpm --filter @socle/ui exec vitest run src/components/Button/Button.test.ts` (ou `-t 'nom du test'`).

Checkpoint avant de conclure une étape : `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook` doivent tous passer.

## Philosophie (non négociable — vient du cahier des charges)

1. **HTML/CSS d'abord, JS en dernier recours.** Primitives natives : `<dialog>`+`showModal()`, Popover API, CSS Anchor Positioning, `<details>`, `:user-invalid`, `:has()`, `color-mix()`, `@starting-style`… Tout JS de comportement doit être **justifié par un commentaire** dans le composant (voir Dialog.vue : le JS se limite au pont v-model ↔ API impérative).
2. **Zéro dépendance runtime hors Vue** (`peerDependencies: { vue }` uniquement). Pas de floating-ui : pour les flottants, anchor positioning CSS sous `@supports` + mini-fallback JS maison (~30 lignes) si nécessaire.
3. **Aucune valeur brute dans le CSS des composants** (couleur, radius, espacement, typo, ombre, durée) : uniquement des tokens sémantiques `var(--ds-*)`. Les durées dérivées passent par `calc()` sur un token. Tolérés : bordures `1px`, opacités.
4. **SSR-safe (Nuxt 3)** : aucun accès `window`/`document`/API navigateur hors `onMounted`/`watch`/handlers. Détection de support (`CSS.supports`) côté client uniquement. IDs via `useId()` de Vue.

## Architecture des tokens (cœur du projet)

Chaîne : `src/tokens/*.ts` (source de vérité typée, format DTCG `{ $value, $type, $description? }`) → `scripts/build-tokens.ts` (via `pnpm tokens`, auto-lancé en `prebuild`/`prestorybook`) → `src/styles/tokens.css` + `src/tokens/tokens.json`. Un plugin Vite inline (`vite.config.ts`) émet aussi `dist/tokens.json`.

- **Deux niveaux** : primitifs (`primitives.ts` — palettes OKLCH, échelles) et sémantiques (`semantic.ts` — seuls consommés par les composants). Les alias DTCG `{color.neutral.500}` sont résolus en `var(--ds-color-neutral-500)` au build (`css.ts`, aussi exporté via `@socle/ui/tokens` pour la future app de theming).
- **Thèmes** : `themes/dark.ts` ne peut surcharger QUE des clés sémantiques existantes (le build le vérifie et échoue sinon). Le CSS généré pose `:root` (tout) + `[data-theme='light']` et `[data-theme='dark']` (sémantiques seulement) → theming par sous-arbre DOM, surcharge runtime sans rebuild.
- **`src/styles/tokens.css` et `src/tokens/tokens.json` sont GÉNÉRÉS** : ne jamais les éditer à la main (ils sont dans .prettierignore ; toute modif passe par la source TS + `pnpm tokens`).

## Cascade CSS

`src/styles/index.css` déclare l'ordre : `@layer ds.reset, ds.tokens, ds.components, ds.utilities;`. Tout style consommateur non-layerisé gagne — c'est le mécanisme de surcharge voulu.

- Chaque SFC a un `<style>` **non-scoped** dont tout le contenu est enveloppé dans `@layer ds.components { … }`.
- **L'ordre des exports dans `src/index.ts` fixe l'ordre du CSS bundlé** : à spécificité égale, le dernier gagne (ex. IconButton doit rester après Button, il surcharge ses règles de padding).
- Build : un seul `dist/styles.css` (reset + tokens + composants), jamais de CSS importé par le JS émis.

## Conventions composants

- Un dossier par composant : `src/components/X/X.vue` + `X.stories.ts` + `X.test.ts`. Export nommé ajouté dans `src/index.ts`.
- Classes `.ds-<nom>` ; **variantes via `data-variant` / `data-tone` / `data-size`** (pas de prolifération de classes). Les tones définissent des variables locales `--_bg-solid`, `--_text-tinted`… que les variantes consomment (voir Button.vue, le modèle de référence).
- API : `defineProps` typées + `withDefaults`, `defineSlots` typés, `defineModel` pour v-model, `defineEmits` typés seulement s'il y a des événements non natifs. Les attributs natifs passent par fallthrough (pas de re-déclaration).
- **Contrôles à racine wrapper** (Checkbox, Radio, Switch : `<label>` englobant ; Select : `<span>`) : `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` sur le contrôle natif, sinon `name`/`required`/`aria-*` atterrissent sur le wrapper et cassent formulaires et accessibilité. L'input est masqué via `opacity: 0` (reste focusable/soumis), jamais `display: none`.
- Manipuler une propriété DOM sans attribut HTML (ex. `indeterminate`) : `watchEffect(..., { flush: 'post' })` — en flush `pre`, la ref template n'est pas encore posée au premier passage.
- Focus visible : `outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color)` + offset token. `@media (prefers-reduced-motion: reduce)` pour toute transition/animation.

## Tests : répartition stricte

- **vitest + jsdom** (`*.test.ts`) : logique uniquement — emits, v-model, attributs ARIA, fallthrough. jsdom ne couvre pas `<dialog>`/Popover/top-layer : la Popover API est stubbée globalement dans `vitest.setup.ts` (marqueur `data-popover-open` + display inline, car `:popover-open` n'est pas évaluable en jsdom et le style UA `[popover]{display:none}` cache le panneau aux requêtes par rôle) ; `<dialog>` est stubbé dans Dialog.test.ts. Ne pas tester le comportement navigateur en jsdom.
- **Play functions Storybook** (`storybook/test` : `expect`, `userEvent`, `within`, `waitFor`) : comportements navigateur réels (ouverture dialog, Esc, `:user-invalid`…). Les mises à jour v-model étant asynchrones, toujours passer par `waitFor` après une interaction.
- `globals: true` dans vitest.config.ts est **requis** pour le cleanup automatique de @testing-library/vue — ne pas le retirer.
- L'`expect` de vitest n'a PAS les matchers jest-dom (`toBeVisible`, `toHaveFocus`…) : en jsdom, asserter sur les propriétés DOM (`el.hidden`, `document.activeElement`). Ces matchers n'existent que dans `storybook/test` (play functions).

## Storybook

Storybook 10, framework `@storybook/vue3-vite`. Imports : types depuis `@storybook/vue3-vite`, utilitaires de test depuis `storybook/test`, blocks MDX depuis `@storybook/addon-docs/blocks`.

- `.storybook/preview.ts` : decorator global de thème (toolbar System/Light/Dark — System suit `prefers-color-scheme` avec écoute des changements OS — + direction LTR/RTL). **Piège vue3** : thème et direction sont appliqués en effets de bord sur `<html>` (`data-theme`, `dir`), PAS via l'état d'un wrapper templaté — le renderer vue3 ne remonte pas l'arbre au changement d'un global du toolbar (seuls les args sont réactifs), un état capturé dans `setup()` reste figé.
- Chaque story couvre : défaut, variantes, états (disabled/loading/error), cas limites (textes longs). `src/tokens/Tokens.mdx` est généré depuis la source TS — ne jamais y dupliquer des valeurs en dur.

## Packaging

Vite lib mode, **ESM uniquement**, `preserveModules` (un module par fichier source → tree-shaking par composant). Exports map : `.`, `./styles.css`, `./tokens` (module typé), `./tokens.json`. `sideEffects: ["**/*.css"]`. Les d.ts sortent de vite-plugin-dts sur `tsconfig.build.json` (qui exclut stories/tests).

## Pièges connus

- **TypeScript épinglé sur ^5.9** (racine et packages/ui) : ne pas laisser pnpm résoudre TS 7 (compilateur natif), vue-tsc/vite-plugin-dts ne le supportent pas.
- Nouvelle dépendance avec postinstall : pnpm 11 la bloque → l'ajouter sous `allowBuilds:` dans `pnpm-workspace.yaml` (esbuild y est déjà).
- Prettier est séparé d'ESLint : `pnpm lint` ne vérifie pas le format, lancer `pnpm format` aussi.
- ESLint : `no-undef` est désactivé pour `.ts`/`.vue` (faux positifs sur les globals DOM, TS couvre) ; `vue/multi-word-component-names` désactivé (noms simples voulus : Button, Input…).
- `corepack enable pnpm` si `pnpm` introuvable dans un nouveau shell.

## Support navigateur

Popover API, `<dialog>`, `<details name>`, `:user-invalid`, `color-mix()`, `:has()` : Baseline, utilisables sans fallback. **CSS Anchor Positioning : utilisé SANS fallback** — décision utilisateur (2026-07) : cible navigateurs modernes uniquement (Chrome/Edge 125+, Safari 26+ ; Firefox non supporté tant qu'anchor positioning n'y est pas stable). Ne pas réintroduire de fallback JS sans demande explicite. `@starting-style`/`allow-discrete` et `closedby` sur dialog : progressive enhancement uniquement, jamais requis.

**Patterns d'ancrage** (`src/styles/floating.css` : classe `.ds-floating` + `data-placement` → `position-area`/`position-try-fallbacks`) :

- Panneau invoqué par `popovertarget` (Popover, DropdownMenu) : l'invocateur est l'**ancre implicite**, aucun `anchor-name` nécessaire.
- Panneau ouvert programmatiquement (Tooltip) : `anchor-name` **statique partagé** sur le wrapper + `position-anchor` sur le panneau — chaque panneau résout l'élément nommé le plus proche qui le précède dans l'arbre (son propre wrapper). Pas d'ID unique, pas de style inline.
- Les triggers sont fournis par slots scopés : `#trigger="{ triggerProps }"` + `v-bind="triggerProps"` (popovertarget, aria-*).

## État d'avancement

- ✅ Socle (tokens, build, Storybook) + vague 1 : Button, IconButton, Input, Dialog.
- ✅ Vague 2 : Textarea (auto-grow via `field-sizing: content`), Select (natif stylé, chevron en currentcolor), Checkbox (indeterminate), Radio (groupe natif par `name`), Switch (`role="switch"`).
- ✅ Vague 3 : Popover, Tooltip (popover manual + délai), DropdownMenu/DropdownMenuItem (ARIA menu, roving focus, provide/inject pour la fermeture) — Popover API + anchor positioning pur CSS, sans fallback.
- ✅ Vague 4 : Tabs/TabList/Tab/TabPanel (pattern ARIA tabs, activation automatique), Accordion/AccordionItem (`<details name>` natif, animation `::details-content` + `interpolate-size` en progressive enhancement), Alert (role status/alert selon tone), Badge, Card, Avatar (fallback initiales), Spinner (`role="status"` + `.ds-visually-hidden` de la layer ds.utilities).
- ✅ Finition : README complet (`packages/ui/README.md` — install, Vue, Nuxt 3, theming runtime, contribution ; README racine = pointeur), passe a11y (noms accessibles dans les stories de formulaires, Avatar sans role="img" orphelin).
- ✅ Vague 5 : DatePicker (`<input type="date">` natif — panneau plateforme non thémable, compromis assumé), Combobox (pattern ARIA combobox/listbox, aria-activedescendant, multi + tags, panneau aligné via `anchor-size(width)`), Breadcrumb/BreadcrumbItem, Chip (aria-pressed + dismiss, jamais de boutons imbriqués), DataTable (SFC **générique** — le typage `Meta<typeof X>`/`Component` ne s'applique pas, caster dans stories/tests ; tri interne v-model:sort ; responsive `stack` en container queries), InputOTP (orchestration focus/collage), Pagination (fenêtre + ellipses), ProgressLinear (`<progress>` natif, `:indeterminate`), ProgressCircular (SVG pathLength=100), Slider (deux `<input type="range">` superposés en mode range, `pointer-events` sur les thumbs uniquement).

- ✅ Vague 6 : Icon (3 sources : ligature Material Symbols Rounded / image / SVG inline ; police chargée par le CONSOMMATEUR — jamais embarquée ; pilotage contextuel par custom properties `--ds-icon-size`/`--ds-icon-opsz`, la prop `size` explicite prime) ; évolutions Button : variants `elevated` (M3, surface-raised + ombre) et `tonal`, tones `success`/`warning` (nouveau token `text-on-warning` = neutral-950, le blanc échoue AA sur amber), `compact` (hauteur -4px via `calc(--_height-base - --ds-space-1)`, padding/typo/icônes inchangés), disabled en gris (`surface-muted`/`text-subtle`/`border` ; loading garde `opacity: 0.5` et ses couleurs), props `iconStart`/`iconEnd` (fallback de slots #start/#end), rendu `<a>` via `href` (lien inerte si disabled/loading : href retiré + aria-disabled + onClick filtré — seul JS du composant, `inheritAttrs: false`) ; IconButton : compact + nouvelles unions, largeur = `var(--_height)` posée par Button. Storybook charge Material Symbols via `.storybook/preview-head.html`.

- ✅ Refonte InputOTP (post-vague 7) : alignement sur Input — `size` sm/md/lg + `compact` (variables `--_height-base`/`--_height` sur la racine, cases carrées `width = var(--_height)`), disabled gris par tokens sans opacité, **BREAKING** : `numeric: boolean` → `format: 'numeric' | 'alpha' | 'alphanumeric'` (majuscules forcées en JS hors numeric, v-model canonique). `pattern` ('GT-###', '###.###.###') : '#' = case, autres caractères = littéraux décoratifs (`aria-hidden`, hors v-model — le modèle ne contient que les caractères saisis) ; prime sur `length` ; collage pattern-aware (les littéraux collés sont consommés positionnellement). `separatorIcon` (Material Symbol) remplace TOUS les littéraux — réservé aux gabarits purement séparateurs.

- ✅ Vague 7 : refonte Input/Textarea en champs complets — **BREAKING structure DOM** : `.ds-input`/`.ds-textarea` sont désormais des wrappers (label + field + hint/meta), le contrôle natif devient `.ds-input-control`/`.ds-textarea-control` (pattern wrapper-root : `inheritAttrs: false`, attrs sur le contrôle SAUF class/style qui restent sur la racine). Nouveautés : `label`, `hint`, `iconStart`/`iconEnd` (+ slots #start/#end ; cliquables via listeners `@click:icon-*` détectés dans vnode.props → rendu `<button>`, libellé via `icon*Label`), `counter`, `maxlength` + `softLimit` (dépassement via `setCustomValidity` → `:user-invalid` natif, jamais d'événement maison), `loading` (Spinner piloté par prop, pas de surcharge CSS), `clearable` (croix SVG inline + refocus), `readonly` (`data-readonly`, fond sunken), disabled gris sans opacité (tokens Checkbox). Pattern regex : Input seulement (attribut natif) — pas d'émulation pour Textarea (décision utilisateur). Focus « bordure 2px » : bordure 1px + `box-shadow 0 0 0 1px` même couleur sur le field (`:focus-within`), rouge si invalide (`--_border-color` fait tout), `outline transparent` en filet forced-colors — étendu à Select, DatePicker, Combobox, InputOTP. Nouveau token `--ds-control-action-size` (boutons internes des champs). Le resize/`data-auto-grow` de Textarea sont portés par le field, plus par le textarea.

**Le périmètre initial + les vagues 5-7 sont terminés** (37 exports). Suite naturelle : l'app de theming temps réel dans `apps/` (manipule `@socle/ui/tokens`, injecte les `--ds-*`, exporte une config), et/ou un playground Nuxt pour valider le SSR de bout en bout.

Méthode validée avec l'utilisateur : implémenter par lots, checkpoint complet (lint/format/typecheck/test/build/build-storybook) à chaque lot, signaler explicitement tout compromis de support navigateur.
