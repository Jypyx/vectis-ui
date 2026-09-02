export default {
  title: 'Interrupteur',
  lead: "Un réglage qui prend effet immédiatement. Il est annoncé avec <code>role=\"switch\"</code>, si bien qu'un lecteur d'écran dit activé ou désactivé plutôt que coché, et c'est toute la raison pour laquelle ce n'est pas une case à cocher.",

  choiceHeading: 'Interrupteur ou case à cocher',
  choiceBody:
    "Un interrupteur agit sur-le-champ ; une case à cocher énonce une intention qu'un envoi exécutera. Si le changement demande un bouton Enregistrer, c'est une case à cocher.",
  spread:
    "<code>spread</code> pousse le libellé et l'interrupteur aux extrémités opposées. C'est la forme habituelle d'une liste de réglages, où les interrupteurs s'alignent alors le long d'un bord.",

  api: {
    VSwitch: {
      props: {
        labelPosition: "De quel côté de l'interrupteur se place le libellé.",
        spread:
          "Pousse le libellé et l'interrupteur aux extrémités opposées de la ligne, si bien qu'une colonne de réglages aligne ses interrupteurs le long d'un bord.",
        disabled:
          "Rend l'interrupteur inutilisable. Il se grise par les tokens de couleur plutôt que par l'opacité, ce qui le garde lisible sur n'importe quelle surface.",
        vModel:
          "Si l'interrupteur est activé. La valeur est liée à un vrai <code>&lt;input type=\"checkbox\"&gt;</code> masqué, donc elle s'envoie avec le formulaire comme n'importe quel autre champ.",
      },
      slots: {
        default:
          "Le libellé. C'est un slot plutôt qu'une prop pour qu'il puisse contenir un lien ou une emphase, et il se trouve à l'intérieur du <code>&lt;label&gt;</code> englobant, donc cliquer les mots bascule l'interrupteur.",
      },
    },
  },
}
