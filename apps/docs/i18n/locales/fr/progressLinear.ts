export default {
  title: 'Progression linéaire',
  lead: "Une barre qui se remplit à mesure que quelque chose avance, ou s'anime en continu quand il n'y a aucun chiffre à rapporter. Elle peut être dressée à la verticale, et porter son propre pourcentage à l'intérieur.",

  examples: {
    value: {
      title: 'Valeur',
      text: "Où en est la progression, face à un <code>max</code> qui dit ce qui compte comme terminé. L'autre extrémité est toujours zéro, si bien qu'un compte de sept fichiers sur douze s'écrit comme il se lit. Tout ce qui sort de l'intervalle y est ramené : un chiffre venu d'un serveur n'a donc pas à être borné par vos soins.",
    },
    indeterminate: {
      title: 'Indéterminé',
      text: "Pour une attente qu'on ne peut pas mesurer : la barre s'anime en continu et la valeur est ignorée, puisqu'il n'y a rien à rapporter. Une seule barre traverse la piste, exactement à fleur de chaque bord aux extrêmes, si bien que la boucle est invisible et que la piste n'est jamais vide. Sous réduction des animations elle est ralentie et non arrêtée, un indicateur immobile ne disant plus la seule chose pour laquelle il existe.",
    },
    tones: {
      title: 'Tonalités',
      text: "Ce que la progression signifie, en couleur. Cinq ici et non les trois d'un bouton, parce qu'une barre rapporte un ÉTAT au lieu de déclencher une action : un quota qui s'épuise est un avertissement, un envoi terminé un succès.",
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: 'Une couleur à vous remplace la tonalité, en hexadécimal, en nom CSS ou en <code>oklch()</code>. La teinte de la piste en est dérivée face au thème : une seule valeur à poser, et elle reste juste en thème sombre.',
    },
    thickness: {
      title: 'Épaisseur',
      text: "Toujours en pixels, que ce soit un nombre ou une chaîne numérique, et 4px à défaut. Aucune prop de longueur ne l'accompagne : la barre prend la largeur de ce qui la contient, sa longueur restant l'affaire du conteneur.",
    },
    shape: {
      title: 'Forme',
      text: 'Si les extrémités de la barre sont arrondies ou coupées droit. Cela se voit sur une barre épaisse et à peine sur les 4px par défaut.',
    },
    customContent: {
      title: 'Du contenu dans la barre',
      text: "<code>showValue</code> écrit le pourcentage dans la barre et <code>valuePosition</code> dit où ce texte se place le long d'elle. Le slot par défaut remplace le chiffre par ce que vous voulez, un compte de fichiers ou un nombre abrégé, et reçoit la valeur, le max et le pourcentage qui en découle. Une chose à savoir avant de l'employer : le contenu est rendu DEUX FOIS, une fois sur la piste vide et une fois sur le remplissage dans une couleur contrastée, chaque copie coupée au bord du remplissage, si bien que ce qu'il rend doit être sans effet de bord. La barre fait 4px par défaut : y écrire suppose de lui donner une épaisseur capable de contenir une ligne de texte.",
    },
    orientation: {
      title: 'Orientation',
      text: "Redressée, la barre se remplit du BAS vers le haut : le zéro est ancré au bord inférieur, elle se lit donc comme une jauge. Elle prend alors la hauteur de ce qui la contient, exactement comme l'horizontale prend la largeur. Les copies de texte restent horizontales, ce qui évite qu'un pourcentage soit réordonné en charabia.",
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
