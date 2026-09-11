export default {
  title: 'Bouton icône',
  lead: "Un bouton carré portant une icône et aucun libellé. C'est VButton en dessous, avec deux valeurs par défaut à lui et un nom obligatoire, puisque l'image est tout ce qu'un lecteur d'écran aurait sinon.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: "Les mêmes quatre variantes et trois tonalités que VButton, avec deux valeurs par défaut à lui : <code>ghost</code> plutôt que <code>solid</code>, et <code>neutral</code> plutôt que <code>accent</code>. Un bouton sans libellé est presque toujours du décor autour du contenu, une croix de fermeture ou un menu, donc la paire discrète est ce à quoi il doit ressembler avant qu'on lui demande quoi que ce soit. Les tonalités sont des intentions et non des états, d'où trois et non cinq : le succès et l'avertissement appartiennent à ce qui rapporte un état, jamais à ce qui déclenche une action.",
    },
    elevated: {
      title: 'Surélevé',
      text: "Une ombre sous le bouton, orthogonale à la variante plutôt qu'une cinquième valeur de celle-ci : n'importe laquelle des quatre peut donc être surélevée. Les variantes ghost et outline gagnent en plus une surface surélevée, sans laquelle l'ombre n'aurait rien qui la projette dans le thème sombre.",
    },
    sizes: {
      title: 'Tailles',
      text: "Les cinq crans que partagent tous les contrôles de la bibliothèque, de 24 à 56 pixels, et le bouton est carré à chacun : la largeur lit la hauteur même que le cran pose, une seule règle couvrant ainsi toute l'échelle. <code>compact</code> retire 4px, et des deux côtés, pour que la boîte reste carrée. L'icône suit le cran sans qu'on le lui dise, un contrôle fixant la taille de ce qui se dessine à l'intérieur.",
    },
    shapes: {
      title: 'Formes',
      text: "Carré, portant le rayon de coin que partagent tous les contrôles, ou circulaire. La boîte est carrée dans les deux cas et seuls les coins changent, d'où une prop qui nomme la silhouette plutôt qu'un rayon : une valeur appelée « arrondi » cesserait d'être vraie le jour où un consommateur met ce rayon à zéro, là où « carré » ne devient que plus vrai. Elle vit ici et non sur VButton, un rayon plein ne disant quelque chose que d'une boîte déjà carrée. Dans un VButtonGroup, les règles de coin de la rangée l'emportent et un segment circulaire garde des coutures carrées, ce qui est justement ce qui fait lire la rangée comme un seul objet.",
    },
    icons: {
      title: 'Icônes',
      text: "La prop <code>icon</code> accepte tout ce qu'accepte une prop d'icône de la bibliothèque : une de ses propres icônes, un simple nom pour votre résolveur, ou un rendu explicite. <code>iconFilled</code> demande la forme pleine, qui sert à marquer un état. Le slot par défaut est la voie vers une icône que la prop ne sait pas exprimer, un VIcon que vous paramétrez vous-même ou un SVG en ligne, et ce qui s'y trouve reste décoratif : le bouton est déjà nommé par son libellé.",
    },
    link: {
      title: 'En tant que lien',
      text: "<code>href</code> n'est pas une prop de ce composant. Il retombe sur le VButton en dessous, qui rend une ancre au lieu d'un bouton, et tout autre attribut d'ancre voyage de la même façon. Un lien désactivé garde sa place et perd sa destination : le href est retiré et les clics sont écartés, rien en HTML ne désactivant une ancre.",
    },
    states: {
      title: 'États',
      text: "L'état désactivé est grisé par les jetons de couleur plutôt que par une opacité, si bien que le bouton garde sa forme sur n'importe quel fond. Le chargement met un spinner à la place de l'icône et désactive le bouton le temps qu'il tourne, ce qui empêche de demander deux fois la même action. Le spinner prend la boîte de l'icône, de sorte que le carré ne change pas de taille en apparaissant.",
    },
  },

  api: {
    VIconButton: {
      props: {
        label:
          "Ce que fait le bouton, en mots. Cela devient l'<code>aria-label</code> et c'est la seule chose dont dispose un lecteur d'écran : nommez donc l'action, « Fermer », « Mois suivant », plutôt que l'image.",
        variant:
          "Le poids visuel que porte le bouton, sur l'échelle de VButton. Dans un VButtonGroup, c'est le groupe qui en décide.",
        tone: "Ce que l'action signifie, en couleur. Un bouton réduit à une icône relève le plus souvent du décor, et c'est pourquoi il part en neutre là où VButton part en accent. Omis dans un VButtonGroup, il prend celui du groupe.",
        elevated:
          'Soulève le bouton avec une ombre, et une surface surélevée sur ghost et outline.',
        size: "La taille du carré, tirée de l'échelle partagée par tous les contrôles.",
        compact: 'Retire 4px des deux côtés du carré, qui reste carré.',
        shape:
          'La silhouette : un carré portant le rayon de coin commun à tous les contrôles, ou un cercle. La boîte reste carrée dans les deux cas, seuls les coins changent.',
        type: 'Le type natif du bouton. Il est ignoré dès que <code>href</code> en fait un lien.',
        disabled: 'Rend le bouton inutilisable, grisé par les tokens de couleur.',
        loading: "Remplace l'icône par un indicateur et désactive le bouton pendant qu'il tourne.",
        icon: "L'icône à afficher. Le slot par défaut est la voie pour en fournir une que cette prop ne peut pas exprimer.",
        iconFilled: "Rend l'icône dans sa forme pleine, l'axe <code>FILL</code> de la police.",
      },
      slots: {
        default:
          "L'icône, quand la prop <code>icon</code> ne peut pas l'exprimer : un VIcon, ou un SVG en ligne marqué <code>aria-hidden</code>, le bouton étant déjà nommé par son libellé.",
      },
    },
  },
}
