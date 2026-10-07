export default {
  title: 'Interrupteur',
  lead: 'Utilisez <code>VSwitch</code> pour un réglage activé ou désactivé dont l’effet est immédiat. Il expose <code>role="switch"</code> aux technologies d’assistance.',
  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: '<code>labelPosition="start"</code> place le libellé avant l’interrupteur.',
    },
    spread: {
      title: 'Pleine largeur',
      text: '<code>spread</code> occupe la largeur disponible et place le libellé et l’interrupteur aux extrémités opposées.',
    },
    disabled: {
      title: 'Désactivé',
      text: '<code>disabled</code> empêche les changements et retire l’interrupteur de la navigation par Tab et de l’envoi du formulaire.',
    },
    hint: {
      title: 'Aide',
      text: 'Utilisez <code>label</code> ou le slot par défaut pour nommer le réglage. <code>hint</code> ajoute un texte d’aide lié par <code>aria-describedby</code>.',
    },
    readonly: {
      title: 'Lecture seule',
      text: '<code>readonly</code> empêche les changements par clic ou Espace tout en conservant le focus et le comportement natif du formulaire. Il définit <code>aria-readonly</code>.',
    },
  },
  api: {
    VSwitch: {
      props: {
        label:
          'Libellé visible, remplacé par le slot par défaut. Sans l’un ni l’autre, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide sous le libellé, lié par <code>aria-describedby</code>.',
        readonly:
          'Empêche les changements et conserve la possibilité de recevoir le focus. Définit <code>aria-readonly</code> ; l’envoi et la validation natifs du formulaire restent applicables.',
        labelPosition:
          'Libellé avant l’interrupteur avec <code>start</code>, ou après avec <code>end</code>.',
        spread: 'Occupe la largeur disponible et sépare le libellé de l’interrupteur.',
        disabled: 'Désactive l’interrupteur et l’exclut du focus et de l’envoi du formulaire.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        vModel:
          'État activé ou désactivé, booléen valant <code>false</code> par défaut. Utilisez les attributs natifs <code>name</code> et <code>value</code> pour l’envoi du formulaire.',
      },
      slots: {
        default: 'Contenu cliquable du libellé, remplaçant <code>label</code>.',
      },
    },
  },
}
