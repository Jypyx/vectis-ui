export default {
  title: 'Curseur',
  lead: "Une valeur choisie en glissant, avec une poignée ou deux. Il est bâti sur de vrais champs range : le clavier, le formulaire et les technologies d'assistance viennent donc tous du navigateur.",

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
