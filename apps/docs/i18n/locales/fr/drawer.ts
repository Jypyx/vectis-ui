export default {
  title: 'Tiroir',
  lead: '<code>VDrawer</code> ouvre un panneau modal natif contre un bord de la zone visible, et le fait glisser à l’ouverture comme à la fermeture.',
  examples: {
    sides: {
      title: 'Côtés',
      text: '<code>side</code> choisit le bord. <code>start</code> et <code>end</code> suivent le sens d’écriture.',
    },
    size: {
      title: 'Taille',
      text: '<code>size</code> définit la largeur d’un tiroir latéral, ou la hauteur d’un tiroir en haut ou en bas. <code>extent</code> la remplace par n’importe quelle longueur CSS. Une bande de la page reste toujours découverte.',
    },
    navigation: {
      title: 'Navigation',
      text: 'Le corps défile tandis que l’en-tête et le pied restent visibles. Fermez le tiroir quand un élément est sélectionné.',
    },
  },
  api: {
    VDrawer: {
      props: {
        title:
          'Titre et nom accessible du tiroir. Ignoré si le slot <code>header</code> est fourni.',
        subtitle: 'Texte complémentaire sous le titre.',
        side: 'Bord d’où vient le tiroir. <code>start</code> et <code>end</code> suivent le sens d’écriture.',
        size: 'Largeur sur un côté, hauteur en haut ou en bas.',
        extent: 'Remplace <code>size</code> : pixels pour les nombres, sinon longueur CSS.',
        hideClose: 'Masque le bouton de fermeture.',
        persistentBackdrop: 'Empêche les clics extérieurs de fermer le tiroir.',
        persistentEscape:
          'Empêche la fermeture par Échap seulement avec <code>persistentBackdrop</code>. Sinon les deux possibilités restent actives.',
        closeLabel: 'Nom accessible du bouton de fermeture. Par défaut, celui du dictionnaire.',
        vModelOpen: 'État d’ouverture du tiroir. La fermeture native met le modèle à jour.',
      },
      slots: {
        default: 'Corps du tiroir, qui défile.',
        header:
          'En-tête personnalisé. Fournissez <code>aria-label</code> ou <code>aria-labelledby</code> pour nommer le tiroir.',
        headerActions: 'Contrôles d’en-tête avant le bouton de fermeture.',
        footer: 'Actions du tiroir.',
        trigger: 'Contrôle d’ouverture. Liez les <code>triggerProps</code> fournies.',
      },
    },
  },
}
