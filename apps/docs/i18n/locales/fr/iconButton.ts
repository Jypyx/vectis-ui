export default {
  title: 'Bouton icône',
  lead: "Un bouton carré portant une icône et aucun libellé. C'est VButton en dessous, avec deux valeurs par défaut à lui et un nom obligatoire, puisque l'image est tout ce qu'un lecteur d'écran aurait sinon.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: 'Les mêmes quatre <code>variant</code> et trois <code>tone</code> que VButton, avec deux valeurs par défaut à lui : <code>ghost</code> plutôt que <code>solid</code>, et <code>neutral</code> plutôt que <code>accent</code>.',
    },
    elevated: {
      title: 'Surélevé',
      text: "<code>elevated</code> applique l'échelle d'ombres à la variante en cours. Les variantes ghost et outline gagnent en plus une surface surélevée.",
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la boîte, carrée à chacun des cinq paliers de 24 à 56 pixels. <code>compact</code> retire 4px des deux côtés, si bien que la boîte reste carrée.',
    },
    shapes: {
      title: 'Formes',
      text: "<code>shape</code> choisit la silhouette, carrée ou circulaire. Dans un VButtonGroup, les règles d'angles de la rangée l'emportent et un segment circulaire garde des jonctions droites.",
    },
    icons: {
      title: 'Icônes',
      text: "<code>icon</code> accepte toute valeur d'icône et <code>iconFilled</code> en demande la forme pleine. Le slot par défaut est la voie vers une icône que la prop ne peut pas exprimer, et reste décoratif : le bouton est nommé par son <code>label</code>.",
    },
    link: {
      title: 'En tant que lien',
      text: "<code>href</code> traverse jusqu'au VButton sous-jacent, qui rend une ancre. Un lien désactivé garde sa place et perd sa destination.",
    },
    states: {
      title: 'États',
      text: "<code>disabled</code> grise le bouton par les tokens de couleur. <code>loading</code> place un indicateur dans la boîte de l'icône et désactive le bouton pendant qu'il tourne.",
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
