export default {
  title: "Champ d'heure",
  lead: "Un champ d'heure sous l'une de trois formes : saisi avec un masque, en lecture seule avec une horloge, ou une liste d'heures à intervalle fixe. La valeur est toujours une chaîne <code>HH:mm</code> sur 24 heures.",

  api: {
    VTimeInput: {
      props: {
        format:
          "Si les heures sont montrées sur une horloge de 12 ou de 24 heures. Omise, la langue du lecteur décide, ce qui est presque toujours ce que l'on veut.",
        mode: "La forme que prend le champ : saisissable, en lecture seule où le sélecteur est la seule voie d'entrée et se trouve donc forcé, ou une LISTE d'heures à intervalle fixe, où un sélecteur n'aurait aucun sens.",
        showPicker:
          "Propose le sélecteur à côté d'un champ saisissable : une icône en fin de champ, et un panneau qu'elle ouvre. Elle est laissée indéfinie plutôt que mise à faux, ce qui distingue « non fournie » d'un refus explicite.",
        minuteStep:
          "L'intervalle entre deux heures qui peuvent être choisies. Il s'applique au sélecteur, aux flèches et aux lignes de la liste.",
        locale:
          "Une locale BCP 47, qui décide de l'horloge et de la façon dont une heure est écrite. Elle l'emporte sur la locale globale du design system et retombe dessus.",
        label: 'Le libellé au-dessus du champ.',
        hint: "Une ligne d'aide sous le champ.",
        placeholder: 'Ce que dit le champ quand il est vide.',
        size: 'La hauteur du champ : 32, 40 ou 48 pixels.',
        compact: 'Retire 4px à la hauteur.',
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        clearable: "Propose une croix qui vide la valeur, affichée avant l'icône de fin.",
        pickerIcon:
          "L'icône qui ouvre l'horloge, en fin de champ. Sans effet sur la forme liste, dont le chevron suit la convention de la liste déroulante. La croix d'effacement apparaît à sa gauche plutôt qu'à sa place.",
        placement: "Où le panneau s'ouvre par rapport au champ.",
        vModel:
          "L'heure, toujours en chaîne sur 24 heures quelle que soit l'horloge affichée : vous n'avez donc jamais à savoir laquelle la langue du lecteur utilise.",
      },
    },
  },
}
