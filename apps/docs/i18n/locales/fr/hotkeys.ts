export default {
  title: 'Raccourcis clavier',
  lead: '<code>VHotkeys</code> affiche un raccourci clavier selon les conventions de la plateforme. Activez <code>listen</code> pour émettre un événement lorsqu’il est utilisé.',
  examples: {
    keys: {
      title: "Ce qu'on peut écrire",
      written: 'Vous écrivez',
      elsewhere: 'Windows et Linux',
      text: 'Écrivez <code>keys</code> sous forme de chaîne séparée par <code>+</code>, sans distinction de casse ni d’espaces. <code>mod</code> désigne Command sur macOS et Ctrl ailleurs ; <code>meta</code> est la touche système littérale. Écrivez la touche plus avec <code>plus</code>. Les valeurs inconnues s’affichent telles quelles.',
    },
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> choisit des touches atténuées, avec bordure ou en relief. Les couleurs héritent du texte environnant.',
    },
    sizes: {
      title: 'Tailles',
      text: 'Choisissez <code>xs</code> ou <code>sm</code>. <code>compact</code> réduit la hauteur.',
    },
    attached: {
      title: 'Attaché',
      text: '<code>attached</code> encadre le raccourci comme une seule touche. Il ne modifie ni son nom accessible ni son comportement.',
    },
    platform: {
      title: 'Plateforme',
      text: '<code>platform</code> remplace la détection automatique de la plateforme.',
    },
    separator: {
      title: 'Séparateur',
      text: '<code>separator</code> définit le texte entre les touches. Utilisez une chaîne vide pour juxtaposer les symboles macOS.',
    },
    inText: {
      title: 'Dans le texte et dans les composants',
      text: 'Placez les raccourcis à côté des contrôles, dans les menus ou dans les infobulles.',
    },
    listening: {
      title: 'Écoute',
      text: '<code>listen</code> émet <code>trigger</code> si les touches modificatrices correspondent exactement. <code>allowDefault</code> conserve l’action du navigateur ; <code>allowInInput</code> autorise la détection dans les champs éditables. Échap n’est jamais annulé. La détection utilise le caractère produit : préférez les lettres et touches nommées aux symboles, chiffres AZERTY ou combinaisons Option-lettre sur macOS.',
    },
  },
  api: {
    VHotkeys: {
      props: {
        keys: 'Chaîne de raccourci séparée par <code>+</code>. Utilisez <code>mod</code> pour Command/Ctrl et <code>plus</code> pour la touche plus.',
        variant: 'Style des touches : atténué, avec bordure ou en relief.',
        attached: 'Encadre toute la combinaison comme une seule touche.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        platform: 'Plateforme imposée pour l’affichage et la détection du raccourci.',
        separator: 'Texte entre les touches. Une chaîne vide conserve uniquement l’espacement.',
        listen: 'Active la détection du raccourci et l’événement <code>trigger</code>.',
        allowDefault:
          'Conserve l’action du navigateur lors de la détection. Échap est toujours conservé.',
        allowInInput: 'Autorise la détection dans les champs éditables.',
        label: 'Nom accessible du raccourci. Lecture localisée des touches par défaut.',
      },
      events: {
        trigger:
          'Le raccourci a été utilisé avec <code>listen</code> activé. Reçoit l’événement clavier.',
      },
    },
  },
}
