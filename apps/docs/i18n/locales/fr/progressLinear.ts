export default {
  title: 'Progression linéaire',
  lead: "Une barre qui se remplit à mesure que quelque chose avance, ou s'anime en continu quand il n'y a aucun chiffre à rapporter. Elle peut être dressée à la verticale, et porter son propre pourcentage à l'intérieur.",

  api: {
    VProgressLinear: {
      props: {
        value: "Où en est la progression. Tout ce qui sort de l'intervalle y est ramené.",
        max: "Ce qui compte comme terminé. L'autre extrémité est toujours zéro.",
        indeterminate:
          "Dit que la progression ne peut pas être mesurée : la barre s'anime en continu et la valeur est ignorée. C'est ce qu'il faut utiliser en attendant un serveur qui ne rapporte aucun pourcentage.",
        tone: 'Ce que la progression signifie, exprimé en couleur.',
        color:
          'Une couleur à vous, en hexadécimal, en nom CSS ou en <code>oklch()</code>, qui remplace le ton. La nuance de la piste en est dérivée face au thème, elle suit donc les deux.',
        thickness:
          "L'épaisseur de la barre, toujours EN PIXELS : <code>12</code> et <code>'12'</code> donnent tous deux 12px. Elle vaut 4px par défaut : afficher du texte dans la barre demande donc une épaisseur explicite.",
        shape: 'Si les extrémités de la barre sont arrondies ou carrées.',
        showValue:
          "Écrit le pourcentage dans la barre. C'est ignoré tant que la progression n'est pas mesurable, faute de chiffre à écrire.",
        valuePosition:
          "Où se place ce texte le long de la barre. Sur une barre verticale, le début est l'extrémité zéro, donc le bas.",
        orientation: 'Dresse la barre à la verticale, qui se remplit du bas vers le haut.',
      },
      slots: {
        default:
          "Ce qu'il faut écrire dans la barre à la place du pourcentage. Il est rendu DEUX FOIS, une fois sur la piste vide et une fois sur la partie remplie dans une couleur contrastée, chaque copie étant coupée au bord du remplissage : ce qu'il rend doit donc être exempt d'effets de bord.",
      },
    },
  },
}
