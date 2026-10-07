export default {
  title: 'Progression circulaire',
  lead: '<code>VProgressCircular</code> affiche la progression d’une tâche sous forme d’anneau, ou d’animation si elle n’est pas mesurable.',
  examples: {
    value: {
      title: 'Valeur',
      text: 'Définissez <code>value</code> et <code>max</code> pour indiquer la progression. Les valeurs sont limitées à cet intervalle.',
    },
    indeterminate: {
      title: 'Indéterminé',
      text: '<code>indeterminate</code> anime l’anneau sans pourcentage. Utilisez <code>VSpinner</code> pour un indicateur de chargement de la taille d’une icône.',
    },
    tones: {
      title: 'Tonalités',
      text: '<code>tone</code> définit la couleur sémantique.',
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: '<code>color</code> remplace le ton par une couleur CSS.',
    },
    sizeAndThickness: {
      title: 'Diamètre et épaisseur',
      text: '<code>size</code> définit le diamètre et <code>thickness</code> l’épaisseur, tous deux en pixels.',
    },
    shape: {
      title: 'Forme',
      text: '<code>shape</code> choisit des extrémités arrondies ou carrées.',
    },
    customContent: {
      title: 'Du contenu au centre',
      text: '<code>showValue</code> affiche le pourcentage au centre. Le slot par défaut le remplace et reçoit <code>value</code>, <code>max</code> et <code>percent</code>.',
    },
  },
  api: {
    VProgressCircular: {
      props: {
        label:
          'Nom accessible de la tâche. Utilise le dictionnaire par défaut ; les attributs ARIA de nommage fournis sont prioritaires.',
        value: 'Valeur de progression, limitée entre 0 et <code>max</code>.',
        max: 'Valeur représentant la fin de la tâche.',
        indeterminate: 'Anime sans valeur mesurable. Ignore <code>value</code>.',
        tone: 'Ton de couleur.',
        color: 'Couleur CSS personnalisée remplaçant le ton.',
        size: 'Diamètre de l’anneau en pixels, nombre ou chaîne numérique.',
        thickness: 'Épaisseur en pixels, nombre ou chaîne numérique.',
        shape: 'Extrémités arrondies ou carrées.',
        showValue: 'Affiche le pourcentage. Ignoré en mode indéterminé.',
      },
      slots: {
        default:
          'Contenu central remplaçant le pourcentage. Reçoit <code>value</code>, <code>max</code> et <code>percent</code>.',
      },
    },
  },
}
