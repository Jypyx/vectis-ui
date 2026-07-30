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

Pour la locale et les icônes, posez la configuration dans un plugin **universel** — `plugins/socle.ts`, jamais `plugins/socle.client.ts` : une configuration client-only ferait diverger le rendu serveur et le rendu client, donc un mismatch d'hydratation. Voir [Internationalisation](#internationalisation).

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

**Aucune police d'icônes n'est requise.** Les icônes que la librairie rend elle-même — croix de `Dialog`, chevrons de `Calendar` et `Menu`, icônes de tone des toasts, tri de `DataTable`… — sont des **SVG embarqués**, répliques exactes de Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24, Apache-2.0 © Google). Elles pèsent ~2 Ko gzip, non tree-shakables : c'est le prix de l'autonomie du DS.

Le composant `Icon` résout sa source dans cet ordre : **`render` explicite → `src` → `name` (résolveur consommateur, puis registre intégré, puis ligature) → slot**.

```vue
<Icon name="close" />
<!-- registre intégré : SVG, aucune police nécessaire -->
<Icon name="favorite" />
<!-- hors registre : ligature de VOTRE police d'icônes -->
<Icon src="/logo.svg" label="Logo" />
<!-- image -->
<Icon><svg …/></Icon>
<!-- SVG inline (slot) -->
```

- **Décorative par défaut** (`aria-hidden`) ; la prop `label` la rend informative (`role="img"` + `aria-label`).
- L'attribut **`data-icon`** porte le nom demandé quelle que soit la source — accroche stable pour du CSS consommateur et pour les tests.
- Taille : **1em par défaut** — l'icône suit le texte environnant. Surcharge libre en pixels via `:size="32"`. Sans prop, tout parent peut piloter le contexte en posant les custom properties **`--ds-icon-size`** et **`--ds-icon-opsz`** (c'est ce que fait la classe partagée `ds-control` — Button, Input, Textarea, InputOTP, Chip… — selon la taille du contrôle) ; la prop numérique prime sur le contexte. `Spinner` suit le même principe (1em + `:size` en px), sans API de contexte.
- **`--ds-icon-opsz` ne s'applique qu'à la ligature** : c'est un axe variable de police, sans prise sur un SVG intégré, une image ou un composant tiers. La taille, elle, vaut pour toutes les sources.

### Toute prop d'icône accepte un nom **ou** un rendu explicite

```vue
<Button icon-start="download">Exporter</Button>
<Breadcrumb :separator="{ src: '/chevron.svg' }" :items="items" />
<MenuItem label="Ouvrir" :icon-start="{ component: FolderIcon }" />
```

Une chaîne est **toujours** un nom d'icône : le DS ne devine plus qu'une valeur contenant `.`, `/` ou `:` serait une URL. C'est ce qui permet aux conventions de nommage type Iconify (`mdi:close`, `fa6-solid:xmark`) de fonctionner.

> **Rupture** depuis la 0.1 : une URL passée en chaîne (`separator="/sep.svg"`) doit devenir `:separator="{ src: '/sep.svg' }"`. Le typage ne la signale pas — une URL reste une chaîne valide — mais l'icône s'affichera comme un nom introuvable.

### Brancher votre propre bibliothèque d'icônes

`setIconResolver` est consulté **avant** le registre intégré ; rendre `undefined` signifie « je ne connais pas ce nom » et laisse la main au registre, puis à la ligature. Les mappings **partiels** sont donc utilisables. Le type `DsIconName` énumère les noms à couvrir.

```ts
// main.ts / plugins/icons.ts — au niveau MODULE, jamais dans un setup()
import { setIconResolver, classIconResolver } from '@socle/ui'

// Font Awesome, Phosphor, Bootstrap Icons… (polices à classes + ::before)
// `fa-solid` sans condition : le tier Free ne dessine qu'une petite fraction du
// catalogue en Regular, donc mapper `filled: false` dessus rendrait des carrés
// vides. Le contour/plein de FA demande le tier Pro.
setIconResolver(
  classIconResolver({
    aliases: { close: 'xmark', expand_more: 'angle-down', check_circle: 'circle-check' },
    className: (nom) => `fa-solid fa-${nom}`,
  }),
)

// Lucide, Untitled UI… (jeux SVG en composants Vue, racine <svg> unique)
import { componentIconResolver } from '@socle/ui'
import { X, Check, ChevronDown } from 'lucide-vue-next'
setIconResolver(
  componentIconResolver({
    components: { close: X, check: Check, expand_more: ChevronDown },
    props: () => ({ strokeWidth: 1.75 }),
  }),
)

// Material Symbols, IcoMoon à ligatures… — rend AUSSI les 20 icônes du DS via
// la police, ce qui restitue l'axe optique --ds-icon-opsz (20 en xs/sm/md).
import { ligatureIconResolver } from '@socle/ui'
setIconResolver(ligatureIconResolver())
```

`classIconResolver` est **strict** par défaut : un nom du registre intégré absent de votre table d'alias retombe sur le SVG embarqué plutôt que de produire une classe inexistante (carré vide). Vos propres noms, eux, passent toujours.

Pour un besoin ponctuel, `setIconResolver` accepte n'importe quelle fonction rendant l'une des cinq formes : `{ path }`, `{ component }`, `{ src }`, `{ text }`, `{ class }`.

> **SSR** — posez le résolveur au niveau module (plugin Nuxt, `main.ts`), jamais dans un `setup()` : l'état vit dans le processus, ce qui est correct pour de la configuration et faux pour de l'état par requête. Surtout, **ne l'installez pas en client-only** (`plugins/*.client.ts`) : le serveur rendrait le SVG intégré et le client votre bibliothèque — mismatch d'hydratation. Font Awesome en mode « SVG with JS » (qui remplace les éléments dans le DOM) n'est pas supporté : utilisez son mode CSS.

**Charger une police d'icônes reste utile** pour vos propres noms. Exemple avec Material Symbols Rounded via Google Fonts :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
/>
```

(ou en self-host du woff2 variable, ex. paquet npm `material-symbols`). `display=block` évite le flash du nom d'icône en toutes lettres. Sans police chargée, la mise en page est préservée (le nom textuel est contenu dans le carré de l'icône). Surcharger le token `--ds-font-family-icon` suffit pour basculer sur une autre police **à ligatures** (Material Symbols Outlined/Sharp, build IcoMoon) — sans résolveur.

Sur `Button` : les props `icon-start` / `icon-end` prennent un nom d'icône ou un rendu explicite (les slots `#start`/`#end` restent disponibles pour du contenu custom et priment sur les props). `Button` accepte aussi `href` (rendu `<a>` ; `disabled`/`loading` produisent un lien inerte : `href` retiré + `aria-disabled`) et `compact` (hauteur réduite de 4 px : 20/28/36/44/52 px selon la taille `xs`–`xl`).

L'échelle `xs`–`xl` n'est pas exposée par tous les composants : ceux qui embarquent un champ de saisie (`Input`, `Textarea`, `InputOTP`, `Combobox`, `DatePicker`, `TimePicker`) se limitent à **`sm` / `md` / `lg`** (32/40/48 px, défaut `md`), `compact` restant disponible ; `Chip` se limite à `xs`/`sm`.

## Internationalisation

Aucun texte utilisateur n'est en dur dans les composants : tout vient d'un dictionnaire. Le design system est **français par défaut** et fournit l'anglais ; toute autre langue s'ajoute côté consommateur.

Deux choses se règlent séparément : les **mots** viennent du dictionnaire, les **formats** (noms de mois et de jours, ordre des champs de date, cycle horaire, premier jour de semaine) sont dérivés d'`Intl` à partir de la balise de locale. Poser une locale sans dictionnaire correspondant donne donc déjà des dates correctes, avec des libellés restés en français.

### Passer le design system en anglais

```ts
// main.ts
import { en, registerMessages, setLocale } from '@socle/ui'

registerMessages('en', en)
setLocale('en-GB')
```

L'anglais est **opt-in** : il n'entre dans votre bundle que si vous l'importez.

Posez une balise BCP 47 **complète**. `Intl` accepte `'en'`, mais lui applique les conventions par défaut de la langue — `'en'` signifie 12 h et semaine commençant le dimanche, ce qui n'est pas `'en-GB'`.

### Ajuster quelques mots

Une surcharge est **partielle** : ce que vous n'écrivez pas reste inchangé, et les appels successifs sur une même langue se cumulent.

```ts
import { registerMessages } from '@socle/ui'

registerMessages('fr', {
  dataTable: { empty: 'Rien à afficher' },
  common: { close: 'Quitter' },
})
```

### Ajouter une langue non fournie

Même geste que pour activer l'anglais — il n'y a pas deux catégories de dictionnaires. Ce que vous n'écrivez pas retombe sur le français, jamais sur une chaîne vide : un dictionnaire partiel est utilisable dès la première clé.

```ts
import { registerMessages, setLocale, type DsMessagesInput } from '@socle/ui'

const de: DsMessagesInput = {
  common: { loading: 'Wird geladen…', close: 'Schließen' },
  pagination: { previous: 'Vorherige Seite', next: 'Nächste Seite', page: (p) => `Seite ${p}` },
}

registerMessages('de', de)
setLocale('de-DE')
```

Une entrée qui dépend d'une valeur est une **fonction TypeScript**, pas une chaîne à placeholders : ni moteur de pluriel, ni syntaxe ICU à apprendre. Typez la constante `DsMessagesInput` pour l'autocomplétion des clés, ou `DsMessages` pour que le compilateur exige une couverture totale.

La clé est la **sous-balise de langue** seule : `registerMessages('de', …)` couvre `de-DE`, `de-AT` et `de-CH`.

### Précédence

Une prop texte posée sur un composant reste **prioritaire** : la traduction globale ne change que les défauts. Pour les noms accessibles de conteneurs, la chaîne complète est `aria-labelledby` › `aria-label` › prop `label` › dictionnaire › français.

`Calendar`, `DatePicker` et `TimePicker` gardent leur prop `locale`, prioritaire ; sans elle, ils suivent la locale globale.

```vue
<DatePicker />
<!-- locale globale -->
<DatePicker locale="ja-JP" />
<!-- forcé -->
```

### Limite : une locale par processus

La configuration vit au niveau module, comme celle des icônes : **une seule locale par processus**. Un site rendu côté serveur qui sert `/fr` et `/en` depuis le même processus Node ne peut pas s'appuyer dessus pour varier la langue par requête — il doit passer les props texte explicitement.

## Composants

| Domaine     | Composants                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions     | `Button`, `IconButton`, `Chip` (sélectionnable, supprimable)                                                                                                  |
| Formulaires | `Input`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Slider` (single/range), `InputOTP`, `Combobox` (recherche, multi)                                        |
| Overlays    | `Tooltip`, `Menu` + `MenuItem`/`MenuGroup`/`MenuSeparator` (sous-menus récursifs)                                                                             |
| Structure   | `Accordion` + `AccordionItem`, `DataTable` (tri, responsive), `Breadcrumb` (data-driven, troncature)                                                          |
| Feedback    | `Toaster` + `toast()` (notifications), `Badge`, `Avatar`, `Spinner`, `ProgressLinear`, `ProgressCircular`, `Icon` (SVG intégrés, police, image ou SVG inline) |

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
- **CSS Anchor Positioning** (Tooltip, Menu et ses sous-menus, Combobox) : pas encore stable sur Firefox — choix assumé de ne pas embarquer de fallback JS ; sur Firefox, les panneaux s'ouvrent (Popover API supportée) mais ne sont pas ancrés à leur déclencheur. Le reste du DS y fonctionne normalement.
- Progressive enhancement pur (dégradation propre si non supporté) : animations `@starting-style`/`allow-discrete`, `field-sizing: content` (Textarea `auto-grow`), `::details-content` + `interpolate-size` (animation Accordion).

## Accessibilité

Navigation clavier et sémantique ARIA sur tous les composants : pattern ARIA menu (roving focus, retour du focus au déclencheur), `role="switch"`, tooltips liés par `aria-describedby` et fermables à Échap (WCAG 1.4.13), `role="status"`/`role="alert"` selon la criticité, libellé accessible **obligatoire** sur `IconButton`. `prefers-reduced-motion` respecté partout. L'addon a11y de Storybook audite chaque story.

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
