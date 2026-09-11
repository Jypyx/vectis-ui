export default {
  title: 'Infobulle',
  lead: "Une courte description de l'élément sous le pointeur, ou sous le focus clavier. C'est une description et jamais un conteneur : rien à l'intérieur ne peut être manipulé.",

  examples: {
    placements: {
      title: 'Placements',
      text: "Huit côtés, dont quatre alignés sur un bord du déclencheur plutôt que centrés dessus, ce qui empêche une infobulle de pendre au bout d'un contrôle large. La valeur nomme une préférence et non une position : le navigateur déplace le panneau de lui-même quand le côté demandé n'a pas la place. Choisissez celui qui se lit le mieux là où le contrôle se trouve habituellement, et laissez les cas limites se régler seuls.",
    },
    edgeFlipping: {
      title: "Au bord de l'écran",
      text: "Faute de place du côté demandé, le panneau prend le côté opposé. C'est du CSS pur et cela ne coûte aucun JavaScript, aucune mesure et aucun observateur : le panneau nomme ses replis et le navigateur fait le reste. Faites défiler les boutons ci-dessous contre le haut puis le bas de la fenêtre pour le voir se produire.",
    },
    delay: {
      title: 'Ouverture et fermeture',
      text: "Le pointeur doit se poser sur le déclencheur avant que l'infobulle apparaisse, 300 ms par défaut : passer dessus en allant ailleurs n'ouvre donc rien. Un délai de 0 supprime complètement l'attente. Le focus clavier, lui, ouvre immédiatement, l'intention n'y faisant aucun doute, et Échap referme sans déplacer le focus. Appuyer sur le déclencheur referme aussi, ce dont a besoin un bouton qui ouvre un panneau : le pointeur n'est pas parti et le focus n'a peut-être pas bougé, donc l'infobulle se tiendrait sinon par-dessus ce que le clic vient d'ouvrir.",
    },
    describing: {
      title: 'Décrire, pas nommer',
      text: "Une infobulle pose <code>aria-describedby</code> sur son déclencheur, et le déclencheur garde son propre nom accessible. Un bouton-icône porte donc toujours son <code>label</code>, l'infobulle en étant la confirmation visuelle plutôt que le remplacement. Le corollaire est la règle à retenir : un tap n'ouvre rien, faute de survol sur un écran tactile et faute de place pour un panneau qui se tiendrait par-dessus ce que le tap vient d'ouvrir. Ce que dit l'infobulle doit donc exister ailleurs aussi. Elle complète ; elle ne porte jamais rien à elle seule.",
    },
    richContent: {
      title: 'Contenu riche',
      text: "Le slot l'emporte sur la prop <code>text</code> quand les deux sont fournis, pour une description qui demande plus d'une suite de texte : un intitulé, un raccourci, une icône. Il doit rester non interactif. L'infobulle se referme dès que le pointeur quitte le déclencheur, donc un lien à l'intérieur ne pourrait jamais être atteint, et la description est de toute façon aplatie en texte brut pour un lecteur d'écran. Ce sur quoi on peut agir appartient à un panneau qui reste ouvert, ce à quoi servent VPopover et VMenu.",
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
