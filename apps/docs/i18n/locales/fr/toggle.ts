export default {
  title: 'Groupe à bascule',
  lead: 'Un groupe de boutons piloté par une seule valeur : un contrôle segmenté pour un choix, ou un jeu de filtres pour plusieurs. Chaque item est un VButton, donc les tons et les variantes sont ceux que vous connaissez déjà.',

  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: "<code>itemVariant</code> peint les items qui ne sont PAS choisis : transparents sous <code>ghost</code>, cernés sous <code>outline</code>. Il est nommé d'après les items parce que c'est ce qu'il peint, là où VTabs et VDataTable emploient <code>variant</code> pour la décoration d'un cadre. La tonalité colore l'item choisi et rien d'autre, les autres restant neutres puisqu'un seul affirme quelque chose. Trois tonalités, celles que propose un bouton, puisque chaque item en est un.",
    },
    selectedVariants: {
      title: 'Comment la sélection est dessinée',
      text: "L'autre moitié de la même décision : <code>selectedVariant</code> est la façon dont l'item choisi est peint dans la tonalité du groupe, plein avec <code>solid</code>, teinté avec <code>soft</code>, ou la seule couleur de son texte avec <code>ghost</code>. Le plein est le plus affirmé et le défaut le plus sûr. Le fantôme sert aux rangées qui doivent rester discrètes, et c'est celui à peser : la différence ne tient alors qu'à la couleur du texte, preuve plus mince qu'une boîte pleine.",
    },
    sizes: {
      title: 'Tailles',
      text: "L'échelle que partagent tous les contrôles, de 24 à 56 pixels, <code>compact</code> en retirant 4px. Elle se pose une fois sur le groupe et chaque item est un bouton de cette taille : une rangée de bascules et un bouton côte à côte s'alignent, au lieu de presque s'aligner.",
    },
    itemContent: {
      title: 'Ce que porte un item',
      text: "Un libellé, une icône à l'une ou l'autre extrémité, ou le slot par défaut pour ce qu'une chaîne ne peut pas contenir. Un item réduit à son icône doit quand même dire ce qu'il est : sans libellé il ne reste aucun nom accessible, donnez-lui-en un. L'icône de fin est la place de ce que l'item porte plutôt que de ce qu'il est, et c'est aussi pourquoi le réglage d'icônes pleines du groupe ne la touche jamais.",
    },
    filledIcons: {
      title: 'Icônes pleines',
      text: "L'item choisi dessine son icône dans sa forme pleine, façon répandue de renforcer lequel est en vigueur, et qui ne repose pas sur la seule couleur. Le réglage désigne l'icône qui TIENT LIEU de l'item : seule celle de début est échangée. Rien n'arrive à une icône sans forme pleine, la bibliothèque ne livrant un second dessin que là où le remplissage change réellement la géométrie, ce qui concerne moins de la moitié des icônes qu'elle embarque.",
    },
    detached: {
      title: 'Détaché',
      text: "Joints par défaut, les items fondus en un seul segmented control, ce qui est la façon de dire qu'ils forment un choix unique. Détaché les laisse en boutons séparés avec un écart entre eux, ce qui convient mieux à une rangée de filtres partageant un modèle qu'à une réponse exclusive.",
    },
    seamless: {
      title: 'Sans coutures',
      text: "Joints, un trait est tracé entre deux items et la rangée se lit comme un ensemble de segments, chacun étant une cible. <code>seamless</code> retire ces traits, et la rangée se lit alors comme un cadre unique contenant une mise en évidence qui se déplace. Cela n'a aucun effet sous <code>detached</code>, où les items sont déjà des boutons séparés.",
    },
    elevated: {
      title: 'Surélevé',
      text: "La rangée est soulevée de la page, aux conditions de la prop de VButtonGroup : l'ombre appartient à la rangée et non à chaque item. Les segments se chevauchent d'un pixel, donc une ombre par item tomberait sur son voisin et remplirait chaque jointure d'une bande sombre au lieu de soulever un objet. Toute la rangée monte ensemble au survol, pour la même raison.",
    },
    orientation: {
      title: 'Orientation',
      text: "Vers le bas plutôt qu'en travers. Les jointures passent aux bords horizontaux, les coins sont taillés en haut et en bas de la colonne, et les flèches suivent l'axe. Le mode détaché fonctionne pareil, l'écart courant simplement dans l'autre direction.",
    },
    multiple: {
      title: 'Choisir plusieurs items',
      text: "Plusieurs items à la fois, ce qui transforme le choix exclusif en un jeu de filtres et fait du modèle une liste. Cliquer un item choisi le rend à nouveau. Le tableau n'est jamais modifié sur place : chaque changement en rend un nouveau, et c'est ce qui réveille un observateur qui y est lié. Une valeur nulle ou scalaire passée dans ce mode est lue comme une sélection vide plutôt que comme une erreur.",
    },
    mandatory: {
      title: 'Garder une sélection',
      text: "Cliquer l'item choisi le rend normalement, ne laissant rien de sélectionné. <code>mandatory</code> refuse ce dernier pas : une rangée qui a une réponse en garde une, et avec plusieurs items c'est le dernier restant qui ne peut plus être rendu. C'est un garde-fou et rien de plus : il ne sélectionne rien de lui-même, et un groupe qui démarre vide reste vide tant qu'on n'a rien cliqué.",
    },
    disabled: {
      title: 'Désactivé',
      text: "Le groupe entier d'un coup, où plus rien ne répond et où aucun item ne prend le focus, ou bien un item seul, qui cesse de répondre et que les flèches enjambent comme s'il n'était pas dans la rangée. Les deux se grisent par les tokens de couleur plutôt que par une opacité : ils gardent donc leur contraste sur la page.",
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
