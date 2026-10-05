export default {
  title: 'Case à cocher',
  lead: 'Utilisez <code>VCheckbox</code> pour des choix indépendants ou une confirmation, comme l’acceptation de conditions.',
  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: '<code>labelPosition="start"</code> place le libellé avant la case.',
    },
    spread: {
      title: 'Pleine largeur',
      text: '<code>spread</code> occupe la largeur disponible et place le libellé et la case aux extrémités opposées.',
    },
    indeterminate: {
      title: 'Indéterminé',
      text: '<code>indeterminate</code> signale une sélection partielle, par exemple lorsque seuls certains éléments d’une liste sont cochés. Il ne modifie pas le <code>v-model</code> booléen.',
    },
    disabled: {
      title: 'Désactivé',
      text: '<code>disabled</code> empêche les changements et retire la case de la navigation par Tab et de l’envoi du formulaire.',
    },
    hint: {
      title: 'Aide',
      text: 'Utilisez <code>label</code> ou le slot par défaut pour nommer la case. <code>hint</code> ajoute un texte d’aide lié par <code>aria-describedby</code>.',
    },
    readonly: {
      title: 'Lecture seule',
      text: '<code>readonly</code> empêche les changements par clic ou Espace tout en conservant le focus et le comportement natif du formulaire. Une case en lecture seule non cochée avec <code>required</code> reste invalide pour la validation native du formulaire.',
    },
  },
  api: {
    VCheckbox: {
      props: {
        label:
          'Libellé visible, remplacé par le slot par défaut. Sans l’un ni l’autre, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide sous le libellé, lié par <code>aria-describedby</code>.',
        readonly:
          'Empêche les changements et conserve la possibilité de recevoir le focus. Définit <code>aria-readonly</code> ; l’envoi et la validation natifs du formulaire restent applicables.',
        indeterminate:
          'Affiche une sélection partielle. Indépendant du <code>v-model</code>, qui reste booléen.',
        labelPosition:
          'Libellé avant la case avec <code>start</code>, ou après avec <code>end</code>.',
        spread: 'Occupe la largeur disponible et sépare le libellé de la case.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        disabled: 'Désactive la case et l’exclut du focus et de l’envoi du formulaire.',
        vModel:
          'État coché, booléen valant <code>false</code> par défaut. Utilisez les attributs natifs <code>name</code> et <code>value</code> pour l’envoi du formulaire.',
      },
      slots: {
        default: 'Contenu cliquable du libellé, remplaçant <code>label</code>.',
      },
    },
  },
}
