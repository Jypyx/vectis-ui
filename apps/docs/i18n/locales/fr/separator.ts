export default {
  title: 'Séparateur',
  lead: "Un filet d'un pixel, rendu par un <code>&lt;hr&gt;</code>. Il ne porte aucun espacement propre : l'écart autour de lui appartient à la mise en page qui le contient.",

  examples: {
    orientation: {
      title: 'Orientation',
      text: "<code>orientation</code> trace le filet en travers de la page ou vers le bas. Un filet vertical prend seul toute la hauteur de sa ligne flex ou grid ; en flux normal il s'effondre, et la hauteur vous revient alors. Le composant ne porte aucun espacement dans les deux cas.",
    },
    labelled: {
      title: 'Un séparateur portant un mot',
      text: "Le composant ne prend aucun contenu : un séparateur portant un mot est un titre encadré de deux filets, il se construit donc plutôt qu'il ne se configure. Le filet est en <code>flex: none</code>, et une règle à vous n'est pas en couche, elle l'emporte donc dessus.",
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
