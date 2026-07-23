# @socle/ui

Design system **Vue 3 + TypeScript**, compatible **Nuxt 3 (SSR)**, construit sur les primitives natives de la plateforme : Popover API, CSS Anchor Positioning, `<details name>`, `:user-invalid`… Le JavaScript est un dernier recours, jamais un réflexe.

## Principes

- **HTML et CSS d'abord.** Les menus, tooltips et toasts reposent sur la Popover API (`popovertarget`, top-layer, light dismiss natif) et l'anchor positioning CSS — **aucune librairie de positionnement**. Les accordéons sont des `<details name>`. Quand du JS existe, il est justifié par un commentaire dans le composant.
- **Zéro dépendance runtime** hors `vue` (peer dependency).
- **Tout le style passe par des design tokens** (`--ds-*`), surchargeables au runtime sans rebuild.
- **Tree-shaking réel** : ESM, un module par composant, imports nommés.

## Installation

```bash
pnpm add @socle/ui vue
```

```ts
// main.ts
import '@socle/ui/styles.css'
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Button, Input, toast } from '@socle/ui'

const email = ref('')
</script>

<template>
  <Input v-model="email" type="email" required placeholder="votre@email.fr" aria-label="Email" />
  <Button @click="toast({ message: `Confirmation envoyée à ${email}`, tone: 'success' })">
    S'abonner
  </Button>
</template>
```

## Nuxt 3

La librairie est pré-buildée en ESM et SSR-safe (aucun accès `window`/`document` hors cycle de vie client). Aucun module ni plugin nécessaire :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['@socle/ui/styles.css'],
})
```

```vue
<script setup lang="ts">
import { Button, Badge } from '@socle/ui'
</script>
```

Les imports nommés sont tree-shakés par Vite/Nitro. Pas besoin de `build.transpile`.

## Theming

### Architecture des tokens

Deux niveaux de custom properties, générés depuis une source TypeScript typée (format inspiré du [W3C DTCG](https://design-tokens.github.io/community-group/format/)) :

- **Primitifs** : palettes OKLCH (`--ds-color-indigo-500`), échelles d'espacement (`--ds-space-4`), typo, radii, ombres, durées/easings.
- **Sémantiques** — les seuls consommés par les composants : `--ds-color-surface`, `--ds-color-text-muted`, `--ds-color-accent`, `--ds-radius-interactive`, `--ds-focus-ring-color`…

### Dark mode

```html
<html data-theme="dark"></html>
```

`data-theme` fonctionne sur **n'importe quel sous-arbre DOM** (un panneau dark dans une page light, ou l'inverse) et pilote aussi `color-scheme` (scrollbars, contrôles natifs).

### Surcharge au runtime — aucun rebuild

Toute personnalisation est une redéfinition de custom properties, en CSS :

```css
/* charte "corail" : accent + arrondis pilule */
:root {
  --ds-color-accent: oklch(58% 0.2 25);
  --ds-color-accent-hover: oklch(51% 0.19 25);
  --ds-radius-interactive: 9999px;
}
```

…ou en JavaScript, y compris sur un sous-arbre :

```ts
panel.style.setProperty('--ds-color-accent', 'oklch(58% 0.2 25)')
```

Le CSS du DS vit dans des layers (`ds.reset < ds.tokens < ds.components < ds.utilities`) : **tout style consommateur non-layerisé gagne automatiquement** — surcharger un composant ne demande jamais de guerre de spécificité.

### Accès programmatique aux tokens

```ts
import { tokens, flattenTokens } from '@socle/ui/tokens'

// [{ path: ['color', 'surface'], cssName: '--ds-color-surface', token: {...} }, …]
const semanticColors = flattenTokens(tokens.semantic.color, ['color'])
```

`@socle/ui/tokens.json` expose la même source en JSON brut (outillage, export de configuration). C'est la fondation de l'app de theming à venir : modifier l'objet, injecter les variables, exporter la config.

## Icônes

Le composant `Icon` accepte trois sources :

```vue
<Icon name="favorite" />
<!-- ligature Material Symbols Rounded -->
<Icon src="/logo.svg" label="Logo" />
<!-- image -->
<Icon><svg …/></Icon>
<!-- SVG inline (slot) -->
```

- **Décorative par défaut** (`aria-hidden`) ; la prop `label` la rend informative (`role="img"` + `aria-label`).
- Taille : **1em par défaut** — l'icône suit le texte environnant. Surcharge libre en pixels via `:size="32"`. Sans prop, tout parent peut piloter le contexte en posant les custom properties **`--ds-icon-size`** et **`--ds-icon-opsz`** (c'est ce que fait la classe partagée `ds-control` — Button, Input, Textarea, InputOTP, Chip — selon la taille du contrôle) ; la prop numérique prime sur le contexte. `Spinner` suit le même principe (1em + `:size` en px), sans API de contexte.

**La police Material Symbols Rounded n'est PAS embarquée** (zéro dépendance runtime) : c'est au consommateur de la charger, par exemple via Google Fonts :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
/>
```

(ou en self-host du woff2 variable, ex. paquet npm `material-symbols`). `display=block` évite le flash du nom d'icône en toutes lettres. Sans police chargée, la mise en page est préservée (le nom textuel est contenu dans le carré de l'icône). Surcharger le token `--ds-font-family-icon` permet de basculer sur Material Symbols Outlined/Sharp.

Sur `Button` : les props `icon-start` / `icon-end` prennent un nom Material Symbols (les slots `#start`/`#end` restent disponibles pour du contenu custom et priment sur les props). `Button` accepte aussi `href` (rendu `<a>` ; `disabled`/`loading` produisent un lien inerte : `href` retiré + `aria-disabled`) et `compact` (hauteur réduite de 4 px : 20/28/36/44/52 px selon la taille `xs`–`xl`).

## Composants

| Domaine     | Composants                                                                                                                                                |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions     | `Button`, `IconButton`, `Chip` (sélectionnable, supprimable)                                                                                              |
| Formulaires | `Input`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Slider` (single/range), `InputOTP`, `Combobox` (recherche, multi)                                    |
| Overlays    | `Tooltip`, `Menu` + `MenuItem`/`MenuGroup`/`MenuSeparator` (sous-menus récursifs)                                                                         |
| Structure   | `Tabs` + `TabList`/`Tab`/`TabPanel`, `Accordion` + `AccordionItem`, `DataTable` (tri, responsive), `Breadcrumb` (data-driven, troncature), `Pagination`   |
| Feedback    | `Toaster` + `toast()` (notifications), `Badge`, `Avatar`, `Spinner`, `ProgressLinear`, `ProgressCircular`, `Icon` (Material Symbols, image ou SVG inline) |

> `Card`, `Select`, `Popover`, `Dialog` et `DatePicker` ont été retirés temporairement et seront réintroduits ultérieurement.

Notes d'implémentation notables :

- **Slider range** superpose deux `<input type="range">` natifs (chaque curseur reste un vrai slider clavier/ARIA) ; le JS empêche seulement le croisement.
- **DataTable responsive** : mode `stack` en pur CSS (container queries) — sous 640px de conteneur, les lignes deviennent des cartes, les en-têtes sont réinjectés par `::before + data-label`.
- **Combobox** suit le pattern ARIA combobox/listbox (`aria-activedescendant`, le focus reste dans l'input) ; le panneau est aligné sur le contrôle via `anchor-size(width)`.
- **Toast** : monter `<Toaster />` une fois (racine de l'app), puis appeler `toast({ message, tone, ... })` depuis n'importe où — composant, store, retour d'API (client uniquement, jamais pendant le rendu SSR). Placements en piles Popover API (top-layer), auto-fermeture (défaut 5 s, `duration: 0` = persistant, pause au survol), `dismissToast(id?)` pour fermer par programme.

Conventions transverses :

- Variantes pilotées par props → attributs `data-variant` / `data-tone` / `data-size` (ciblables en CSS).
- `v-model` partout où un état existe (`v-model:open` pour Menu).
- Les flottants prennent leur déclencheur en slot scopé : `<template #trigger="{ triggerProps }"><Button v-bind="triggerProps">…</Button></template>` — `popovertarget` et les attributs ARIA sont posés pour vous.
- Formulaires : l'état d'erreur visuel vient de `:user-invalid` natif (zéro JS de validation) ; la prop `invalid` force l'état pour la validation serveur.

La documentation vivante (stories, page tokens, switch de thème) : `pnpm storybook`.

## Support navigateur

Cible : **navigateurs modernes** — Chrome/Edge 125+, Safari 26+.

- Baseline, sans compromis : Popover API, `<dialog>`, `<details name>`, `:user-invalid`, `:has()`, `color-mix()`, `@layer`, custom properties.
- **CSS Anchor Positioning** (Tooltip, Menu et ses sous-menus) : pas encore stable sur Firefox — choix assumé de ne pas embarquer de fallback JS ; sur Firefox, les panneaux s'ouvrent (Popover API supportée) mais ne sont pas ancrés à leur déclencheur. Le reste du DS y fonctionne normalement.
- Progressive enhancement pur (dégradation propre si non supporté) : animations `@starting-style`/`allow-discrete`, `field-sizing: content` (Textarea `auto-grow`), `::details-content` + `interpolate-size` (animation Accordion).

## Accessibilité

Navigation clavier et sémantique ARIA sur tous les composants : pattern ARIA menu (roving focus, retour du focus au déclencheur), pattern ARIA tabs (activation automatique aux flèches), `role="switch"`, tooltips liés par `aria-describedby` et fermables à Échap (WCAG 1.4.13), `role="status"`/`role="alert"` selon la criticité, libellé accessible **obligatoire** sur `IconButton`. `prefers-reduced-motion` respecté partout. L'addon a11y de Storybook audite chaque story.

## Contribuer

```bash
corepack enable pnpm
pnpm install
pnpm storybook          # développement
pnpm lint && pnpm format && pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook
```

- **Tokens** : ne jamais éditer `src/styles/tokens.css` ni `src/tokens/tokens.json` (générés) — modifier la source `src/tokens/*.ts` puis `pnpm tokens`.
- **Nouveau composant** : un dossier `src/components/X/` avec `X.vue` (styles non-scoped dans `@layer ds.components`, tokens sémantiques uniquement, variantes en `data-*`), `X.stories.ts` (défaut, variantes, états, cas limites, play functions), `X.test.ts` (logique seulement — le comportement navigateur se teste dans les play functions), et l'export nommé dans `src/index.ts`.
- Tout JS de comportement doit être justifié par un commentaire : « est-ce que HTML/CSS moderne sait le faire ? » d'abord.
