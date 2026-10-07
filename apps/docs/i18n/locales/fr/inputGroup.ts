export default {
  title: 'Groupe de champs',
  lead: '<code>VInputGroup</code> réunit des champs basés sur <code>VInput</code> et des boutons sur une ligne, avec des bordures et des libellés partagés.',
  examples: {
    multipleInputs: {
      title: 'Plusieurs champs',
      text: 'Les champs se partagent équitablement la largeur disponible. Les boutons gardent leur largeur naturelle.',
    },
    naming: {
      title: 'Noms accessibles',
      text: 'Utilisez les props <code>label</code> et <code>hint</code> du groupe pour les textes communs. Donnez un <code>aria-label</code> à chaque champ pour le nommer sans ajouter de libellé visible.',
    },
    widths: {
      title: 'Largeurs',
      text: 'Définissez <code>flex</code> dans la classe d’un segment pour modifier sa largeur.',
    },
    withButton: {
      title: 'Avec un bouton',
      text: 'Utilisez <code>solid</code> ou <code>soft</code>, ou <code>outline</code> avec <code>tone="neutral"</code>. Évitez <code>ghost</code>, qui n’a pas de cadre visible.',
    },
    sizes: {
      title: 'Taille et densité',
      text: 'Définissez <code>size</code> et <code>compact</code> sur le groupe pour remplacer les réglages individuels.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> désactive tous les segments. Les segments désactivés individuellement le restent ; définissez les erreurs sur le champ concerné.',
    },
    pickers: {
      title: 'Avec des sélecteurs',
      text: 'Chaque panneau s’ouvre sous son propre champ. La taille définie sur le groupe n’affecte pas les contrôles des panneaux.',
    },
  },
  api: {
    VInputGroup: {
      props: {
        required:
          'Ajoute un astérisque après le libellé. Marquez les segments eux-mêmes <code>required</code>.',
        hideLabel: 'Masque le libellé visuellement tout en le gardant comme nom accessible.',
        labelPosition: 'Place le libellé au-dessus du champ ou à côté.',
        label:
          'Libellé visible commun et nom accessible du groupe. Les attributs <code>aria-label</code> ou <code>aria-labelledby</code> fournis prennent le pas sur cette prop. Nommez chaque champ séparément.',
        error:
          'Message d’erreur affiché à la place de l’aide, lié au groupe par <code>aria-describedby</code> et annoncé quand il apparaît. Marquez les segments en faute avec <code>invalid</code>.',
        hint: 'Texte d’aide commun sous la ligne, lié au groupe par <code>aria-describedby</code>.',
        size: 'Taille de tous les segments. Remplace les tailles individuelles ; si omise, chaque segment conserve la sienne.',
        compact:
          'Réduit la hauteur des segments. Remplace les valeurs individuelles, même avec <code>false</code> ; si omis, chaque segment conserve la sienne.',
        disabled:
          'Désactive tous les segments. La valeur <code>false</code> ne réactive pas les contrôles désactivés individuellement.',
      },
      slots: {
        default:
          'Champs basés sur <code>VInput</code>, et boutons <code>VButton</code> ou <code>VIconButton</code>.',
      },
    },
  },
}
