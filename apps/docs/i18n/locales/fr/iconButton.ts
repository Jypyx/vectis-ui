export default {
  title: 'Bouton icône',
  lead: '<code>VIconButton</code> affiche une icône pour une action ou un lien. La prop obligatoire <code>label</code> fournit son nom accessible.',
  examples: {
    variantsAndTones: {
      title: 'Variantes et tons',
      text: 'Les variantes et tons sont ceux de <code>VButton</code>, avec <code>ghost</code> et <code>neutral</code> par défaut.',
    },
    elevated: {
      title: 'Avec une ombre',
      text: '<code>elevated</code> ajoute une ombre. Les variantes <code>ghost</code> et <code>outline</code> reçoivent aussi un fond.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> ajuste le bouton et son icône. <code>compact</code> réduit la largeur et la hauteur de la même valeur.',
    },
    shapes: {
      title: 'Formes',
      text: '<code>shape</code> définit une forme carrée ou circulaire. Dans un <code>VButtonGroup</code>, les boutons joints gardent des bords droits entre les segments.',
    },
    icons: {
      title: 'Icônes',
      text: 'Fournissez une icône avec <code>icon</code> ou le slot par défaut. <code>iconFilled</code> demande une version pleine lorsqu’elle existe.',
    },
    link: {
      title: 'Lien',
      text: '<code>href</code> affiche un lien. La navigation est bloquée lorsque le bouton est désactivé ou en chargement.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> empêche l’activation. <code>loading</code> remplace aussi l’icône par un indicateur de chargement et définit <code>aria-busy</code>.',
    },
  },
  api: {
    VIconButton: {
      props: {
        label:
          'Nom accessible, appliqué comme <code>aria-label</code>. Nommez l’action, par exemple « Fermer » ou « Mois suivant ».',
        variant:
          'Style visuel. Accepte les mêmes valeurs que <code>VButton</code>. Remplacé lorsque <code>VButtonGroup</code> définit une variante.',
        tone: 'Intention de l’action. Si omis, reprend le ton du groupe, ou <code>neutral</code> si le groupe n’en définit pas.',
        elevated:
          'Ajoute une ombre et, pour <code>ghost</code> et <code>outline</code>, un fond. Remplacé lorsque le groupe définit <code>elevated</code>.',
        size: 'Taille du bouton. Remplacée lorsque le groupe définit <code>size</code>.',
        compact:
          'Réduit la largeur et la hauteur de la même valeur. Remplacé lorsque le groupe définit <code>compact</code>.',
        shape: 'Forme carrée ou circulaire. La largeur et la hauteur restent égales.',
        href: 'Destination du lien. Lorsqu’il est désactivé ou en chargement, le lien perd sa destination et ne peut recevoir le focus ni naviguer.',
        type: 'Type natif du bouton. Ignoré si <code>href</code> est défini.',
        disabled: 'Empêche l’activation et retire le bouton de la navigation par Tab.',
        loading:
          'Désactive le bouton, définit <code>aria-busy</code> et remplace l’icône ou le contenu du slot par défaut par un indicateur de chargement.',
        icon: 'Icône à afficher. Accepte un <code>IconSource</code>. Prend le pas sur le slot par défaut.',
        iconFilled:
          'Demande une version pleine de <code>icon</code> lorsqu’elle existe. Sans effet sur le contenu des slots.',
      },
      slots: {
        default:
          'Contenu de l’icône, utilisé si <code>icon</code> est absent. Ajoutez <code>aria-hidden="true"</code> au contenu décoratif.',
      },
    },
  },
}
