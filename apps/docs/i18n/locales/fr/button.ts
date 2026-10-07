export default {
  title: 'Bouton',
  lead: '<code>VButton</code> déclenche une action ou ouvre une URL si <code>href</code> est défini.',
  examples: {
    variantsAndTones: {
      title: 'Variantes et tons',
      text: '<code>variant</code> définit le style visuel et <code>tone</code> indique l’intention de l’action.',
    },
    elevated: {
      title: 'Avec une ombre',
      text: '<code>elevated</code> ajoute une ombre. Les variantes <code>ghost</code> et <code>outline</code> reçoivent aussi un fond.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste la hauteur, les espacements internes, le texte et les icônes.',
    },
    compact: {
      title: 'Compact',
      text: '<code>compact</code> réduit la hauteur sans modifier les espacements internes, le texte ni les icônes.',
    },
    fullWidth: {
      title: 'Pleine largeur',
      text: '<code>fullWidth</code> étend le bouton à la largeur de son parent.',
    },
    icons: {
      title: 'Avec des icônes',
      text: 'Ajoutez des icônes avec <code>iconStart</code> ou <code>iconEnd</code>. Pour du contenu personnalisé, utilisez <code>#start</code> ou <code>#end</code>.',
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: 'Les deux props d’icône acceptent un <code>IconSource</code> : une icône intégrée, un nom résolu par votre application, un tracé SVG, un composant ou une image.',
    },
    link: {
      title: 'Lien',
      text: '<code>href</code> affiche un lien. La navigation est bloquée lorsque le bouton est désactivé ou en chargement.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> empêche l’activation. <code>loading</code> affiche aussi un indicateur de chargement et définit <code>aria-busy</code>.',
    },
  },
  api: {
    VButton: {
      props: {
        variant:
          'Style visuel : <code>solid</code> pour un fond plein, <code>soft</code> pour un fond teinté, <code>outline</code> pour une bordure ou <code>ghost</code> pour un fond transparent jusqu’au survol. <code>VButtonGroup</code> impose sa valeur.',
        tone: 'Intention de l’action : <code>accent</code> pour une action principale, <code>neutral</code> pour une action secondaire ou <code>danger</code> pour une action destructive. Si omis, reprend le ton de <code>VButtonGroup</code>, ou <code>accent</code> hors d’un groupe.',
        elevated:
          'Ajoute une ombre et, pour <code>ghost</code> et <code>outline</code>, un fond. <code>VButtonGroup</code> impose sa valeur.',
        size: 'Taille du bouton. <code>VButtonGroup</code> impose sa valeur.',
        compact:
          'Réduit la hauteur sans modifier les espacements internes, le texte ni les icônes. <code>VButtonGroup</code> impose sa valeur.',
        fullWidth: 'Occupe toute la largeur du parent.',
        href: 'Destination du lien. Affiche un <code>&lt;a&gt;</code> au lieu d’un <code>&lt;button&gt;</code>. Lorsque le bouton est désactivé ou en chargement, le lien perd sa destination et ne peut plus recevoir le focus ni déclencher de navigation.',
        type: 'Type natif du bouton. Ignoré si <code>href</code> est défini.',
        disabled: 'Empêche l’activation et retire le bouton de l’ordre de tabulation.',
        loading:
          'Désactive le bouton, définit <code>aria-busy</code> et remplace <code>iconStart</code> ou le contenu de <code>#start</code> par un indicateur de chargement.',
        iconStart: 'Icône avant le libellé. Remplacée par le slot <code>#start</code>.',
        iconEnd: 'Icône après le libellé. Remplacée par le slot <code>#end</code>.',
        iconFilled:
          'Demande les versions pleines de <code>iconStart</code> et <code>iconEnd</code>, si disponibles. Sans effet sur le contenu des slots.',
      },
      slots: {
        default: 'Libellé du bouton.',
        start:
          'Contenu avant le libellé, à la place de <code>iconStart</code>. Masqué pendant le chargement. Ajoutez <code>aria-hidden="true"</code> au contenu décoratif.',
        end: 'Contenu après le libellé, à la place de <code>iconEnd</code>.',
      },
    },
  },
}
