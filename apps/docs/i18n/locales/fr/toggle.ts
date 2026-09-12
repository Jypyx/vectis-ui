export default {
  title: 'Groupe à bascule',
  lead: 'Un groupe de boutons piloté par une seule valeur : un contrôle segmenté pour un choix, ou un jeu de filtres pour plusieurs. Chaque item est un VButton, donc les tons et les variantes sont ceux que vous connaissez déjà.',

  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: "<code>itemVariant</code> peint les éléments qui ne sont pas choisis, transparents en <code>ghost</code> et contourés en <code>outline</code>. <code>tone</code> colore l'élément choisi et rien d'autre, avec les trois valeurs qu'offre un bouton.",
    },
    selectedVariants: {
      title: 'Comment la sélection est dessinée',
      text: "<code>selectedVariant</code> est la façon dont l'élément choisi est peint dans le ton du groupe : plein en <code>solid</code>, teinté en <code>soft</code>, ou par la seule couleur de son texte en <code>ghost</code>.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> reprend l'échelle partagée par tous les contrôles, de 24 à 56 pixels, et <code>compact</code> lui retire 4px. Elle se pose une fois sur le groupe.",
    },
    itemContent: {
      title: 'Ce que porte un item',
      text: "Un élément accepte un libellé, une icône à chaque extrémité, ou le slot par défaut pour ce qu'une chaîne ne peut pas porter. Un élément réduit à son icône demande toujours un <code>label</code>, qui est alors son nom accessible.",
    },
    filledIcons: {
      title: 'Icônes pleines',
      text: "<code>selectedIconFilled</code> dessine l'icône de début de l'élément choisi dans sa forme pleine. Rien n'arrive à une icône qui n'a pas de dessin plein.",
    },
    detached: {
      title: 'Détaché',
      text: '<code>detached</code> laisse les éléments en boutons séparés avec un écart entre eux, au lieu de les joindre en un contrôle segmenté.',
    },
    seamless: {
      title: 'Sans coutures',
      text: '<code>seamless</code> retire les traits dessinés entre deux éléments : la rangée se lit alors comme un cadre unique portant une surbrillance qui se déplace. Il est sans effet sous <code>detached</code>.',
    },
    elevated: {
      title: 'Surélevé',
      text: "<code>elevated</code> soulève la rangée, l'ombre appartenant à la rangée plutôt qu'à chaque élément.",
    },
    orientation: {
      title: 'Orientation',
      text: "<code>orientation</code> à <code>vertical</code> empile les éléments vers le bas, les jonctions et les flèches suivant l'axe.",
    },
    multiple: {
      title: 'Choisir plusieurs items',
      text: "<code>multiple</code> permet de choisir plusieurs éléments à la fois, ce qui fait de la valeur une liste. Cliquer un élément choisi le rend, et le tableau n'est jamais muté sur place.",
    },
    mandatory: {
      title: 'Garder une sélection',
      text: "<code>mandatory</code> refuse d'abandonner le dernier élément choisi. C'est une garde et rien de plus : il ne sélectionne rien de lui-même.",
    },
    disabled: {
      title: 'Désactivé',
      text: '<code>disabled</code> vaut pour tout le groupe, où rien ne répond et où aucun élément ne prend le focus, ou pour un seul élément, que les flèches enjambent alors. Les deux se grisent par les tokens de couleur.',
    },
  },

  api: {
    VToggle: {
      props: {
        multiple:
          'Permet de choisir plusieurs items à la fois, ce qui fait de la valeur une liste.',
        mandatory:
          "Refuse d'abandonner le dernier item choisi, pour que quelque chose reste toujours sélectionné une fois que ça l'a été. C'est un garde-fou et rien de plus : il ne sélectionne rien de lui-même au départ.",
        detached:
          'Laisse les items en boutons séparés avec un écart entre eux. Sans lui, ils sont assemblés en un seul contrôle segmenté.',
        seamless:
          'Retire les traits entre les items assemblés, si bien que la rangée se lit comme un cadre unique plutôt que comme des segments. Sans effet sous <code>detached</code>, où les items sont déjà des boutons séparés.',
        orientation: 'Si les items courent en travers de la page ou de haut en bas.',
        itemVariant:
          "Comment sont dessinés les items non sélectionnés. Ce que prend le sélectionné, c'est <code>selectedVariant</code>. Elle porte le nom des items parce que c'est ce qu'elle peint : sur VTabs et VDataTable, <code>variant</code> nomme la décoration du cadre.",
        selectedVariant:
          "Comment l'item sélectionné est dessiné, dans le ton du groupe : plein avec <code>solid</code>, teinté avec <code>soft</code>, ou la couleur de son seul texte avec <code>ghost</code>.",
        tone: 'La couleur que prend un item sélectionné. Les autres restent neutres.',
        size: "La hauteur des items, tirée de l'échelle partagée par tous les contrôles.",
        compact: 'Retire 4px à la hauteur de chaque item.',
        elevated:
          "Soulève la rangée, aux conditions de la prop de VButtonGroup : l'ombre appartient à la rangée et non à chaque item, ce qui garde les joints nets.",
        disabled: 'Rend tout le groupe inutilisable.',
        selectedIconFilled:
          "Dessine l'icône de l'item sélectionné dans sa forme pleine, une façon courante de renforcer qu'il est celui en vigueur.",
        label:
          "Ce que les lecteurs d'écran annoncent pour le groupe, « Alignement du texte », « Filtres ». Vivement recommandé : aucune valeur par défaut ne pourrait dire à quoi sert un groupe de boutons.",
        vModel:
          "Ce qui est sélectionné, et sa FORME suit <code>multiple</code> : une valeur unique, ou <code>null</code> d'où elle part, quand un seul item peut être choisi, et un tableau quand plusieurs le peuvent. Une valeur nulle ou scalaire passée en mode multiple est lue comme une sélection vide. Le tableau n'est jamais muté sur place. Recliquer l'item sélectionné le désélectionne, sauf si <code>mandatory</code> est posé.",
      },
      slots: {
        default: 'Les items du groupe.',
      },
    },
    VToggleItem: {
      props: {
        value:
          "Ce que signifie le choix de cet item. C'est ce que porte la valeur du groupe quand l'item est sélectionné, et cela doit être unique au sein du groupe.",
        label: 'Le libellé visible. Le slot par défaut le remplace.',
        iconStart: 'Une icône avant le libellé.',
        iconEnd:
          "Une icône après le libellé. Elle ne passe pas à sa forme pleine sous l'effet du <code>selectedIconFilled</code> du groupe, qui nomme l'icône représentant l'item et non celle qui le suit.",
        disabled:
          "Rend cet item inutilisable : il ne répond plus, les flèches l'enjambent, et il se grise par les tokens de couleur.",
      },
      slots: {
        default: "Le contenu de l'item, qui remplace la prop <code>label</code>.",
      },
    },
  },
}
