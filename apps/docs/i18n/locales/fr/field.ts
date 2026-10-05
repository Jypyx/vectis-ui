export default {
  title: 'Champ',
  lead: '<code>VField</code> place un libellé, une aide et un message d’erreur autour de n’importe quel contrôle. Son slot fournit <code>fieldProps</code> à lier sur le contrôle.',
  examples: {
    native: {
      title: 'Contrôle natif',
      text: 'Les éléments natifs et les composants tiers prennent les mêmes <code>fieldProps</code> que les contrôles de la bibliothèque.',
    },
    error: {
      title: 'Erreur',
      text: '<code>error</code> affiche un message à la place de l’aide, sans agrandir le champ, et marque le contrôle comme invalide. Le message est annoncé quand il apparaît. <code>required</code> ajoute un astérisque et transmet <code>required</code> au contrôle.',
    },
    labelStart: {
      title: 'Libellé à côté du contrôle',
      text: '<code>labelPosition="start"</code> place le libellé dans sa propre colonne. Dans un champ étroit, le libellé repasse au-dessus du contrôle.',
    },
    hiddenLabel: {
      title: 'Libellé masqué',
      text: '<code>hideLabel</code> masque le libellé visuellement. Il nomme toujours le contrôle pour les lecteurs d’écran.',
    },
  },
  api: {
    VField: {
      props: {
        label: 'Libellé lié au contrôle par <code>for</code>.',
        hint: 'Texte d’aide sous le contrôle, lié par <code>aria-describedby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        required:
          'Ajoute un astérisque après le libellé et transmet <code>required</code> au contrôle.',
        hideLabel: 'Masque le libellé visuellement tout en le gardant comme nom accessible.',
        labelPosition: 'Place le libellé au-dessus du contrôle ou à côté.',
      },
      slots: {
        default:
          'Le contrôle. Liez <code>fieldProps</code> : id, descriptions, état invalide, <code>required</code> et les attributs posés sur le champ autres que <code>class</code> et <code>style</code>.',
      },
    },
  },
}
