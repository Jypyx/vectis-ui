export default {
  title: 'Menu',
  lead: '<code>VMenu</code> affiche des commandes dans un panneau flottant avec navigation au clavier et sous-menus imbriqués.',
  examples: {
    menuItems: {
      title: 'Les commandes',
      text: 'Utilisez <code>VMenuItem</code> pour des commandes ou des liens et <code>VMenuSeparator</code> entre les ensembles. La navigation par flèches ignore les éléments désactivés.',
    },
    sublabels: {
      title: 'Seconde ligne',
      text: '<code>sublabel</code> ajoute une seconde ligne pour une aide ou un raccourci.',
    },
    selection: {
      title: 'Sélection',
      text: '<code>selected</code> marque le choix actuel. Choisir une commande ferme toujours le menu.',
    },
    groups: {
      title: 'Groupes',
      text: '<code>VMenuGroup</code> nomme un ensemble de commandes. Son en-tête est non interactif.',
    },
    submenus: {
      title: 'Sous-menus',
      text: 'Le slot <code>submenu</code> ajoute des commandes imbriquées. Le survol ouvre le sous-menu après un délai ; les flèches gauche et droite permettent d’y entrer et d’en sortir.',
    },
    sizes: {
      title: 'Tailles',
      text: 'Définissez <code>size</code> et <code>compact</code> sur le menu ; les sous-menus en héritent.',
    },
    width: {
      title: 'Largeur',
      text: '<code>width</code> fixe la largeur du panneau principal. <code>matchTrigger</code> utilise la largeur du déclencheur comme minimum. Les sous-menus conservent leur largeur par défaut.',
    },
    placement: {
      title: 'Position',
      text: '<code>placement</code> définit la position souhaitée du panneau.',
    },
    open: {
      title: 'Savoir si le menu est ouvert',
      text: '<code>v-model:open</code> suit l’ouverture et la fermeture au clic extérieur, avec Échap ou lors du choix d’une commande.',
    },
  },
  api: {
    VMenu: {
      props: {
        placement: 'Position souhaitée du panneau ; ajustée si l’espace manque.',
        size: 'Taille des lignes héritée par les sous-menus.',
        compact: 'Réduit la hauteur des lignes, sous-menus compris.',
        width:
          'Largeur du panneau principal. Les nombres utilisent des pixels ; les chaînes, des longueurs ou mots-clés CSS.',
        matchTrigger:
          'La largeur minimale du panneau principal correspond au déclencheur. Sans effet sur les sous-menus.',
        vModelOpen:
          'État ouvert synchronisé avec les clics extérieurs, Échap et le choix d’une commande.',
      },
      slots: {
        trigger: 'Bouton d’ouverture. Liez les <code>triggerProps</code> fournis.',
        default:
          'Enfants <code>VMenuItem</code>, <code>VMenuGroup</code> et <code>VMenuSeparator</code>.',
      },
    },
    VMenuItem: {
      props: {
        label: 'Libellé de commande, remplacé par le slot par défaut.',
        sublabel: 'Seconde ligne sous le libellé.',
        iconStart: 'Icône avant le libellé. Remplacée par <code>start</code>.',
        iconEnd: 'Icône après le libellé. Remplacée par <code>end</code>.',
        selected: 'Met en évidence et annonce le choix actuel.',
        tone: 'Neutre ou danger ; utilisez danger pour les commandes destructives.',
        disabled: 'Désactive la commande et l’ignore dans la navigation par flèches.',
        href: 'Destination du lien.',
      },
      events: {
        select: 'La commande a été activée au clic ou au clavier. Ferme le menu.',
      },
      slots: {
        default: 'Contenu remplaçant le libellé.',
        sublabel: 'Contenu remplaçant la seconde ligne.',
        start: 'Contenu remplaçant <code>iconStart</code>.',
        end: 'Contenu remplaçant <code>iconEnd</code>.',
        submenu: 'Éléments, groupes et séparateurs du sous-menu.',
      },
    },
    VMenuGroup: {
      props: {
        label: 'Nom du groupe. Fournissez cette prop ou son slot.',
      },
      slots: {
        default: 'Commandes du groupe.',
        label: 'Contenu remplaçant le nom du groupe.',
      },
    },
  },
}
