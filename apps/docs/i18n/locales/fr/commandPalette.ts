export default {
  title: 'Palette de commandes',
  lead: '<code>VCommandPalette</code> ouvre un champ de recherche au-dessus d’une liste de commandes, dans un dialogue modal natif. La saisie filtre la liste, les flèches s’y déplacent et Entrée exécute une commande. La prop <code>shortcut</code> l’ouvre depuis n’importe où dans la page.',
  examples: {
    groups: {
      title: 'Groupes',
      text: 'Passez des commandes, des groupes nommés et des séparateurs dans <code>items</code>. Les <code>keywords</code> sont cherchés sans être affichés, et le <code>shortcut</code> d’une commande est seulement affiché.',
    },
    links: {
      title: 'Liens',
      text: 'Une commande avec <code>href</code> est un lien : Entrée le suit, et un clic modifié l’ouvre dans un nouvel onglet. Avec un routeur, appelez <code>event.preventDefault()</code> dans <code>select</code> et naviguez vous-même.',
    },
    asyncSearch: {
      title: 'Recherche asynchrone',
      text: 'Passez <code>filter</code> à <code>false</code> et chargez les commandes sur <code>search</code>, émis avec un délai. <code>loading</code> affiche un indicateur dans le champ.',
    },
    recent: {
      title: 'Commandes récentes',
      text: 'La palette ne garde aucun historique. Retenez les choix depuis <code>select</code> et ajoutez un groupe de commandes récentes tant que <code>v-model:query</code> est vide.',
    },
  },
  api: {
    VCommandPalette: {
      props: {
        items: 'Commandes, groupes nommés et séparateurs.',
        shortcut:
          'Raccourci global qui ouvre et ferme la palette, comme <code>mod+k</code>. Ignoré pendant la saisie dans un autre champ. Ajoute <code>aria-keyshortcuts</code> au déclencheur.',
        filter:
          'Filtrage intégré insensible aux accents sur les libellés et les mots-clés, filtrage désactivé, ou fonction personnalisée recevant la commande et la recherche nettoyée.',
        searchDebounce:
          'Délai en millisecondes avant d’émettre une recherche saisie. Zéro émet immédiatement.',
        loading:
          'Affiche un indicateur dans le champ, et une ligne de chargement tant qu’aucune commande n’est disponible.',
        loadingText:
          'Texte de chargement annoncé aux lecteurs d’écran. Gardez-le cohérent avec un contenu <code>#loading</code> personnalisé.',
        emptyText:
          'Titre du <code>VEmptyState</code> par défaut, également annoncé aux lecteurs d’écran. Gardez-le cohérent avec un contenu <code>#empty</code> personnalisé.',
        placeholder: 'Texte indicatif du champ de recherche. Par défaut, celui du dictionnaire.',
        label: 'Nom accessible de la palette et de sa liste. Par défaut, celui du dictionnaire.',
        searchLabel: 'Nom accessible du champ de recherche. Par défaut, celui du dictionnaire.',
        hideFooter: 'Masque le pied qui liste les touches.',
        width: 'Largeur de la palette : pixels pour un nombre, sinon une longueur CSS.',
        vModelOpen: 'État d’ouverture. La fermeture native met le modèle à jour.',
        vModelQuery: 'Texte recherché. Vidé à la fermeture de la palette.',
      },
      events: {
        select:
          'Émis avec la commande et l’événement de clic quand une commande est choisie. La palette se ferme ensuite, sauf si la commande a <code>keepOpen</code>.',
        search:
          'Émet le terme recherché après <code>searchDebounce</code>, ou immédiatement à l’ouverture. Deux termes identiques consécutifs ne sont émis qu’une fois.',
      },
      slots: {
        trigger: 'Contrôle d’ouverture. Liez-y les <code>triggerProps</code> fournies.',
        item: 'Libellé et description d’une ligne. Reçoit la commande et son état actif.',
        empty:
          'Contenu de l’état vide. Reçoit la recherche ; définissez aussi <code>emptyText</code>.',
        loading: 'Contenu de chargement. Définissez aussi <code>loadingText</code>.',
        footer: 'Remplace le pied qui liste les touches.',
      },
    },
  },
}
