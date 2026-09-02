export default {
  title: 'Squelette de chargement',
  lead: "La silhouette d'un contenu qui n'est pas encore arrivé. Elle est en CSS pur, et décorative par défaut : ce qui annonce l'attente est le conteneur autour d'elle, pas une douzaine de silhouettes concurrentes.",

  api: {
    VSkeletonLoader: {
      props: {
        shape:
          "Ce que la silhouette représente. Chaque valeur fixe à la fois un rayon de coin et une façon d'être dimensionnée : <code>text</code> suit la typographie alentour, <code>control</code> prend la hauteur d'un contrôle de la taille donnée, <code>pill</code> est cette hauteur aux extrémités entièrement arrondies, <code>circle</code> est cette hauteur dans les deux dimensions, et <code>surface</code> est une carte ou une image avec sa propre hauteur.",
        size: "La taille sur l'échelle partagée par tous les contrôles. Elle ne signifie quelque chose que pour les formes dimensionnées comme un contrôle : le texte suit la typographie alentour, et une surface a sa hauteur propre.",
        compact: 'Retire 4px à la hauteur, comme partout ailleurs dans le design system.',
        width:
          "La largeur : un nombre est lu en pixels, et tout le reste comme une longueur CSS à vous, <code>'100%'</code> ou <code>'12ch'</code>. Sans elle, la silhouette prend toute la largeur disponible.",
        height: "La hauteur, lue de la même façon. Elle l'emporte sur la forme et sur la taille.",
        lines:
          'Combien de silhouettes empiler. Dans la forme texte, la dernière est dessinée plus courte que les autres, et ce seul détail est ce qui se lit comme un paragraphe plutôt que comme un tableau.',
        animation:
          "Comment la silhouette montre qu'il se passe quelque chose. La couper la fige, ce qui convient à une impression, une capture d'écran, ou un parent qui anime déjà.",
        color:
          "Une couleur de fond à vous, qui remplace le token. Le reflet de la vague en est dérivé, donc il reste juste sans rien d'autre à régler.",
        announce:
          "Annonce le chargement aux lecteurs d'écran. Désactivé par défaut, parce qu'un squelette est décoratif : une page en contient une douzaine, et une douzaine d'annonces concurrentes est illisible. Ce qui doit annoncer l'attente est le conteneur autour d'eux, marqué occupé.",
        label:
          "Ce qui est annoncé, ce qui implique aussi de l'annoncer. Préférez quelque chose de situé, « Chargement des résultats », puisqu'un mot générique est la raison pour laquelle le silence est la valeur par défaut. Il retombe sur le dictionnaire du design system.",
      },
    },
  },
}
