export default {
  title: 'Indicateur de chargement',
  lead: "Un anneau qui tourne pour dire qu'il se passe quelque chose. Il occupe la boîte d'une icône et en peint la quantité d'encre, si bien qu'il se glisse dans un bouton ou une ligne de texte à la place d'un glyphe.",

  examples: {
    sizes: {
      title: 'Tailles',
      text: "<code>size</code> est un nombre de pixels, et il nomme la boîte qu'occupe l'indicateur et non le diamètre de l'anneau. Sans lui, la boîte mesure 1em et suit le texte environnant.",
    },
    colour: {
      title: 'Couleur',
      text: "Il n'y a pas de prop de couleur : l'anneau est peint en <code>currentcolor</code>, il prend donc la couleur du texte où il se trouve.",
    },
    icon: {
      title: "À la place d'une icône",
      text: "La boîte est celle d'une icône : un VIcon et un VSpinner de même taille sont donc interchangeables. C'est ce qui permet à VButton, VInput, VTextarea et VCombobox d'en dessiner un à la taille du glyphe qu'il remplace.",
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
