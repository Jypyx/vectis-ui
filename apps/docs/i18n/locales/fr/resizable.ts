export default {
  title: 'Panneaux redimensionnables',
  lead: '<code>VResizable</code> partage un espace entre deux <code>VResizablePanel</code> ou plus et place une poignée entre chaque paire. Une poignée se fait glisser au pointeur, ou reçoit le focus et se déplace avec les flèches.',
  examples: {
    vertical: {
      title: 'Vertical',
      text: '<code>orientation="vertical"</code> empile les panneaux. Le groupe a alors besoin d’une hauteur. <code>grip</code> dessine une pastille sur chaque poignée.',
    },
    limits: {
      title: 'Limites',
      text: '<code>minSize</code> et <code>maxSize</code> acceptent un nombre en pourcentage ou une longueur CSS comme <code>10rem</code>. Quand un panneau atteint son minimum, la poignée prend le reste au panneau suivant.',
    },
    collapsible: {
      title: 'Panneaux repliables',
      text: 'Un panneau <code>collapsible</code> se replie quand on le tire au-delà de la moitié de son minimum, ou avec Entrée sur sa poignée, et se rouvre à sa taille précédente. <code>v-model:collapsed</code> suit son état. <code>collapsedSize</code> garde une bande, comme un rail d’icônes ; à 0, le contenu sort de la mise en page et de l’ordre de tabulation.',
    },
    nested: {
      title: 'Groupes imbriqués',
      text: 'Un panneau peut contenir son propre groupe. Donnez au groupe intérieur <code>height: 100%</code>.',
    },
    persisted: {
      title: 'Enregistrer les tailles',
      text: 'Le v-model contient les tailles en pourcentage et change pendant le glisser. <code>change</code> est émis quand elles se stabilisent : c’est le moment de les enregistrer. Pour une page rendue sur le serveur, un cookie permet au serveur d’afficher directement les tailles enregistrées.',
    },
  },
  api: {
    VResizable: {
      props: {
        orientation: 'Panneaux côte à côte, dans le sens du texte, ou empilés.',
        disabled:
          'Fige les tailles. Les poignées ne se déplacent plus et ne reçoivent plus le focus.',
        grip: 'Dessine une pastille au milieu de chaque poignée.',
        step: 'Déplacement d’une poignée par touche fléchée, en pourcentage.',
        vModel:
          'Taille de chaque panneau en pourcentage de l’espace partagé, pour un total de 100. Sans liaison, les panneaux partent de leur <code>defaultSize</code>.',
      },
      events: {
        change: 'Émet les tailles une fois stabilisées : après un glisser, une touche ou un repli.',
      },
      slots: {
        default: 'Les <code>VResizablePanel</code>, au moins deux.',
      },
    },
    VResizablePanel: {
      props: {
        index: 'Position du panneau, attribuée par le groupe. Ne pas la définir.',
        defaultSize:
          'Taille de départ en pourcentage quand le v-model n’en donne pas. Les panneaux sans taille se partagent le reste.',
        minSize: 'Taille minimale : un nombre en pourcentage ou une longueur CSS.',
        maxSize: 'Taille maximale : un nombre en pourcentage ou une longueur CSS.',
        collapsible:
          'Permet de replier le panneau en le faisant glisser ou avec Entrée sur sa poignée.',
        collapsedSize:
          'Taille du panneau replié, en pourcentage ou en longueur CSS. À 0, le contenu est masqué.',
        label: 'Nom accessible de la poignée qui redimensionne le panneau.',
        vModelCollapsed: 'État replié. Le modifier replie ou rouvre le panneau.',
      },
      slots: {
        default: 'Contenu du panneau.',
      },
    },
  },
}
