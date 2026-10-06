export default {
  title: 'Carte de survol',
  lead: '<code>VHoverCard</code> donne un aperçu de la destination d’un lien, comme le profil derrière une mention, quand le pointeur ou le focus clavier s’y attarde. Son contenu peut être interactif.',
  examples: {
    inText: {
      title: 'Dans le texte',
      text: 'Le déclencheur suit le fil de la phrase. Le contenu de la carte est monté à la première ouverture : un déclencheur dans un paragraphe produit donc un HTML valide côté serveur.',
    },
    delays: {
      title: 'Délais',
      text: '<code>openDelay</code> fixe la durée de survol ou de focus avant l’ouverture. <code>closeDelay</code> garde la carte le temps que le pointeur franchisse l’écart qui l’en sépare.',
    },
    interactiveContent: {
      title: 'Contenu interactif',
      text: 'Le focus clavier ouvre la carte après le délai et Tab y entre. Échap la ferme depuis n’importe où et rend le focus au déclencheur. Un tap n’ouvre rien : gardez la même information à la destination du déclencheur.',
    },
    loadOnOpen: {
      title: 'Chargement à l’ouverture',
      text: '<code>v-model:open</code> signale chaque ouverture, le bon moment pour charger les données de la carte. Le modifier ouvre ou ferme la carte sans délai.',
    },
  },
  api: {
    VHoverCard: {
      props: {
        placement: 'Position souhaitée ; bascule si l’espace manque.',
        openDelay: 'Attente au survol ou au focus clavier avant l’ouverture, en millisecondes.',
        closeDelay:
          'Attente avant la fermeture une fois que le pointeur a quitté le déclencheur et la carte, en millisecondes.',
        vModelOpen: 'État d’ouverture. Les changements s’appliquent sans délai.',
      },
      slots: {
        default:
          'Déclencheur, généralement un lien. Liez les <code>triggerProps</code> fournies pour poser <code>aria-details</code>.',
        content:
          'Contenu de la carte, monté à la première ouverture. Peut contenir des liens et des boutons.',
      },
    },
  },
}
