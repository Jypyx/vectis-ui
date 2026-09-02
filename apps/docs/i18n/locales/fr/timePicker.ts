export default {
  title: "Sélecteur d'heure",
  lead: "Un cadran d'horloge en ligne, le pendant de VDatePicker pour les heures et les minutes. Sa valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures, quelle que soit l'horloge affichée.",

  api: {
    VTimePicker: {
      props: {
        format:
          "Si le cadran montre une horloge sur 12 ou sur 24 heures. Omise, la langue du lecteur décide, ce qui est presque toujours ce que l'on veut.",
        locale:
          "Une locale BCP 47, qui décide de l'horloge. Elle l'emporte sur la locale globale du design system et retombe dessus, ce pourquoi elle n'a pas de valeur par défaut littérale.",
        minuteStep:
          "L'intervalle sur lequel les minutes s'alignent, au glissement comme aux flèches.",
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
