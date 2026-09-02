export default {
  title: 'Bouton radio',
  lead: "Un choix parmi plusieurs. Le groupe est natif : tous les boutons partageant un <code>name</code> lui appartiennent, et le navigateur se charge de l'exclusivité et des flèches.",

  api: {
    VRadio: {
      props: {
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
          'Le libellé. Il est cliquable, tout le composant étant enveloppé dans un <code>&lt;label&gt;</code>.',
      },
    },
  },
}
