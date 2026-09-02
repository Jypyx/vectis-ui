export default {
  title: 'Champ de date',
  lead: "Un champ de texte saisissable, avec un VDatePicker dans un panneau à côté. Le masque suit la langue : l'ordre des champs, le séparateur et le gabarit sont tous dérivés de la locale.",

  api: {
    VDateInput: {
      props: {
        selection:
          'Ce qui est choisi : une date, une période entre deux, ou plusieurs dates séparées.',
        locale:
          "Une locale BCP 47, qui décide des noms de mois et de jours, du premier jour de la semaine et de l'ordre dans lequel le champ se saisit. Elle l'emporte sur la locale globale du design system et retombe dessus.",
        firstDayOfWeek:
          'Force le jour où commencent les semaines, de 0 pour dimanche à 6 pour samedi.',
        min: 'La première date qui peut être choisie, en chaîne ISO.',
        max: 'La dernière date qui peut être choisie, en chaîne ISO.',
        disabledDates: 'Les dates qui ne peuvent pas être choisies, en liste ou en fonction.',
        showAdjacentDays: 'Remplit les coins de la grille avec les jours grisés des mois voisins.',
        selectAdjacentDays: 'Permet de cliquer ces jours voisins, ce qui implique de les afficher.',
        events: 'Les événements à marquer sous les jours concernés.',
        mode: "Si le champ peut être SAISI, dans la forme numérique de la langue du lecteur, ou s'il est en lecture seule, le calendrier étant alors la seule voie d'entrée. La saisie est réservée au choix d'une date UNIQUE : une période ou une liste retombe en lecture seule, faute de façon sensée de saisir l'une ou l'autre.",
        showPicker:
          "Propose le sélecteur de date à côté d'un champ saisissable : une icône en fin de champ, et un panneau qui s'ouvre au focus. Cela ne signifie rien en lecture seule, où le sélecteur est déjà la seule façon de choisir.",
        label: 'Le libellé au-dessus du champ.',
        hint: "Une ligne d'aide sous le champ.",
        placeholder: 'Ce que dit le champ quand il est vide.',
        size: 'La hauteur du champ : 32, 40 ou 48 pixels.',
        compact: 'Retire 4px à la hauteur.',
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        clearable: "Propose une croix qui vide la valeur, affichée avant l'icône de fin.",
        pickerIcon:
          "L'icône qui ouvre le sélecteur de date, en fin de champ. La croix d'effacement apparaît à sa gauche plutôt qu'à sa place, et aucune icône n'est rendue du tout quand il n'y a pas de panneau à ouvrir.",
        displayFormat:
          "Comment la date est ÉCRITE dans le champ. Sans effet sur un champ en cours de saisie, qui montre nécessairement la forme numérique que l'on tape : cette prop concerne donc la lecture seule, ainsi que les sélections de période et de liste.",
        placement: "Où le panneau s'ouvre par rapport au champ.",
        vModel:
          "La ou les dates choisies, dans la forme que <code>selection</code> réclame. Pendant la saisie, la valeur n'est écrite qu'une fois que ce qui a été entré est une date complète et acceptable ; une entrée inachevée ou refusée la laisse intacte et est annulée quand le lecteur quitte le champ.",
      },
      slots: {
        day: 'Ce que montre une cellule de jour, transmis tel quel au calendrier.',
        footer:
          "La bande au pied du panneau : des actions, ou des dates prédéfinies comme aujourd'hui. Elle reçoit <code>close</code>, ce qui permet à l'un de ces boutons de refermer le panneau.",
      },
    },
  },
}
