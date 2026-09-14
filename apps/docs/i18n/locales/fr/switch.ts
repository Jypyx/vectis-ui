export default {
  title: 'Interrupteur',
  lead: "Un réglage qui prend effet immédiatement. Il est annoncé avec <code>role=\"switch\"</code>, si bien qu'un lecteur d'écran dit activé ou désactivé plutôt que coché, et c'est toute la raison pour laquelle ce n'est pas une case à cocher.",

  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: "<code>labelPosition</code> place le libellé avant l'interrupteur plutôt qu'après.",
    },
    spread: {
      title: 'Écartement',
      text: "<code>spread</code> prend toute la largeur offerte et pousse le libellé et l'interrupteur aux deux extrémités de la ligne.",
    },
    disabled: {
      title: 'Désactivé',
      text: "<code>disabled</code> empêche de basculer l'interrupteur et le grise par les tokens de couleur, allumé comme éteint. Le clavier l'enjambe.",
    },
    hint: {
      title: 'Aide',
      text: "<code>label</code> écrit le texte à côté de l'interrupteur, et le slot par défaut le remplace. <code>hint</code> ajoute une légende en dessous, reliée à l'interrupteur par <code>aria-describedby</code> : c'est là qu'un réglage dit ce que l'activer change.",
    },
    readonly: {
      title: 'Lecture seule',
      text: "<code>readonly</code> montre le réglage sans permettre de le changer : un clic ou la barre d'espace sont annulés. L'interrupteur reste focalisable, s'envoie avec son formulaire et est annoncé en lecture seule.",
    },
  },

  api: {
    VSwitch: {
      props: {
        label: "Le texte à côté de l'interrupteur, qui le nomme. Le slot par défaut le remplace.",
        hint: "Une ligne d'aide sous le libellé. Elle est reliée à l'interrupteur pour les technologies d'assistance, qui la lisent après le libellé et non comme une partie de celui-ci.",
        readonly:
          "Montre le réglage sans permettre de le changer. L'interrupteur reste focalisable, est annoncé en lecture seule et s'envoie toujours avec son formulaire ; un clic ou la barre d'espace ne changent simplement rien.",
        labelPosition: "De quel côté de l'interrupteur se place le libellé.",
        spread:
          "Pousse le libellé et l'interrupteur aux extrémités opposées de la ligne, si bien qu'une colonne de réglages aligne ses interrupteurs le long d'un bord.",
        disabled:
          "Rend l'interrupteur inutilisable. Il se grise par les tokens de couleur plutôt que par l'opacité, ce qui le garde lisible sur n'importe quelle surface.",
        invalid:
          "Marque le champ comme invalide, ce qui cercle la piste et le signale aux technologies d'assistance. À utiliser pour une règle que le navigateur ne sait pas vérifier ; la validité native est déjà prise en charge sans ça.",
        vModel:
          "Si l'interrupteur est activé. La valeur est liée à un vrai <code>&lt;input type=\"checkbox\"&gt;</code> masqué, donc elle s'envoie avec le formulaire comme n'importe quel autre champ.",
      },
      slots: {
        default:
          "Le libellé, quand il demande plus que le texte de la prop <code>label</code>, un lien ou une emphase. Il se trouve à l'intérieur du <code>&lt;label&gt;</code>, donc cliquer les mots bascule l'interrupteur.",
      },
    },
  },
}
