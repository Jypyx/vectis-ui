export default {
  title: 'Pagination',
  lead: '<code>VPagination</code> sélectionne une page avec des boutons ou des liens. Il peut tronquer la plage.',
  examples: {
    variantsAndTones: {
      title: 'Variantes et tonalités',
      text: '<code>itemVariant</code> définit le style des autres pages et des contrôles. <code>tone</code> colore uniquement la page actuelle.',
    },
    selectedVariants: {
      title: 'Comment la sélection est dessinée',
      text: '<code>selectedVariant</code> définit le style de la page actuelle : plein, atténué ou sans fond.',
    },
    detached: {
      title: 'Détaché',
      text: '<code>detached</code> sépare les boutons. <code>bordered</code> ajoute des séparateurs entre les boutons joints.',
    },
    elevated: {
      title: 'Surélevé',
      text: '<code>elevated</code> ajoute une ombre à la ligne, ou à chaque bouton s’ils sont séparés.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> définit la taille des boutons ; <code>compact</code> réduit leur hauteur.',
    },
    length: {
      title: 'Nombre de pages',
      text: '<code>length</code> est le nombre total de pages. Sans <code>totalVisible</code>, toutes les pages apparaissent.',
    },
    totalVisible: {
      title: "Nombre d'emplacements",
      text: '<code>totalVisible</code> limite les emplacements de pages et de points de suspension. À partir de cinq emplacements, les première et dernière pages restent visibles. En dessous, des pages consécutives entourent la page courante, jusqu’à la page courante seule. À zéro, seuls les contrôles restent.',
    },
    controls: {
      title: 'Précédent et suivant',
      text: '<code>controls</code> choisit des icônes, du texte, les deux ou aucun contrôle. Ils se désactivent si aucune page n’est accessible dans leur direction.',
    },
    edgeControls: {
      title: 'Première et dernière',
      text: '<code>edgeControls</code> ajoute des contrôles menant aux première et dernière pages accessibles, affichés comme l’indique <code>controls</code>.',
    },
    unreachablePages: {
      title: 'Pages inaccessibles',
      text: '<code>disabledPages</code> accepte un tableau de pages ou un prédicat. Les contrôles ignorent ces pages.',
    },
    links: {
      title: 'Liens',
      text: 'Fournissez <code>href</code> pour afficher des liens. Gérez <code>navigate</code> et appelez <code>preventDefault()</code> pour naviguer via un routeur. Les clics avec une touche modificatrice conservent le comportement natif sans modifier le modèle.',
    },
    states: {
      title: 'États',
      text: '<code>disabled</code> désactive toute la ligne.',
    },
    alignment: {
      title: 'Alignement',
      text: '<code>align</code> positionne la ligne dans la largeur disponible.',
    },
  },
  api: {
    VPagination: {
      props: {
        length: 'Nombre total de pages.',
        totalVisible:
          'Nombre maximal d’emplacements de pages et de points de suspension ; 0 ne laisse que les contrôles. Absent, affiche toutes les pages.',
        detached: 'Sépare les boutons de page.',
        bordered:
          'Ajoute des séparateurs entre les boutons joints. Ignoré si les boutons sont séparés.',
        itemVariant: 'Style des autres pages et des contrôles précédent/suivant.',
        selectedVariant: 'Style de la page actuelle.',
        tone: 'Couleur de la page actuelle.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans modifier le texte ni les icônes.',
        elevated: 'Ajoute une ombre à la ligne ou aux boutons séparés.',
        align: 'Alignement de la ligne dans la largeur disponible.',
        controls: 'Contenu précédent/suivant : icônes, texte, les deux ou <code>false</code>.',
        prevIcon: 'Icône du contrôle précédent.',
        nextIcon: 'Icône du contrôle suivant.',
        prevText:
          'Texte et nom accessible du contrôle précédent. Utilise le dictionnaire par défaut.',
        nextText:
          'Texte et nom accessible du contrôle suivant. Utilise le dictionnaire par défaut.',
        edgeControls:
          'Ajoute des contrôles première et dernière page, affichés comme l’indique <code>controls</code>.',
        firstIcon: 'Icône du contrôle première page.',
        lastIcon: 'Icône du contrôle dernière page.',
        firstText:
          'Texte et nom accessible du contrôle première page. Utilise le dictionnaire par défaut.',
        lastText:
          'Texte et nom accessible du contrôle dernière page. Utilise le dictionnaire par défaut.',
        disabled: 'Désactive les interactions.',
        disabledPages:
          'Pages indisponibles sous forme de tableau ou de prédicat. Les contrôles les ignorent.',
        label: 'Nom accessible de la navigation. Utilise le dictionnaire par défaut.',
        pageLabel:
          'Fonction fournissant un nom accessible pour chaque numéro de page. Utilise le dictionnaire par défaut.',
        href: 'Fonction associant une page à son URL. Affiche les pages et contrôles comme des liens.',
        vModel: 'Page actuelle, à partir de 1.',
      },
      events: {
        navigate:
          'Activation d’une page, avant la mise à jour du modèle. Reçoit la page et le clic ; appelez <code>preventDefault()</code> pour le routage. Les clics avec une touche modificatrice ne l’émettent pas.',
      },
    },
  },
}
