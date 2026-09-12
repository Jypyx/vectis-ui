export default {
  title: 'Pagination',
  lead: "Une rangée de boutons de page. Chaque pastille est un VButton, donc rien de leurs états n'est redéfini ici, et la rangée peut abandonner des pages à mesure que la place se réduit, sans point de rupture.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: '<code>itemVariant</code> peint les pages qui ne sont pas courantes et les contrôles, en ghost par défaut ou en outlined. <code>tone</code> est la couleur que prend la page courante, le reste de la rangée restant neutre.',
    },
    detached: {
      title: 'Détaché',
      text: '<code>detached</code> espace les boutons et rend à chacun ses coins, au lieu de les joindre en contrôle segmenté.',
    },
    elevated: {
      title: 'Surélevé',
      text: "<code>elevated</code> soulève la rangée. Jointe, l'ombre appartient à la rangée ; détachée, chaque bouton porte la sienne.",
    },
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> définit la hauteur, de 24 à 56 pixels, et <code>compact</code> lui retire 4px. Une pastille est carrée à un chiffre et s'élargit d'elle-même au-delà.",
    },
    length: {
      title: 'Nombre de pages',
      text: "<code>length</code> est le nombre total de pages, une par défaut. Toutes les pages sont rendues tant que <code>totalVisible</code> ne dit pas combien d'emplacements garder.",
    },
    totalVisible: {
      title: "Nombre d'emplacements",
      text: "<code>totalVisible</code> est le nombre d'emplacements rendus par la rangée, points de suspension compris, ce qui garde sa largeur constante. La première et la dernière page sont toujours gardées, et cinq est le minimum utile.",
    },
    controls: {
      title: 'Précédent et suivant',
      text: '<code>controls</code> décide de ce que montrent les boutons précédent et suivant : une icône, un mot, les deux, ou rien du tout. Leurs icônes et leurs mots vous appartiennent, un libellé étant à la fois le texte visible et le nom accessible.',
    },
    unreachablePages: {
      title: 'Pages inaccessibles',
      text: "<code>disabledPages</code> accepte une liste de pages, ou une fonction quand la règle s'écrit plus facilement qu'elle ne s'énumère. Les contrôles précédent et suivant enjambent ces pages et ne se désactivent que lorsqu'il n'y a plus rien à atteindre.",
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> met toute la rangée hors de portée, grisée par les tokens de couleur. À chaque extrémité de la plage, le contrôle correspondant se désactive de lui-même.',
    },
    alignment: {
      title: 'Alignement',
      text: "<code>align</code> dit où se place la rangée dans la largeur qui lui est donnée. Il ne veut dire quelque chose qu'en mode responsive, qui fait prendre à la navigation toute la largeur disponible.",
    },
    responsive: {
      title: 'Conteneurs étroits',
      text: '<code>responsive</code> abandonne des pages à mesure que la place se réduit, en masquant les voisines de la page courante un cran à la fois, la première, la dernière et la courante ne partant jamais. Il mesure sa propre largeur et non celle de la fenêtre.',
    },
  },

  api: {
    VPagination: {
      props: {
        length:
          'Combien de pages il y a en tout. Elle vaut 1 par défaut, ce qui rend une seule page : le vrai nombre doit presque toujours être donné.',
        totalVisible:
          "Combien d'emplacements rendre, ellipses comprises, pour que la rangée garde exactement la même largeur quelle que soit la page courante. En dessous de cinq il ne resterait rien à montrer autour de la page courante : cinq est donc le minimum effectif. Omise, toutes les pages sont rendues.",
        detached:
          "Sépare les boutons au lieu de les joindre en un seul contrôle segmenté. C'est le mot que VButtonGroup et VToggle emploient pour la même question, dans le même sens.",
        itemVariant:
          "Comment sont dessinées les pages autres que la page courante, ainsi que les contrôles. La page courante est toujours pleine, quoi que dise cette prop. Elle porte le nom des items parce que c'est ce qu'elle peint : sur VTabs et VDataTable, <code>variant</code> nomme la décoration du cadre.",
        tone: 'La couleur que prend la page courante. Les autres pages et les contrôles restent neutres.',
        size: "La hauteur des boutons, tirée de l'échelle partagée par tous les contrôles.",
        compact: 'Retire 4px à la hauteur de chaque bouton.',
        elevated:
          "Surélève la rangée. Jointe, l'ombre appartient à la rangée et non à chaque pastille, ce qui l'empêche de tomber dans les jointures ; détachée, chaque bouton porte la sienne.",
        align:
          "Où se place la rangée dans l'espace qu'on lui donne. Cela ne compte qu'en mode responsive, où la rangée prend toute la largeur disponible.",
        controls:
          "Les boutons précédent et suivant de part et d'autre des pages : ce qu'ils affichent, ou <code>false</code> pour les retirer. Une prop plutôt que deux, la forme que <code>preview</code> de VFilePicker et <code>controls</code> de VCarousel emploient déjà.",
        prevIcon: "L'icône du contrôle précédent.",
        nextIcon: "L'icône du contrôle suivant.",
        prevLabel:
          "Le libellé du contrôle précédent, utilisé à la fois comme texte visible et comme ce que les lecteurs d'écran annoncent. Il retombe sur le dictionnaire du design system.",
        nextLabel:
          "Le libellé du contrôle suivant, utilisé à la fois comme texte visible et comme ce que les lecteurs d'écran annoncent. Il retombe sur le dictionnaire du design system.",
        disabled: 'Rend tout le composant inutilisable.',
        disabledPages:
          "Quelles pages ne peuvent pas être atteintes, en liste ou en fonction. Les contrôles précédent et suivant les ENJAMBENT plutôt que de s'arrêter dessus.",
        responsive:
          'Laisse la rangée abandonner des pages à mesure que la place se réduit, en interrogeant sa propre largeur. Désactivé par défaut, parce que cela fait prendre à la rangée toute la largeur disponible.',
        label:
          "Ce que les lecteurs d'écran annoncent pour la navigation elle-même. Il retombe sur le dictionnaire du design system.",
        pageLabel:
          "Comment une page est annoncée. Une pastille affiche un nombre nu, qui seul ne signifie rien pour un lecteur d'écran : c'est ce qui en fait « Page 3 ». Il retombe sur le dictionnaire du design system.",
        vModel: 'La page affichée, comptée à partir de 1. Elle démarre sur la première.',
      },
    },
  },
}
