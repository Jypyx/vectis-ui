export default {
  title: 'Champ de fichiers',
  lead: '<code>VFileInput</code> sélectionne des fichiers via le sélecteur natif ou par glisser-déposer. Le modèle est toujours un <code>File[]</code>.',
  examples: {
    labelAndHint: {
      title: 'Libellé et aide',
      text: 'Nommez le champ avec <code>label</code>. Décrivez les fichiers acceptés dans <code>hint</code>.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille du champ ; <code>compact</code> réduit sa hauteur.',
    },
    multiple: {
      title: 'Fichiers multiples',
      text: '<code>multiple</code> autorise plusieurs fichiers. Sinon, les fichiers supplémentaires sont refusés.',
    },
    clearable: {
      title: 'Effacement',
      text: '<code>clearable</code> ajoute un bouton pour vider la sélection.',
    },
    display: {
      title: 'Affichage',
      text: 'Avec plusieurs fichiers, <code>display</code> choisit entre des noms séparés par des virgules et des chips supprimables. Un fichier unique apparaît toujours sous forme de texte.',
    },
    perFileLimits: {
      title: 'Limites par fichier',
      text: '<code>accept</code> filtre les types et <code>maxSize</code> limite chaque fichier en octets. Chaque fichier refusé émet <code>reject</code>. Ajoutez des extensions si les types MIME peuvent être absents.',
    },
    selectionLimits: {
      title: 'Limites de sélection',
      text: '<code>maxFiles</code> et <code>maxTotalSize</code> limitent toute la sélection, fichiers déjà présents compris.',
    },
    counter: {
      title: 'Compteur',
      text: '<code>counter</code> affiche le nombre de fichiers et leur taille totale. Son slot reçoit <code>text</code>, <code>count</code> et <code>bytes</code>.',
    },
    customIcon: {
      title: 'Icône personnalisée',
      text: 'Remplacez l’icône du sélecteur avec <code>pickerIcon</code>.',
    },
    states: {
      title: 'États',
      text: '<code>readonly</code> empêche la sélection et le retrait. <code>noDrop</code> désactive uniquement le glisser-déposer. <code>loading</code> affiche un indicateur sans désactiver la sélection.',
    },
  },
  api: {
    VFileInput: {
      props: {
        multiple: 'Autorise plusieurs fichiers. Sinon, les fichiers supplémentaires sont refusés.',
        accept:
          'Types acceptés, selon la syntaxe native comme <code>image/*,.pdf</code>. Filtre les sélections et les fichiers déposés.',
        display:
          'Affichage de plusieurs fichiers : texte ou chips supprimables. Un fichier unique utilise toujours du texte.',
        maxSize: 'Taille maximale par fichier, en octets.',
        maxTotalSize: 'Taille maximale de la sélection, en octets.',
        maxFiles: 'Nombre maximal de fichiers sélectionnés.',
        counter: 'Affiche le nombre de fichiers et leur taille totale sous le champ.',
        pickerIcon: 'Icône du bouton ouvrant le sélecteur de fichiers.',
        noDrop: 'Désactive le glisser-déposer ; le sélecteur reste disponible.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        disabled: 'Désactive les interactions.',
        readonly:
          'Empêche l’ouverture du sélecteur, le dépôt et le retrait de fichiers. Les contrôles conservent le focus.',
        invalid:
          'Marque le contrôle comme invalide et applique le style d’erreur. Validez séparément la sélection de fichiers.',
        label:
          'Libellé visible. Sans nom visible, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        hint: 'Texte d’aide lié par <code>aria-describedby</code>.',
        placeholder:
          'Texte affiché quand la sélection est vide. Utilise le dictionnaire de la bibliothèque par défaut.',
        iconStart:
          'Icône de début. Un écouteur <code>@click:icon-start</code> en fait un bouton ; fournissez <code>iconStartLabel</code>.',
        iconStartLabel: 'Nom accessible du bouton d’icône de début.',
        pickerIconLabel:
          'Nom accessible du bouton de sélection de fichiers. Utilise le dictionnaire de la bibliothèque par défaut.',
        loading: 'Affiche un indicateur sans désactiver la sélection ni le glisser-déposer.',
        loadingText:
          'Texte de chargement et nom accessible de l’indicateur. Utilise le dictionnaire de la bibliothèque par défaut.',
        clearable: 'Ajoute un bouton pour vider la sélection.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Utilise le dictionnaire de la bibliothèque par défaut.',
        vModel:
          'Fichiers sélectionnés sous forme de <code>File[]</code>, même pour un seul fichier.',
      },
      events: {
        change: 'La sélection a changé. Reçoit le <code>File[]</code> complet.',
        reject:
          'Émis pour chaque fichier refusé. Reçoit le fichier et un motif : <code>type</code>, <code>size</code>, <code>count</code> ou <code>total-size</code>.',
        clear: 'La sélection a été effacée ; le modèle est déjà vide.',
        remove:
          'Un chip a retiré un fichier. Reçoit le fichier et son index ; suivi de <code>change</code>.',
        clickIconStart: 'Le bouton de l’icône de début a été activé.',
      },
      slots: {
        chip: 'Contenu du chip de fichier. Reçoit le fichier, son nom abrégé, <code>remove</code>, la taille et la densité.',
        counter:
          'Contenu du compteur. Reçoit le <code>text</code> localisé, <code>count</code> et la taille totale en <code>bytes</code>.',
        valueEnd: 'Contenu avant les boutons d’effacement et de sélection.',
        start: 'Contenu après <code>iconStart</code>.',
      },
    },
  },
}
