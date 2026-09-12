export default {
  title: 'Infobulle',
  lead: "Une courte description de l'élément sous le pointeur, ou sous le focus clavier. C'est une description et jamais un conteneur : rien à l'intérieur ne peut être manipulé.",

  examples: {
    placements: {
      title: 'Placements',
      text: '<code>placement</code> propose huit côtés, dont quatre alignés sur un bord du déclencheur plutôt que centrés dessus. Il nomme une préférence : le navigateur déplace le panneau quand le côté demandé manque de place.',
    },
    edgeFlipping: {
      title: "Au bord de l'écran",
      text: "Faute de place du côté demandé, le panneau prend le côté opposé. C'est du CSS pur, sans mesure ni observateur.",
    },
    delay: {
      title: 'Ouverture et fermeture',
      text: "<code>delay</code> est le temps pendant lequel le pointeur doit reposer sur le déclencheur avant que l'infobulle apparaisse, 300ms par défaut, et 0 supprime l'attente. Le focus clavier l'ouvre aussitôt, Échap la ferme sans retirer le focus, et appuyer sur le déclencheur la ferme aussi.",
    },
    describing: {
      title: 'Décrire, pas nommer',
      text: "L'infobulle pose <code>aria-describedby</code> sur son déclencheur, qui garde son propre nom accessible : un bouton icône porte toujours son <code>label</code>. Une tape n'ouvre rien, ce que dit l'infobulle doit donc exister ailleurs aussi.",
    },
    richContent: {
      title: 'Contenu riche',
      text: "Le slot <code>#content</code> l'emporte sur la prop <code>text</code> quand les deux sont donnés. Il doit rester non interactif : l'infobulle se ferme dès que le pointeur quitte le déclencheur, et la description est aplatie en texte simple pour un lecteur d'écran.",
    },
  },

  api: {
    VTooltip: {
      props: {
        text: "Ce que dit l'infobulle. Le slot <code>#content</code> la remplace quand les deux sont donnés.",
        placement:
          "De quel côté de l'élément l'infobulle apparaît. Le navigateur la bascule de lui-même du côté opposé quand la place manque.",
        delay:
          "Combien de temps le pointeur doit rester sur l'élément avant que l'infobulle apparaisse, en millisecondes. Le focus clavier l'ouvre immédiatement, l'intention n'y faisant aucun doute, et un délai de 0 supprime entièrement l'attente.",
      },
      slots: {
        default:
          "L'élément que l'infobulle décrit. Liez les <code>triggerProps</code> qu'il reçoit dessus, ce qui relie les deux pour les technologies d'assistance, et assurez-vous qu'il puisse prendre le focus, sans quoi les utilisateurs au clavier ne verront jamais l'infobulle.",
        content:
          "Un contenu plus riche qu'une simple chaîne : une mise en forme, un raccourci clavier, une icône. Il doit rester non interactif. L'infobulle se ferme dès que le pointeur quitte l'élément, donc un lien ou un bouton à l'intérieur ne pourrait jamais être atteint, et la description est de toute façon aplatie en texte brut pour les lecteurs d'écran. Un contenu manipulable appartient à un panneau qui reste ouvert, comme VMenu.",
      },
    },
  },
}
