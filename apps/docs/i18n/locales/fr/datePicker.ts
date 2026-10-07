export default {
  title: 'Sélecteur de date',
  lead: '<code>VDatePicker</code> est un calendrier intégré pour une date, une période ou plusieurs dates. Les valeurs sont des dates locales au format <code>YYYY-MM-DD</code>.',
  examples: {
    range: {
      title: 'Période',
      text: 'Sélectionnez le début puis la fin de la période. Le modèle est <code>{ start, end }</code> ; chaque borne peut valoir <code>null</code> tant que la période est incomplète.',
    },
    multiple: {
      title: 'Dates multiples',
      text: 'Sélectionnez des dates pour les ajouter au tableau de dates ISO ; sélectionnez-les à nouveau pour les retirer.',
    },
    presets: {
      title: 'Raccourcis',
      text: 'Placez des boutons de dates prédéfinies dans <code>footer</code> et utilisez-les pour modifier le modèle.',
    },
    disabledDates: {
      title: 'Dates désactivées',
      text: '<code>disabledDates</code> accepte des dates ISO ou un prédicat. Les jours indisponibles restent visibles et accessibles au clavier.',
    },
    bounds: {
      title: 'Minimum et maximum',
      text: '<code>min</code> et <code>max</code> limitent la sélection et la navigation dans le calendrier.',
    },
    events: {
      title: 'Pastilles',
      text: 'Signalez les événements par des points colorés. Leurs libellés font partie du nom accessible du jour.',
    },
    adjacentDays: {
      title: 'Jours adjacents',
      text: 'Affichez les jours voisins avec <code>showAdjacentDays</code>. Autorisez leur sélection avec <code>selectAdjacentDays</code>.',
    },
    localization: {
      title: 'Localisation',
      text: '<code>locale</code> définit les noms des mois et le début de semaine. <code>firstDayOfWeek</code> remplace ce dernier.',
    },
  },
  api: {
    VDatePicker: {
      props: {
        selection: 'Mode de sélection : une date, une période ou plusieurs dates.',
        locale:
          'Locale BCP 47 pour l’affichage des dates et le début de semaine. Remplace la locale globale.',
        firstDayOfWeek:
          'Premier jour de la semaine, de 0 (dimanche) à 6 (samedi). Dépend de la locale par défaut.',
        min: 'Première date sélectionnable au format <code>YYYY-MM-DD</code>. Limite aussi la navigation.',
        max: 'Dernière date sélectionnable au format <code>YYYY-MM-DD</code>. Limite aussi la navigation.',
        disabledDates:
          'Dates indisponibles : tableau de chaînes ISO ou prédicat. Les jours restent visibles et accessibles au clavier.',
        showAdjacentDays: 'Affiche les jours des mois voisins.',
        selectAdjacentDays:
          'Permet de sélectionner les jours des mois voisins et ouvre le mois choisi. Implique <code>showAdjacentDays</code>.',
        events:
          'Événements représentés par trois points au maximum par jour. Chacun accepte une date, une couleur CSS et un libellé accessible.',
        disabled: 'Désactive la sélection et la navigation.',
        readonly:
          'Empêche la sélection. La navigation entre les mois et les années reste disponible.',
        label:
          'Nom accessible du calendrier. Utilise le dictionnaire par défaut ; l’attribut <code>aria-label</code> fourni est prioritaire.',
        vModel:
          'Date ISO ou <code>null</code> pour une sélection unique, <code>{ start, end }</code> pour une période, tableau de dates ISO pour une sélection multiple.',
      },
      events: {
        select:
          'Une date a été sélectionnée. Reçoit le modèle actuel, y compris une période incomplète.',
      },
      slots: {
        day: 'Contenu d’une cellule. Reçoit <code>iso</code>, <code>day</code>, <code>inMonth</code>, <code>disabled</code>, <code>selected</code>, <code>today</code>, <code>inRange</code> et <code>events</code>.',
        footer: 'Actions ou dates prédéfinies sous la grille.',
      },
    },
  },
}
