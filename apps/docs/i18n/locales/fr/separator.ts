export default {
  title: 'Séparateur',
  lead: "Un filet d'un pixel, rendu par un <code>&lt;hr&gt;</code>. Il ne porte aucun espacement propre : l'écart autour de lui appartient à la mise en page qui le contient.",

  api: {
    VSeparator: {
      props: {
        orientation:
          "Le sens dans lequel court le filet : en travers par défaut, ou de haut en bas avec <code>vertical</code>. Un filet vertical a besoin d'une hauteur pour se voir. En item flex ou grid il prend celle de sa ligne ; dans le flux ordinaire, c'est à vous de la poser.",
      },
    },
  },
}
