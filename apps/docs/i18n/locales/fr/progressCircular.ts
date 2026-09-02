export default {
  title: 'Progression circulaire',
  lead: "Un anneau qui se remplit à mesure que quelque chose avance, ou tourne en continu quand il n'y a aucun chiffre à rapporter. Sa géométrie est en CSS pur : changer sa taille ne recalcule rien en JavaScript.",

  api: {
    VProgressCircular: {
      props: {
        value: "Où en est la progression. Tout ce qui sort de l'intervalle y est ramené.",
        max: "Ce qui compte comme terminé. L'autre extrémité est toujours zéro.",
        indeterminate:
          "Dit que la progression ne peut pas être mesurée : l'anneau tourne en continu et la valeur est ignorée.",
        tone: 'Ce que la progression signifie, exprimé en couleur.',
        color:
          "Une couleur à vous, en hexadécimal, en nom CSS ou en <code>oklch()</code>, qui remplace le ton. La nuance de l'anneau non rempli en est dérivée face au thème, elle suit donc les deux.",
        size: "Le diamètre, toujours EN PIXELS : <code>96</code> et <code>'96'</code> donnent tous deux 96px.",
        thickness:
          "L'épaisseur de l'anneau, toujours EN PIXELS : <code>8</code> et <code>'8'</code> donnent tous deux 8px.",
        shape: "Si les extrémités de l'arc dessiné sont arrondies ou coupées net.",
        showValue:
          "Écrit le pourcentage au milieu de l'anneau. C'est ignoré tant que la progression n'est pas mesurable, faute de chiffre à écrire.",
      },
      slots: {
        default:
          "Ce qu'il faut mettre au milieu de l'anneau à la place du pourcentage : un nombre de fichiers, une icône, un chiffre abrégé.",
      },
    },
  },
}
