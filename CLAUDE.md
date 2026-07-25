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

1. **HTML/CSS d'abord, JS en dernier recours.** Primitives natives : `<dialog>`+`showModal()`, Popover API, CSS Anchor Positioning, `<details>`, `:user-invalid`, `:has()`, `color-mix()`, `@starting-style`… Tout JS de comportement doit être **justifié par un commentaire** dans le composant (voir Dropdown.vue : le JS se limite au roving focus clavier et au pont v-model ↔ API impérative du popover).
2. **Zéro dépendance runtime hors Vue** (`peerDependencies: { vue }` uniquement). Pas de floating-ui : pour les flottants, anchor positioning CSS sous `@supports` + mini-fallback JS maison (~30 lignes) si nécessaire.
3. **Aucune valeur brute dans le CSS des composants** (couleur, radius, espacement, typo, ombre, durée) : uniquement des tokens sémantiques `var(--ds-*)`. Les durées dérivées passent par `calc()` sur un token. Tolérés : bordures `1px`, opacités.
4. **SSR-safe (Nuxt 3)** : aucun accès `window`/`document`/API navigateur hors `onMounted`/`watch`/handlers. Détection de support (`CSS.supports`) côté client uniquement. IDs via `useId()` de Vue.

## Architecture des tokens (cœur du projet)

Chaîne : `src/tokens/*.ts` (source de vérité typée, format DTCG `{ $value, $type, $description? }`) → `scripts/build-tokens.ts` (via `pnpm tokens`, auto-lancé en `prebuild`/`prestorybook`) → `src/styles/tokens.css` + `src/tokens/tokens.json`. Un plugin Vite inline (`vite.config.ts`) émet aussi `dist/tokens.json`.

- **Deux niveaux** : primitifs (`primitives.ts` — palettes OKLCH, échelles) et sémantiques (`semantic.ts` — seuls consommés par les composants). Les alias DTCG `{color.neutral.500}` sont résolus en `var(--ds-color-neutral-500)` au build (`css.ts`, aussi exporté via `@socle/ui/tokens` pour la future app de theming).
- **Thèmes** : `themes/dark.ts` ne peut surcharger QUE des clés sémantiques existantes (le build le vérifie et échoue sinon). Le CSS généré pose `:root` (tout) + `[data-theme='light']` et `[data-theme='dark']` (sémantiques seulement) → theming par sous-arbre DOM, surcharge runtime sans rebuild.
- **`src/styles/tokens.css` et `src/tokens/tokens.json` sont GÉNÉRÉS** : ne jamais les éditer à la main (ils sont dans .prettierignore ; toute modif passe par la source TS + `pnpm tokens`).
- **Tokens de dimension dédiés** : jamais `--ds-space-*` pour une taille de composant (track, thumb, hauteur de pastille…) — créer un token sémantique dédié. Un vrai espacement (gouttière, offset, delta compact, padding) reste légitime en `--ds-space-*`.

## Cascade CSS

`src/styles/index.css` déclare l'ordre : `@layer ds.reset, ds.tokens, ds.components, ds.utilities;`. Tout style consommateur non-layerisé gagne — c'est le mécanisme de surcharge voulu.

- Chaque SFC a un `<style>` **non-scoped** dont tout le contenu est enveloppé dans `@layer ds.components { … }`.
- **L'ordre des exports dans `src/index.ts` fixe l'ordre du CSS bundlé** : à spécificité égale, le dernier gagne. Contraintes actuelles : IconButton après Button (surcharge padding/largeur), Slider après Input (surcharge la largeur des champs numériques `.ds-slider-field`), Toaster après Button (croix = IconButton recoloré).
- Build : un seul `dist/styles.css` (reset + tokens + composants), jamais de CSS importé par le JS émis.

## Conventions composants

- Un dossier par composant : `src/components/X/X.vue` + `X.stories.ts` + `X.test.ts` + **`X.mdx`** (doc Storybook — obligatoire, générée à chaque nouveau composant). Export nommé ajouté dans `src/index.ts`.
- Classes `.ds-<nom>` ; **variantes via `data-variant` / `data-tone` / `data-size`** (pas de prolifération de classes). Les tones définissent des variables locales `--_bg-solid`, `--_text-tinted`… que les variantes consomment (voir Button.vue, le modèle de référence).
- API : `defineProps` typées + `withDefaults`, `defineSlots` typés, `defineModel` pour v-model, `defineEmits` typés seulement s'il y a des événements non natifs. Les attributs natifs passent par fallthrough (pas de re-déclaration).
- **Pattern wrapper-root** — un composant dont la racine est un wrapper (contrôles masqués Checkbox/Radio/Switch en `<label>` englobant ; champs Input/Textarea ; Chip) : `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` sur l'élément fonctionnel (contrôle natif / action), en gardant `class`/`style` sur la racine. Sinon `name`/`required`/`aria-*` atterrissent sur le wrapper et cassent formulaires et accessibilité. Un input masqué l'est via `opacity: 0` (reste focusable/soumis), jamais `display: none`.
- Manipuler une propriété DOM sans attribut HTML (ex. `indeterminate`) : `watchEffect(..., { flush: 'post' })` — en flush `pre`, la ref template n'est pas encore posée au premier passage.
- Focus visible : `outline: var(--ds-focus-ring-width) solid var(--ds-focus-ring-color)` + offset token. `@media (prefers-reduced-motion: reduce)` pour toute transition/animation.

## Tests : répartition stricte

- **vitest + jsdom** (`*.test.ts`) : logique uniquement — emits, v-model, attributs ARIA, fallthrough. jsdom ne couvre pas Popover/top-layer : la Popover API est stubbée globalement dans `vitest.setup.ts` (marqueur `data-popover-open` + display inline, car `:popover-open` n'est pas évaluable en jsdom et le style UA `[popover]{display:none}` cache le panneau aux requêtes par rôle ; `hidePopover` ferme aussi les descendants `[data-popover-open]` — cascade de pile nécessaire aux sous-menus). Ne pas tester le comportement navigateur en jsdom.
- **Play functions Storybook** (`storybook/test` : `expect`, `userEvent`, `within`, `waitFor`) : comportements navigateur réels (ouverture popover, Esc, `:user-invalid`…). Les mises à jour v-model étant asynchrones, toujours passer par `waitFor` après une interaction.
- `globals: true` dans vitest.config.ts est **requis** pour le cleanup automatique de @testing-library/vue — ne pas le retirer.
- L'`expect` de vitest n'a PAS les matchers jest-dom (`toBeVisible`, `toHaveFocus`…) : en jsdom, asserter sur les propriétés DOM (`el.hidden`, `document.activeElement`). Ces matchers n'existent que dans `storybook/test` (play functions).

## Storybook

Storybook 10, framework `@storybook/vue3-vite`. Imports : types depuis `@storybook/vue3-vite`, utilitaires de test depuis `storybook/test`, blocks MDX depuis `@storybook/addon-docs/blocks`.

- `.storybook/preview.ts` : decorator global de thème (toolbar System/Light/Dark — System suit `prefers-color-scheme` avec écoute des changements OS — + direction LTR/RTL). **Piège vue3** : thème et direction sont appliqués en effets de bord sur `<html>` (`data-theme`, `dir`), PAS via l'état d'un wrapper templaté — le renderer vue3 ne remonte pas l'arbre au changement d'un global du toolbar (seuls les args sont réactifs), un état capturé dans `setup()` reste figé.
- La police Material Symbols (Icon) est chargée par Storybook via `.storybook/preview-head.html` (jamais embarquée dans la lib).
- Chaque story couvre : défaut, variantes, états (disabled/loading/error), cas limites (textes longs). `src/tokens/Tokens.mdx` est généré depuis la source TS — ne jamais y dupliquer des valeurs en dur.
- **Doc `X.mdx` obligatoire par composant** (à générer avec les stories, jamais après-coup) : `import { Canvas, Controls, Meta } from '@storybook/addon-docs/blocks'` + `import * as XStories from './X.stories'` + `<Meta of={XStories} />`. Structure type (cf. `AvatarGroup.mdx`) : titre `# X`, intro courte décrivant le composant, puis une section par aspect (`<Canvas of={XStories.MaStory} />`, un `<Controls>` sur la story principale), et une section **Accessibilité** finale. Prose seulement (le rendu vient des stories) — aucune valeur de token en dur.

## Packaging

Vite lib mode, **ESM uniquement**, `preserveModules` (un module par fichier source → tree-shaking par composant). Exports map : `.`, `./styles.css`, `./tokens` (module typé), `./tokens.json`. `sideEffects: ["**/*.css"]`. Les d.ts sortent de vite-plugin-dts sur `tsconfig.build.json` (qui exclut stories/tests).

## Pièges connus

- **TypeScript épinglé sur ^5.9** (racine et packages/ui) : ne pas laisser pnpm résoudre TS 7 (compilateur natif), vue-tsc/vite-plugin-dts ne le supportent pas.
- Nouvelle dépendance avec postinstall : pnpm 11 la bloque → l'ajouter sous `allowBuilds:` dans `pnpm-workspace.yaml` (esbuild y est déjà).
- Prettier est séparé d'ESLint : `pnpm lint` ne vérifie pas le format, lancer `pnpm format` aussi.
- ESLint : `no-undef` est désactivé pour `.ts`/`.vue` (faux positifs sur les globals DOM, TS couvre) ; `vue/multi-word-component-names` et `vue/no-reserved-component-names` désactivés (noms simples voulus : Button, Input, Dropdown…).
- `corepack enable pnpm` si `pnpm` introuvable dans un nouveau shell.

## Support navigateur

Popover API, `<dialog>`, `<details name>`, `:user-invalid`, `color-mix()`, `:has()` : Baseline, utilisables sans fallback. **CSS Anchor Positioning : utilisé SANS fallback** — décision utilisateur (2026-07) : cible navigateurs modernes uniquement (Chrome/Edge 125+, Safari 26+ ; Firefox non supporté tant qu'anchor positioning n'y est pas stable). Ne pas réintroduire de fallback JS sans demande explicite. `@starting-style`/`allow-discrete` : progressive enhancement uniquement, jamais requis.

**Patterns d'ancrage** (`src/styles/floating.css` : classe `.ds-floating` + `data-placement` → `position-area`/`position-try-fallbacks`) :

- Panneau invoqué par `popovertarget` (Dropdown — sous-menus compris : l'item parent est l'invocateur du panneau imbriqué) : l'invocateur est l'**ancre implicite**, aucun `anchor-name` nécessaire.
- Panneau ouvert programmatiquement (Tooltip) : `anchor-name` **statique partagé** sur le wrapper + `anchor-scope` (même nom) qui le confine au sous-arbre du wrapper + `position-anchor` sur le panneau. Le confinement est indispensable : un popover affiché passe en top layer et est considéré comme « après » tout le document pour la résolution d'ancre — sans `anchor-scope`, tous les panneaux se rattacheraient au dernier wrapper nommé de la page. Pas d'ID unique, pas de style inline. `anchor-scope` : Chrome/Edge 131+, Safari 26+ (léger relèvement du plancher Chrome 125 assumé). Range vertical par `writing-mode` (Slider) : Chrome/Edge 129+, Safari 18.1+ (même logique de relèvement assumé).
- Placements alignés (`top-start`, `bottom-end`…) : la marge inline du côté aligné est annulée dans floating.css (`[data-placement$='-start']`/`[$='-end']`), sinon le `margin` d'écart décale le panneau du bord du trigger. Placements latéraux (sous-menus, `right-start`) : axe inversé, la marge inline est restaurée (l'écart est inline, l'alignement block).
- Les triggers sont fournis par slots scopés : `#trigger="{ triggerProps }"` + `v-bind="triggerProps"` (popovertarget, aria-*). Tooltip suit le même pattern (slot default scopé) — un pont automatique posant aria-describedby au mount a été envisagé puis abandonné (décision utilisateur 2026-07 : la voie explicite est préférée, plus déclarative et sans JS supplémentaire).
- Garde-fou : `.ds-floating:not(:popover-open) { display: none }` — un panneau qui pose son propre `display` (ex. `.ds-dropdown` en flex) écrase le `display: none` UA de `[popover]` (styles auteur > UA), le panneau fermé resterait cliquable en `opacity: 0` par-dessus le contenu. Même garde-fou côté Toast (piles `.ds-toast-stack`).

## Échelle de tailles (contrôles)

Échelle unifiée **xs/sm/md/lg/xl** (24/32/40/48/56px, tokens `--ds-control-height-xs…xl`). Le mapping taille → hauteur/font/icône/opsz/gap vit en UNE incarnation CSS : `src/styles/control-size.css`, classe **`.ds-control`** posée sur la racine porteuse de `data-size`/`data-compact`. Les blocs `[data-size]` ne définissent QUE des custom properties `--_control-*` (héritées jusqu'aux enfants, ex. le field d'Input — aucun conflit de spécificité) + le contexte Icon `--ds-icon-size`/`--ds-icon-opsz`.

- **Compact** = -4px de hauteur partout (`--_control-height` dérivée de `--_control-height-base`).
- Mappings (littéraux, contrat police maintenu — pas de nouveaux tokens) : icônes xs→16 / sm-md→20 / lg-xl→24 ; opsz xs-md→20, lg-xl→24 ; fonts xs→xs, sm-md→sm, lg-xl→md ; gap `--_control-gap` xs→4px, sm-lg→8px, xl→12px ; paddings = `--ds-space-*` directs.
- Adoptée par : Button/IconButton (xs–xl), Input, Textarea, InputOTP (typo majorée +2 crans), Chip (xs/sm, défaut xs), Dropdown (sm/md, défaut sm).

## Composants

Inventaire (exportés depuis `src/index.ts` — l'ordre y fixe la cascade CSS) : **Icon, Button, IconButton, ButtonGroup, Input, Textarea, Checkbox, Radio, Switch, Tooltip, Dropdown** (+ DropdownItem/DropdownGroup/DropdownSeparator)**, Tabs** (+ TabList/Tab/TabPanel)**, Accordion** (+ AccordionItem)**, Toaster** (+ `toast()`/`dismissToast`)**, Badge, Avatar, Spinner, Combobox, Breadcrumb, Chip, DataTable, InputOTP, Pagination, ProgressLinear, ProgressCircular, Slider, Dialog** (+ DialogAlert)**, Calendar, DatePicker**.

Retirés (décision utilisateur — réintroduction possible sur demande) : **Card, Select, Popover** ; **Alert** remplacé par Toast. La Popover API native reste utilisée par Dropdown/Tooltip/Toast/DatePicker. Tokens orphelins (combobox) laissés en place, inoffensifs.

Règles transverses déjà couvertes plus haut : tone/variant (Button = référence), pattern wrapper-root, échelle de tailles, disabled **gris par tokens** (jamais `opacity` — sauf `loading` qui garde `opacity: 0.5`).

### Caractéristiques par composant

- **Icon** : 3 sources — ligature Material Symbols Rounded / image / SVG inline. La police est chargée par le **consommateur** (jamais embarquée). Pilotage contextuel `--ds-icon-size`/`--ds-icon-opsz` ; la prop `size` explicite prime. Helper `Icon/iconProps.ts` : distingue nom Material vs URL par regex `[./:]` (un nom Material n'en contient jamais) — réutilisé partout où une prop accepte « nom OU URL ».
- **Button** : modèle tone/variant de référence. Variants dont `elevated`/`tonal`, tones `success`/`warning` (token `text-on-warning` = neutral-950, le blanc échoue AA sur amber). `iconStart`/`iconEnd` (fallback slots #start/#end). Rendu `<a>` via `href` (lien inerte si disabled/loading : href retiré + aria-disabled + onClick filtré — seul JS, `inheritAttrs: false`). `compact` = -4px.
- **IconButton** : carré, largeur = `var(--_control-height)` posée par Button.
- **ButtonGroup** : wrapper `role="group"` qui rattache des Button/IconButton en contrôle segmenté (bordures fusionnées `margin: -1px`, coins arrondis aux seules extrémités via propriétés logiques `border-*-*-radius`, couture `--ds-color-border` entre segments pleins, `z-index` au hover/focus/active). CSS-only (aucun provide/inject) : chaque bouton garde ses props ; poser les mêmes variant/tone/size sur les enfants pour la cohérence. `orientation` horizontal (défaut) / vertical. Exporté après IconButton (surcharge `.ds-button-group > .ds-button`).
- **Input / Textarea** : wrappers (label + field + hint/meta), contrôle natif = `.ds-*-control` (wrapper-root). `label`, `hint`, `iconStart`/`iconEnd` (+ slots ; icône cliquable → `<button>`, détection `@click:icon-*` dans vnode.props, libellé via `icon*Label`), `counter`, `maxlength` + `softLimit` (dépassement via `setCustomValidity` → `:user-invalid`, jamais d'event maison), `loading`, `clearable`, `readonly` (fond sunken). Focus « bordure 2px » = bordure 1px + `box-shadow 0 0 0 1px` sur le field (`:focus-within`), rouge si invalide. Textarea auto-grow via `field-sizing: content` (porté par le field) ; regex `pattern` : Input seulement (attribut natif), pas d'émulation Textarea.
- **Checkbox / Radio / Switch** : wrapper-root `<label>`, input masqué `opacity: 0`. Checkbox `indeterminate` via `watchEffect({ flush: 'post' })`. Radio = groupe natif par `name`. Switch `role="switch"`, taille unique 40×20px (tokens `--ds-control-size-switch-w/h`, pas de prop `size`), `labelPosition` start/end + `spread`.
- **Tooltip** : `popover="manual"` + délai. Ancrage par `anchor-name` statique partagé + `anchor-scope` (cf. Patterns d'ancrage). Trigger en slot scopé, `aria-describedby` posé explicitement par le consommateur.
- **Dropdown** : menu d'actions ARIA (`role="menu"`/`menuitem"`), Popover API + ancre implicite. Panneau interne partagé `DropdownPanel.vue` (racine + sous-menus), roving focus **confiné au panneau courant** (`closest('[role="menu"]') === panel` — les keydown des sous-panneaux bubblent). Sous-menus récursifs via slot `#submenu` : le sous-panneau est rendu **frère de l'item, dans le panneau parent** → pile native de popovers (light dismiss total, branche sœur fermée, cascade). **Piège** : les ouvertures programmatiques (clavier, survol) DOIVENT passer `showPopover({ source: item })` (cast `PopoverWithSource`, option absente de lib.dom TS 5.9) sinon le panneau n'a pas d'ancre implicite. Délai d'intention survol 150 ms (`SUBMENU_HOVER_DELAY`, timers annulés au unmount). Flèche gauche/Échap ferment un niveau ; Tab/sélection → `closeAll` injecté (`dropdownKey`). `size` sm/md (défaut sm) + `compact`, variables `--_dropdown-item-*` posées via `data-size`/`data-compact` du panneau racine SEULEMENT (héritées par les sous-panneaux). **Mode `role="listbox"`** (brique du Combobox — le contexte `dropdownKey` porte le `role`, les DropdownItem en dérivent `option`/`aria-selected` + surbrillance externe `active`/`data-active`) : désactive roving focus/focusFirst/keydown (le champ externe pilote le clavier), panneau `popover="manual"` sans light dismiss, ouverture par `v-model:open`, ancrage statique par prop `anchor` (dashed-ident) + `anchor-size(width)` ; la sélection ne ferme pas (le consommateur gère). Le mode `menu` (défaut) est inchangé, tout le listbox passe par des early-returns.
- **Tabs** : pattern ARIA tabs, activation automatique au focus.
- **Accordion** : `<details name>` natif ; animation `::details-content` + `interpolate-size` en progressive enhancement.
- **Toast** : notifications programmatiques — `toast(options)` importable partout (**client-only**, jamais en SSR) + `<Toaster />` monté une fois. État réactif au **niveau module** (`Toast/state.ts`, pattern sonner). DOM : un `popover="manual"` **par placement** (6 conteneurs permanents, coordonnées physiques, empilement CSS `column`). Timers pause au survol / reprise à la durée pleine ; `duration: 0` = persistant. Tones neutral/accent/success/danger/warning × tonal/solid. `role="alert"` (danger/warning) sinon `role="status"`. `Toast.vue` interne (seuls `Toaster`/`toast`/`dismissToast` exportés). Stories : décorator `dismissToast()` obligatoire (l'état module survit à la navigation).
- **Badge** : pastille **non interactive** (wrapper : slot default = élément cible). Porte QUE `count` (>99 → « 99+ ») **ou** `icon` — pas de texte (statut textuel → Chip). Formats pilule 20px ou `dot` 10px. Placements standalone/inline/overlay. Couleur `tone` (défaut accent, neutral = inversion text/surface) ou `color` custom. Texte adaptatif via `contrast-color()` (progressive enhancement Safari 26+ ; fallback `--_text-fallback` par tone). `bordered` = anneau `box-shadow`.
- **Avatar** : fallback initiales, pas de `role="img"` orphelin.
- **Spinner** : `role="status"` + `.ds-visually-hidden` (layer ds.utilities).
- **Combobox** : **composé** de `Input` (recherche `role="combobox"`), `Dropdown` en mode `listbox` (options `role="option"`) et `Chip` (valeurs en multiple). Pattern ARIA combobox/listbox (`aria-activedescendant`, le focus reste dans l'input — d'où le mode listbox du Dropdown), filtrage NFD (accents), multi. Ouverture par `v-model:open`, fermeture au `focusout` (panneau `manual`). Ancrage statique `--ds-combobox-anchor` (`anchor-scope` sur la racine, `anchor-size(width)`). Hors focus : champ de saisie replié en CSS (`data-collapsed`, reste focusable) en multiple, libellé en texte en simple.
- **Breadcrumb** : **data-driven** — prop `items: BreadcrumbItem[]` (`{ label, href, iconStart? }`, `href` obligatoire), pas de sous-composant ni slots. Séparateur = `<Icon>` décoratif masqué sur le premier via `:first-child`. Item actif dérivé de `currentPath` (slash final normalisé → `aria-current="page"`, reste un lien). `maxItems` : troncature 1er + ellipsis (IconButton `more_horiz`) ouvrant un **Dropdown** des seuls items masqués.
- **Chip** : modèle tone/variant de Button (tonal/solid/outline, défaut tonal). `neutral` solid = inversion totale text/surface. **Prop `color` custom** (hex/nom CSS/oklch → `--_custom` inline + `data-custom`, nuances par `color-mix` — light/dark auto). `shape` chip/pill (défaut chip). Interactivité par priorité : selectable > href > clickable > span statique. `check` (coche Material remplace l'emplacement start). Icône seule → `data-icon-only` (carré). Dismiss `dismissIcon`.
- **DataTable** : SFC **générique** — le typage `Meta<typeof X>`/`Component` ne s'applique pas, **caster dans stories/tests**. Tri interne `v-model:sort`. Responsive `stack` en container queries (<640px conteneur → cartes, en-têtes réinjectés par `::before` + `data-label`).
- **InputOTP** : orchestration focus/collage. `format: 'numeric' | 'alpha' | 'alphanumeric'` (majuscules forcées hors numeric). `pattern` ('GT-###', '###.###.###') : `#` = case, autres caractères = littéraux décoratifs (`aria-hidden`, hors v-model) ; prime sur `length` ; collage pattern-aware. `separatorIcon` remplace tous les littéraux (gabarits purement séparateurs).
- **Pagination** : fenêtre glissante + ellipses.
- **ProgressLinear** : `<progress>` natif, `:indeterminate`.
- **ProgressCircular** : SVG `pathLength=100`.
- **Slider** : deux `<input type="range">` superposés en mode range (`pointer-events` sur les thumbs uniquement, anti-croisement JS). Track 6px via tokens `--ds-control-size-slider-*`. Custom properties inline en **fractions unitless** `--_start-f`/`--_end-f` (fill/ticks/labels/tooltips centrés sur le thumb réel). `orientation="vertical"` (`writing-mode` + `direction: rtl` sur `.ds-slider-control`). `inputs` (compose `<Input type="number">`, commit au `change` avec clamp/snap), `ticks`, `labels: SliderLabel[]` (pose `aria-valuetext`), `tooltip` (`:has(:active/:focus-visible)` — pas d'anchor positioning, le thumb natif n'est pas ancrable). Layout racine en grid à zones piloté par `:has()`.
- **Calendar** : grille inline `role="grid"` (inspiration Material). Toute la logique de dates vit dans `Calendar/dateUtils.ts` (helpers PURS, chaînes ISO `YYYY-MM-DD` en **heure locale** — jamais `new Date('YYYY-MM-DD')`/`toISOString()` ; noms via `Intl` sur dates de référence UTC, SSR-safe). `focusedISO` = **source de vérité unique** du mois affiché (les computed `viewYear`/`viewMonth0` en dérivent). Trois vues (`data-view` days/months/years, mois/années en `v-if`). Modes `single` (`string|null`) / `range` (`DateRange {start,end}`, prévisualisation au survol) / `multiple` (`string[]`) — le type du v-model suit `mode`. `min`/`max` (nav + sélection bornées), `disabledDates` (tableau **ou** prédicat → barrées, focusables non sélectionnables), `showAdjacentDays`/`selectAdjacentDays` (jours adjacents = spans statiques, ou boutons `data-outside` si sélectionnables), `events: CalendarEvent[]` (≤3 pastilles, couleur inline `--_dot-color`), slots `#day` (contenu custom, ex. prix) et `#footer` (presets/actions). Roving tabindex + clavier flèches/Home/End/PageUp-Down(+Shift an)/Entrée. Tokens dédiés `--ds-control-size-calendar-cell`/`-dot`. `today` posé en `onMounted` (pas de mismatch d'hydratation). Expose `focus()`.
- **DatePicker** : champ `Input` **readonly** + `Calendar` dans un panneau flottant `popover="manual"` (PAS de Dropdown : `popovertarget` invalide sur `<input>` texte). Ancrage pur CSS `anchor-scope`/`anchor-name`/`position-anchor` (`--ds-datepicker-anchor`, précédent Tooltip/Combobox), ouverture programmatique → **focus déplacé dans la grille** ; fermeture par `@focusout` racine + `Échap` (refocus champ) + sélection en mode simple. Passe-plat des props Calendar + champ (`size`/`compact`/`clearable`…) ; texte du champ formaté via `Intl` (plage via `formatRange`). L'icône de fin bascule `calendar_today` ↔ `close` (effacement) car readonly masque la croix native d'Input. Slot `#footer` reçoit `close`.

### Suite

App de theming temps réel dans `apps/` (manipule `@socle/ui/tokens`, injecte les `--ds-*`, exporte une config) ; playground Nuxt pour valider le SSR de bout en bout.

**Méthode validée** : implémenter par lots, checkpoint complet (lint/format/typecheck/test/build/build-storybook) à chaque lot, signaler explicitement tout compromis de support navigateur.
