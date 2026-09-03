export default {
  title: 'Calendrier',
  lead: "Un agenda à lire et à réorganiser : vues jour, semaine, mois et année, avec des événements que l'on peut déplacer et étirer. Ouvrir l'un d'eux pour l'éditer vous revient.",

  api: {
    VCalendar: {
      props: {
        views:
          "Quelles vues le menu propose, dans l'ordre où il les liste. Le restreindre est la façon dont un calendrier qui ne montre que des semaines cesse d'en proposer d'autres.",
        customDays:
          'Combien de jours la vue personnalisée montre, et de combien Précédent et Suivant y avancent.',
        weekdays:
          "Quels jours de la semaine sont montrés, en nombres à partir de 0 pour dimanche. L'ORDRE compte aussi : la première entrée est le jour où commence une semaine, ce pourquoi il n'y a pas de réglage séparé pour cela. Omis, les sept jours dans l'ordre où la locale les place.",
        locale:
          'La langue dans laquelle les jours, les mois et les heures sont écrits. Elle retombe sur la locale globale.',
        hourFormat:
          'Si les heures sont montrées sur une horloge de 12 ou de 24 heures. Suit la locale.',
        dayStart: "L'heure à laquelle la grille commence, à partir de 0.",
        dayEnd: "L'heure à laquelle elle se termine, jusqu'à 24.",
        slotDuration:
          "Le pas sur lequel tout s'aligne, en minutes : de combien un coup de pouce déplace un événement, et quelle durée a celui qui vient d'être créé.",
        scrollTime:
          'Où la grille est défilée à sa première apparition, pour que la journée de travail soit en vue.',
        hideCurrentTime:
          "Retire la ligne tracée en travers de la colonne du jour à l'heure qu'il est, et le point sur son bord avant. Laissée en place, elle avance d'une minute par minute tant que le calendrier est à l'écran.",
        monthEventLimit:
          "Combien d'événements un jour de la vue mois montre avant de compter le reste.",
        readonly:
          "Empêche de déplacer et d'étirer les événements, à la souris comme au clavier. Ils restent lisibles et cliquables, et rien de plus.",
        creatable:
          "Crée un événement quand une partie vide d'une journée est prise : un clic en fait un long d'un pas, un glissement en fait un aussi long qu'il a été tracé. Le signal de créneau part de toute façon : vous pouvez donc laisser ceci de côté et le garder.",
        edgeStepDelay:
          "Combien de temps un événement déplacé doit reposer contre le bord du calendrier avant que la vue passe à la période précédente ou suivante, en millisecondes. Zéro le désactive. L'attente est tout l'intérêt : tourner la page à l'instant où le pointeur touche le bord rendrait le dernier jour d'une semaine impossible à viser.",
        noEdgeScroll:
          "Empêche un glissement près du haut ou du bas d'une grille horaire de la faire défiler.",
        label: 'Le nom du calendrier, pour qui ne peut pas le voir.',
        vModelView: 'Quelle étendue le calendrier affiche. Il ouvre sur la semaine.',
        vModelDate:
          "Le jour sur lequel la vue est ancrée, en chaîne ISO. Il ouvre sur aujourd'hui.",
        vModelEvents:
          "Ce qui est au calendrier. C'est un modèle plutôt qu'une simple prop parce que déplacer et redimensionner y réécrivent : le calendrier réorganise ce qu'on lui donne et rend la nouvelle liste, sans jamais muter celle qu'il a reçue.",
      },
      events: {
        eventActivate:
          'Une carte a été cliquée ou activée, le signal pour ouvrir un éditeur à vous.',
        slotActivate: 'Une partie vide de la grille a été activée, à ce jour et à cette heure.',
        eventMove:
          "Un événement a été déplacé ou poussé ailleurs. Il porte l'événement tel qu'il est désormais et d'où il vient, si bien qu'annuler ne demande aucune copie de votre part.",
        eventResize: "La fin d'un événement a été déplacée ou poussée, en ces deux mêmes parties.",
        eventCreate:
          "Un événement a été créé en prenant une partie vide d'une journée. Il est déjà ajouté à la liste ; c'est le signal pour lui donner un vrai nom, ou pour l'enregistrer.",
      },
      slots: {
        actions:
          "Des contrôles supplémentaires dans la barre d'outils, entre la plage et le menu des vues.",
        event: "Le contenu de la carte d'un événement, qui remplace le titre et les heures.",
        dayHeader:
          "La tête d'une colonne de jour, qui remplace le jour de la semaine et le numéro.",
        allDayLabel: 'Le libellé à côté de la bande des événements sur la journée entière.',
      },
    },
  },
}
