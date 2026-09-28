export default {
  title: 'Groupe à bascule',
  lead: '<code>VToggle</code> regroupe des boutons <code>VToggleItem</code> pour sélectionner une ou plusieurs valeurs avec <code>v-model</code>.',
  examples: {
    variants: {
      title: 'Variantes et tons',
      text: '<code>itemVariant</code> définit le style des éléments non sélectionnés. <code>tone</code> s’applique aux éléments sélectionnés ; les autres restent neutres.',
    },
    selectedVariants: {
      title: 'Style de la sélection',
      text: '<code>selectedVariant</code> définit le style de la sélection : <code>solid</code>, <code>soft</code> ou <code>ghost</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille de tous les éléments. <code>compact</code> réduit leur hauteur.',
    },
    itemContent: {
      title: 'Contenu des éléments',
      text: 'Utilisez <code>label</code> ou le slot par défaut pour le texte visible, et <code>iconStart</code> ou <code>iconEnd</code> pour les icônes. Donnez un <code>aria-label</code> aux éléments sans texte visible.',
    },
    filledIcons: {
      title: 'Icônes pleines',
      text: '<code>selectedIconFilled</code> affiche l’icône de début de l’élément sélectionné en version pleine. La prop <code>iconFilled</code> d’un élément fait de même pour ses deux icônes, quelle que soit la sélection, si cette version existe.',
    },
    detached: {
      title: 'Éléments séparés',
      text: '<code>detached</code> sépare les éléments par un espace.',
    },
    seamless: {
      title: 'Sans séparateurs',
      text: '<code>seamless</code> retire les séparateurs internes. Sans effet avec <code>detached</code>.',
    },
    fullWidth: {
      title: 'Pleine largeur',
      text: '<code>fullWidth</code> occupe toute la largeur du parent. Dans un groupe horizontal, les éléments ont la même largeur.',
    },
    elevated: {
      title: 'Avec une ombre',
      text: '<code>elevated</code> ajoute une ombre au groupe, ou à chaque élément lorsqu’ils sont séparés.',
    },
    orientation: {
      title: 'Orientation et clavier',
      text: '<code>orientation="vertical"</code> dispose les éléments en colonne. Les flèches déplacent le focus sur cet axe ; Home et End ciblent le premier et le dernier élément non désactivé. Chaque élément non désactivé reste accessible par Tab. Espace ou Entrée modifie la sélection.',
    },
    multiple: {
      title: 'Sélection multiple',
      text: '<code>multiple</code> autorise plusieurs sélections et utilise un tableau pour <code>v-model</code>. Activez à nouveau un élément sélectionné pour le désélectionner.',
    },
    mandatory: {
      title: 'Conserver une sélection',
      text: '<code>mandatory</code> empêche de désélectionner le dernier élément sélectionné. Définissez la sélection initiale avec <code>v-model</code>.',
    },
    disabled: {
      title: 'Désactivé',
      text: 'Désactivez le groupe ou un élément avec <code>disabled</code>. Les éléments désactivés ne reçoivent pas le focus et sont ignorés par la navigation avec les flèches.',
    },
  },
  api: {
    VToggle: {
      props: {
        multiple: 'Autorise plusieurs sélections. Utilisez un tableau pour <code>v-model</code>.',
        mandatory:
          'Empêche de désélectionner le dernier élément sélectionné. Ne choisit aucune valeur initiale et n’empêche pas les modifications externes de <code>v-model</code>.',
        detached: 'Sépare les éléments par un espace.',
        seamless:
          'Retire les séparateurs internes et conserve la bordure extérieure. Sans effet avec <code>detached</code>.',
        orientation:
          'Disposition en ligne horizontale ou en colonne verticale. Définit le sens de navigation avec les flèches.',
        fullWidth:
          'Occupe toute la largeur du parent. Les éléments horizontaux ont la même largeur, mais peuvent déborder si leur contenu est trop large.',
        itemVariant:
          'Style visuel des éléments non sélectionnés : <code>ghost</code> ou <code>outline</code>.',
        selectedVariant:
          'Style visuel des éléments sélectionnés : <code>solid</code>, <code>soft</code> ou <code>ghost</code>.',
        tone: 'Ton des éléments sélectionnés. Les autres restent neutres.',
        size: 'Taille de tous les éléments.',
        compact: 'Réduit la hauteur des éléments.',
        elevated: 'Ajoute une ombre au groupe, ou à chaque élément avec <code>detached</code>.',
        disabled: 'Désactive tous les éléments et les retire de la navigation par Tab.',
        selectedIconFilled:
          'Demande une icône de début pleine pour les éléments sélectionnés lorsqu’elle existe. Sans effet sur les icônes de fin ou le contenu des slots.',
        label:
          'Nom accessible du groupe. Fournissez cette prop, un <code>aria-label</code> ou un <code>aria-labelledby</code>.',
        vModel:
          'Valeur sélectionnée : une chaîne, un nombre ou <code>null</code> en sélection simple ; un tableau en sélection multiple. En mode multiple, une valeur scalaire ou <code>null</code> équivaut à une sélection vide. Activer un élément sélectionné le désélectionne, sauf si <code>mandatory</code> l’empêche.',
      },
      slots: {
        default: 'Les composants <code>VToggleItem</code> du groupe.',
      },
    },
    VToggleItem: {
      props: {
        value:
          'Valeur écrite dans le <code>v-model</code> du groupe. Doit être unique au sein du groupe.',
        label:
          'Texte visible, remplacé par le slot par défaut. Pour les éléments sans texte visible, utilisez <code>aria-label</code>.',
        iconStart: 'Icône avant le libellé, remplacée par le slot <code>#start</code>.',
        iconEnd: 'Icône après le libellé, remplacée par le slot <code>#end</code>.',
        iconFilled:
          'Demande une version pleine des deux icônes, quelle que soit la sélection, lorsqu’elle existe. Sans effet sur le contenu des slots.',
        disabled: 'Désactive cet élément et le retire de la navigation par Tab et par flèches.',
      },
      slots: {
        default: 'Contenu visible, remplaçant <code>label</code>.',
        start: 'Contenu avant le libellé, remplaçant <code>iconStart</code>.',
        end: 'Contenu après le libellé, remplaçant <code>iconEnd</code>.',
      },
    },
  },
}
