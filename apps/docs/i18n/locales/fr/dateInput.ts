export default {
  title: 'Champ de date',
  lead: '<code>VDateInput</code> associe un champ de date localisé à <code>VDatePicker</code>. Il accepte une date, une période ou plusieurs dates.',
  examples: {
    labelAndHint: {
      title: 'Libellé, aide et icône',
      text: 'Nommez le champ avec <code>label</code> et ajoutez une aide avec <code>hint</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille du champ ; <code>compact</code> réduit sa hauteur.',
    },
    modes: {
      title: 'Modes',
      text: '<code>input</code> accepte une date numérique localisée. <code>showPicker</code> y ajoute un calendrier. <code>picker</code> utilise uniquement le calendrier ; les sélections de période et de dates multiples imposent ce mode.',
    },
    range: {
      title: 'Période',
      text: '<code>selection="range"</code> utilise un modèle <code>{ start, end }</code>. Chaque borne est une date ISO ou <code>null</code>.',
    },
    multiple: {
      title: 'Dates multiples',
      text: '<code>selection="multiple"</code> utilise un tableau de dates ISO. Sélectionnez à nouveau une date pour la retirer.',
    },
    presets: {
      title: 'Raccourcis',
      text: 'Ajoutez des dates prédéfinies dans <code>footer</code>. Son rappel <code>close</code> ferme le panneau.',
    },
    bounds: {
      title: 'Bornes et jours fermés',
      text: '<code>min</code> et <code>max</code> limitent la sélection et la navigation. Excluez certaines dates avec <code>disabledDates</code>.',
    },
    events: {
      title: 'Pastilles',
      text: '<code>events</code> ajoute trois points au maximum par jour. Les libellés des événements font partie du nom accessible du jour.',
    },
    customDay: {
      title: 'Cellules de jour personnalisées',
      text: 'Personnalisez le contenu des cellules avec <code>day</code>, à partir de leur date et de leur état de sélection.',
    },
    clearable: {
      title: 'Effacement',
      text: '<code>clearable</code> ajoute un bouton pour effacer la sélection.',
    },
    adjacentDays: {
      title: 'Jours adjacents',
      text: '<code>showAdjacentDays</code> affiche les jours voisins. <code>selectAdjacentDays</code> permet aussi de les choisir et ouvre leur mois.',
    },
    states: {
      title: 'États',
      text: '<code>readonly</code> empêche la saisie, la sélection et l’effacement tout en conservant le focus. <code>loading</code> affiche un indicateur sans désactiver le champ.',
    },
    localization: {
      title: 'Localisation',
      text: '<code>locale</code> définit les noms et l’ordre des éléments de date. <code>displayFormat</code> personnalise l’affichage en mode calendrier ; il ne modifie pas le masque de saisie.',
    },
    placement: {
      title: 'Placement',
      text: '<code>placement</code> définit la position souhaitée du calendrier.',
    },
  },
  api: {
    VDateInput: {
      props: {
        selection: 'Mode de sélection : une date, une période ou plusieurs dates.',
        locale:
          'Locale BCP 47 pour l’affichage des dates et le début de semaine. Remplace la locale globale.',
        firstDayOfWeek:
          'Premier jour de la semaine, de 0 (dimanche) à 6 (samedi). Dépend de la locale par défaut.',
        min: 'Première date sélectionnable au format <code>YYYY-MM-DD</code>. Limite aussi la navigation.',
        max: 'Dernière date sélectionnable au format <code>YYYY-MM-DD</code>. Limite aussi la navigation.',
        disabledDates:
          'Dates indisponibles : tableau de chaînes ISO ou prédicat. Les jours restent visibles et accessibles au clavier.',
        showAdjacentDays: 'Affiche les jours des mois voisins.',
        selectAdjacentDays:
          'Permet de sélectionner les jours des mois voisins et ouvre le mois choisi. Implique <code>showAdjacentDays</code>.',
        events:
          'Événements représentés par trois points au maximum par jour. Chacun accepte une date, une couleur CSS et un libellé accessible.',
        mode: '<code>input</code> pour la saisie, <code>picker</code> pour le calendrier. Les périodes et dates multiples imposent le mode calendrier.',
        showPicker: 'Ajoute un calendrier au mode saisie. Le mode calendrier l’inclut toujours.',
        label:
          'Libellé visible. Sans nom visible, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        placeholder: 'Texte indicatif lorsque le champ est vide.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        disabled: 'Désactive les interactions.',
        readonly: 'Empêche la saisie, la sélection et l’effacement. Le champ conserve le focus.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        iconStart:
          'Icône de début. Un écouteur <code>@click:icon-start</code> en fait un bouton ; fournissez <code>iconStartLabel</code>.',
        iconStartLabel: 'Nom accessible du bouton d’icône de début.',
        pickerIconLabel:
          'Nom accessible du bouton calendrier. Utilise le dictionnaire de la bibliothèque par défaut.',
        loading:
          'Remplace l’icône calendrier par un indicateur. Ne désactive ni la saisie ni le panneau.',
        loadingText:
          'Texte de chargement et nom accessible de l’indicateur. Utilise le dictionnaire de la bibliothèque par défaut.',
        clearable: 'Ajoute un bouton pour effacer la sélection.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Utilise le dictionnaire de la bibliothèque par défaut.',
        pickerIcon: 'Icône du bouton calendrier, affichée si un panneau est disponible.',
        displayFormat:
          'Options d’affichage en mode calendrier. Ne modifie pas le masque de saisie numérique.',
        placement: 'Position souhaitée du panneau par rapport au champ.',
        vModel:
          'Date ISO ou <code>null</code>, période <code>{ start, end }</code> ou tableau de dates ISO. La saisie ne modifie le modèle que si elle est complète et autorisée ; les autres valeurs sont annulées à la perte du focus.',
      },
      events: {
        clear: 'La sélection a été effacée ; le modèle est déjà réinitialisé.',
        clickIconStart: 'Le bouton de l’icône de début a été activé.',
      },
      slots: {
        day: 'Contenu d’une cellule. Reçoit les données du slot de jour de <code>VDatePicker</code>.',
        footer: 'Pied du panneau. Reçoit <code>close</code> pour le fermer.',
        valueEnd: 'Contenu avant les boutons d’effacement et de calendrier.',
        start: 'Contenu après <code>iconStart</code>.',
      },
    },
  },
}
