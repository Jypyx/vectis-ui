export default {
  title: "Sélecteur d'heure",
  lead: "Un cadran d'horloge en ligne, le pendant de VDatePicker pour les heures et les minutes. Sa valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures, quelle que soit l'horloge affichée.",

  examples: {
    minuteStep: {
      title: 'Pas des minutes',
      text: "<code>minuteStep</code> est l'intervalle auquel l'aiguille s'aligne et le pas des flèches du clavier, sur les minutes seules. Le cadran n'imprime que les minutes que le pas atteint.",
    },
    restrictions: {
      title: 'Ce que l’on peut choisir',
      text: "<code>min</code> et <code>max</code> sont deux bornes inclusives écrites en chaînes canoniques <code>HH:mm</code>, et <code>allowedHours</code> et <code>allowedMinutes</code> acceptent chacune la liste des valeurs autorisées ou une règle répondant pour une valeur. Ce qu'elles écartent est absent du cadran, et une heure n'est fermée que lorsqu'il n'y reste plus rien.",
    },
    hourFormat: {
      title: 'Format horaire',
      text: '<code>format</code> choisit entre un cadran sur 12 heures, un anneau de chiffres avec la paire AM et PM à côté, et un cadran sur 24 heures, deux anneaux et aucune paire. Sans lui, la langue du lecteur décide. La valeur est la même dans les deux cas.',
    },
    localization: {
      title: 'Localisation',
      text: "<code>locale</code> décide ici de l'horloge : une langue qui compte en douze heures reçoit l'anneau simple, une qui compte en vingt-quatre l'anneau double. Elle l'emporte sur la locale globale et s'y rabat. Les mots, eux, viennent du dictionnaire.",
    },
  },

  api: {
    VTimePicker: {
      props: {
        format:
          "Si le cadran montre une horloge sur 12 ou sur 24 heures. Omise, la langue du lecteur décide, ce qui est presque toujours ce que l'on veut.",
        locale:
          "Une locale BCP 47, qui décide de l'horloge. Elle l'emporte sur la locale globale du design system et retombe dessus, ce pourquoi elle n'a pas de valeur par défaut littérale.",
        minuteStep:
          "L'intervalle sur lequel les minutes s'alignent, au glissement comme aux flèches. Le cadran n'affiche que les minutes qu'il peut atteindre : un pas d'un quart d'heure en marque quatre.",
        min: "L'heure la plus tôt que l'on puisse choisir, incluse, en chaîne canonique sur 24 heures. Le cadran laisse de côté ce qui tombe en dehors, comme il laisse de côté les minutes que le pas n'atteint pas.",
        max: "L'heure la plus tard que l'on puisse choisir, incluse, écrite comme min.",
        allowedHours:
          "Les heures que l'on peut choisir : leur liste, ou une règle qui répond pour l'une d'elles. L'heure passée à une règle est toujours celle sur 24 heures, quelle que soit l'horloge affichée. Les heures qu'elle écarte ne sont pas affichées.",
        allowedMinutes:
          "Les minutes que l'on peut choisir : leur liste, ou une règle qui répond pour l'une d'elles. Les minutes qu'elle écarte ne sont pas affichées.",
        disabled:
          "Rend toute l'horloge inutilisable : l'aiguille ne bouge plus, la demi-journée ne change plus, et tout se grise par les jetons de couleur.",
        readonly:
          "Montre l'heure sans permettre de la changer. Le cadran garde son focus et les deux grands chiffres basculent toujours entre heure et minutes, de sorte que la valeur reste lisible en entier.",
        label:
          "Le nom accessible de l'horloge entière, ses deux chiffres et son cadran ensemble. Il retombe sur le dictionnaire, et un <code>aria-label</code> du consommateur l'emporte. Le cadran garde son propre nom, qui dit si l'aiguille est sur les heures ou sur les minutes.",
        vModel:
          "L'heure, toujours en chaîne sur 24 heures quelle que soit l'horloge affichée : vous n'avez donc jamais à savoir laquelle la langue utilise. Sans valeur, le cadran affiche minuit plutôt que l'heure courante : lire l'horloge pendant le rendu ferait diverger une page dessinée sur un serveur de la même page dans le navigateur.",
      },
      events: {
        confirm:
          "Les minutes ont été arrêtées AU CLAVIER. Relâcher un pointeur est la façon de cesser d'ajuster l'aiguille, pas de confirmer : cet événement ne part donc pas.",
      },
      slots: {
        footer: "Une bande au pied de l'horloge, la place des actions comme Annuler et OK.",
      },
    },
  },
}
