export default {
  title: "Fil d'Ariane",
  lead: '<code>VBreadcrumb</code> affiche un fil d’Ariane à partir d’un tableau d’éléments et identifie la page actuelle par son URL.',
  examples: {
    separator: {
      title: 'Séparateur personnalisé',
      text: '<code>separatorIcon</code> remplace le séparateur entre les segments.',
    },
    icons: {
      title: 'Avec des icônes',
      text: 'Chaque élément peut inclure une <code>icon</code> décorative à côté du libellé.',
    },
    truncated: {
      title: 'Troncature',
      text: 'Au-delà de <code>maxItems</code>, le fil conserve le premier élément et les deux derniers. Un menu de points de suspension liste les éléments masqués.',
    },
    router: {
      title: 'Routeur',
      text: 'Chaque segment est un vrai <code>&lt;a&gt;</code>. Un clic émet <code>navigate</code> avec l’élément et l’événement : avec Nuxt ou Vue Router, appelez <code>preventDefault()</code> et poussez <code>item.href</code>. Un clic avec une touche de modification n’émet rien et ouvre toujours un nouvel onglet.',
    },
  },
  api: {
    VBreadcrumb: {
      props: {
        items: 'Éléments du fil, de la racine au niveau actuel.',
        label: 'Nom accessible de la navigation. Utilise le dictionnaire par défaut.',
        currentPath:
          'URL utilisée pour identifier l’élément actuel. Les barres obliques finales, paramètres de requête et fragments sont ignorés.',
        separatorIcon: 'Icône de séparation. Retournée dans les dispositions de droite à gauche.',
        maxItems: 'Seuil de troncature, avec un minimum effectif de 3.',
        ellipsisLabel:
          'Nom accessible du menu de points de suspension. Utilise le dictionnaire par défaut.',
      },
      events: {
        navigate:
          'Segment suivi, depuis le fil ou le menu des points de suspension. Reçoit l’élément et le clic ; appelez <code>preventDefault()</code> pour le routage. Les clics avec une touche modificatrice ne l’émettent pas.',
      },
    },
  },
}
