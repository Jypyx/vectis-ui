export default {
  title: 'Indicateur de chargement',
  lead: "Un anneau qui tourne pour dire qu'il se passe quelque chose. Il occupe la boîte d'une icône et en peint la quantité d'encre, si bien qu'il se glisse dans un bouton ou une ligne de texte à la place d'un glyphe.",

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
