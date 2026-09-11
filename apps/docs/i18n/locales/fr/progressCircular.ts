export default {
  title: 'Progression circulaire',
  lead: "Un anneau qui se remplit à mesure que quelque chose avance, ou tourne en continu quand il n'y a aucun chiffre à rapporter. Sa géométrie est en CSS pur : changer sa taille ne recalcule rien en JavaScript.",

  examples: {
    value: {
      title: 'Valeur',
      text: "Où en est la progression, face à un <code>max</code> qui dit ce qui compte comme terminé. L'autre extrémité est toujours zéro, si bien qu'un compte de sept fichiers sur douze s'écrit comme il se lit. Tout ce qui sort de l'intervalle y est ramené : un chiffre venu d'un serveur n'a donc pas à être borné par vos soins.",
    },
    indeterminate: {
      title: 'Indéterminé',
      text: "Pour une attente qu'on ne peut pas mesurer : l'anneau tourne et son arc s'allonge et se raccourcit, les deux sur des périodes propres pour que le mouvement ne s'installe jamais dans un rythme, et la valeur est ignorée. Là où un indicateur tient la place d'une icône plutôt que de rendre compte d'une tâche, VSpinner est la chose plus petite à employer.",
    },
    tones: {
      title: 'Tonalités',
      text: "Ce que la progression signifie, en couleur. Cinq ici et non les trois d'un bouton, parce qu'un anneau rapporte un ÉTAT au lieu de déclencher une action : un quota qui s'épuise est un avertissement, un envoi terminé un succès.",
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: 'Une couleur à vous remplace la tonalité, en hexadécimal, en nom CSS ou en <code>oklch()</code>. La teinte de la partie non remplie en est dérivée face au thème : une seule valeur à poser, et elle reste juste en thème sombre.',
    },
    sizeAndThickness: {
      title: 'Diamètre et épaisseur',
      text: "Le diamètre et l'anneau, tous deux toujours en pixels qu'on les donne en nombre ou en chaîne numérique, et indépendants l'un de l'autre. La géométrie est entièrement en CSS : le rayon se dérive des deux, donc changer l'un ou l'autre ne recalcule rien en JavaScript, et un anneau peut être redimensionné depuis une media query ou une container query sans que le composant en soit averti.",
    },
    shape: {
      title: 'Forme',
      text: "Si les extrémités de l'arc dessiné sont arrondies ou coupées droit. Cela se voit sur un anneau épais et à peine sur un anneau fin.",
    },
    customContent: {
      title: 'Du contenu au centre',
      text: "<code>showValue</code> écrit le pourcentage dans le creux de l'anneau, dimensionné proportionnellement au diamètre pour rester lisible à toutes les tailles. Le slot par défaut le remplace par ce que vous voulez, un compte, un nombre abrégé ou une icône, et reçoit la valeur, le max et le pourcentage qui en découle. À la différence de la barre, ce contenu n'est rendu qu'une fois et repose sur le fond de la page plutôt que sur l'anneau : il prend donc simplement la couleur de texte de la page.",
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
