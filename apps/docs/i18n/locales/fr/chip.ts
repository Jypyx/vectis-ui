export default {
  title: 'Puce',
  lead: "Une petite information : un statut, une étiquette, un filtre qui reste choisi. Elle partage mot pour mot sa table de variantes et de tons avec VButton, et ajoute les deux états qu'un bouton n'a pas.",

  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: "Trois variantes sur chaque ligne, cinq tonalités en colonne. Les variantes sont celles que partage chaque composant coloré de la bibliothèque : <code>soft</code> teinte le fond, <code>solid</code> le remplit, <code>outline</code> ne garde qu'une bordure. Les tonalités vont deux crans plus loin que celles d'un bouton, parce qu'une puce rapporte un état là où un bouton exprime une intention, et que <code>success</code> et <code>warning</code> sont des états.",
    },
    shapes: {
      title: 'Silhouettes',
      text: "Deux silhouettes. <code>chip</code>, la valeur par défaut, reprend le rayon d'angle de tous les contrôles interactifs de la bibliothèque : la puce se pose donc dans un formulaire à côté d'un bouton et d'un champ sans se démarquer. <code>pill</code> arrondit complètement les extrémités, ce qui se lit mieux là où les puces sont le contenu plutôt qu'une partie d'un contrôle : une ligne d'étiquettes, un jeu de filtres, une liste de catégories.",
    },
    sizes: {
      title: 'Tailles',
      text: "Deux hauteurs, 24 et 32 pixels, le bas de l'échelle que partage chaque contrôle de la bibliothèque. La seconde ligne est la même paire sous <code>compact</code> : 4px partent de la hauteur et rien d'autre ne bouge, si bien qu'une puce continue de s'aligner sur le texte qui la borde. Un champ qui rend ses propres puces, un combobox multiple ou un champ de fichiers, choisit déjà le cran juste en dessous du sien et n'a besoin de rien de tout cela.",
    },
    customColors: {
      title: 'Couleurs personnalisées',
      text: "Une <code>color</code> remplace la tonalité. Toutes les nuances dont la puce a besoin sont dérivées de cette seule valeur : le fond teinté, la bordure, le texte et le survol la suivent, dans le thème clair comme dans le sombre, sans rien à reconstruire. Elle accepte n'importe quelle couleur CSS, ce qui permet à une puce de porter une couleur venue de vos données : un projet, une étiquette, un agenda. La seule chose à vérifier vous-même est le contraste du texte sur une puce <code>solid</code>.",
    },
    icons: {
      title: 'Avec des icônes',
      text: "<code>iconStart</code> et <code>iconEnd</code> acceptent les mêmes valeurs que toutes les props d'icône de la bibliothèque, et les slots <code>#start</code> et <code>#end</code> les remplacent quand le contenu n'est pas une icône du tout, une pastille d'état par exemple. Retirez complètement le libellé et la puce devient carrée ; il faut alors lui donner un nom, puisqu'il ne reste qu'une icône, sans rien à lire.",
    },
    clickable: {
      title: 'Cliquable et liens',
      text: "Une puce rend l'élément que sa fonction réclame. Sans rien, c'est du texte, sans survol et sans rien à focaliser. <code>clickable</code> en fait un vrai bouton, et <code>href</code> un vrai lien : le clavier, l'anneau de focus et le menu contextuel du navigateur viennent donc de la plateforme et non d'un gestionnaire de clic posé sur un span.",
    },
    selection: {
      title: 'Sélection',
      text: "<code>selectable</code> fait de la puce un bouton à deux états lié à <code>v-model:selected</code>, et la sélectionner la peint comme le rendu <code>solid</code> de sa tonalité. Ce changement de couleur est tout le signal de la première ligne. Ajoutez <code>check</code> et une coche apparaît en plus devant le libellé, ce qui vaut la peine partout où les tonalités sont proches ou la ligne longue. La coche remplace l'icône de début au lieu de s'y ajouter, si bien que la largeur ne saute pas au moment de la sélection.",
    },
    dismissible: {
      title: 'Suppression',
      text: "<code>dismissible</code> ajoute un second bouton à côté du premier, jamais à l'intérieur, et l'activer émet <code>dismiss</code>. La puce est toujours là ensuite : la retirer de la liste est la décision prise ci-dessous, ce qui permet au même évènement d'archiver, de demander une confirmation ou de proposer une annulation. <code>dismissIcon</code> et <code>dismissLabel</code> changent le glyphe et les mots qu'il annonce.",
    },
    states: {
      title: 'États',
      text: "Une puce désactivée grise par les jetons de couleur plutôt que par une opacité : elle garde donc son contraste sur toutes les surfaces. Cela vaut quel que soit l'élément rendu, et le lien est le cas à connaître : HTML n'a pas de <code>disabled</code> pour un lien, donc l'adresse est retirée, ce qui le rend ni focalisable ni suivable au lieu de simplement grisé.",
    },
  },

  api: {
    VChip: {
      props: {
        variant:
          "L'intensité avec laquelle la puce est peinte : un fond teinté, la couleur pleine, ou une bordure seule.",
        tone: "Ce que la puce signifie, exprimé en couleur. Une puce peut rapporter un état là où un bouton ne le peut pas, et c'est pourquoi elle en propose cinq plutôt que trois.",
        color:
          "Une couleur à vous, en hexadécimal, en nom CSS ou en <code>oklch()</code>, qui remplace le ton. Toutes les nuances nécessaires sont dérivées de cette seule couleur, si bien qu'elle suit les deux thèmes sans rien à reconstruire. Seul le contraste du texte sur une puce en couleur pleine reste à votre charge.",
        shape: 'La silhouette : des coins doucement arrondis, ou une pilule complète.',
        size: 'La hauteur de la puce.',
        compact:
          'Retire 4px à la hauteur, en laissant le rembourrage, le texte et les icônes tels quels.',
        clickable: "Fait de la puce un bouton qui réagit au clic, sans retenir d'état.",
        href: 'Où la puce mène, ce qui en fait un lien.',
        selectable:
          "Fait de la puce quelque chose qui reste choisi. Cela l'emporte sur <code>href</code> et <code>clickable</code>.",
        check:
          "Affiche une coche avant le libellé tant que la puce est sélectionnée. Elle remplace l'icône de début qui aurait été donnée, si bien que les deux ne sont jamais montrées ensemble.",
        iconStart: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        iconEnd: 'Une icône après le libellé. Le slot <code>#end</code> la remplace.',
        dismissible:
          "Ajoute un bouton qui demande le retrait de la puce. Il ne fait qu'émettre cette demande : retirer la puce est votre décision.",
        dismissIcon: "L'icône de ce bouton de retrait.",
        dismissLabel:
          'Ce que fait le bouton de retrait, en mots. Il retombe sur le dictionnaire du design system.',
        disabled: 'Rend la puce inutilisable, grisée par les tokens de couleur.',
        vModelSelected:
          "Si la puce est sélectionnée, ce qui est aussi ce qui la rend sélectionnable : la lier transforme la puce en bouton bascule et l'emporte sur <code>href</code> et <code>clickable</code>.",
      },
      events: {
        dismiss:
          "Le bouton de retrait a été pressé. La puce est toujours à l'écran : la retirer vous revient.",
      },
      slots: {
        default:
          "Le libellé. Il peut être omis entièrement, ce qui donne une puce faite d'icônes seules.",
        start: 'Du contenu avant le libellé, qui prend la place de <code>iconStart</code>.',
        end: 'Du contenu après le libellé, qui prend la place de <code>iconEnd</code>.',
      },
    },
  },
}
