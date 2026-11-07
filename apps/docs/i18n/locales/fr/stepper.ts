export default {
  title: 'Étapes',
  lead: '<code>VStepper</code> montre les étapes d’un processus et où en est le lecteur. Affichez vous-même le contenu de chaque étape à partir du même <code>v-model</code>.',
  examples: {
    states: {
      title: 'États',
      text: 'Les étapes avant l’étape courante sont terminées et celles d’après à venir. <code>completed</code> remplace cette règle pour une étape, <code>error</code> l’emporte sur tous les états et <code>disabled</code> met une étape hors d’atteinte.',
    },
    nonLinear: {
      title: 'Non linéaire',
      text: 'Par défaut, seules les étapes déjà atteintes sont des boutons. <code>nonLinear</code> en fait des boutons pour toutes ; indiquez <code>completed</code> sur les étapes terminées.',
    },
    textPosition: {
      title: 'Texte sous les cercles',
      text: '<code>textPosition="bottom"</code> centre le titre et la description sous chaque cercle. Les étapes se partagent alors la largeur à parts égales.',
    },
    vertical: {
      title: 'Verticale',
      text: '<code>orientation="vertical"</code> dispose les étapes en colonne, pour une barre latérale. Sous 36rem, un stepper horizontal ne garde à l’écran que le titre de l’étape courante, et <code>hideText</code> ne garde que les cercles.',
    },
  },
  api: {
    VStepper: {
      props: {
        steps:
          'Étapes dans l’ordre : <code>value</code>, <code>title</code>, et en option <code>description</code>, <code>icon</code>, <code>error</code>, <code>completed</code> et <code>disabled</code>.',
        orientation: 'Sens de disposition.',
        nonLinear:
          'Fait de chaque étape non désactivée un bouton. Par défaut, seules les étapes déjà atteintes le sont.',
        textPosition:
          'Position du titre et de la description : à côté du cercle, ou centrés dessous. Stepper horizontal uniquement.',
        hideText:
          'Ne garde que les cercles à l’écran. Titres et descriptions restent lus par les technologies d’assistance.',
        label:
          'Nom accessible de la liste d’étapes. Par défaut, celui du dictionnaire de la bibliothèque.',
        vModel: 'Valeur de l’étape courante. Sans elle, la première étape est courante.',
      },
      slots: {
        indicator:
          'Contenu du cercle d’une étape. Reçoit <code>step</code>, <code>index</code> et <code>state</code>.',
      },
    },
  },
}
