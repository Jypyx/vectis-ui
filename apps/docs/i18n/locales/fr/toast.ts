export default {
  title: 'Notification',
  lead: 'Appelez <code>toast()</code> pour afficher des notifications via un unique <code>VToaster</code> monté. Les notifications s’empilent et se ferment indépendamment.',
  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: '<code>tone</code> définit la couleur et l’icône par défaut. <code>variant</code> choisit un style atténué ou plein.',
    },
    contents: {
      title: 'Titre et message',
      text: '<code>message</code> est le texte de la notification. Ajoutez un <code>title</code> facultatif.',
    },
    icons: {
      title: 'Icônes',
      text: 'Remplacez l’<code>icon</code> du ton, ou définissez-la sur <code>false</code> pour la masquer.',
    },
    width: {
      title: 'Largeur',
      text: '<code>width</code> définit la largeur de la carte dans les limites de la zone visible.',
    },
    placements: {
      title: 'Placements',
      text: 'Définissez le <code>placement</code> par défaut sur <code>VToaster</code> ou remplacez-le pour une notification.',
    },
    stacking: {
      title: 'Empilement',
      text: 'Chaque notification conserve son propre délai de fermeture.',
    },
    autoDismiss: {
      title: 'Combien de temps elle reste',
      text: '<code>duration</code> définit la durée en millisecondes. Les délais sont suspendus tant que le pointeur ou le focus clavier reste dans la pile.',
    },
    persistent: {
      title: 'Notifications persistantes',
      text: '<code>duration: 0</code> conserve la notification ouverte. Gardez un bouton de fermeture ou fournissez une autre action.',
    },
    dismissing: {
      title: 'Renvoyer une notification',
      text: '<code>toast()</code> renvoie un identifiant. Transmettez-le à <code>dismissToast()</code> pour fermer cette notification, ou omettez-le pour tout fermer. <code>hideClose</code> masque le bouton de fermeture.',
    },
  },
  api: {
    VToaster: {
      props: {
        placement: 'Position des notifications par défaut.',
        duration: 'Durée par défaut en millisecondes. 0 désactive la fermeture automatique.',
        closeLabel: 'Nom accessible du bouton de fermeture. Utilise le dictionnaire par défaut.',
        label: 'Nom accessible de la zone de notifications. Utilise le dictionnaire par défaut.',
      },
    },
  },
}
