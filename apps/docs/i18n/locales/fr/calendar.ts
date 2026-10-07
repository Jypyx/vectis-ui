export default {
  title: 'Calendrier',
  lead: '<code>VCalendar</code> affiche des événements par jour, semaine, mois ou année. Déplacez et redimensionnez les événements à la souris ou au clavier ; fournissez vos propres formulaires de création et de modification.',
  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> encadre la vue d’une bordure (<code>outline</code>, par défaut), d’une surface surélevée avec une ombre (<code>elevated</code>), d’une surface atténuée (<code>filled</code>) ou de rien (<code>flat</code>). La barre d’outils reste hors du cadre.',
    },
    month: {
      title: 'Mois',
      text: '<code>monthEventLimit</code> limite le nombre de cartes par jour. Un compteur indique les événements restants.',
    },
    year: {
      title: 'Année',
      text: 'La vue annuelle affiche douze mois. Sélectionner un mois ouvre sa vue détaillée.',
    },
    customView: {
      title: 'Vue personnalisée',
      text: '<code>customDays</code> définit le nombre de jours de la vue personnalisée et le pas de navigation.',
    },
    weekdays: {
      title: 'Les jours affichés',
      text: '<code>weekdays</code> définit les jours visibles et leur ordre. Sa première entrée remplace <code>firstDayOfWeek</code>. Limitez les heures affichées avec <code>dayStart</code> et <code>dayEnd</code>.',
    },
    allDay: {
      title: 'Événements sur la journée',
      text: 'Les événements marqués <code>allDay</code> ou durant au moins 24 heures apparaissent dans la bande dédiée. Un événement plus court passant minuit apparaît sur les deux jours ; une fin à minuit appartient au jour précédent.',
    },
    overlapping: {
      title: 'Événements qui se chevauchent',
      text: 'Les événements qui se chevauchent se partagent la largeur de la colonne.',
    },
    colours: {
      title: 'Couleurs',
      text: 'Définissez une couleur CSS dans <code>color</code>. Sinon, la couleur dépend de l’identifiant de l’événement.',
    },
    eventSlot: {
      title: "Contenu d'événement personnalisé",
      text: 'Le slot <code>event</code> remplace le contenu de la carte. Ses données d’événement, d’heure et de disposition permettent d’adapter l’affichage.',
    },
    editing: {
      title: 'Créer et éditer des événements',
      text: 'Ouvrez votre éditeur avec <code>event-activate</code> et <code>cell-activate</code>. Avec <code>creatable</code>, tracer une plage horaire vide émet <code>event-create</code> sans ajouter d’événement. Enregistrez les modifications dans <code>v-model:events</code> ; le déplacement et le redimensionnement mettent directement ce modèle à jour.',
    },
  },
  api: {
    VCalendar: {
      props: {
        variant: 'Cadre de la vue : une bordure, une ombre, un fond atténué ou aucun.',
        views: 'Vues proposées dans le menu, dans l’ordre d’affichage.',
        customDays: 'Nombre de jours de la vue personnalisée et pas de navigation.',
        weekdays:
          'Jours visibles dans l’ordre, avec 0 pour dimanche. La première entrée remplace <code>firstDayOfWeek</code>.',
        firstDayOfWeek:
          'Premier jour quand <code>weekdays</code> est absent. Dépend de la locale par défaut ; 0 désigne dimanche.',
        locale: 'Locale des dates et heures. Utilise la locale globale par défaut.',
        format: 'Affichage sur 12 ou 24 heures. Dépend de la locale par défaut.',
        dayStart: 'Première heure visible, à partir de 0.',
        dayEnd: 'Fin des heures visibles, jusqu’à 24.',
        slotDuration: 'Pas en minutes pour déplacer, redimensionner et créer des événements.',
        scrollTime: 'Position de défilement initiale, sous forme de chaîne horaire.',
        hideCurrentTime: 'Masque l’indicateur de l’heure actuelle.',
        monthEventLimit: 'Nombre maximal de cartes par jour dans la vue mensuelle.',
        readonly:
          'Empêche le déplacement et le redimensionnement. La navigation et l’activation restent disponibles ; <code>creatable</code> contrôle la création.',
        disabled: 'Désactive la navigation, la création, la modification et l’activation.',
        creatable:
          'Permet de tracer une plage vide pour émettre <code>event-create</code>. N’ajoute aucun événement.',
        edgeStepDelay:
          'Délai en millisecondes avant qu’un événement glissé contre un bord change la période visible. 0 désactive ce comportement.',
        noEdgeScroll:
          'Désactive le défilement vertical lors d’un glissement près des bords de la grille.',
        label: 'Nom accessible du calendrier.',
        vModelView: 'Vue affichée. <code>week</code> par défaut.',
        vModelDate: 'Date de référence au format <code>YYYY-MM-DD</code>. Date du jour par défaut.',
        vModelEvents:
          'Tableau d’événements. Déplacer ou redimensionner émet un nouveau tableau sans modifier celui fourni.',
      },
      events: {
        eventActivate: 'Un événement a été activé. Reçoit l’événement.',
        cellActivate:
          'Une cellule vide a été activée. Reçoit sa date et son heure ; la vue mensuelle utilise <code>dayStart</code>.',
        eventMove:
          'Un événement a été déplacé. Reçoit l’événement modifié et ses anciennes dates de début et de fin.',
        eventResize:
          'Un événement a été redimensionné. Reçoit l’événement modifié et ses anciennes dates de début et de fin.',
        eventCreate:
          'Une plage vide a été tracée. Reçoit son début et sa fin ; ajoutez vous-même l’événement.',
      },
      slots: {
        actions: 'Contrôles de la barre d’outils entre la période et le menu des vues.',
        event: 'Remplace le contenu de la carte. Reçoit l’événement et son état d’affichage.',
        dayHeader:
          'Remplace l’en-tête d’une colonne. Reçoit <code>iso</code>, <code>weekday</code>, <code>dayText</code> et <code>today</code>.',
        allDayLabel: 'Libellé à côté de la bande des événements à la journée.',
      },
    },
  },
}
