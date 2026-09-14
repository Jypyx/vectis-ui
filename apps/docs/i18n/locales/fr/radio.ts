export default {
  title: 'Bouton radio',
  lead: "Un choix parmi plusieurs. Le groupe est natif : tous les boutons partageant un <code>name</code> lui appartiennent, et le navigateur se charge de l'exclusivité et des flèches.",

  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: "<code>labelPosition</code> place le libellé avant le point plutôt qu'après.",
    },
    spread: {
      title: 'Écartement',
      text: '<code>spread</code> prend toute la largeur offerte et pousse le libellé et le point aux deux extrémités de la ligne.',
    },
    disabled: {
      title: 'Désactivé',
      text: '<code>disabled</code> empêche de choisir le bouton et le grise par les tokens de couleur. Un bouton à la fois sélectionné et désactivé garde son point.',
    },
    hint: {
      title: 'Aide',
      text: "<code>label</code> écrit le texte à côté du point, et le slot par défaut le remplace. <code>hint</code> ajoute une légende en dessous, reliée au bouton par <code>aria-describedby</code> : c'est l'endroit où dire ce qu'une option implique.",
    },
    readonly: {
      title: 'Lecture seule',
      text: '<code>readonly</code>, posé sur chaque bouton du groupe, laisse la sélection où elle est. Le composant annule le clic, et les flèches sont couvertes aussi, puisque le navigateur sélectionne le bouton suivant par un clic : le focus se déplace, la sélection non.',
    },
  },

  api: {
    VRadio: {
      props: {
        label: 'Le texte à côté du point, qui le nomme. Le slot par défaut le remplace.',
        hint: "Une ligne d'aide sous le libellé. Elle est reliée au bouton pour les technologies d'assistance, qui la lisent après le libellé et non comme une partie de celui-ci.",
        readonly:
          "Montre la sélection sans permettre de la changer. Le bouton reste focalisable et s'envoie toujours avec son formulaire ; un clic ou une flèche ne sélectionnent simplement rien. À poser sur chaque bouton du groupe.",
        value:
          "Ce que signifie le choix de ce bouton. Le v-model du groupe porte la valeur du bouton sélectionné : c'est donc ce qu'il devient quand celui-ci est choisi.",
        labelPosition: 'De quel côté du point se place le libellé.',
        spread:
          'Pousse le libellé et le point aux extrémités opposées de la ligne, qui prend toute la largeur disponible.',
        invalid:
          "Marque le champ comme invalide, ce qui colore le point et le signale aux technologies d'assistance. C'est pour une règle que le navigateur ne sait pas vérifier seul.",
        disabled: 'Rend ce choix inutilisable, grisé par les tokens de couleur.',
        vModel:
          "La valeur sélectionnée dans le groupe, partagée par tous les boutons portant le même <code>name</code>. Elle est vide tant que rien n'est choisi, et un bouton est sélectionné quand elle correspond à sa propre <code>value</code>.",
      },
      slots: {
        default:
          'Le libellé, quand il demande plus que le texte de la prop <code>label</code>. Il est cliquable.',
      },
    },
  },
}
