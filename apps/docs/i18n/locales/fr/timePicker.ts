export default {
  title: "Sélecteur d'heure",
  lead: '<code>VTimePicker</code> est une horloge intégrée pour choisir les heures et les minutes. Son modèle utilise le format sur 24 heures <code>HH:mm</code>.',
  examples: {
    minuteStep: {
      title: 'Pas des minutes',
      text: '<code>minuteStep</code> définit le pas à la souris et au clavier. Seules les minutes accessibles apparaissent sur le cadran.',
    },
    restrictions: {
      title: 'Ce que l’on peut choisir',
      text: 'Limitez les choix avec des bornes horaires et des règles d’heures ou de minutes autorisées. Une heure est indisponible si aucune de ses minutes n’est autorisée.',
    },
    hourFormat: {
      title: 'Format horaire',
      text: '<code>12h</code> affiche un cercle d’heures et des contrôles AM/PM ; <code>24h</code> affiche deux cercles. Le modèle utilise toujours 24 heures.',
    },
    localization: {
      title: 'Localisation',
      text: 'La locale définit le cycle horaire, sauf si <code>format</code> le remplace.',
    },
  },
  api: {
    VTimePicker: {
      props: {
        format:
          'Affichage sur 12 ou 24 heures. Dépend de la locale par défaut ; le modèle utilise toujours 24 heures.',
        locale:
          'Locale BCP 47 pour l’affichage des heures. Remplace la locale globale ; <code>format</code> est prioritaire.',
        minuteStep: 'Pas des minutes pour l’horloge et les touches fléchées.',
        min: 'Première heure autorisée, incluse, au format <code>HH:mm</code>.',
        max: 'Dernière heure autorisée, incluse, au format <code>HH:mm</code>.',
        allowedHours: 'Heures autorisées : tableau ou prédicat recevant une valeur sur 24 heures.',
        allowedMinutes: 'Minutes autorisées : tableau ou prédicat.',
        disabled: 'Désactive les interactions.',
        readonly:
          'Empêche les modifications. Le cadran conserve le focus et permet toujours d’alterner entre les heures et les minutes.',
        label:
          'Nom accessible de l’horloge. Utilise le dictionnaire par défaut ; l’attribut <code>aria-label</code> fourni est prioritaire.',
        vModel:
          'Heure sur 24 heures au format <code>HH:mm</code>, ou <code>null</code>. Une horloge vide affiche minuit.',
      },
      events: {
        confirm:
          'Confirmation des minutes au clavier. Reçoit l’heure actuelle ; relâcher le pointeur ne l’émet pas.',
      },
      slots: {
        footer: 'Actions sous l’horloge.',
      },
    },
  },
}
