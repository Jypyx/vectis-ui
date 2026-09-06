export default {
  title: "Sélecteur d'heure",
  lead: "Un cadran d'horloge en ligne, le pendant de VDatePicker pour les heures et les minutes. Sa valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures, quelle que soit l'horloge affichée.",

  examples: {
    minuteStep: {
      title: 'Pas des minutes',
      text: "Le cadran est un curseur et non une liste, il faut donc lui dire sur quoi il a le droit de se poser. <code>minuteStep</code> est cet intervalle : l'aiguille s'y accroche quand on la fait tourner, et les flèches du clavier avancent de ce pas. Il ne concerne que les minutes. Les repères du cadran ne changent pas avec lui, ce sont les marques de cinq minutes dans tous les cas ; ce que le pas décide, ce sont les valeurs entre elles sur lesquelles l'aiguille peut s'arrêter.",
    },
    hourFormat: {
      title: 'Format horaire',
      text: "Un cadran de 12 heures porte un seul anneau de chiffres et la paire AM et PM à côté d'eux. Un cadran de 24 heures en porte deux, l'anneau intérieur tenant 00 et 13 à 23, et aucune paire à choisir. <code>format</code> tranche entre les deux, et sans lui c'est la langue du lecteur qui décide, ce qui est presque toujours ce que l'on veut. La valeur est la même de part et d'autre : sept heures et demie du soir est la chaîne 19:30 sur les deux cadrans, donc rien en aval n'a besoin de savoir lequel l'a produite.",
    },
    localization: {
      title: 'Localisation',
      text: "La prop <code>locale</code> décide ici d'une seule chose, le cadran. Une balise dont la langue compte en douze heures obtient l'anneau simple et la paire AM et PM, une autre qui compte en vingt-quatre obtient le double anneau. en-US et en-GB forment la paire la plus nette, partageant chaque mot et ne différant en rien d'autre. La prop prend le pas sur la locale globale et se rabat sur elle, donc c'est en l'omettant qu'un cadran suit la langue à laquelle la page est réglée. Les mots sont une autre question : ils viennent du dictionnaire, et une langue que le dictionnaire ne fournit pas garde les mots anglais sur un cadran que la balise a déjà mis juste.",
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
