export default {
  title: 'Infobulle',
  lead: '<code>VTooltip</code> affiche une courte description au survol ou au focus. Son contenu doit rester non interactif.',
  examples: {
    placements: {
      title: 'Placements',
      text: '<code>placement</code> définit la position souhaitée de l’infobulle.',
    },
    edgeFlipping: {
      title: "Au bord de l'écran",
      text: 'L’infobulle passe de l’autre côté si l’espace manque.',
    },
    delay: {
      title: 'Ouverture et fermeture',
      text: '<code>delay</code> définit l’attente au survol en millisecondes. Le focus ouvre immédiatement ; Échap ou l’activation du déclencheur ferme sans déplacer le focus.',
    },
    describing: {
      title: 'Décrire, pas nommer',
      text: 'L’infobulle utilise <code>aria-describedby</code> ; le déclencheur nécessite toujours son propre nom accessible. Le toucher ne l’ouvre pas : rendez les informations essentielles disponibles ailleurs.',
    },
    richContent: {
      title: 'Contenu riche',
      text: '<code>content</code> remplace <code>text</code>. Utilisez de la mise en forme ou des icônes décoratives, sans contrôles interactifs.',
    },
  },
  api: {
    VTooltip: {
      props: {
        text: 'Description de l’infobulle. Remplacée par le slot <code>content</code>.',
        placement: 'Position souhaitée ; change de côté si l’espace manque.',
        delay:
          'Délai au survol en millisecondes ; 0 supprime l’attente. Le focus ouvre immédiatement.',
      },
      slots: {
        default: 'Déclencheur accessible au focus. Liez les <code>triggerProps</code> fournis.',
        content:
          'Description non interactive remplaçant <code>text</code>. Les technologies d’assistance la lisent comme du texte simple.',
      },
    },
  },
}
