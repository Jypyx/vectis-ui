export default {
  title: 'Notification',
  lead: "Des notifications levées depuis n'importe où dans le code en appelant <code>toast()</code>, et affichées par un seul VToaster monté une fois. Plusieurs peuvent s'empiler, chacune avec son propre compte à rebours.",

  examples: {
    variants: {
      title: 'Variantes et tonalités',
      text: "La tonalité dit ce que signifie la notification, et elle décide aussi de l'icône qu'elle prend quand aucune n'est fournie. Il y en a cinq, contre deux pour un snackbar, et la différence tient au sujet : une notification rapporte un ÉTAT, et le succès comme l'avertissement sont des états. La variante est la force avec laquelle cette tonalité est peinte : un fond teinté avec une bordure, ou la couleur pleine. Le plein se lit de plus loin et mérite d'être réservé à ce qui ne doit pas être manqué, une page de notifications pleines n'ayant plus rien pour hausser le ton.",
    },
    contents: {
      title: 'Titre et message',
      text: "Le message fait tout, et une phrase suffit le plus souvent. Un titre l'encadre quand le message seul ne dirait pas de quoi il s'agit, un échec nommant le fichier auquel il est arrivé, et c'est un intitulé plutôt qu'une première phrase : quelques mots, pas de point final. Une notification arrive sans prévenir et interrompt : elle se lit d'un coup d'œil ou pas du tout.",
    },
    icons: {
      title: 'Icônes',
      text: "Sans rien préciser, l'icône vient de la tonalité. Ce défaut est le bon la plupart du temps : une notification se balaie du regard avant d'être lue, et c'est le glyphe qui porte le sens au premier coup d'œil. En nommer une remplace celle de la tonalité, pour une notification dont le sujet est plus précis que la signification. Passer <code>false</code> la retire complètement, ce qui n'est pas la même chose que de ne rien préciser.",
    },
    width: {
      title: 'Largeur',
      text: "Laissée seule, la carte se tient entre un plancher et un plafond à elle : un message court n'est donc pas un filet, et un message long ne s'étire pas en travers de la page. N'importe quelle longueur CSS remplace les deux. Elle n'est jamais autorisée à dépasser la largeur de la fenêtre, marges comprises : une valeur trop grande pour un téléphone y est ignorée plutôt que de pousser la carte hors de l'écran.",
    },
    placements: {
      title: 'Placements',
      text: "Six coins, chacun avec sa pile, si bien que des notifications visant des coins différents ne font jamais la queue l'une derrière l'autre. Les six conteneurs existent en permanence et ne coûtent rien tant qu'ils sont vides. Posé sur le VToaster, le placement est celui de toutes les notifications ; passé au moment d'en lever une, il n'appartient qu'à elle.",
    },
    stacking: {
      title: 'Empilement',
      text: "Les notifications s'empilent au lieu de se remplacer, parce que deux états peuvent être vrais en même temps : une sauvegarde terminée et un envoi échoué méritent tous deux d'être lus. Chacune garde son propre compte à rebours : elles s'en vont donc à mesure que leurs horloges respectives expirent, et non dans l'ordre d'arrivée. C'est toute la différence avec un snackbar, qui confirme une action au lieu de rapporter un état, et où seule la dernière mérite d'être montrée.",
    },
    autoDismiss: {
      title: 'Combien de temps elle reste',
      text: "Cinq secondes par défaut, et chaque notification peut demander la sienne. Le compte à rebours est suspendu tant que le pointeur repose quelque part sur la pile et repart quand il la quitte : ce qui disparaît sur une horloge peut donc toujours être lu jusqu'au bout. Pesez la durée au regard de la longueur du message plutôt que de poser un même nombre partout : un titre et deux lignes prennent plus de temps à lire que « Enregistré ».",
    },
    persistent: {
      title: 'Notifications persistantes',
      text: "Une durée de 0 désarme le compte à rebours : la notification reste jusqu'à ce qu'on la renvoie. Réservez-le à ce que le lecteur doit voir, un échec sur lequel il peut agir ou un état encore en cours, et laissez la croix de fermeture pour qu'il y ait une sortie.",
    },
    dismissing: {
      title: 'Renvoyer une notification',
      text: "La croix de fermeture est active par défaut, et la retirer n'a de sens que sur une notification qui s'en va toute seule : sans compte à rebours et sans croix, rien d'autre que du code ne peut la faire disparaître. <code>toast</code> renvoie un identifiant, et <code>dismissToast</code> retire celle-là, ce dont a besoin une notification qui rapporte quelque chose en cours au moment où cela se termine. Appelé sans argument, il vide toutes les notifications d'un coup.",
    },
  },

  api: {
    VToaster: {
      props: {
        placement:
          "Dans quel coin les notifications apparaissent, sauf si l'une d'elles en demande un autre.",
        duration:
          "Combien de temps une notification reste, en millisecondes, sauf si elle demande autre chose. Une notification à qui l'on donne 0 reste jusqu'à ce qu'elle soit fermée.",
        closeLabel:
          'Ce que fait la croix de fermeture, en mots. Elle retombe sur le dictionnaire du design system.',
        label:
          "Ce que les lecteurs d'écran annoncent pour les zones de notification elles-mêmes, qui sont des points de repère de la page. Il retombe sur le dictionnaire du design system.",
      },
    },
  },
}
