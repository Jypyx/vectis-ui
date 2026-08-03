/**
 * Point de branchement d'une bibliothèque d'icônes tierce. Le résolveur est
 * consulté AVANT le registre intégré : c'est ce qui permet à un consommateur de
 * faire passer TOUTES les icônes du DS sur sa propre source.
 *
 * État module-level (précédent : `VToast/state.ts`) plutôt que plugin Vue : c'est
 * de la configuration, identique pour toutes les requêtes d'un processus, et
 * elle doit rester posable depuis un `.ts` quelconque (plugin Nuxt, main.ts).
 */
import { shallowRef, type Component } from 'vue'

import { builtinIcons, type VectisIconName } from './icons'
import type { IconContext, IconRender } from './types'

/**
 * Traduit un nom d'icône en rendu. Rendre `undefined` signifie « je ne connais
 * pas ce nom » — pas « ne rien afficher » : VIcon retombe alors sur le registre
 * intégré, puis sur la ligature. C'est ce qui rend les mappings PARTIELS
 * utilisables (mapper cinq noms, garder les autres).
 */
export type IconResolver = (name: string, ctx: IconContext) => IconRender | undefined

/**
 * Table de correspondance « nom du DS → nom chez vous ». Les clés du registre
 * intégré sont suggérées par l'IDE ; toute autre clé reste acceptée (vos propres
 * icônes ont aussi le droit d'être aliasées).
 */
export type IconAliases = Partial<Record<VectisIconName, string>> & Record<string, string>

const resolver = shallowRef<IconResolver | undefined>(undefined)

/**
 * Installe (ou retire, avec `undefined`) le résolveur global.
 *
 * À appeler au niveau MODULE — plugin Nuxt, `main.ts` — jamais dans un `setup()`.
 * En SSR l'état vit dans le processus : c'est correct pour de la configuration,
 * faux pour de l'état par requête. Attention aussi au client-only : un résolveur
 * posé dans un `plugins/*.client.ts` fait diverger serveur et client, donc
 * mismatch d'hydratation.
 */
export function setIconResolver(next: IconResolver | undefined): void {
  resolver.value = next
}

/** Interne — consommé par `VIcon.vue`, non exporté publiquement. */
export function resolveIcon(name: string, ctx: IconContext): IconRender | undefined {
  return resolver.value?.(name, ctx)
}

/**
 * Police à LIGATURES : Material Symbols (toutes variantes), build IcoMoon à
 * ligatures. Répond à tous les noms — c'est aussi la façon de rendre les icônes
 * du DS avec la police plutôt qu'avec les SVG intégrés, et donc de retrouver
 * l'axe optique `--vectis-icon-opsz`, que le registre (dessiné à opsz 24) ignore.
 */
export function ligatureIconResolver(options: { aliases?: IconAliases } = {}): IconResolver {
  const { aliases } = options
  return (name) => ({ text: aliases?.[name] ?? name })
}

/**
 * Police à CLASSES + pseudo-élément : Font Awesome, Phosphor, Bootstrap Icons…
 *
 * `strict` (défaut) protège les icônes du DS : un nom du registre intégré qui
 * n'est PAS dans votre table d'alias produirait une classe inexistante, donc un
 * carré vide — mieux vaut le laisser retomber sur le SVG intégré. Vos propres
 * noms, eux, passent toujours : ils sont déjà écrits dans votre vocabulaire.
 */
export function classIconResolver(options: {
  aliases?: IconAliases
  /** `mapped` = l'alias s'il existe, sinon le nom tel quel. */
  className: (mapped: string, filled: boolean) => string
  strict?: boolean
}): IconResolver {
  const { aliases, className, strict = true } = options
  return (name, ctx) => {
    const mapped = aliases?.[name]
    if (mapped === undefined && strict && name in builtinIcons) return undefined
    return { class: className(mapped ?? name, ctx.filled) }
  }
}

/**
 * Jeu SVG en COMPOSANTS Vue : Lucide, Untitled UI… Strict par construction — un
 * nom absent de la table retombe sur le registre intégré, puis sur la ligature.
 * Contrat : chaque composant doit avoir une racine `<svg>` unique, c'est elle
 * que le CSS dimensionne.
 */
export function componentIconResolver(options: {
  components: Partial<Record<VectisIconName, Component>> & Record<string, Component>
  props?: (name: string, filled: boolean) => Record<string, unknown>
}): IconResolver {
  const { components, props } = options
  return (name, ctx) => {
    const component = components[name]
    return component ? { component, props: props?.(name, ctx.filled) } : undefined
  }
}
