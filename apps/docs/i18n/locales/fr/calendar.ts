export default {
  title: 'Calendrier',
  lead: "Un agenda à lire et à réorganiser : vues jour, semaine, mois et année, avec des événements que l'on peut déplacer et étirer. Ouvrir l'un d'eux pour l'éditer vous revient.",

  examples: {
    month: {
      title: 'Mois',
      text: "La vue mois troque les heures contre la forme du mois : chaque jour est une case qui tient ses événements sous forme de puces, et un jour qui en compte plus que <code>monthEventLimit</code> dénombre le reste au lieu de s'agrandir. Choisir un numéro de jour ouvre ce jour seul. Un événement qui court d'un jour à l'autre est dessiné comme une barre sur les cases qu'il couvre.",
    },
    year: {
      title: 'Année',
      text: "Douze petits mois, pour se repérer plutôt que pour lire le détail. Les jours n'y sont délibérément pas des contrôles : trois cent soixante-cinq arrêts de tabulation rendraient la vue inutilisable à qui l'atteint au clavier. Les jours occupés sont donc cerclés et c'est le mois qui peut être choisi, ce qui l'ouvre, son nom portant le nombre de ses jours qui ont quelque chose.",
    },
    customView: {
      title: 'Vue personnalisée',
      text: "Les préréglages sont le jour, les quatre jours et la semaine. <code>custom</code> est cette même mécanique dont la longueur vous revient : <code>customDays</code> dit combien de jours elle affiche, et de combien avancent Précédent et Suivant. C'est cette seconde moitié qui la sépare de <code>week</code>, laquelle retombe toujours sur les bornes d'une semaine calendaire. Les cinq jours ci-dessous commencent au jour sur lequel le calendrier est ancré et se déplacent de cinq en cinq : une période peut donc tenir à cheval sur un week-end au lieu de s'arrêter devant. Le menu des vues nomme l'entrée d'après sa propre longueur.",
    },
    weekdays: {
      title: 'Les jours affichés',
      text: "<code>weekdays</code> décide des jours qui paraissent, en nombres à partir de 0 pour dimanche : <code>[1, 2, 3, 4, 5]</code> est donc une semaine sans week-end. L'ordre compte aussi : la première entrée est le jour où commence une semaine, et c'est pourquoi aucun réglage distinct n'existe pour cela. Le réglage atteint toutes les vues, et c'est à cela que sert le menu ci-dessous : le week-end manque aux cases du mois et aux petits mois de l'année exactement comme il manque aux colonnes. <code>dayStart</code> et <code>dayEnd</code> rognent les heures dans le même esprit, et n'atteignent que les grilles horaires, les deux autres vues n'ayant aucune heure à rogner.",
    },
    allDay: {
      title: 'Événements sur la journée',
      text: "Un événement passe dans le bandeau au-dessus de la grille lorsqu'il ne peut pas être dessiné dans une seule colonne. <code>allDay</code> l'y place sur un jour unique, et celui dont les champs <code>start</code> et <code>end</code> tombent sur des jours différents s'y trouve déjà sans lui. Les barres qui se chevauchent s'empilent sur des rangs à elles, et le bandeau défile une fois qu'il a grandi autant qu'il le peut.",
    },
    overlapping: {
      title: 'Événements qui se chevauchent',
      text: "Les événements qui ont lieu en même temps se partagent la largeur de leur journée. Ils sont d'abord regroupés en grappes, si bien qu'une matinée chargée ne rétrécit jamais une réunion isolée de l'après-midi : les quatre ci-dessous se partagent la matinée pendant que le déjeuner garde toute la colonne.",
    },
    colours: {
      title: 'Couleurs',
      text: "Un événement sans <code>color</code> prend une teinte dérivée de son identifiant : il garde donc la même couleur quels que soient les filtres et les tris appliqués à la liste. Seule la teinte est dérivée, la clarté et le chroma venant du thème, ce qui maintient le contraste d'un titre où que la teinte tombe sur la roue. Un événement qui nomme sa propre couleur l'emploie pour son arête de tête et pour un lavis sur sa face, jamais sous le titre, ce qui garde une valeur arbitraire lisible dans les deux thèmes.",
    },
    eventSlot: {
      title: "Contenu d'événement personnalisé",
      text: "Le slot <code>#event</code> remplace ce qu'une carte affiche et reçoit tout ce que la carte sait : l'événement, le <code>timeText</code> déjà formaté, la disposition <code>layout</code> dans laquelle elle est dessinée (<code>block</code> dans une grille horaire, <code>chip</code> dans une case de mois) et le fait qu'elle se poursuive avant ou après le jour où elle se trouve. Typer les événements avec une interface qui étend <code>CalendarEvent</code> est ce qui amène les champs supplémentaires typés jusqu'au slot, plutôt qu'en quelque chose à convertir sur place. La carte elle-même reste au composant : le bouton, la couleur, le nom accessible et la poignée par laquelle on étire sa fin.",
    },
  },

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
        format:
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
        disabled:
          "Fige tout le calendrier : plus rien ne se déplace, ne se crée ni ne s'ouvre, et aucune autre période n'est atteignable. Les cartes sortent du parcours de tabulation, la grille garde le sien, si bien que l'agenda reste lisible. C'est ce qui le distingue de <code>readonly</code>, qui n'arrête que l'édition.",
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
