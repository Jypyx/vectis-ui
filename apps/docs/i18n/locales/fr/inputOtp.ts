export default {
  title: 'Code à usage unique',
  lead: 'Un code saisi un caractère par case : un mot de passe à usage unique, une clé de licence, une référence. Un collage remplit toute la rangée, et la valeur ne contient que les caractères, jamais les séparateurs.',

  api: {
    VInputOTP: {
      props: {
        length:
          "Combien de cases compte le code. Ignorée dès qu'un <code>pattern</code> est donné.",
        format:
          "De quels caractères le code est fait. Cela filtre ce qui peut être saisi ou collé, et décide du clavier qu'un téléphone propose.",
        pattern:
          "La forme du code : chaque <code>#</code> est une case à remplir, et tout autre caractère est un séparateur affiché entre les cases sans jamais faire partie de la valeur, <code>'GT-###'</code> ou <code>'###.###.###'</code>. Il l'emporte sur <code>length</code>.",
        separatorIcon:
          "Une icône dessinée à la place de chaque séparateur du motif. Elle convient à un gabarit dont les séparateurs sont purement décoratifs, <code>'###-###'</code>, et non à un gabarit portant du texte porteur de sens comme <code>'GT-###'</code>, que l'icône effacerait.",
        size: 'La taille des cases : 32, 40 ou 48 pixels.',
        compact: 'Retire 4px aux cases, en laissant le texte et les icônes tels quels.',
        disabled: 'Rend toutes les cases inutilisables, grisées par les tokens de couleur.',
        invalid:
          "Marque le code comme erroné, ce qui colore les cases et le signale aux technologies d'assistance.",
        label:
          "Ce que les lecteurs d'écran annoncent pour la rangée dans son ensemble. Il retombe sur le dictionnaire du design system.",
        vModel:
          'Le code en une seule chaîne, sans les séparateurs : un gabarit <code>GT-###</code> donne tout de même trois caractères. Il est vide au départ, et plus court que la longueur complète pendant la saisie.',
      },
      events: {
        complete:
          "Toutes les cases ont été remplies, avec le code terminé. C'est le signal pour le vérifier.",
      },
    },
  },
}
