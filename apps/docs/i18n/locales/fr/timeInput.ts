export default {
  title: "Champ d'heure",
  lead: '<code>VTimeInput</code> permet de saisir une heure, de la choisir sur une horloge ou dans une liste filtrable. Le modèle utilise toujours le format sur 24 heures <code>HH:mm</code>.',
  examples: {
    labelAndHint: {
      title: 'Libellé, indication et icône',
      text: 'Nommez le champ avec <code>label</code> et ajoutez une aide avec <code>hint</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille du champ ; <code>compact</code> réduit sa hauteur.',
    },
    modes: {
      title: 'Modes',
      text: '<code>input</code> permet la saisie, avec une horloge facultative via <code>showPicker</code>. <code>picker</code> utilise uniquement l’horloge. <code>list</code> propose une liste d’heures filtrable.',
    },
    steps: {
      title: 'Pas',
      text: '<code>minuteStep</code> définit le pas de l’horloge et l’intervalle de la liste. Il ne limite pas les minutes saisies. Un pas plus grand réduit la longueur de la liste.',
    },
    restrictions: {
      title: 'Ce que l’on peut choisir',
      text: '<code>min</code>, <code>max</code>, <code>allowedHours</code> et <code>allowedMinutes</code> limitent les choix de l’horloge et de la liste. Une heure saisie hors de ces limites modifie le modèle, mais échoue à la validation native du champ.',
    },
    clearable: {
      title: 'Effaçable',
      text: '<code>clearable</code> ajoute un bouton pour effacer l’heure.',
    },
    states: {
      title: 'États',
      text: '<code>readonly</code> empêche toute modification de la valeur et conserve le focus. <code>loading</code> affiche un indicateur sans désactiver les interactions.',
    },
    twelveHour: {
      title: 'Horloge de douze heures',
      text: '<code>format="12h"</code> affiche des contrôles AM/PM. Le modèle reste une heure sur 24 heures.',
    },
    localization: {
      title: 'Localisation',
      text: '<code>locale</code> définit les conventions d’affichage. Un <code>format</code> explicite remplace son cycle horaire.',
    },
    placement: {
      title: 'Positionnement',
      text: '<code>placement</code> définit la position souhaitée du panneau.',
    },
  },
  api: {
    VTimeInput: {
      props: {
        format:
          'Affichage sur 12 ou 24 heures. Dépend de la locale par défaut ; le modèle utilise toujours 24 heures.',
        mode: 'Saisie, sélection sur horloge ou liste d’heures filtrable.',
        showPicker:
          'Ajoute une horloge au mode saisie. Le mode horloge l’inclut toujours ; le mode liste l’ignore.',
        minuteStep:
          'Pas de l’horloge et intervalle de la liste en minutes. Ne limite pas les valeurs saisies.',
        min: 'Première heure autorisée, incluse, au format <code>HH:mm</code>.',
        max: 'Dernière heure autorisée, incluse, au format <code>HH:mm</code>.',
        allowedHours: 'Heures autorisées : tableau ou prédicat recevant une valeur sur 24 heures.',
        allowedMinutes: 'Minutes autorisées : tableau ou prédicat.',
        locale:
          'Locale BCP 47 pour l’affichage des heures. Remplace la locale globale ; <code>format</code> est prioritaire.',
        label:
          'Libellé visible. Sans nom visible, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Pose <code>aria-invalid</code>, est lié par <code>aria-describedby</code> et est annoncé quand il apparaît.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        placeholder: 'Texte indicatif lorsque le champ est vide.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        disabled: 'Désactive les interactions.',
        readonly:
          'Empêche la saisie, la sélection, le changement AM/PM et l’effacement. Conserve le focus.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas à lui seul l’envoi du formulaire.',
        iconStart:
          'Icône de début. Un écouteur <code>@click:icon-start</code> en fait un bouton ; fournissez <code>iconStartLabel</code>.',
        iconStartLabel: 'Nom accessible du bouton d’icône de début.',
        pickerLabel:
          'Nom accessible du bouton horloge. Utilise le dictionnaire de la bibliothèque par défaut.',
        loading: 'Remplace l’icône horloge par un indicateur sans désactiver le champ.',
        loadingText:
          'Texte de chargement et nom accessible de l’indicateur. Utilise le dictionnaire de la bibliothèque par défaut.',
        clearable: 'Ajoute un bouton pour effacer la valeur.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Utilise le dictionnaire de la bibliothèque par défaut.',
        pickerIcon: 'Icône du bouton horloge. Sans effet en mode liste.',
        placement: 'Position souhaitée du panneau par rapport au champ.',
        vModel: 'Heure sur 24 heures au format <code>HH:mm</code>, ou <code>null</code>.',
      },
      events: {
        clear: 'L’heure a été effacée ; le modèle est déjà réinitialisé.',
        clickIconStart: 'Le bouton de l’icône de début a été activé.',
      },
      slots: {
        footer:
          'Remplace les boutons Annuler et OK de l’horloge. Appelez <code>confirm</code> pour valider le brouillon ou <code>cancel</code> / <code>close</code> pour l’annuler. Absent en mode liste.',
        valueEnd: 'Contenu avant les boutons d’effacement et de sélection.',
        start: 'Contenu après <code>iconStart</code>.',
      },
    },
  },
}
