export default {
  title: 'Classes CSS utilitaires',
  lead: "Une seule classe utilitaire est livrée, et c'est délibéré : un design system qui livre des utilitaires entre en concurrence avec le framework que le consommateur a déjà choisi.",

  hiddenHeading: 'v-visually-hidden',
  hiddenBody:
    "Sort un élément de la vue tout en le laissant dans l'arbre d'accessibilité, ce qu'exige un libellé dont un lecteur d'écran a besoin et dont un lecteur voyant n'a que faire. Elle vit dans <code>vectis.utilities</code>, la couche la plus forte, et l'emporte donc sur n'importe quelle règle de composant.",
  hiddenNot:
    "Notez ce qu'elle n'est PAS. <code>display: none</code> et <code>visibility: hidden</code> retirent l'élément de l'arbre d'accessibilité autant que de la page, et <code>width: 0</code> est annoncé par certains lecteurs d'écran et sauté par d'autres. C'est le rognage qui la garde lisible et invisible à la fois.",

  layersHeading: 'Les couches',
  layersIntro: "Quatre, déclarées dans cet ordre, et l'ordre est tout le modèle de surcharge :",
  layersBody:
    "Tout style non calqué écrit côté consommateur l'emporte automatiquement. Écrivez une règle sans couche, ou écrivez dans <code>vectis.utilities</code>. Jamais de guerre de spécificité, et jamais d'<code>!important</code>. Chaque ligne de CSS de ce site emprunte ce chemin : sa mise en page, ses polices et son accent sont tous des règles non calquées posées par-dessus la bibliothèque.",
  layersQuote:
    "Un piège vient avec. Un nom de couche est GLOBAL et non préfixé : écrire <code>@layer vectis.components { … }</code> dans votre propre feuille met votre règle à l'intérieur de la couche de la bibliothèque, où elle est arbitrée par l'ordre ci-dessus au lieu de l'emporter dessus. Laisser votre CSS sans couche est à la fois plus simple et plus fort.",

  internalHeading: 'Les classes internes que vous verrez dans le DOM',
  internalBody:
    "Ce n'est pas une API. Elles sont nommées ici parce que vous les lirez dans les devtools, et parce qu'une surcharge ciblée a besoin du bon point d'accroche. Elles peuvent changer ; une propriété personnalisée, non.",
  columnClass: 'Classe',
  columnCarries: 'Ce qui la porte',
  control:
    'Tout contrôle. Elle lit la table des tailles et publie <code>--control-height</code>, <code>--control-padding-inline</code>, <code>--control-font-size</code> et <code>--control-gap</code> pour ses enfants.',
  panel:
    'Le décor commun des panneaux flottants : surface de survol, bordure de 1px, <code>radius-overlay</code>, <code>shadow-lg</code>.',
  overlay:
    "Le placement dans la couche supérieure et l'animation d'entrée ancrée (fondu plus <code>scale(0.97)</code>).",
  tone: "La table des tons, sur l'élément qui porte <code>data-tone</code>. Elle publie <code>--tone-bg-solid</code>, <code>--tone-text-tinted</code> et les leurs, que les variantes consomment.",
  ligature: "Une icône rendue en ligature de police plutôt qu'en tracé intégré.",
  theme:
    "Pas une classe : l'unique signal du document. Il déplace les rôles et pilote <code>color-scheme</code>.",

  propertiesHeading: 'Les propriétés personnalisées à viser',
  propertiesBody:
    "Préférez repointer une propriété à réécrire une règle : <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-icon-size</code>, <code>--vectis-focus-ring-color</code>, <code>--vectis-text-family-heading</code>. Un composant les lit à chaque rendu, si bien que le changement suit tous ses états, survol, focus et désactivé compris, sans qu'aucun d'eux soit redit.",
}
