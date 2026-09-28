export default {
  title: 'Puce',
  lead: '<code>VChip</code> affiche un tag, un statut ou un filtre. Il peut servir de bouton, de lien, de bascule ou d’élément supprimable.',
  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: 'Combinez <code>variant</code> et <code>tone</code> pour définir l’apparence.',
    },
    shapes: {
      title: 'Silhouettes',
      text: '<code>shape</code> choisit des coins arrondis ou une capsule. Personnalisez le rayon avec <code>--vectis-radius-chip</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille du chip ; <code>compact</code> réduit sa hauteur.',
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: '<code>color</code> remplace le ton par une couleur CSS. Vérifiez le contraste du texte sur les chips pleins.',
    },
    icons: {
      title: 'Avec des icônes',
      text: 'Utilisez les props d’icônes ou les slots <code>start</code> et <code>end</code>. Donnez un nom accessible aux chips interactifs sans texte.',
    },
    clickable: {
      title: 'Cliquable et liens',
      text: '<code>clickable</code> affiche un bouton ; <code>href</code> affiche un lien. Sans ces props, le chip est un contenu simple.',
    },
    selection: {
      title: 'Sélection',
      text: 'Activez <code>selectable</code> et liez <code>v-model:selected</code>. <code>check</code> affiche une coche à la place de l’icône de début lorsque le chip est sélectionné.',
    },
    dismissible: {
      title: 'Suppression',
      text: '<code>dismissible</code> ajoute un bouton émettant <code>dismiss</code>. Retirez vous-même le chip. Donnez à chaque bouton un <code>dismissLabel</code> qui nomme l’élément retiré.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> empêche les interactions. Les liens désactivés perdent leur destination et quittent l’ordre de tabulation.',
    },
  },
  api: {
    VChip: {
      props: {
        variant: 'Style visuel.',
        tone: 'Ton de couleur.',
        color:
          'Couleur CSS personnalisée remplaçant le ton. Vérifiez le contraste du texte sur les chips pleins.',
        shape: 'Coins arrondis ou forme de capsule.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        clickable: 'Affiche un bouton sans état de sélection.',
        href: 'Destination du lien.',
        selectable:
          'Affiche un bouton bascule. Prioritaire sur <code>href</code> et <code>clickable</code>.',
        check: 'Affiche une coche si le chip est sélectionné, à la place du contenu de début.',
        checkIcon: 'Icône de coche. Non affectée par <code>iconFilled</code>.',
        iconStart: 'Icône avant le libellé. Remplacée par le slot <code>start</code>.',
        iconEnd: 'Icône après le libellé. Remplacée par le slot <code>end</code>.',
        iconFilled:
          'Utilise les icônes de début et de fin pleines si disponibles. Sans effet sur les slots, la coche ou l’icône de suppression.',
        dismissible: 'Ajoute un bouton de suppression. Ne retire pas automatiquement le chip.',
        dismissIcon: 'Icône du bouton de suppression.',
        dismissLabel:
          'Nom accessible du bouton de suppression. Utilise le dictionnaire de la bibliothèque par défaut.',
        disabled: 'Désactive les interactions.',
        vModelSelected: 'État de sélection si <code>selectable</code> est activé.',
      },
      events: {
        dismiss: 'Le bouton de suppression a été activé. Retirez le chip en réponse.',
      },
      slots: {
        default: 'Libellé. Peut être omis pour un chip composé d’icônes.',
        start: 'Contenu remplaçant <code>iconStart</code>.',
        end: 'Contenu remplaçant <code>iconEnd</code>.',
      },
    },
  },
}
