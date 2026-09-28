export default {
  title: 'Séparateur',
  lead: '<code>VSeparator</code> affiche un trait horizontal ou vertical sans marges.',
  examples: {
    orientation: {
      title: 'Orientation',
      text: 'Les séparateurs verticaux s’étirent dans les dispositions flex ou grid. Dans le flux normal, définissez leur hauteur.',
    },
    labelled: {
      title: 'Un séparateur portant un mot',
      text: 'Pour ajouter un libellé, placez du texte entre deux séparateurs dans une disposition flex.',
    },
  },
  api: {
    VSeparator: {
      props: {
        orientation:
          'Trait horizontal ou vertical. Un trait vertical nécessite une hauteur ou une disposition flex/grid qui l’étire.',
      },
    },
  },
}
