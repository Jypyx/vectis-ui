export default {
  title: 'Squelette de chargement',
  lead: "La silhouette d'un contenu qui n'est pas encore arrivé. Elle est en CSS pur, et décorative par défaut : ce qui annonce l'attente est le conteneur autour d'elle, pas une douzaine de silhouettes concurrentes.",

  examples: {
    shapes: {
      title: 'Formes',
      text: "Ce que la silhouette représente. Chaque valeur pose à la fois un rayon de coin et une façon d'être dimensionnée : <code>text</code> suit la typographie qui l'entoure, <code>control</code> prend la hauteur d'un contrôle, <code>pill</code> cette hauteur avec des bouts entièrement arrondis, <code>circle</code> cette hauteur dans les deux dimensions, et <code>surface</code> est une carte ou une image, avec une hauteur à elle. Le composant n'a pas de largeur propre et remplit ce qu'on lui donne : c'est le conteneur qui décide de la longueur d'une silhouette. <code>width</code> en nomme une quand cela ne suffit pas, un nombre étant lu en pixels et tout le reste comme une longueur CSS ; <code>height</code> se lit de la même manière et prime sur la forme comme sur la taille, pour une silhouette qu'aucune forme ne décrit.",
    },
    sizes: {
      title: 'Tailles',
      text: "L'échelle que partagent tous les contrôles, de 24 à 56 pixels, <code>compact</code> en retirant 4px comme partout ailleurs. Un skeleton <code>md</code> fait exactement la hauteur d'un bouton <code>md</code>, et c'est ce qui permet à une silhouette de tenir la place du contrôle qu'elle remplace au lieu de l'approcher. Cela ne veut rien dire pour <code>text</code>, qui suit la typographie environnante, ni pour <code>surface</code>, qui a sa propre hauteur.",
    },
    paragraph: {
      title: 'Paragraphes de texte',
      text: "Dans la forme texte, une silhouette fait un em de haut et la gouttière entre deux d'entre elles vaut l'interligne : <code>lines</code> silhouettes occupent donc exactement autant de lignes de la typographie qui les entoure, et les remplacer par le vrai texte ne déplace rien. La dernière ligne est tracée plus courte que les autres, et ce seul détail est ce qui se lit comme un paragraphe plutôt que comme un tableau.",
    },
    silhouettes: {
      title: "La silhouette d'un vrai composant",
      text: "À quoi servent les formes. Un bouton est un <code>control</code> à la taille du bouton, avec la largeur qu'aurait prise son libellé ; un avatar est un <code>circle</code>, une puce un <code>pill</code>, un champ deux silhouettes puisque son libellé est une ligne de texte et sa boîte un contrôle. Rien n'est mesuré ici : le composant ne regarde jamais ce qu'il remplace, donc une silhouette juste est une silhouette que vous avez déclarée, ce qui est aussi ce qui la rend juste avant que la vraie chose n'ait jamais été rendue.",
    },
    animations: {
      title: 'Animations',
      text: "Les deux animations éclaircissent la silhouette avec le même reflet, dérivé de son propre fond : la vague le fait traverser, la pulsation le monte et le redescend sur place. Aucune ne fait disparaître la silhouette vers la page, ce qui l'éclaircirait dans un thème et l'assombrirait dans l'autre. <code>none</code> la fige, ce qui convient à une impression, une capture, ou un parent qui anime déjà. Sous <code>prefers-reduced-motion</code>, la vague retombe sur une pulsation ralentie plutôt que de s'arrêter, une translation étant précisément ce que cette préférence vise.",
    },
    colour: {
      title: 'Une couleur à vous',
      text: "Le gris livré se lit comme une absence sur le fond de page, et comme un trou sur une surface qui peint le sien. <code>color</code> le remplace, et le reflet qu'utilisent les deux animations est dérivé de cette couleur par un écart de luminosité plutôt que mélangé vers une cible : il reste donc juste sur un fond inhabituel comme dans les deux thèmes, sans rien d'autre à régler.",
    },
    replacing: {
      title: 'Remplacer le squelette',
      text: "Il n'y a pas de mode enveloppe, et c'est une décision plutôt qu'un oubli : envelopper inviterait le composant à mesurer ce qu'il remplace, et la forme resterait de toute façon à déclarer. L'idiome est un simple <code>v-if</code>, avec <code>aria-busy</code> sur le conteneur. C'est cet attribut qui annonce l'attente pour toute la zone, ce qui est l'autre moitié du silence de la silhouette.",
    },
    announcing: {
      title: "Annoncer l'attente",
      text: "Une silhouette est décorative par défaut et masquée à l'arbre d'accessibilité : une page en contient une douzaine, et une douzaine d'annonces concurrentes est illisible. Une seule instance par zone parle, par <code>announce</code>, ou par <code>label</code>, qui dit ce qui est annoncé et déclenche l'annonce du seul fait d'être fourni. Préférez quelque chose de situé, « Chargement des résultats », un mot générique étant la raison pour laquelle le défaut est le silence.",
    },
  },

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
