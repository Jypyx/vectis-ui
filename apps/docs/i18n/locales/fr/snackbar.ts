export default {
  title: 'Barre de confirmation',
  lead: 'Appelez <code>snackbar()</code> pour confirmer une action via <code>VSnackbar</code>, avec un bouton d’action facultatif. Un nouveau message remplace le précédent.',
  examples: {
    tones: {
      title: 'Tonalités',
      text: 'Choisissez un ton neutre ou danger. Les deux utilisent un fond plein.',
    },
    withoutAction: {
      title: 'Sans action',
      text: 'Sans action, aucun bouton n’apparaît. Exécuter une action ferme la barre.',
    },
    icon: {
      title: 'Avec une icône',
      text: '<code>icon</code> ajoute une icône facultative. Le ton n’en fournit aucune par défaut.',
    },
    placements: {
      title: 'Placements',
      text: 'Choisissez le début, le centre ou la fin du bord inférieur. Définissez la valeur par défaut sur <code>VSnackbar</code> ou remplacez-la par message.',
    },
    replacement: {
      title: 'Une seule à la fois',
      text: 'Un nouveau message remplace celui visible et relance son délai.',
    },
    autoDismiss: {
      title: 'Combien de temps elle reste',
      text: '<code>duration</code> définit la durée en millisecondes. Le délai est suspendu tant que le pointeur ou le focus clavier reste dans la barre.',
    },
    persistent: {
      title: "La garder jusqu'à ce qu'on la retire",
      text: '<code>duration: 0</code> conserve la barre ouverte. Utilisez l’identifiant renvoyé par <code>snackbar()</code> avec <code>dismissSnackbar()</code> pour la fermer.',
    },
  },
  api: {
    VSnackbar: {
      props: {
        placement: 'Position par défaut sur le bord inférieur.',
        duration: 'Durée par défaut en millisecondes. 0 désactive la fermeture automatique.',
        actionText:
          'Texte et nom accessible de l’action par défaut. Utilise le dictionnaire par défaut.',
        label: 'Nom accessible de la zone de confirmation. Utilise le dictionnaire par défaut.',
      },
    },
  },
}
