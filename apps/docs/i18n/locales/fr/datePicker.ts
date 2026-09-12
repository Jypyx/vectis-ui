export default {
  title: 'Sélecteur de date',
  lead: "Une grille de calendrier en ligne. Chaque date qu'il contient est une simple chaîne <code>YYYY-MM-DD</code> en heure locale et jamais un <code>Date</code>, si bien qu'une valeur ne peut pas glisser d'un jour d'un fuseau à l'autre.",

  examples: {
    range: {
      title: 'Période',
      text: '<code>selection</code> à <code>range</code> fait de la valeur un début et une fin, la période sous le pointeur étant prévisualisée entre les deux clics.',
    },
    multiple: {
      title: 'Dates multiples',
      text: '<code>selection</code> à <code>multiple</code> fait de la valeur une liste, un jour déjà présent en ressortant à un nouveau clic.',
    },
    presets: {
      title: 'Raccourcis',
      text: "Le slot <code>#footer</code> est une bande sous la grille, pour des actions ou pour les dates les plus demandées. Les boutons qui s'y trouvent écrivent le modèle comme n'importe quel autre contrôle.",
    },
    disabledDates: {
      title: 'Dates désactivées',
      text: '<code>disabledDates</code> accepte une liste de jours, ou une fonction interrogée pour une date à la fois. Un jour fermé reste visible, barré, et atteignable au clavier.',
    },
    bounds: {
      title: 'Minimum et maximum',
      text: '<code>min</code> et <code>max</code> bornent la navigation autant que le choix, dans toutes les vues.',
    },
    events: {
      title: 'Pastilles',
      text: "<code>events</code> dessine jusqu'à trois points sous un jour. Chacun accepte n'importe quelle couleur CSS et un <code>label</code>, qui est ce que lisent les technologies d'assistance.",
    },
    adjacentDays: {
      title: 'Jours adjacents',
      text: '<code>showAdjacentDays</code> remplit les coins de la grille avec les mois voisins, grisés et inertes. <code>selectAdjacentDays</code> les rend aussi choisissables, et en choisir un déplace le calendrier vers son mois.',
    },
    localization: {
      title: 'Localisation',
      text: "<code>locale</code> décide des noms de mois et de jours et du jour où commencent les semaines, et l'emporte sur la locale globale. <code>firstDayOfWeek</code> remplace le jour que cette locale aurait choisi.",
    },
  },

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
        disabled:
          'Rend tout le calendrier inutilisable : aucune date ne peut être choisie, aucun mois atteint, et tout se grise par les jetons de couleur.',
        readonly:
          'Montre la sélection sans permettre de la changer. Le calendrier reste lisible et parcourable, un autre mois ou une autre année, ce qui le distingue de <code>disabled</code>.',
        label:
          "Le nom accessible du sélecteur entier, son en-tête et sa grille ensemble. Une plage montrée comme deux calendriers côte à côte en demande un chacun, sinon un lecteur d'écran annonce deux fois le même groupe. Il retombe sur le dictionnaire, et un <code>aria-label</code> du consommateur l'emporte.",
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
