export default {
  title: 'Curseur',
  lead: "Une valeur choisie en glissant, avec une poignée ou deux. Il est bâti sur de vrais champs range : le clavier, le formulaire et les technologies d'assistance viennent donc tous du navigateur.",

  examples: {
    range: {
      title: 'Intervalle',
      text: '<code>range</code> offre deux poignées pour choisir une plage, ce qui fait de la valeur une paire. Les poignées ne peuvent pas se croiser, et chacune est annoncée comme le début ou la fin de la plage.',
    },
    minMax: {
      title: 'Minimum et maximum',
      text: '<code>min</code> et <code>max</code> bornent la valeur, 0 et 100 sauf indication contraire, négatifs compris. Tout le reste se mesure par rapport à eux.',
    },
    steps: {
      title: 'Pas',
      text: "<code>step</code> est l'écart entre deux valeurs sur lesquelles la poignée peut s'arrêter, et le pas d'une flèche du clavier. <code>ticks</code> marque ces arrêts sur le rail, et au-delà de cinquante pas aucune graduation n'est dessinée.",
    },
    textLabels: {
      title: 'Libellés texte',
      text: "<code>labels</code> nomme les arrêts sous le rail, une entrée par pas, et c'est ce qu'annonce un lecteur d'écran à la place du nombre brut. Donner des libellés active les graduations de lui-même.",
    },
    iconLabels: {
      title: 'Libellés icône',
      text: "Un libellé peut porter une icône au lieu d'un mot, le libellé restant ce qui est annoncé et ce comme quoi la valeur est lue. Les deux formes se mélangent dans la même liste.",
    },
    tooltip: {
      title: 'Montrer la valeur pendant le glissement',
      text: "<code>tooltip</code> affiche une bulle au-dessus de la poignée pendant le glissement ou tant qu'elle a le focus clavier, une par poignée. Elle est décorative et masquée aux technologies d'assistance.",
    },
    inputs: {
      title: 'Saisir la valeur exactement',
      text: '<code>inputs</code> ajoute un champ numérique à côté du rail, un par extrémité en mode plage. Ce qui est saisi est validé à la sortie du champ ou sur Entrée, ramené dans les bornes et aligné sur le pas ; une saisie illisible remet la valeur précédente.',
    },
    orientation: {
      title: 'Orientation',
      text: "<code>orientation</code> à <code>vertical</code> dresse le curseur, la plus petite valeur en bas. Sa longueur vient d'un token et non de son conteneur.",
    },
    disabled: {
      title: 'Désactivé',
      text: "<code>disabled</code> grise le rail, la poignée et les graduations par les tokens de couleur, sort les poignées de l'ordre de tabulation et désactive les champs numériques avec elles.",
    },
    form: {
      title: 'Dans un formulaire',
      text: "<code>name</code>, <code>id</code> et les aria-* sont redirigés sur le vrai input range sous-jacent. Le nommage passe par la prop <code>label</code>, qui pose un aria-label : choisissez donc entre elle et un libellé visible à vous. Une plage n'a pas de valeur unique à soumettre : seule la poignée de fin porte le nom.",
    },
  },

  api: {
    VSlider: {
      props: {
        min: 'La valeur la plus basse que la poignée peut atteindre.',
        max: 'La valeur la plus haute que la poignée peut atteindre.',
        step: "L'écart entre deux valeurs sur lesquelles la poignée peut s'arrêter. C'est aussi le pas des flèches, et ce sur quoi une valeur saisie dans le champ voisin est alignée.",
        range:
          'Propose deux poignées pour choisir un intervalle, ce qui fait de la valeur une paire.',
        disabled: 'Rend le curseur inutilisable.',
        label:
          "Ce que les lecteurs d'écran annoncent pour le curseur. En mode intervalle, les deux poignées sont annoncées comme le début et la fin de celui-ci.",
        orientation: 'Dresse le curseur à la verticale, la valeur la plus basse en bas.',
        inputs:
          "Ajoute un champ numérique à côté du curseur pour poser la valeur exactement, un champ ou un par extrémité en mode intervalle. Glisser est rapide mais imprécis ; c'est la porte de sortie.",
        ticks:
          "Marque chaque pas sur la piste. Fournir des libellés l'implique. Au-delà de cinquante pas, les marques formeraient un peigne illisible et ne sont pas dessinées du tout.",
        labels:
          "Un libellé pour chaque pas, dans l'ordre : un texte, ou une icône avec les mots qui la nomment pour les lecteurs d'écran. Ils deviennent aussi ce qu'un lecteur d'écran annonce à la place du nombre brut.",
        tooltip:
          "Affiche la valeur dans une bulle au-dessus de la poignée pendant qu'on la déplace ou qu'elle a le focus.",
        vModel:
          'La valeur, et sa FORME est ce qui met le curseur en mode intervalle : un nombre unique donne une poignée, une paire en donne deux. La paire est toujours ordonnée, les poignées étant empêchées de se croiser.',
      },
    },
  },
}
