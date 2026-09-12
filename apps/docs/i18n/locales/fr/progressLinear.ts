export default {
  title: 'Progression linéaire',
  lead: "Une barre qui se remplit à mesure que quelque chose avance, ou s'anime en continu quand il n'y a aucun chiffre à rapporter. Elle peut être dressée à la verticale, et porter son propre pourcentage à l'intérieur.",

  examples: {
    value: {
      title: 'Valeur',
      text: "<code>value</code> est l'avancement, face à un <code>max</code> qui dit ce qui compte comme terminé. Tout ce qui sort de la plage y est ramené.",
    },
    indeterminate: {
      title: 'Indéterminé',
      text: "<code>indeterminate</code> sert à une attente qui ne se mesure pas : la barre s'anime en continu et la valeur est ignorée. Sous animation réduite, elle est ralentie plutôt qu'arrêtée.",
    },
    tones: {
      title: 'Tonalités',
      text: "<code>tone</code> dit ce que signifie la progression, sous forme de couleur. Il y en a cinq plutôt que les trois d'un bouton, une barre rendant compte d'un état plutôt que d'amorcer une action.",
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: '<code>color</code> remplace le ton, en hexadécimal, en nom CSS ou en <code>oklch()</code>. La nuance du rail en est dérivée face au thème.',
    },
    thickness: {
      title: 'Épaisseur',
      text: "<code>thickness</code> est toujours en pixels, qu'elle soit donnée en nombre ou en chaîne numérique, et vaut 4px sauf indication contraire. Il n'y a pas de prop de longueur à côté : la barre prend la largeur de ce qui la contient.",
    },
    shape: {
      title: 'Forme',
      text: '<code>shape</code> dit si les extrémités de la barre sont arrondies ou coupées net. Cela se voit sur une barre épaisse et presque pas sur les 4px par défaut.',
    },
    customContent: {
      title: 'Du contenu dans la barre',
      text: '<code>showValue</code> écrit le pourcentage dans la barre et <code>valuePosition</code> dit où ce texte se place le long de celle-ci. Le slot par défaut remplace le chiffre et reçoit la valeur, le max et le pourcentage. Le contenu est rendu deux fois, une fois sur le rail et une fois sur le remplissage : il doit donc être sans effet de bord.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation</code> à <code>vertical</code> remplit la barre du bas vers le haut et lui fait prendre la hauteur de ce qui la contient. Les copies de texte restent horizontales.',
    },
  },

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
