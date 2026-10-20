export default {
  title: 'Progression linéaire',
  lead: '<code>VProgressLinear</code> affiche la progression d’une tâche sous forme de barre, ou d’animation si elle n’est pas mesurable.',
  examples: {
    value: {
      title: 'Valeur',
      text: 'Définissez <code>value</code> et <code>max</code> pour indiquer la progression. Les valeurs sont limitées à cet intervalle.',
    },
    indeterminate: {
      title: 'Indéterminé',
      text: '<code>indeterminate</code> anime la barre sans pourcentage. L’animation ralentit si la réduction des mouvements est activée.',
    },
    tones: {
      title: 'Tonalités',
      text: '<code>tone</code> définit la couleur sémantique.',
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: '<code>color</code> remplace le ton par une couleur CSS.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> règle l’épaisseur de la barre, de 2 à 20 pixels, sur la même échelle que <code>VMeter</code>. La barre occupe la largeur de son conteneur.',
    },
    shape: {
      title: 'Forme',
      text: '<code>shape</code> choisit des extrémités arrondies ou carrées.',
    },
    customContent: {
      title: 'Position de la valeur',
      text: '<code>showValue</code> affiche le pourcentage. <code>valuePosition</code> l’écrit après le libellé ou dans la barre, ce qui demande <code>size="xl"</code>. Le slot par défaut reçoit <code>value</code>, <code>max</code> et <code>percent</code>. Dans la barre, il est rendu deux fois : utilisez du contenu non interactif sans effets de bord.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> remplit du bas vers le haut. Définissez une hauteur pour régler la longueur de la barre.',
    },
  },
  api: {
    VProgressLinear: {
      props: {
        label:
          'Libellé au-dessus de la barre, qui la nomme aussi. Sans lui, le dictionnaire fournit un nom accessible ; les attributs ARIA de nommage fournis sont prioritaires.',
        hideLabel: 'Masque visuellement le libellé, qui reste le nom de la barre.',
        value: 'Valeur de progression, limitée entre 0 et <code>max</code>.',
        max: 'Valeur représentant la fin de la tâche.',
        indeterminate: 'Anime sans valeur mesurable. Ignore <code>value</code>.',
        tone: 'Ton de couleur.',
        color: 'Couleur CSS personnalisée remplaçant le ton.',
        size: 'Épaisseur de la barre. Seule <code>xl</code> contient la valeur dans la barre.',
        shape: 'Extrémités arrondies ou carrées.',
        showValue: 'Affiche le pourcentage. Ignoré en mode indéterminé.',
        valuePosition:
          'Position du texte : après le libellé, ou le long de la barre. En vertical, le début est en bas.',
        orientation:
          'Barre horizontale ou verticale. En vertical, le remplissage va du bas vers le haut.',
      },
      slots: {
        default:
          'Contenu remplaçant le pourcentage. Reçoit <code>value</code>, <code>max</code> et <code>percent</code>. Rendu deux fois dans la barre ; gardez le contenu non interactif et sans effets de bord.',
      },
    },
  },
}
