export default {
  title: 'Bouton',
  lead: "Le bouton qui déclenche une action, et la référence dont sont tirées les tables de tons et de variantes de tous les autres composants colorés. Il rend un <code>&lt;button&gt;</code> natif, ou un <code>&lt;a&gt;</code> dès qu'on lui donne un <code>href</code>.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tons',
      text: '<code>variant</code> propose quatre façons de peindre le bouton, et <code>tone</code> trois sens : <code>accent</code>, <code>neutral</code> et <code>danger</code>.',
    },
    elevated: {
      title: 'Surélevé',
      text: "<code>elevated</code> applique l'échelle d'ombres à la variante en cours. Un bouton ghost ou outline gagne en plus un fond surélevé.",
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la hauteur : 24, 32, 40, 48 ou 56 pixels. La typographie, les rembourrages et les icônes suivent.',
    },
    compact: {
      title: 'Compact',
      text: "<code>compact</code> retire 4px à la hauteur, sans rien déplacer d'autre.",
    },
    fullWidth: {
      title: 'Pleine largeur',
      text: '<code>fullWidth</code> étire le bouton sur toute la largeur de son parent et le passe en bloc.',
    },
    icons: {
      title: 'Avec des icônes',
      text: "<code>iconStart</code> et <code>iconEnd</code> posent une icône de part et d'autre du libellé, et <code>iconFilled</code> les passe à leur forme pleine. Les slots <code>#start</code> et <code>#end</code> prennent le relais quand le contenu est plus qu'une icône.",
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: "Les deux props d'icône acceptent un <code>IconSource</code> : une des icônes de la bibliothèque, un nom confié au résolveur installé par votre application, des données de tracé SVG, un composant, ou une image.",
    },
    link: {
      title: 'Lien',
      text: '<code>href</code> rend le bouton sous forme de <code>&lt;a&gt;</code>. Un lien désactivé ou en chargement est rendu inerte, son adresse retirée.',
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> grise le bouton par les tokens de couleur. <code>loading</code> le désactive, l'annonce occupé et place un indicateur là où était l'icône de début.",
    },
  },

  api: {
    VButton: {
      props: {
        variant:
          "Le poids visuel que porte l'action : <code>solid</code> est rempli du ton, <code>soft</code> utilise un fond teinté, <code>outline</code> ne garde qu'une bordure, et <code>ghost</code> ne montre rien jusqu'au survol. Dans un VButtonGroup, c'est le groupe qui en décide, comme de la taille, de la densité et de l'élévation.",
        tone: "Ce que l'action signifie : <code>accent</code> pour l'action ordinaire, <code>neutral</code> pour une action secondaire, <code>danger</code> pour celle qui détruit quelque chose. Sur un bouton, un ton est une intention, et c'est pourquoi des états comme succès ou avertissement ne sont pas proposés ici. Omis dans un VButtonGroup, il prend celui du groupe ; seul, le bouton est en <code>accent</code>.",
        elevated:
          "Soulève le bouton de la page avec l'échelle d'ombres, quelle que soit la variante. Un bouton ghost ou outline reçoit en plus une surface surélevée, parce qu'en thème sombre une ombre posée sur le fond de page n'a rien qui la projette.",
        size: "La hauteur du bouton, tirée de l'échelle de tailles partagée par tous les contrôles : 24, 32, 40, 48 et 56 pixels.",
        compact:
          'Retire 4px à la hauteur, en laissant le rembourrage, le texte et les icônes tels quels.',
        fullWidth:
          'Étire le bouton sur toute la largeur de son parent au lieu de le laisser à la largeur de son libellé. Il devient également un élément de bloc, et ne repose donc plus sur une ligne de texte.',
        href: "Transforme le bouton en <code>&lt;a&gt;</code> pointant vers cette adresse. Un lien désactivé ou en chargement devient inerte : l'adresse est retirée, si bien qu'il ne peut être ni focalisé ni suivi.",
        type: 'Le type natif du bouton. Il est ignoré dès que <code>href</code> en fait un lien.',
        disabled:
          "Rend le bouton inutilisable : il cesse de répondre, quitte l'ordre de tabulation et se grise par les tokens de couleur plutôt que par l'opacité.",
        loading:
          "Affiche un indicateur, désactive le bouton et l'annonce comme occupé. L'indicateur prend la place de l'icône de début, si bien que les deux ne sont jamais côte à côte.",
        iconStart: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        iconEnd: 'Une icône après le libellé. Le slot <code>#end</code> la remplace.',
        iconFilled:
          "Rend les deux icônes dans leur forme pleine, l'axe <code>FILL</code> de la police. Sans effet sur les slots <code>#start</code> et <code>#end</code>, dont vous construisez vous-même les icônes.",
      },
      slots: {
        default: 'Le libellé du bouton.',
        start:
          'Du contenu placé avant le libellé, en général une icône. Marquez-la <code>aria-hidden</code> quand elle ne fait que répéter ce que le libellé dit déjà.',
        end: 'Du contenu placé après le libellé.',
      },
    },
  },
}
