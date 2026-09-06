export default {
  title: 'Case à cocher',
  lead: "Un choix qu'un envoi exécutera, à la différence d'un interrupteur, qui agit sur-le-champ. Elle enveloppe un vrai <code>&lt;input type=\"checkbox\"&gt;</code>, donc elle s'envoie avec le formulaire.",

  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: "Le libellé se place après la case par défaut, l'ordre de lecture qu'on attend d'un formulaire. <code>labelPosition</code> le fait passer avant, pour une colonne dont les libellés s'alignent à gauche. Tout le composant est un seul <code>&lt;label&gt;</code>, donc le texte est cliquable dans les deux cas, et la case native est sortie du flux : inverser la ligne ne fait jamais qu'échanger la case et le texte.",
    },
    spread: {
      title: 'Écartement',
      text: "Une liste de réglages place son libellé d'un côté de la ligne et sa case de l'autre. <code>spread</code> fait exactement cela : la ligne prend toute la largeur qu'on lui offre et écarte les deux, si bien que c'est le conteneur qui décide de la distance. Combiné à <code>labelPosition</code>, il décide aussi de l'extrémité où chacun se rend.",
    },
    indeterminate: {
      title: 'Indéterminé',
      text: "Un parent dont les enfants ne sont ni tous cochés ni tous décochés affiche un tiret. C'est une troisième apparence et non une troisième valeur : le v-model contient toujours vrai ou faux, et <code>indeterminate</code> est une prop à part, calculée depuis les enfants. Elle n'existe que comme propriété du DOM, sans attribut HTML qu'un template pourrait poser, ce qui en fait la seule chose que ce composant écrit à la main sur la case native.",
    },
    disabled: {
      title: 'Désactivé',
      text: "Une case désactivée ne peut plus être cochée, le clavier l'enjambe, et elle grise par les jetons de couleur plutôt que par une opacité : le libellé garde donc son contraste. Cela vaut pour les trois apparences. Utilisez-la quand le choix existe mais n'est pas encore disponible ; un choix qui ne s'applique jamais est mieux absent du formulaire.",
    },
  },

  api: {
    VCheckbox: {
      props: {
        indeterminate:
          "Affiche la case comme partiellement cochée, un tiret au lieu d'une coche. C'est l'allure d'une case parente dont certains enfants sont cochés et d'autres non. C'est un état à part, pas une valeur que le v-model peut porter.",
        labelPosition: 'De quel côté de la case se place le libellé.',
        spread:
          "Pousse le libellé et la case aux extrémités opposées de la ligne, qui prend toute la largeur disponible. C'est la forme habituelle d'une liste de réglages.",
        invalid:
          "Marque le champ comme invalide, ce qui colore la case et le signale aux technologies d'assistance. À utiliser pour une règle que le navigateur ne sait pas vérifier seul ; la validité native est déjà prise en charge sans elle.",
        disabled: 'Rend la case inutilisable, grisée par les tokens de couleur.',
        vModel:
          "Si la case est cochée. Elle part décochée, et le tiret est une troisième apparence plutôt qu'une troisième valeur : celle-là, c'est <code>indeterminate</code>.",
      },
      slots: {
        default:
          'Le libellé. Il est cliquable, tout le composant étant enveloppé dans un <code>&lt;label&gt;</code>.',
      },
    },
  },
}
