export default {
  title: 'Séparateur',
  lead: '<code>VSeparator</code> affiche un trait horizontal ou vertical sans marges.',
  examples: {
    orientation: {
      title: 'Orientation',
      text: 'Les séparateurs verticaux s’étirent dans les dispositions flex ou grid. Dans le flux normal, définissez leur hauteur.',
    },
    labelled: {
      title: 'Libellé et icône',
      text: 'Renseignez <code>label</code>, <code>icon</code> ou le slot par défaut, et placez-les avec <code>contentPosition</code>. Le libellé devient aussi le nom accessible du séparateur.',
    },
    variants: {
      title: 'Variantes, taille et couleur',
      text: '<code>variant</code> trace le trait plein, en tirets ou en pointillés, et <code>size</code> règle son épaisseur. <code>color</code> ne colore que le trait ; le libellé garde la couleur de texte atténuée.',
    },
  },
  api: {
    VSeparator: {
      props: {
        orientation:
          'Trait horizontal ou vertical. Un trait vertical nécessite une hauteur ou une disposition flex/grid qui l’étire.',
        variant: 'Tracé du trait : plein, en tirets ou en pointillés.',
        size: 'L’épaisseur du trait : 1px, 2px ou 4px. Un trait plus épais marque une rupture plus forte et rend les pointillés lisibles.',
        color:
          'Une couleur CSS pour le trait. Le libellé et l’icône gardent la couleur de texte atténuée.',
        label: 'Texte visible qui interrompt le trait, utilisé aussi comme nom accessible.',
        icon: 'Une icône qui interrompt le trait, avant le libellé.',
        contentPosition: 'Position du libellé et de l’icône le long du trait.',
      },
      slots: {
        default:
          'Contenu riche qui interrompt le trait, à la place du libellé. Nommez-le avec <code>aria-label</code> quand ses mots comptent.',
      },
    },
  },
}
