export default {
  title: 'Icône',
  lead: "Une icône, depuis la source dont vous disposez. La bibliothèque embarque ses propres dessins, donc rien ici n'exige de police d'icônes, et un résolveur permet de brancher un jeu tiers à la place.",

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
