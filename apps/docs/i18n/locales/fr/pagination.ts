export default {
  title: 'Pagination',
  lead: "Une rangée de boutons de page. Chaque pastille est un VButton, donc rien de leurs états n'est redéfini ici, et la rangée peut abandonner des pages à mesure que la place se réduit, sans point de rupture.",

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
