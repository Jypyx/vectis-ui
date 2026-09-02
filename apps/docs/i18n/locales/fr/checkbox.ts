export default {
  title: 'Case à cocher',
  lead: "Un choix qu'un envoi exécutera, à la différence d'un interrupteur, qui agit sur-le-champ. Elle enveloppe un vrai <code>&lt;input type=\"checkbox\"&gt;</code>, donc elle s'envoie avec le formulaire.",

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
