export default {
  title: 'Progression circulaire',
  lead: "Un anneau qui se remplit à mesure que quelque chose avance, ou tourne en continu quand il n'y a aucun chiffre à rapporter. Sa géométrie est en CSS pur : changer sa taille ne recalcule rien en JavaScript.",

  examples: {
    value: {
      title: 'Valeur',
      text: "<code>value</code> est l'avancement, face à un <code>max</code> qui dit ce qui compte comme terminé. Tout ce qui sort de la plage y est ramené.",
    },
    indeterminate: {
      title: 'Indéterminé',
      text: "<code>indeterminate</code> sert à une attente qui ne se mesure pas : l'anneau tourne et la valeur est ignorée. Là où un indicateur tient lieu d'icône plutôt que de rendre compte d'une tâche, VSpinner est le plus petit objet à prendre.",
    },
    tones: {
      title: 'Tonalités',
      text: "<code>tone</code> dit ce que signifie la progression, sous forme de couleur. Il y en a cinq plutôt que les trois d'un bouton, un anneau rendant compte d'un état plutôt que d'amorcer une action.",
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: "<code>color</code> remplace le ton, en hexadécimal, en nom CSS ou en <code>oklch()</code>. La nuance de l'anneau non rempli en est dérivée face au thème.",
    },
    sizeAndThickness: {
      title: 'Diamètre et épaisseur',
      text: "<code>size</code> et <code>thickness</code> sont le diamètre et l'anneau, toujours en pixels qu'ils soient donnés en nombre ou en chaîne numérique, et indépendants l'un de l'autre.",
    },
    shape: {
      title: 'Forme',
      text: "<code>shape</code> dit si les extrémités de l'arc dessiné sont arrondies ou coupées net. Cela se voit sur un anneau épais et presque pas sur un anneau fin.",
    },
    customContent: {
      title: 'Du contenu au centre',
      text: "<code>showValue</code> écrit le pourcentage dans le creux de l'anneau, dimensionné en proportion du diamètre. Le slot par défaut le remplace par un contenu à vous et reçoit la valeur, le max et le pourcentage qui en découle.",
    },
  },

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
