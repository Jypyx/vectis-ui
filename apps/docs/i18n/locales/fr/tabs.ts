export default {
  title: 'Onglets',
  lead: '<code>VTabs</code> sélectionne un onglet et affiche son panneau facultatif. Il peut aussi servir de barre d’onglets sans panneaux.',
  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: '<code>flat</code> souligne l’onglet sélectionné. <code>outline</code>, <code>elevated</code> et <code>filled</code> ajoutent un cadre avec une bordure, une ombre ou une surface atténuée, et <code>inset</code> utilise un fond en creux. <code>tone</code> colore la sélection.',
    },
    sizes: {
      title: 'Tailles',
      text: 'Définissez <code>size</code> et <code>compact</code> sur le groupe.',
    },
    tabContent: {
      title: 'Ce que porte un onglet',
      text: 'Utilisez des libellés, des icônes ou des slots. Donnez un <code>label</code> aux onglets sans texte pour leur nom accessible.',
    },
    panels: {
      title: 'Panneaux',
      text: 'Fournissez un panneau correspondant à chaque onglet dans <code>panels</code>, ou omettez ce slot dès le départ. Les panneaux masqués conservent leur état et leurs valeurs de formulaire. <code>lazy</code> retarde le montage jusqu’à la première ouverture.',
    },
    alignment: {
      title: 'Alignement',
      text: '<code>align</code> positionne les onglets quand ils n’occupent pas toute la barre.',
    },
    fullWidth: {
      title: 'Remplir la barre',
      text: '<code>fullWidth</code> répartit la barre également entre les onglets. Les longs libellés sont tronqués ; le défilement est désactivé.',
    },
    orientation: {
      title: 'Orientation',
      text: 'Les onglets verticaux apparaissent à côté des panneaux. La navigation par flèches suit l’orientation.',
    },
    scrolling: {
      title: 'Défilement',
      text: 'Les onglets débordants défilent au toucher, au pavé tactile ou au clavier. Autorisez le parent à rétrécir avec une taille minimale nulle.',
    },
    scrollButtons: {
      title: 'Boutons de défilement',
      text: '<code>scrollButtons</code> ajoute des contrôles aux extrémités. Il ne peut pas être combiné à <code>fullWidth</code>.',
    },
    customArrows: {
      title: 'Flèches personnalisées',
      text: 'Personnalisez les icônes de défilement et leurs noms accessibles avec <code>prevIcon</code>, <code>nextIcon</code>, <code>prevLabel</code> et <code>nextLabel</code>.',
    },
    activation: {
      title: "Sélectionner à l'arrivée",
      text: 'L’activation manuelle déplace le focus avec les flèches et sélectionne avec Entrée ou Espace. L’activation automatique sélectionne au focus ; utilisez-la si les panneaux s’affichent immédiatement.',
    },
    disabled: {
      title: 'Onglets désactivés',
      text: 'Les onglets désactivés sont ignorés. Conservez le modèle sur un onglet actif. Désactiver le groupe laisse le panneau actuel visible.',
    },
  },
  api: {
    VTabs: {
      props: {
        variant:
          'Style de barre : souligné, encadré par une bordure, une ombre ou un fond atténué, ou en creux.',
        tone: 'Couleur de l’onglet sélectionné.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        orientation: 'Navigation horizontale ou verticale.',
        align: 'Alignement des onglets quand la barre n’est pas remplie.',
        fullWidth: 'Répartit les onglets également dans la barre.',
        scrollButtons:
          'Ajoute des contrôles de défilement. Incompatible avec <code>fullWidth</code>.',
        prevIcon: 'Icône de défilement arrière. Flèche adaptée à l’orientation par défaut.',
        nextIcon: 'Icône de défilement avant. Flèche adaptée à l’orientation par défaut.',
        prevLabel: 'Nom accessible du défilement arrière. Utilise le dictionnaire par défaut.',
        nextLabel: 'Nom accessible du défilement avant. Utilise le dictionnaire par défaut.',
        activation: 'Sélection manuelle avec Entrée/Espace, ou automatique au focus.',
        disabled:
          'Désactive tous les onglets et contrôles de défilement ; conserve le panneau actuel.',
        label: 'Nom accessible de la liste d’onglets. Utilise le dictionnaire par défaut.',
        vModel:
          'Valeur de l’onglet sélectionné. Doit désigner un onglet existant et actif pour l’accès au clavier.',
      },
      slots: {
        default: 'Enfants <code>VTab</code>.',
        panels:
          'Enfants <code>VTabPanel</code> correspondants. Omettez-le pour une barre sans panneaux.',
      },
    },
    VTab: {
      props: {
        value: 'Identifiant correspondant au panneau et à la valeur du modèle.',
        label:
          'Libellé visible, remplacé par le slot par défaut. Nomme aussi les onglets sans texte.',
        iconStart: 'Icône avant le libellé.',
        iconEnd: 'Icône après le libellé.',
        iconFilled: 'Utilise des icônes pleines si disponibles.',
        disabled: 'Désactive cet onglet ; la désactivation du groupe s’applique aussi.',
      },
      slots: {
        default: 'Contenu remplaçant le libellé.',
        start: 'Contenu remplaçant <code>iconStart</code>.',
        end: 'Contenu remplaçant <code>iconEnd</code>.',
      },
    },
    VTabPanel: {
      props: {
        value: 'Identifiant de l’onglet affichant ce panneau.',
        lazy: 'Monte le contenu à la première ouverture, puis le conserve.',
      },
      slots: {
        default: 'Contenu du panneau.',
      },
    },
  },
}
