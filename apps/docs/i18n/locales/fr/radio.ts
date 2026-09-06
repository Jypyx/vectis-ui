export default {
  title: 'Bouton radio',
  lead: "Un choix parmi plusieurs. Le groupe est natif : tous les boutons partageant un <code>name</code> lui appartiennent, et le navigateur se charge de l'exclusivité et des flèches.",

  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: "Le libellé se place après le point par défaut, l'ordre de lecture qu'on attend d'un formulaire. <code>labelPosition</code> le fait passer avant, pour une colonne dont les libellés s'alignent à gauche. Tout le composant est un seul <code>&lt;label&gt;</code>, donc le texte est cliquable dans les deux cas, et le bouton natif est sorti du flux : inverser la ligne ne fait jamais qu'échanger le point et le texte. Les deux lignes ci-dessous diffèrent pour que les deux positions se comparent ; un vrai groupe en choisit une et la garde pour tous ses boutons.",
    },
    spread: {
      title: 'Écartement',
      text: "Un panneau de réglages place son libellé d'un côté de la ligne et son contrôle de l'autre. <code>spread</code> fait exactement cela : la ligne prend toute la largeur qu'on lui offre et écarte les deux, si bien que c'est le conteneur qui décide de la distance. Combiné à <code>labelPosition</code>, il décide aussi de l'extrémité où chacun se rend.",
    },
    disabled: {
      title: 'Désactivé',
      text: "Un bouton désactivé ne peut plus être choisi, et il grise par les tokens de couleur plutôt que par une opacité : le libellé garde donc son contraste. L'exclusivité et les flèches appartiennent au navigateur, qui enjambe un bouton désactivé de lui-même, sans rien ici pour l'y aider. Un bouton à la fois sélectionné et désactivé conserve son point : c'est ainsi que se lit un choix déjà fait mais qui n'est plus proposé, et il reste dans le groupe au lieu d'en disparaître.",
    },
  },

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
