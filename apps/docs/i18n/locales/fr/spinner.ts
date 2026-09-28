export default {
  title: 'Indicateur de chargement',
  lead: '<code>VSpinner</code> indique une opération en cours et occupe l’espace d’une icône.',
  examples: {
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille du cadre en pixels. <code>1em</code> par défaut.',
    },
    colour: {
      title: 'Couleur',
      text: 'L’indicateur utilise <code>currentcolor</code> et hérite de la couleur du texte.',
    },
    icon: {
      title: "À la place d'une icône",
      text: 'Utilisez la même <code>size</code> qu’une icône pour la remplacer par un indicateur.',
    },
  },
  api: {
    VSpinner: {
      props: {
        size: 'Taille du cadre en pixels, nombre ou chaîne numérique. <code>1em</code> par défaut.',
        label:
          'Texte de chargement accessible. Utilise le dictionnaire de la bibliothèque par défaut.',
      },
    },
  },
}
