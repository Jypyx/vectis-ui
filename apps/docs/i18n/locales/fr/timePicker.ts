export default {
  title: "Sélecteur d'heure",
  lead: "Un cadran d'horloge en ligne, le pendant de VDatePicker pour les heures et les minutes. Sa valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures, quelle que soit l'horloge affichée.",

  examples: {
    minuteStep: {
      title: 'Pas des minutes',
      text: "Le cadran est un curseur et non une liste, il faut donc lui dire sur quoi il a le droit de se poser. <code>minuteStep</code> est cet intervalle : l'aiguille s'y accroche quand on la fait tourner, et les flèches du clavier avancent de ce pas. Il ne concerne que les minutes. Le cadran n'affiche que les minutes que le pas atteint : un quart d'heure y marque quatre repères et rien entre eux, car un chiffre que l'on peut viser sans pouvoir s'y poser est un chiffre que l'aiguille dément en s'arrêtant à côté. Un pas trop fin pour douze chiffres conserve les marques de cinq minutes sur lesquelles une horloge se lit, moins celles qu'il ne peut pas atteindre.",
    },
    restrictions: {
      title: 'Ce que l’on peut choisir',
      text: 'Quatre props restreignent la valeur, et elles se composent en une seule réponse : <code>min</code> et <code>max</code>, deux bornes incluses écrites en chaînes canoniques <code>HH:mm</code>, et <code>allowedHours</code> et <code>allowedMinutes</code>, qui prennent chacune la liste des valeurs autorisées ou une règle qui répond pour l’une d’elles. Ce qu’elles excluent est désactivé et non masqué, l’inverse de <code>minuteStep</code> : une borne ne se lit qu’à côté de ce qu’elle exclut, et une graduation trouée ne dit rien. Une heure n’est fermée que s’il n’y reste rien du tout : une borne à 09:30 garde neuf heures et retire ses trente premières minutes du côté des minutes. Choisir cette heure aligne alors les minutes sur la plus proche qu’elle autorise, et les flèches enjambent ce sur quoi elles n’ont pas le droit de se poser au lieu de s’y arrêter.',
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
          "L'intervalle sur lequel les minutes s'alignent, au glissement comme aux flèches. Le cadran n'affiche que les minutes qu'il peut atteindre : un pas d'un quart d'heure en marque quatre.",
        min: "L'heure la plus tôt que l'on puisse choisir, incluse, en chaîne canonique sur 24 heures. Le cadran désactive ce qui tombe en dehors plutôt que de le retirer : une borne ne se lit qu'à côté de ce qu'elle exclut.",
        max: "L'heure la plus tard que l'on puisse choisir, incluse, écrite comme min.",
        allowedHours:
          "Les heures que l'on peut choisir : leur liste, ou une règle qui répond pour l'une d'elles. L'heure passée à une règle est toujours celle sur 24 heures, quelle que soit l'horloge affichée.",
        allowedMinutes:
          "Les minutes que l'on peut choisir : leur liste, ou une règle qui répond pour l'une d'elles.",
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
