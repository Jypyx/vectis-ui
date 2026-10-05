export default {
  title: 'Groupe de champs',
  lead: '<code>VFieldset</code> regroupe des contrôles liés dans un <code>&lt;fieldset&gt;</code> natif nommé par sa légende, avec une aide et un message d’erreur.',
  examples: {
    horizontal: {
      title: 'Horizontal',
      text: '<code>orientation="horizontal"</code> dispose les contrôles sur une ligne qui passe à la ligne si besoin.',
    },
    error: {
      title: 'Erreur et obligatoire',
      text: '<code>error</code> remplace l’aide, décrit le groupe et est annoncé quand il apparaît. Un groupe ne peut pas porter <code>aria-invalid</code> : liez les <code>invalid</code> et <code>required</code> du slot sur les contrôles.',
    },
    hiddenLegend: {
      title: 'Légende masquée',
      text: '<code>hideLegend</code> masque la légende visuellement. Elle nomme toujours le groupe pour les lecteurs d’écran.',
    },
  },
  api: {
    VFieldset: {
      props: {
        legend: 'Légende qui nomme le groupe.',
        hint: 'Texte d’aide sous le groupe, lié par <code>aria-describedby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide, lié par <code>aria-describedby</code> et annoncé quand il apparaît. Active le <code>invalid</code> du slot.',
        required:
          'Ajoute un astérisque après la légende et active le <code>required</code> du slot.',
        hideLegend: 'Masque la légende visuellement tout en la gardant comme nom du groupe.',
        orientation: 'Dispose les contrôles en colonne ou sur une ligne qui passe à la ligne.',
      },
      slots: {
        default: 'Les contrôles. Liez <code>invalid</code> et <code>required</code> sur eux.',
      },
    },
  },
}
