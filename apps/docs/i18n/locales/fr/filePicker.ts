export default {
  title: 'Sélecteur de fichiers',
  lead: '<code>VFilePicker</code> est une zone de dépôt avec un sélecteur natif et une liste d’aperçus facultative. Le modèle est toujours un <code>File[]</code>.',
  examples: {
    titleAndSubtitle: {
      title: 'Titre et sous-titre',
      text: 'Utilisez <code>title</code> pour la consigne et <code>subtitle</code> pour les contraintes de fichiers.',
    },
    preview: {
      title: 'La liste des fichiers',
      text: '<code>preview="bottom"</code> liste les fichiers sous la zone. <code>preview="end"</code> les place à côté, puis en dessous si le composant est étroit.',
    },
    customIcons: {
      title: 'Icônes personnalisées',
      text: 'Personnalisez l’icône de la zone avec <code>icon</code> et celles des types de fichiers avec <code>typeIcons</code>.',
    },
    thumbnails: {
      title: 'Vignettes',
      text: 'Les images affichent des miniatures. <code>hideThumbnails</code> les remplace par des icônes de type de fichier.',
    },
    multiple: {
      title: 'Fichiers multiples',
      text: '<code>multiple</code> autorise plusieurs fichiers ; <code>maxFiles</code> limite la sélection.',
    },
    accept: {
      title: 'Types acceptés',
      text: '<code>accept</code> filtre les sélections et les dépôts. Ajoutez des extensions si les types MIME peuvent être absents.',
    },
    maxSize: {
      title: 'Taille maximale',
      text: '<code>maxSize</code> limite chaque fichier en octets. Écoutez <code>reject</code> pour expliquer les refus.',
    },
    totalSize: {
      title: 'Taille totale et nombre',
      text: '<code>maxTotalSize</code> limite toute la sélection, fichiers déjà présents compris.',
    },
    states: {
      title: 'États',
      text: '<code>readonly</code> empêche les ajouts et retraits tout en conservant le focus. <code>loading</code> remplace l’icône de la zone par un indicateur sans désactiver la sélection.',
    },
  },
  api: {
    VFilePicker: {
      props: {
        title: 'Consigne de dépôt obligatoire.',
        subtitle: 'Contraintes de fichiers facultatives sous le titre.',
        icon: 'Grande icône de la zone de dépôt.',
        hideBrowse:
          'Masque le bouton de parcours et transforme la zone en bouton, activable avec Entrée ou Espace.',
        browseText:
          'Texte visible et nom accessible du bouton de parcours. Utilise le dictionnaire de la bibliothèque par défaut.',
        preview:
          'Position des aperçus : <code>false</code>, <code>bottom</code> ou <code>end</code>. La liste latérale passe en dessous dans un conteneur étroit.',
        hideThumbnails: 'Utilise des icônes de type de fichier à la place des miniatures.',
        typeIcons: 'Icônes personnalisées par catégorie de fichier.',
        removeIcon: 'Icône du bouton de retrait d’un fichier.',
        multiple: 'Autorise plusieurs fichiers. Sinon, les fichiers supplémentaires sont refusés.',
        accept:
          'Types acceptés, selon la syntaxe native comme <code>image/*,.pdf</code>. Filtre les sélections et les fichiers déposés.',
        maxSize: 'Taille maximale par fichier, en octets.',
        maxTotalSize: 'Taille maximale de la sélection, en octets.',
        maxFiles: 'Nombre maximal de fichiers sélectionnés.',
        disabled: 'Désactive les interactions.',
        readonly:
          'Empêche l’ouverture du sélecteur, le dépôt et le retrait de fichiers. Les contrôles conservent le focus.',
        invalid:
          'Marque le contrôle comme invalide et applique le style d’erreur. Validez séparément la sélection de fichiers.',
        loading: 'Affiche un indicateur à la place de l’icône sans désactiver la sélection.',
        loadingText:
          'Texte de chargement et nom accessible de l’indicateur. Utilise le dictionnaire de la bibliothèque par défaut.',
        vModel:
          'Fichiers sélectionnés sous forme de <code>File[]</code>, même pour un seul fichier.',
      },
      events: {
        change: 'La sélection a changé. Reçoit le <code>File[]</code> complet.',
        reject:
          'Émis pour chaque fichier refusé. Reçoit le fichier et un motif : <code>type</code>, <code>size</code>, <code>count</code> ou <code>total-size</code>.',
        remove: 'Un fichier a été retiré. Reçoit le fichier et son index.',
      },
      slots: {
        icon: 'Illustration de la zone. Gardez-la non interactive.',
        title:
          'Contenu de la consigne. Utilisez du texte et des éléments en ligne non interactifs.',
        subtitle:
          'Contenu des contraintes. Utilisez du texte et des éléments en ligne non interactifs.',
        browse:
          'Contrôle de parcours personnalisé. Reçoit <code>open</code> et <code>disabled</code> ; appelez <code>open</code> pour ouvrir le sélecteur.',
        item: 'Ligne d’aperçu entière. Reçoit le fichier, l’index, la catégorie, la miniature, l’icône, la taille formatée et <code>remove</code>.',
        thumbnail: 'Visuel de l’aperçu. Reçoit les mêmes données que <code>item</code>.',
        remove:
          'Contrôle de retrait. Appelez <code>remove</code> et utilisez <code>removeLabel</code> comme nom accessible.',
      },
    },
  },
}
