export default {
  title: 'Icône',
  lead: "Une icône, depuis la source dont vous disposez. La bibliothèque embarque ses propres dessins, donc rien ici n'exige de police d'icônes, et un résolveur permet de brancher un jeu tiers à la place.",

  examples: {
    size: {
      title: 'Taille',
      text: "Un nombre de pixels, et l'icône est carrée. Sans lui, elle prend la taille que son contexte impose : chaque contrôle de la bibliothèque en pose une pour tout ce qui se dessine à l'intérieur, si bien qu'une icône dans un bouton suit le bouton sans qu'on le lui dise. Sans contexte non plus, elle retombe sur <code>1em</code>, ce qui lui donne la taille du texte où elle se trouve et la garde sur la ligne au lieu de l'écarter. Une taille explicite l'emporte sur les deux.",
    },
    filled: {
      title: 'Pleine',
      text: "La même icône, forme remplie, ce qui sert à marquer un état : une notification arrivée, une étape faite. La bibliothèque n'embarque un dessin plein que là où le remplissage change vraiment la géométrie, 15 de ses 34 icônes, et en demander un à une icône qui n'en a pas dessine l'icône qu'elle a toujours eue. La prop peut donc être liée à une condition sans vérifier d'abord si cette icône-là a quelque chose à en dire. Elle ne veut rien dire pour une image ou un SVG en ligne, dont la forme est fixe, et une police à ligatures l'honore toujours.",
    },
    rendering: {
      title: "D'où vient le dessin",
      text: 'Une icône peut venir de cinq endroits, interrogés dans un ordre fixe, et le premier qui répond est celui qui est dessiné :',
      order: [
        "<code>render</code>, une description explicite de ce qu'il faut dessiner : des données de tracé SVG, un composant, une image, ou la classe d'une police.",
        "<code>src</code>, l'adresse d'une image.",
        '<code>name</code>, proposé à votre résolveur en premier, puis au dessin que porte une icône de la bibliothèque, puis à une police à ligatures.',
        "Le slot par défaut, un SVG en ligne, atteint quand ni <code>name</code> ni <code>src</code> n'ont été donnés.",
      ],
      moreBefore:
        "L'ordre est le contrat. Votre résolveur passe avant les dessins de la bibliothèque, si bien qu'un seul appel déplace vers votre jeu toutes les icônes que les composants dessinent, et un résolveur qui ne répond rien pour un nom donné le rend au lieu de laisser un trou, ce qui rend utilisable une correspondance partielle. Une simple chaîne n'est jamais qu'un nom, jamais une adresse : c'est ce qui permet à un identifiant à espace de noms comme <code>mdi:close</code> d'atteindre votre résolveur intact. Brancher un jeu, et la liste de ce que la bibliothèque embarque, sont tous deux sur",
      moreAfter: '.',
    },
  },

  api: {
    VIcon: {
      props: {
        name: "Quelle icône dessiner. Une simple chaîne est un nom : elle est proposée à votre résolveur, puis laissée à une police d'icônes en tant que ligature. Une des icônes de la bibliothèque, importée depuis <code>vectis-ui/icons</code>, porte son dessin avec elle ; le résolveur est tout de même interrogé d'abord, et le dessin répond quand rien d'autre ne le fait.",
        render:
          "Une description explicite de ce qu'il faut dessiner, une image, un composant, un tracé ou une classe, qui l'emporte sur tout le reste. C'est la voie que prend chaque prop d'icône de la bibliothèque quand on lui donne autre chose qu'un simple nom.",
        src: "L'adresse d'une image à utiliser comme icône. Elle l'emporte sur <code>name</code>.",
        size: "Une taille en pixels. Sans elle, l'icône prend la taille que son contexte impose, un bouton en fixant une pour les icônes qu'il contient, et à défaut 1em, ce qui la fait suivre le texte alentour.",
        label:
          "Ce que l'icône signifie, pour les lecteurs d'écran. L'omettre marque l'icône comme décorative et la masque à ces derniers, ce qui est juste dès que le texte alentour dit déjà ce qu'elle dit.",
        filled:
          "Dessine la version pleine de l'icône. Les icônes intégrées l'honorent partout où le remplissage change réellement le dessin, et une police à ligatures le fait toujours. Cela ne signifie rien pour une image ou un SVG en ligne, dont la forme est fixe.",
      },
      slots: {
        default:
          "Un SVG en ligne, utilisé quand ni <code>src</code> ni <code>name</code> n'a été donné.",
      },
    },
  },
}
