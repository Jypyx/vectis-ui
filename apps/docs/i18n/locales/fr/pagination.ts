export default {
  title: 'Pagination',
  lead: "Une rangée de boutons de page. Chaque pastille est un VButton, donc rien de leurs états n'est redéfini ici, et la rangée peut abandonner des pages à mesure que la place se réduit, sans point de rupture.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: "Chaque pastille est un bouton : rien du survol, du focus ou de la désactivation n'est réécrit ici. La page courante est toujours pleine, quoi que dise la variante : ce que peint <code>itemVariant</code>, ce sont les AUTRES pages et les contrôles, en ghost par défaut ou en contour. La tonalité est la couleur que prend la page courante, le reste de la rangée restant neutre, et elle offre les trois qu'offre un bouton : une intention plutôt qu'un état.",
    },
    detached: {
      title: 'Détaché',
      text: 'La rangée est un contrôle segmenté par défaut, ses boutons joints et seules les deux extrémités arrondies. <code>detached</code> les espace et rend à chacun ses coins, ce qui est le même mot dans le même sens que sur VButtonGroup et VToggle.',
    },
    elevated: {
      title: 'Surélevé',
      text: "Soulève la rangée de la page. Jointe, l'ombre appartient à la rangée et non à chaque pastille : les segments se chevauchent d'un pixel, donc une ombre par pastille tomberait dans chaque jointure et remplirait la rangée de bandes sombres au lieu de soulever un seul objet. Détachée il n'y a plus de jointure, et chaque bouton porte la sienne.",
    },
    sizes: {
      title: 'Tailles',
      text: "Les cinq crans que partagent tous les contrôles, de 24 à 56 pixels, chacun avec sa version <code>compact</code> plus courte de 4px. Une pastille est carrée à un chiffre et s'élargit d'elle-même au-delà, sa largeur minimale dérivant de la hauteur du contrôle : rien n'est réglé taille par taille.",
    },
    length: {
      title: 'Nombre de pages',
      text: "Combien de pages il y a en tout. Sa valeur par défaut est un, ce qui rend une seule page : le vrai nombre doit donc presque toujours être donné. Toutes les pages sont rendues tant que <code>totalVisible</code> ne dit pas combien d'emplacements garder.",
    },
    totalVisible: {
      title: "Nombre d'emplacements",
      text: "Combien d'emplacements la rangée rend, points de suspension compris. C'est ce qui garde la largeur CONSTANTE : parcourez les pages et rien ne se déplace latéralement, la fenêtre autour de la page courante se DÉCALANT aux extrémités au lieu de rétrécir. La première et la dernière page sont toujours gardées, et en dessous de cinq emplacements il ne resterait rien à montrer autour de la page courante : cinq est donc le minimum effectif.",
    },
    controls: {
      title: 'Précédent et suivant',
      text: "Une seule prop plutôt qu'un booléen à côté d'une union : on choisit ce que les contrôles montrent, une icône, un mot, ou les deux, ou bien on les retire entièrement. Les icônes et les mots sont les vôtres, et un libellé sert à la fois de texte visible et de nom accessible, ce qui garde un contrôle nommé quand une rangée étroite masque son texte et ne laisse que le glyphe.",
    },
    unreachablePages: {
      title: 'Pages inaccessibles',
      text: "Quelles pages ne peuvent pas être atteintes, sous forme de liste quand on les connaît ou de fonction quand la règle est plus simple à écrire qu'à énumérer. C'est un comportement plutôt qu'un état : les contrôles précédent et suivant ENJAMBENT ces pages au lieu de s'arrêter sur l'une d'elles, et ne se désactivent que lorsqu'il n'y a plus rien à atteindre, ce qui couvre les extrémités de la rangée sans règle à part.",
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> met toute la rangée hors d'atteinte, grisée par les jetons de couleur comme tout autre contrôle. À chaque bout de l'intervalle, le contrôle correspondant se désactive de lui-même faute de destination, ce qui est le mécanisme même que rencontre une page inaccessible.",
    },
    alignment: {
      title: 'Alignement',
      text: "Où la rangée se place dans la largeur qu'on lui donne. Cela ne dit quelque chose qu'en mode responsive, qui est ce qui fait prendre à la navigation toute la largeur disponible ; en dehors, la rangée garde une largeur intrinsèque et se pose là où son parent la met. C'est aussi pourquoi une pagination dans le pied d'un tableau n'a pas besoin d'un <code>flex</code> à elle.",
    },
    responsive: {
      title: 'Conteneurs étroits',
      text: "La rangée perd des pages à mesure que la place se réduit, en masquant les voisines de la page courante un cran à la fois, tandis que la première page, la dernière et la courante ne partent jamais. Elle interroge sa PROPRE largeur et non celle de la fenêtre : une pagination logée dans un panneau étroit se replie donc pendant que la page autour reste large, et les flèches du clavier sautent ce qui est masqué. C'est éteint par défaut, parce que cela fait prendre à la navigation toute la largeur disponible. Aucun point de suspension n'est ajouté pour remplacer une voisine masquée : il est aussi large que la pastille qu'il remplacerait.",
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
