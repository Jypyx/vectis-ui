export default {
  title: 'Code à usage unique',
  lead: 'Un code saisi un caractère par case : un mot de passe à usage unique, une clé de licence, une référence. Un collage remplit toute la rangée, et la valeur ne contient que les caractères, jamais les séparateurs.',

  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: "C'est le seul champ de la bibliothèque dont le <code>label</code> ne rend rien. Il nomme la rangée pour les technologies d'assistance et s'arrête là, parce qu'une rangée de cases prend ses instructions de la page au-dessus d'elle, écrites là où elles se lisent le mieux et dans la typographie de cette page. <code>hint</code> est le texte que le lecteur voit réellement, rattaché à la rangée pour être annoncé avec le libellé : où le code a été envoyé, combien de temps il dure.",
    },
    sizes: {
      title: 'Tailles',
      text: "Trois hauteurs, 32, 40 et 48 pixels, chacune avec sa version <code>compact</code> plus courte de 4px. Le caractère à l'intérieur est agrandi d'un cran ou deux au-dessus de celui de la rangée, un code se lisant un glyphe à la fois plutôt que comme un mot, et <code>compact</code> le laisse exactement où il était.",
    },
    length: {
      title: 'Longueur',
      text: "Combien de cases le code comporte, six par défaut. Quatre convient à un code PIN, huit à un code de secours. Elle est ignorée dès qu'un <code>pattern</code> est donné, celui-ci disant déjà combien il y a de cases.",
    },
    formats: {
      title: 'Formats',
      text: "De quels caractères le code est fait. Cela filtre ce qui peut être saisi ou collé, et décide aussi du clavier qu'un téléphone propose, un code numérique faisant apparaître le pavé de chiffres plutôt que le clavier complet. Hors du format numérique, la valeur est forcée en capitales quelle que soit la casse saisie, si bien que ce qui arrive à votre vérification a une forme canonique unique.",
    },
    pattern: {
      title: 'Gabarit',
      text: "La forme du code, écrite noir sur blanc : chaque <code>#</code> est une case à remplir et tout autre caractère est un littéral dessiné entre les cases. Un littéral ne se saisit jamais et n'entre jamais dans la valeur : un gabarit <code>GT-###</code> donne donc toujours trois caractères. Le gabarit l'emporte sur <code>length</code>, alors ignorée.",
    },
    separators: {
      title: 'Séparateurs',
      text: "Une icône peut remplacer les littéraux que dessine un gabarit. Elle les remplace tous, elle convient donc à un gabarit dont les séparateurs sont de la ponctuation et rien d'autre. Tenez-la à l'écart d'un gabarit portant un vrai préfixe comme <code>GT-###</code>, où elle effacerait les deux caractères qui disent ce qu'est le code.",
    },
    pasting: {
      title: 'Collage et remplissage automatique',
      text: "Un code collé n'importe où dans la rangée est réparti sur toutes les cases, et les littéraux du gabarit sont consommés avec lui : une référence copiée dans sa forme formatée, <code>GT-4F2</code>, atterrit comme les trois caractères qu'elle est réellement au lieu d'être refusée. La première case porte <code>autocomplete=\"one-time-code\"</code>, si bien qu'un code arrivant d'un SMS ou d'un gestionnaire de mots de passe est réparti de la même façon, et ce que le format refuse est écarté plutôt que d'interrompre le collage.",
    },
    reading: {
      title: 'Lire le code',
      text: "La valeur est une seule chaîne faite des caractères seuls, jamais des séparateurs, et elle est plus courte que la rangée pendant la saisie. <code>complete</code> part une fois toutes les cases remplies, en portant le code achevé : c'est le signal de vérification, plutôt qu'une chose à déduire en comparant vous-même la longueur de la valeur au nombre de cases.",
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> met toute la rangée hors d'atteinte, grisée par les jetons de couleur. <code>readonly</code> se place entre les deux : le code est montré et figé, tandis que les cases gardent le focus et que le code reste sélectionnable et copiable, ce dont a besoin une référence à reporter ailleurs. <code>invalid</code> colore les cases et signale aux technologies d'assistance que le code a été refusé.",
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
