export default {
  title: 'Code à usage unique',
  lead: '<code>VInputOTP</code> saisit un code avec un caractère par case. Son <code>v-model</code> contient les caractères sans séparateurs.',
  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: '<code>label</code> affiche un libellé au-dessus des cases et nomme le groupe. <code>hint</code> affiche une aide en dessous.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit les dimensions des cases. <code>compact</code> les réduit sans modifier le texte ni les icônes.',
    },
    length: {
      title: 'Longueur',
      text: '<code>length</code> définit le nombre de cases. Un <code>pattern</code> contenant <code>#</code> prend le pas sur cette valeur.',
    },
    formats: {
      title: 'Formats',
      text: '<code>format</code> accepte une saisie numérique, alphabétique ou alphanumérique. Les lettres sont converties en majuscules.',
    },
    pattern: {
      title: 'Gabarit',
      text: 'Chaque <code>#</code> crée une case. Les autres caractères sont des séparateurs affichés et exclus de la valeur.',
    },
    separators: {
      title: 'Séparateurs',
      text: '<code>separatorIcon</code> remplace tous les caractères littéraux du motif. Utilisez-le si les séparateurs ne portent aucun texte significatif.',
    },
    pasting: {
      title: 'Collage et remplissage automatique',
      text: 'Collez un code complet dans n’importe quelle case. La première utilise <code>autocomplete="one-time-code"</code> pour le remplissage automatique.',
    },
    reading: {
      title: 'Lire le code',
      text: 'Les caractères remplissent les cases à la suite. Supprimer un caractère décale les suivants. <code>complete</code> émet le code complet lorsqu’il change.',
    },
    form: {
      title: 'Dans un formulaire',
      text: 'Fournissez <code>name</code>, <code>form</code> et <code>required</code> pour gérer le formulaire natif. Un code partiel est invalide ; un code vide reste accepté sans <code>required</code>.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> empêche les interactions. <code>readonly</code> conserve le focus et la copie. <code>invalid</code> signale un code refusé.',
    },
  },
  api: {
    VInputOTP: {
      props: {
        length: 'Nombre de cases, remplacé par un <code>pattern</code> contenant <code>#</code>.',
        format:
          'Caractères autorisés : chiffres, lettres majuscules ou les deux. Filtre la saisie et le collage.',
        pattern:
          'Disposition du code. <code>#</code> crée une case ; les autres caractères sont affichés. Sans <code>#</code>, reprend <code>length</code>.',
        separatorIcon:
          'Icône remplaçant tous les caractères littéraux du motif, y compris les préfixes textuels.',
        size: 'Taille des cases.',
        compact: 'Réduit les dimensions des cases sans modifier le texte ni les icônes.',
        disabled: 'Désactive les interactions.',
        readonly: 'Empêche les modifications par l’utilisateur et conserve le focus.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        label:
          'Libellé au-dessus des cases, lié par <code>aria-labelledby</code>. Sans lui, le groupe est nommé par <code>aria-label</code> ou par le dictionnaire de la bibliothèque.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        vModel: 'Chaîne du code sans séparateurs. Vaut une chaîne vide par défaut.',
      },
      events: {
        complete:
          'Émet un code complet modifié. Ressaisir le même code ne déclenche pas un nouvel événement.',
      },
    },
  },
}
