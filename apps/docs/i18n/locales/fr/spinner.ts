export default {
  title: 'Indicateur de chargement',
  lead: "Un anneau qui tourne pour dire qu'il se passe quelque chose. Il occupe la boîte d'une icône et en peint la quantité d'encre, si bien qu'il se glisse dans un bouton ou une ligne de texte à la place d'un glyphe.",

  examples: {
    sizes: {
      title: 'Tailles',
      text: "Sans rien préciser, la boîte mesure 1em : le spinner suit donc le texte qui l'entoure, et un conteneur qui pose une taille de police le dimensionne sans qu'on ait rien à lui dire, ce qui est la façon dont il reste proportionné dans un bouton quelle que soit la taille de ce bouton. <code>size</code> est un nombre de pixels pour les cas qui en demandent un, et ce qu'il nomme est la BOÎTE occupée par le spinner plutôt que le diamètre de l'anneau, dessiné un peu plus petit à l'intérieur.",
    },
    colour: {
      title: 'Couleur',
      text: "Il n'y a pas de prop de couleur. L'anneau est peint en <code>currentcolor</code> : il prend donc la couleur du texte où il se trouve, et poser <code>color</code> sur le spinner ou sur n'importe quoi au-dessus suffit à le faire suivre. C'est aussi ce qui le fait sortir juste sur un bouton plein sans que personne ait eu à le dire.",
    },
    icon: {
      title: "À la place d'une icône",
      text: "Un spinner remplace presque toujours une icône : il est donc construit aux mêmes mesures, sa boîte étant une boîte d'icône et l'encre qu'il y pose occupant la même fraction de cette boîte qu'un glyphe Material Symbols. Un VIcon et un VSpinner de même taille sont ainsi interchangeables, boîte pour boîte, et échanger l'un contre l'autre ne déplace rien sur la ligne. C'est aussi ce qui permet à un contrôle de dessiner le sien : VButton, VInput, VTextarea et VCombobox posent la taille d'icône et obtiennent un spinner de la taille du glyphe qu'il remplace, sans aucun rapport à eux à tenir accordé.",
    },
  },

  api: {
    VSpinner: {
      props: {
        size: "Une taille en pixels, comprise exactement comme celle de VIcon : c'est la BOÎTE qu'occupe l'indicateur, pas le diamètre de l'anneau, dessiné un peu plus petit à l'intérieur. Sans elle, la boîte mesure 1em et suit la taille du texte alentour, ce qui garde l'indicateur proportionné dans un bouton sans rien avoir à lui dire.",
        label:
          "Ce que les lecteurs d'écran annoncent pendant qu'il tourne. Il retombe sur le dictionnaire du design system, dans la langue courante.",
      },
    },
  },
}
