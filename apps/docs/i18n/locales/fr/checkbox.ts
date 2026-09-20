export default {
  title: 'Case à cocher',
  lead: "Un choix qu'un envoi exécutera, à la différence d'un interrupteur, qui agit sur-le-champ. Elle enveloppe un vrai <code>&lt;input type=\"checkbox\"&gt;</code>, donc elle s'envoie avec le formulaire.",

  examples: {
    labelPosition: {
      title: 'Position du libellé',
      text: "<code>labelPosition</code> place le libellé avant la case plutôt qu'après.",
    },
    spread: {
      title: 'Écartement',
      text: '<code>spread</code> prend toute la largeur offerte et pousse le libellé et la case aux deux extrémités de la ligne.',
    },
    indeterminate: {
      title: 'Indéterminé',
      text: "<code>indeterminate</code> affiche un tiret à la place de la coche. C'est une apparence à part : le v-model contient toujours true ou false.",
    },
    disabled: {
      title: 'Désactivé',
      text: "<code>disabled</code> empêche de cocher la case et la grise par les tokens de couleur. Le clavier l'enjambe.",
    },
    hint: {
      title: 'Aide',
      text: '<code>label</code> écrit le texte à côté de la case, et le slot par défaut le remplace quand le libellé demande plus que du texte. <code>hint</code> ajoute une légende en dessous, reliée à la case par <code>aria-describedby</code> et gardée hors du <code>&lt;label&gt;</code> : elle est annoncée comme une description et non comme une partie du nom.',
    },
    readonly: {
      title: 'Lecture seule',
      text: "<code>readonly</code> montre l'état sans permettre de le changer. L'attribut natif n'a aucun effet sur une case à cocher, donc le composant annule le clic, ce qui couvre aussi la barre d'espace. La case reste focalisable, s'envoie avec son formulaire et est annoncée en lecture seule. Elle participe toujours à la validation de contrainte, cela dit, donc <code>readonly</code> avec <code>required</code> et rien de coché laisse un formulaire impossible à envoyer comme à corriger.",
    },
  },

  api: {
    VCheckbox: {
      props: {
        label: 'Le texte à côté de la case, qui la nomme. Le slot par défaut le remplace.',
        hint: "Une ligne d'aide sous le libellé. Elle est reliée à la case pour les technologies d'assistance, qui la lisent après le libellé et non comme une partie de celui-ci.",
        readonly:
          "Montre l'état sans permettre de le changer. La case reste focalisable, est annoncée en lecture seule et s'envoie toujours avec son formulaire ; un clic ou la barre d'espace ne changent simplement rien.",
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
          'Le libellé, quand il demande plus que le texte de la prop <code>label</code>. Il est cliquable.',
      },
    },
  },
}
