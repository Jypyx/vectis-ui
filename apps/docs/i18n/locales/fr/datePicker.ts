export default {
  title: 'Sélecteur de date',
  lead: "Une grille de calendrier en ligne. Chaque date qu'il contient est une simple chaîne <code>YYYY-MM-DD</code> en heure locale et jamais un <code>Date</code>, si bien qu'une valeur ne peut pas glisser d'un jour d'un fuseau à l'autre.",

  api: {
    VDatePicker: {
      props: {
        selection:
          'Ce que le lecteur choisit : une date unique, une période entre deux dates, ou un nombre quelconque de dates séparées. Cela détermine la forme de la valeur.',
        locale:
          "Une locale BCP 47, qui décide des noms de mois et de jours et du premier jour de la semaine. Elle l'emporte sur la locale globale du design system et retombe dessus, ce pourquoi elle n'a pas de valeur par défaut littérale.",
        firstDayOfWeek:
          'Force le jour où commencent les semaines, de 0 pour dimanche à 6 pour samedi. Omise, la locale décide.',
        min: 'La première date sélectionnable, en chaîne ISO. Ni la navigation ni la sélection ne remontent au-delà.',
        max: 'La dernière date sélectionnable, en chaîne ISO. Ni la navigation ni la sélection ne vont au-delà.',
        disabledDates:
          'Les dates qui ne peuvent pas être choisies, en liste de chaînes ISO ou en fonction. Elles restent visibles, barrées, et restent atteignables au clavier.',
        showAdjacentDays:
          'Remplit aussi les coins vides de la grille avec les jours grisés des mois voisins.',
        selectAdjacentDays:
          'Permet de cliquer ces jours voisins, ce qui déplace le calendrier sur leur mois. Un jour cliquable doit être visible : cela implique donc de les afficher.',
        events: 'Les événements à marquer, en trois points colorés au plus sous le jour concerné.',
        vModel:
          "Ce qui est sélectionné, et sa forme suit <code>selection</code> : une chaîne ISO pour une date unique, une paire début et fin pour une période, un tableau pour plusieurs. Rien n'est sélectionné au départ.",
      },
      events: {
        select: "Une date a été choisie, avec la valeur telle qu'elle est désormais.",
      },
      slots: {
        day: "Remplace le contenu d'une cellule de jour, pour afficher un prix ou une disponibilité sous le numéro. Elle reçoit tout ce que l'on sait de ce jour, y compris s'il appartient au mois affiché.",
        footer:
          'La bande sous la grille, pour des actions comme Fermer ou Enregistrer, ou pour des dates prédéfinies.',
      },
    },
  },
}
