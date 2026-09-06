export default {
  title: 'Interrupteur',
  lead: "Un réglage qui prend effet immédiatement. Il est annoncé avec <code>role=\"switch\"</code>, si bien qu'un lecteur d'écran dit activé ou désactivé plutôt que coché, et c'est toute la raison pour laquelle ce n'est pas une case à cocher.",

  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: "Le libellé se place après l'interrupteur par défaut. <code>labelPosition</code> le fait passer avant, ce que réclame en général une ligne de réglages : les mots d'un côté, la commande de l'autre. Tout le composant est un seul <code>&lt;label&gt;</code>, donc le texte bascule l'interrupteur dans les deux cas, et l'input masqué est sorti du flux : inverser la ligne ne fait jamais qu'échanger la piste et les mots.",
    },
    spread: {
      title: 'Écartement',
      text: "Un panneau de réglages place le libellé à une extrémité de la ligne et la commande à l'autre, si bien qu'une colonne d'interrupteurs s'aligne le long d'un bord quelle que soit la longueur de chaque libellé. <code>spread</code> est ce qui produit cela : la ligne prend toute la largeur qu'on lui offre et écarte les deux, ce qui laisse la distance au conteneur. <code>labelPosition</code> décide toujours de l'extrémité où chacun se rend.",
    },
    disabled: {
      title: 'Désactivé',
      text: "Un interrupteur désactivé ne peut plus être basculé et le clavier l'enjambe, aussi bien activé que désactivé : l'état reste lisible, car ce que vaut un réglage compte même lorsqu'on ne peut pas le changer. Il se grise par les tokens de couleur plutôt que par une opacité, donc le libellé garde son contraste sur n'importe quelle surface. Utilisez-le quand un réglage existe mais n'est pas encore disponible ; un réglage qui ne s'applique jamais est mieux absent du panneau.",
    },
  },

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
