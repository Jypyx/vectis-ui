export default {
  title: 'Bouton radio',
  lead: '<code>VRadio</code> sélectionne une valeur parmi plusieurs options. Partagez le même <code>name</code> et le même <code>v-model</code> dans le groupe pour la sélection native et la navigation par flèches.',
  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: '<code>labelPosition="start"</code> place le libellé avant le bouton radio.',
    },
    spread: {
      title: 'Pleine largeur',
      text: '<code>spread</code> occupe la largeur disponible et place le libellé et le bouton radio aux extrémités opposées.',
    },
    disabled: {
      title: 'Désactivé',
      text: '<code>disabled</code> empêche la sélection et retire l’option de la navigation clavier et de l’envoi du formulaire.',
    },
    hint: {
      title: 'Aide',
      text: 'Utilisez <code>label</code> ou le slot par défaut pour nommer l’option. <code>hint</code> ajoute un texte d’aide lié par <code>aria-describedby</code>.',
    },
    readonly: {
      title: 'Lecture seule',
      text: 'Définissez <code>readonly</code> sur chaque option pour conserver la sélection pendant que les flèches déplacent le focus. Utilisez un conteneur nommé avec <code>role="radiogroup"</code> et <code>aria-readonly="true"</code> pour annoncer cet état. Un groupe en lecture seule avec <code>required</code> et sans sélection reste invalide pour la validation native du formulaire.',
    },
  },
  api: {
    VRadio: {
      props: {
        label:
          'Libellé visible, remplacé par le slot par défaut. Sans l’un ni l’autre, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide sous le libellé, lié par <code>aria-describedby</code>.',
        readonly:
          'Empêche les changements de sélection tout en conservant le focus et le comportement natif du formulaire. À définir sur chaque option. Annoncez la lecture seule sur le conteneur du groupe.',
        value:
          'Chaîne ou nombre affecté au <code>v-model</code> lors de la sélection. Utilisez une valeur distincte par option.',
        labelPosition:
          'Libellé avant le bouton radio avec <code>start</code>, ou après avec <code>end</code>.',
        spread: 'Occupe la largeur disponible et sépare le libellé du bouton radio.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        disabled:
          'Désactive cette option et l’exclut de la navigation clavier et de l’envoi du formulaire.',
        vModel:
          'Valeur sélectionnée, partagée par le groupe. Une option est sélectionnée si le modèle correspond à son <code>value</code>. Vaut une chaîne vide par défaut.',
      },
      slots: {
        default: 'Contenu cliquable du libellé, remplaçant <code>label</code>.',
      },
    },
  },
}
