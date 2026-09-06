export default {
  title: 'Sélecteur de date',
  lead: "Une grille de calendrier en ligne. Chaque date qu'il contient est une simple chaîne <code>YYYY-MM-DD</code> en heure locale et jamais un <code>Date</code>, si bien qu'une valeur ne peut pas glisser d'un jour d'un fuseau à l'autre.",

  examples: {
    range: {
      title: 'Période',
      text: "La valeur devient un début et une fin. Le premier clic pose l'un, le second pose l'autre, et entre les deux l'intervalle sous le pointeur est prévisualisé pour que le lecteur voie ce qu'il s'apprête à prendre. Cliquer un jour antérieur au début recommence à partir de là plutôt que de produire une période à l'envers.",
    },
    multiple: {
      title: 'Dates multiples',
      text: "La valeur devient une liste, et un jour déjà présent en ressort d'un second clic. Le tableau n'est jamais modifié sur place, donc un observateur posé sur le modèle se déclenche comme il doit. Rien ne borne le nombre : un calendrier avec quarante jours sélectionnés reste lisible, et c'est au formulaire de juger si cela a du sens.",
    },
    presets: {
      title: 'Raccourcis',
      text: "Le slot <code>#footer</code> est une bande sous la grille, pour des actions ou pour les dates qu'un lecteur choisit le plus souvent. Il ne reçoit rien, n'étant qu'un endroit où rendre : les boutons ci-dessous écrivent le modèle comme le ferait n'importe quel autre contrôle. L'horloge est lue dans le gestionnaire et jamais au setup, le serveur n'ayant aucun moyen de savoir quel jour il est là où se trouve le lecteur.",
    },
    disabledDates: {
      title: 'Dates désactivées',
      text: "Avec une liste, les jours nommés ne peuvent pas être choisis. Avec une fonction, elle est interrogée sur une date à la fois, ce qui transforme une règle comme « pas de week-end » en une ligne plutôt qu'en une énumération. Dans les deux cas un jour fermé reste visible et barré, et le clavier l'atteint toujours : un lecteur qui parcourt la grille aux flèches n'est jamais sauté par-dessus un jour en silence, et le calendrier dit pourquoi en le dessinant au lieu de le cacher.",
    },
    bounds: {
      title: 'Minimum et maximum',
      text: "<code>min</code> et <code>max</code> bornent la navigation autant que le choix : les flèches s'arrêtent au bord au lieu de partir vers des mois qui ne contiennent rien à prendre. Les jours hors bornes sont dessinés comme les jours fermés, et les vues mois et année sont bornées de la même façon.",
    },
    events: {
      title: 'Pastilles',
      text: "Jusqu'à trois pastilles sous un jour, pour dire qu'il s'y passe quelque chose. La couleur est n'importe quelle couleur CSS, donc un jeton la garde en phase avec les deux thèmes, et une pastille sans couleur prend l'accent. Donnez un <code>label</code> à chacune : c'est ce que lisent les technologies d'assistance, la pastille elle-même ne portant rien d'audible.",
    },
    adjacentDays: {
      title: 'Jours adjacents',
      text: 'Un mois commence rarement sur la première colonne, donc les coins de la grille sont vides par défaut. <code>showAdjacentDays</code> les remplit avec les mois voisins, grisés et inertes, ce qui fait que les semaines se lisent comme des semaines entières. <code>selectAdjacentDays</code> les rend choisissables en plus, et en choisir un déplace le calendrier sur son mois, donc cette prop implique de les afficher.',
    },
    localization: {
      title: 'Localisation',
      text: "L'étiquette de langue décide des noms de mois et de jours et du jour où commencent les semaines, le tout dérivé d'<code>Intl</code> et non tabulé ici. <code>locale</code> prend le pas sur la locale globale et retombe dessus si on l'omet, de sorte qu'un calendrier isolé peut différer du reste de la page. <code>firstDayOfWeek</code> passe outre le jour qu'aurait choisi la locale, pour un domaine dont les semaines commencent ailleurs.",
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
