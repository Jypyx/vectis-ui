export default {
  title: 'Bouton',
  lead: "Le bouton qui déclenche une action, et la référence dont sont tirées les tables de tons et de variantes de tous les autres composants colorés. Il rend un <code>&lt;button&gt;</code> natif, ou un <code>&lt;a&gt;</code> dès qu'on lui donne un <code>href</code>.",

  variantsHeading: 'Variantes',
  variantsBody:
    "Le poids visuel que porte l'action. VButton ne surcharge pas une seule valeur de la table de tons partagée, et c'est pour cela qu'il en est la référence.",
  variantsElevation:
    "L'élévation est orthogonale à la variante, et c'est un booléen plutôt qu'une cinquième valeur : <code>elevated</code> applique l'échelle d'ombres aux quatre. Un bouton ghost ou outline élevé reçoit en plus une surface SURÉLEVÉE, parce qu'en mode sombre une ombre posée sur le fond de page n'a rien qui la projette.",

  tonesHeading: 'Tons',
  tonesBody:
    "Ce que l'action SIGNIFIE. Sur un bouton, un ton est une intention, et c'est pourquoi des états comme succès ou avertissement ne sont pas proposés ici — ils appartiennent aux puces, aux badges et aux notifications.",
  tonesRule:
    "Une règle gouverne les contrôles pleins : ils portent du texte blanc. Tout le reste plie pour que cela reste vrai — le neutre plein est une inversion complète texte/surface, et son survol mélange VERS <code>surface</code> plutôt que de s'en éloigner, parce qu'il n'existe pas de neutre plus sombre où aller.",

  sizesHeading: 'Tailles',
  sizesBody:
    "La hauteur vient de l'échelle de contrôles partagée par tous les contrôles : 24, 32, 40, 48 et 56px. <code>compact</code> en retire 4px, en laissant le rembourrage, le texte et les icônes tels quels.",

  iconsHeading: 'Icônes',
  iconsBody:
    "<code>iconStart</code> et <code>iconEnd</code> prennent un nom d'icône ou un rendu explicite, et les slots <code>#start</code> / <code>#end</code> prennent le relais quand un nom ne suffit pas. VIconButton est le frère carré pour une action sans libellé — où la prop <code>label</code> est obligatoire et non optionnelle, puisqu'elle est le seul nom accessible que le contrôle aura jamais.",

  statesHeading: 'États',
  statesBody:
    "L'état désactivé se grise par les tokens de couleur, jamais par l'opacité — le chargement est la seule exception, à <code>opacity: 0.5</code>. Un LIEN désactivé ou en chargement devient inerte : l'adresse est retirée, si bien qu'il ne peut être ni focalisé ni suivi, et <code>aria-disabled</code> dit aux technologies d'assistance pourquoi.",
  statesCaption:
    "Cliquez sur Deploy : l'indicateur remplace l'icône de DÉBUT, et le bouton s'annonce occupé.",

  apiHeading: 'API',
  apiHref: '<code>string</code> — rend un <code>&lt;a&gt;</code>',
  apiIconFilled: "<code>boolean</code> — l'axe FILL, là où l'icône en a un",
  apiSlots:
    "Slots : <code>#default</code> pour le libellé, <code>#start</code> et <code>#end</code> pour ce qu'un nom d'icône ne peut pas exprimer. Les attributs natifs ne sont pas redéclarés — ils retombent sur le bouton ou sur l'ancre.",

  iconButtonHeading: 'VIconButton',
  apiLabel: '<code>string</code> — <strong>obligatoire</strong>, le nom accessible',
  apiIcon: '<code>IconSource</code> — ou le slot par défaut',
  iconButtonQuote:
    "Les deux valeurs par défaut diffèrent de celles de VButton à dessein : un contrôle réduit à une icône relève bien plus souvent du décor que de l'action principale.",
}
