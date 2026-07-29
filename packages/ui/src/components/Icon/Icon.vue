<script setup lang="ts">
/**
 * Icône, résolue dans cet ordre : image (`src`), puis `name` — d'abord le
 * RÉSOLVEUR consommateur s'il est posé (`setIconResolver`, cf. `resolver.ts`),
 * puis le REGISTRE INTÉGRÉ (SVG Material Symbols Rounded embarqués, cf.
 * `icons.ts`), sinon la ligature (police chargée par le CONSOMMATEUR, voir
 * README) — sinon SVG inline par le slot. Décorative par défaut (aria-hidden) ;
 * `label` la rend informative (role="img" + aria-label).
 *
 * L'ordre EST le contrat : le résolveur passe avant le registre, sinon les
 * icônes du DS resteraient en Material chez qui a branché sa propre
 * bibliothèque ; et un résolveur qui rend `undefined` laisse la main au registre,
 * ce qui rend les mappings partiels utilisables.
 *
 * Le registre est ce qui rend le DS utilisable SANS police d'icônes : les icônes
 * que la librairie rend elle-même (croix, chevrons, tones de Toast…) ne
 * dépendent plus de rien. La ligature reste le repli pour tout autre nom.
 *
 * Aucun JS de COMPORTEMENT ici malgré le `computed` : ni événement, ni cycle de
 * vie, ni accès DOM — une résolution de source pure, évaluée identiquement au
 * serveur et au client. La propriété « zéro JS » d'Icon était un corollaire de
 * « la police fait tout » ; s'en affranchir la retire nécessairement.
 */
import { computed, type Component } from 'vue'

import { builtinIcons, ICON_VIEW_BOX } from './icons'
import { resolveIcon } from './resolver'
import type { IconRender } from './types'

interface IconProps {
  /** Nom d'icône : une des icônes intégrées, sinon ligature de la police du consommateur. */
  name?: string
  /**
   * Rendu explicite (image, composant, path, classe…) — prioritaire sur tout le
   * reste. C'est par là que passent les props `IconSource` des composants du DS
   * quand le consommateur ne fournit pas un simple nom.
   */
  render?: IconRender
  /** Source image (URL). Prioritaire sur `name`. */
  src?: string
  /**
   * Taille explicite en pixels (ex. :size="32"). Sans elle : taille du
   * contexte (`--ds-icon-size` posée par un parent, ex. Button), sinon 1em —
   * l'icône suit le texte environnant.
   */
  size?: number
  /** Libellé accessible ; absent = icône décorative (aria-hidden). */
  label?: string
  /**
   * Variante pleine (axe `FILL` 1 au lieu de 0) : honorée par le registre
   * intégré quand la géométrie diffère, et par la ligature. Sans effet sur les
   * sources `src` (image) et SVG inline.
   */
  filled?: boolean
}

const props = withDefaults(defineProps<IconProps>(), {
  name: undefined,
  render: undefined,
  src: undefined,
  size: undefined,
  label: undefined,
  filled: false,
})

defineSlots<{
  /** SVG inline (utilisé si ni `src` ni `name`). */
  default?(): unknown
}>()

/**
 * Forme retenue, taguée : l'union publique `IconRender` n'est pas discriminée
 * (le consommateur n'a rien à taguer), mais le template a besoin d'un
 * discriminant fiable — et le tag encode au passage la précédence documentée.
 */
type Resolved =
  | { kind: 'path'; path: string; viewBox: string }
  | { kind: 'component'; component: Component; props?: Record<string, unknown> }
  | { kind: 'src'; src: string }
  | { kind: 'text'; text: string; class?: string }
  | { kind: 'class'; class: string }

function tag(render: IconRender): Resolved {
  if ('path' in render)
    return { kind: 'path', path: render.path, viewBox: render.viewBox ?? ICON_VIEW_BOX }
  if ('component' in render)
    return { kind: 'component', component: render.component, props: render.props }
  if ('src' in render) return { kind: 'src', src: render.src }
  if ('text' in render) return { kind: 'text', text: render.text, class: render.class }
  return { kind: 'class', class: render.class }
}

/** `render` explicite, puis résolveur consommateur, puis registre intégré ; sinon ligature. */
const resolved = computed<Resolved | undefined>(() => {
  if (props.render) return tag(props.render)
  if (props.src !== undefined || props.name === undefined) return undefined

  const custom = resolveIcon(props.name, { filled: props.filled })
  if (custom) return tag(custom)

  const paths: readonly string[] | undefined = (
    builtinIcons as Record<string, readonly string[] | undefined>
  )[props.name]
  // Le path plein n'existe que si l'axe FILL change la géométrie (cf. icons.ts).
  const path = paths && ((props.filled ? paths[1] : undefined) ?? paths[0])
  return path ? { kind: 'path', path, viewBox: ICON_VIEW_BOX } : undefined
})
</script>

<template>
  <span
    class="ds-icon"
    :style="size !== undefined ? { '--ds-icon-size': `${size}px` } : undefined"
    :data-icon="name"
    :data-filled="filled || undefined"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <template v-if="resolved">
      <svg
        v-if="resolved.kind === 'path'"
        class="ds-icon-svg"
        :viewBox="resolved.viewBox"
        aria-hidden="true"
        focusable="false"
      >
        <path :d="resolved.path" />
      </svg>
      <component
        :is="resolved.component"
        v-else-if="resolved.kind === 'component'"
        v-bind="resolved.props"
      />
      <img v-else-if="resolved.kind === 'src'" class="ds-icon-img" :src="resolved.src" alt="" />
      <!-- l'interpolation touche les balises : une ligature ne tolère pas d'espace autour -->
      <span v-else-if="resolved.kind === 'text'" class="ds-icon-symbol" :class="resolved.class">{{
        resolved.text
      }}</span>
      <span v-else class="ds-icon-glyph" :class="resolved.class" />
    </template>
    <img v-else-if="src" class="ds-icon-img" :src="src" alt="" />
    <span v-else-if="name" class="ds-icon-symbol">{{ name }}</span>
    <slot v-else />
  </span>
</template>

<style>
@layer ds.components {
  .ds-icon {
    /*
     * Résolution de la taille, par priorité :
     * 1. prop `size` (px) — posée en --ds-icon-size inline sur l'élément :
     *    une déclaration propre prime sur l'héritage et sur la layer ;
     * 2. --ds-icon-size / --ds-icon-opsz héritées d'un parent (API de
     *    contexte : Button les pose selon sa propre taille) ;
     * 3. 1em — l'icône suit la taille de texte du parent.
     */
    --_size: var(--ds-icon-size, 1em);
    --_opsz: var(--ds-icon-opsz, 24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    inline-size: var(--_size);
    block-size: var(--_size);
    /* la ligature Material Symbols se dimensionne par font-size */
    font-size: var(--_size);
  }

  /* Dégradé si la police n'est pas chargée : le nom textuel reste contenu dans
     le carré au lieu de casser la mise en page. Posé sur la SEULE branche qu'il
     protège et non sur `.ds-icon` : une police d'icônes tierce peut dessiner un
     glyphe hors de son cadran 1em, qui serait alors rogné. */
  .ds-icon:has(> .ds-icon-symbol) {
    overflow: hidden;
  }

  .ds-icon-symbol {
    font-family: var(--ds-font-family-icon);
    font-weight: var(--ds-font-weight-regular);
    font-style: normal;
    line-height: var(--ds-font-leading-none);
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    direction: ltr;
    /* axes de la police Material Symbols (FILL/wght/GRAD/opsz) : contrat
       technique de la police, pas des tokens de design — valeurs littérales
       tolérées, comme les opacités */
    font-variation-settings:
      'FILL' var(--_fill, 0),
      'wght' 400,
      'GRAD' 0,
      'opsz' var(--_opsz);
  }

  .ds-icon[data-filled] .ds-icon-symbol {
    --_fill: 1;
  }

  .ds-icon-img,
  .ds-icon > svg {
    inline-size: 100%;
    block-size: 100%;
    object-fit: contain;
  }

  /* Police à classes fournie par un résolveur (Font Awesome, Phosphor…) : le
     glyphe vient d'un `::before`, dimensionné par le `font-size` de `.ds-icon`.
     C'est le DS qui possède l'élément, donc une seule règle suffit — `font-style`
     couvre d'avance les conventions en `<i>`, et `line-height` empêche la line
     box héritée de décentrer le glyphe dans le carré. */
  .ds-icon-glyph {
    display: block;
    font-style: normal;
    line-height: var(--ds-font-leading-none);
  }

  /* SVG du registre intégré. `fill` est posé sur NOTRE classe et jamais sur
     `.ds-icon > svg` : un SVG multicolore passé par le slot garde ses couleurs.
     `display: block` supprime le gap de ligne de base sous l'élément inline. */
  .ds-icon-svg {
    display: block;
    fill: currentcolor;
  }
}
</style>
