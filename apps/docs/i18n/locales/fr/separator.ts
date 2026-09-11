export default {
  title: 'Séparateur',
  lead: "Un filet d'un pixel, rendu par un <code>&lt;hr&gt;</code>. Il ne porte aucun espacement propre : l'écart autour de lui appartient à la mise en page qui le contient.",

  examples: {
    orientation: {
      title: 'Orientation',
      text: "En travers de la page par défaut, ou de haut en bas. Un filet vertical vient avec une chose à savoir : un <code>&lt;hr&gt;</code> n'a pas de hauteur propre. En tant qu'élément flex ou grille, il prend toute la hauteur de sa ligne quel que soit l'alignement du conteneur, et il n'y a rien à poser. Dans un flux ordinaire, il s'effondre à rien au lieu de cela, en silence et sans la moindre erreur : c'est donc à vous de lui donner une hauteur. Le filet ne porte aucun espacement dans un cas comme dans l'autre : ce qui le sépare de ce qu'il sépare, c'est l'écart de la mise en page.",
    },
    labelled: {
      title: 'Un séparateur portant un mot',
      text: "Le composant ne prend aucun contenu, et un slot serait de mauvaise forme : un séparateur portant un mot est un titre flanqué d'un filet de chaque côté, il se construit donc au lieu de se configurer. Deux filets à qui l'on dit de grandir, le mot entre les deux. Le filet de base est en <code>flex: none</code>, ce qui l'empêche de s'étirer là où ce n'est pas voulu, et une règle à vous n'est dans aucune couche : elle l'emporte donc sans lutte.",
    },
  },

  api: {
    VSeparator: {
      props: {
        orientation:
          "Le sens dans lequel court le filet : en travers par défaut, ou de haut en bas avec <code>vertical</code>. Un filet vertical a besoin d'une hauteur pour se voir. En item flex ou grid il prend celle de sa ligne ; dans le flux ordinaire, c'est à vous de la poser.",
      },
    },
  },
}
