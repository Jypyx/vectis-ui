export default {
  title: 'Boîte de dialogue',
  lead: '<code>VDialog</code> ouvre un dialogue modal natif qui contient le focus. <code>VDialogAlert</code> exige une réponse explicite pour se fermer.',
  examples: {
    width: {
      title: 'Largeur',
      text: '<code>width</code> définit la largeur du dialogue dans les limites de la zone visible.',
    },
    longContent: {
      title: 'Contenu long',
      text: 'Le corps défile tandis que l’en-tête et le pied restent visibles.',
    },
    customHeader: {
      title: 'En-tête personnalisé',
      text: '<code>header</code> remplace le titre et le sous-titre. Fournissez un nom accessible avec <code>aria-label</code> ou <code>aria-labelledby</code>.',
    },
    headerActions: {
      title: "Actions d'en-tête",
      text: '<code>header-actions</code> place des contrôles avant le bouton de fermeture.',
    },
    dismissal: {
      title: 'Fermeture',
      text: '<code>hideClose</code> masque le bouton de fermeture. <code>persistentBackdrop</code> désactive la fermeture au clic extérieur ; <code>persistentEscape</code> désactive Échap seulement si les deux sont activés. Fournissez une action de fermeture si toutes ces possibilités sont désactivées.',
    },
    alert: {
      title: "Boîte d'alerte",
      text: '<code>VDialogAlert</code> n’a pas de bouton de fermeture et ignore Échap et les clics extérieurs. Fournissez des boutons de réponse dans son pied.',
    },
  },
  api: {
    VDialog: {
      props: {
        title:
          'Titre et nom accessible du dialogue. Ignoré si le slot <code>header</code> est fourni.',
        subtitle: 'Texte complémentaire sous le titre.',
        width: 'Largeur en pixels pour les nombres, sinon longueur CSS. Limitée à la zone visible.',
        role: 'Rôle du dialogue. Utilisez <code>alertdialog</code> pour une réponse nécessitant une attention immédiate.',
        hideClose: 'Masque le bouton de fermeture.',
        persistentBackdrop: 'Empêche les clics extérieurs de fermer le dialogue.',
        persistentEscape:
          'Empêche la fermeture par Échap uniquement avec <code>persistentBackdrop</code>. Sinon, les deux possibilités de fermeture restent actives.',
        closeLabel: 'Nom accessible du bouton de fermeture. Utilise le dictionnaire par défaut.',
        vModelOpen: 'État ouvert du dialogue. La fermeture native met le modèle à jour.',
      },
      slots: {
        default: 'Corps défilant du dialogue.',
        header:
          'En-tête personnalisé. Fournissez <code>aria-label</code> ou <code>aria-labelledby</code> pour nommer le dialogue.',
        headerActions: 'Contrôles d’en-tête avant le bouton de fermeture.',
        footer: 'Actions du dialogue.',
        trigger: 'Contrôle d’ouverture. Liez les <code>triggerProps</code> fournis.',
      },
    },
    VDialogAlert: {
      props: {
        title:
          'Titre et nom accessible du dialogue. Ignoré si le slot <code>header</code> est fourni.',
        subtitle: 'Texte complémentaire expliquant la réponse.',
        width: 'Largeur en pixels pour les nombres, sinon longueur CSS. Limitée à la zone visible.',
        vModelOpen: 'État ouvert du dialogue. La fermeture native met le modèle à jour.',
      },
      slots: {
        default: 'Contenu de l’alerte.',
        header:
          'En-tête personnalisé. Fournissez <code>aria-label</code> ou <code>aria-labelledby</code> pour nommer le dialogue.',
        headerActions: 'Contrôles à la fin de l’en-tête.',
        footer: 'Actions de réponse requises. Incluez une possibilité de fermer l’alerte.',
        trigger: 'Contrôle d’ouverture. Liez les <code>triggerProps</code> fournis.',
      },
    },
  },
}
