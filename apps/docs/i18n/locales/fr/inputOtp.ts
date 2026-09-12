export default {
  title: 'Code à usage unique',
  lead: 'Un code saisi un caractère par case : un mot de passe à usage unique, une clé de licence, une référence. Un collage remplit toute la rangée, et la valeur ne contient que les caractères, jamais les séparateurs.',

  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: "<code>label</code> n'affiche rien ici : il nomme la rangée pour les technologies d'assistance. <code>hint</code> est le texte que voit le lecteur, lié à la rangée pour être lu avec le libellé.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> définit la hauteur à 32, 40 ou 48 pixels, et <code>compact</code> lui retire 4px. Le caractère à l'intérieur est agrandi d'un ou deux crans au-dessus du palier de la rangée.",
    },
    length: {
      title: 'Longueur',
      text: "<code>length</code> est le nombre de cases du code, six par défaut. Elle est ignorée dès qu'un <code>pattern</code> est donné.",
    },
    formats: {
      title: 'Formats',
      text: "<code>format</code> décide des caractères dont le code est fait, filtre ce qui peut être saisi ou collé et choisit le clavier qu'offre un téléphone. Hors code numérique, la valeur est forcée en majuscules.",
    },
    pattern: {
      title: 'Gabarit',
      text: "<code>pattern</code> écrit la forme du code : chaque <code>#</code> est une case à remplir et tout autre caractère un littéral dessiné entre les cases, jamais saisi et jamais compris dans la valeur. Il l'emporte sur <code>length</code>.",
    },
    separators: {
      title: 'Séparateurs',
      text: '<code>separatorIcon</code> remplace les littéraux dessinés par un pattern, tous sans exception : elle convient donc à un gabarit dont les séparateurs ne sont que de la ponctuation.',
    },
    pasting: {
      title: 'Collage et remplissage automatique',
      text: "Un code collé n'importe où dans la rangée est réparti sur toutes les cases, les littéraux du pattern étant absorbés avec lui. La première case porte <code>autocomplete=\"one-time-code\"</code>, si bien qu'un code venu d'un SMS ou d'un gestionnaire de mots de passe est réparti de la même façon.",
    },
    reading: {
      title: 'Lire le code',
      text: 'La valeur est une seule chaîne des caractères seuls, jamais des séparateurs. <code>complete</code> est émis dès que toutes les cases sont remplies, avec le code terminé.',
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> met toute la rangée hors de portée, grisée par les tokens de couleur. <code>readonly</code> montre le code figé pendant que les cases gardent le focus et restent copiables. <code>invalid</code> colore les cases et indique aux technologies d'assistance que le code a été refusé.",
    },
  },

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
        readonly:
          'Affiche le code sans permettre de le changer. Les cases gardent leur focus et le code reste sélectionnable et copiable, ce qui le distingue de <code>disabled</code>.',
        invalid:
          "Marque le code comme erroné, ce qui colore les cases et le signale aux technologies d'assistance.",
        label:
          "Ce que les lecteurs d'écran annoncent pour la rangée dans son ensemble. Il retombe sur le dictionnaire du design system.",
        hint: "Une ligne d'aide sous les cases, pour dire où le code a été envoyé ou combien de temps il vaut. Elle est liée à la rangée pour les technologies d'assistance, donc lue avec le libellé. Contrairement à <code>label</code>, qui nomme la rangée sans rien afficher, ce texte est visible.",
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
