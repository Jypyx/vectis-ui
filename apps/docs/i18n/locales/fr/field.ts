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
    group: {
      title: 'Groupe d’éléments',
      text: '<code>group</code> nomme un groupe d’éléments, comme une rangée de champs de rôle <code>group</code>. Le libellé devient un simple texte et <code>fieldProps</code> fournit <code>aria-labelledby</code> au lieu des états qu’un groupe ne peut pas porter.',
    },
    meta: {
      title: 'Contenu à côté de l’aide',
      text: 'Le slot <code>meta</code> place du contenu en fin de ligne de l’aide, comme un compteur de caractères. Liez l’<code>id</code> qu’il fournit : il rejoint l’<code>aria-describedby</code> du contrôle.',
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
        disabled: 'Grise le libellé et l’aide et transmet <code>disabled</code> au contrôle.',
        hideLabel: 'Masque le libellé visuellement tout en le gardant comme nom accessible.',
        labelPosition: 'Place le libellé au-dessus du contrôle ou à côté.',
        group:
          'Nomme un groupe d’éléments par <code>aria-labelledby</code> au lieu de <code>for</code>.',
      },
      slots: {
        default:
          'Le contrôle. Liez <code>fieldProps</code> : id, descriptions, état invalide, <code>required</code>, <code>disabled</code> et les attributs posés sur le champ autres que <code>class</code> et <code>style</code>.',
        meta: 'Contenu en fin de ligne de l’aide, comme un compteur de caractères.',
      },
    },
  },
}
