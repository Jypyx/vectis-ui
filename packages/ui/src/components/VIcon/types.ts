import type { Component } from 'vue'

/** Contexte d'une demande d'icône. Objet plutôt qu'un booléen nu, pour rester extensible. */
export interface IconContext {
  /** `filled` demandé par l'appelant (prop de VIcon, `iconFilled` de VButton…). */
  filled: boolean
}

/**
 * Les cinq formes de rendu d'une icône — elles couvrent les quatre familles de
 * sources du marché : paths bruts, jeux SVG en composants (Lucide, Untitled UI),
 * sprites/URL, polices à ligatures ou à codepoints (Material, IcoMoon), polices
 * à classes + pseudo-élément (Font Awesome, Phosphor, Bootstrap Icons).
 *
 * Union non taguée : c'est ce que le consommateur écrit à la main, autant qu'il
 * n'ait rien à taguer. La précédence est fixée côté VIcon, dans cet ordre :
 * path > component > src > text > class.
 */
export type IconRender =
  /** Données de path SVG. `viewBox` défaut : la grille Material Symbols. */
  | { path: string; viewBox?: string }
  /** Composant Vue à racine `<svg>` UNIQUE (contrat du dimensionnement). */
  | { component: Component; props?: Record<string, unknown> }
  /** Image : sprite, data-URL, fichier. */
  | { src: string }
  /** Police à ligatures ou à codepoints : le texte est le glyphe. */
  | { text: string; class?: string }
  /** Police à classes : le glyphe vient d'un `::before` porté par ces classes. */
  | { class: string }

/**
 * Ce qu'accepte toute prop d'icône du DS. **Aucune heuristique** : une chaîne est
 * TOUJOURS un nom d'icône, une URL ou un composant passe explicitement par un
 * objet (`{ src: '/logo.svg' }`). C'est ce qui permet à n'importe quelle
 * convention de nommage (`mdi:close`, `fa6-solid:xmark`) d'atteindre le
 * résolveur au lieu d'être prise pour une URL.
 */
export type IconSource = string | IconRender
