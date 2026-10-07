export default {
  title: 'Alerte',
  lead: '<code>VAlert</code> affiche un message dans le flux de la page, avec un titre, des actions et un bouton de fermeture facultatifs. Pour les notifications temporaires, utilisez <code>toast()</code>.',
  examples: {
    variants: {
      title: 'Variantes',
      text: '<code>variant</code> choisit <code>soft</code>, une surface teintée, ou <code>outline</code>, la surface de la page dans une bordure teintée.',
    },
    tones: {
      title: 'Tons',
      text: '<code>tone</code> définit la couleur sémantique et l’icône par défaut.',
    },
    icon: {
      title: 'Icône',
      text: '<code>icon</code> remplace l’icône du ton. <code>hideIcon</code> la retire. L’icône est décorative : le texte doit porter le sens.',
    },
    actions: {
      title: 'Actions',
      text: 'Le slot <code>actions</code> place des boutons ou des liens sous le message.',
    },
    closable: {
      title: 'Fermeture',
      text: '<code>closable</code> ajoute un bouton de fermeture qui passe <code>open</code> à <code>false</code> et émet <code>close</code>. Liez <code>v-model:open</code> pour réafficher l’alerte.',
    },
    live: {
      title: 'Annonce',
      text: 'Par défaut, l’alerte est lue avec le reste de la page. <code>live</code> l’annonce : <code>role="status"</code>, ou <code>role="alert"</code> pour le ton <code>danger</code>. Utilisez-le pour les alertes qui apparaissent après une action.',
    },
  },
  api: {
    VAlert: {
      props: {
        variant: 'Style visuel.',
        tone: 'Ton de couleur. Choisit aussi l’icône par défaut.',
        title: 'Texte au-dessus du message. Remplacé par le slot <code>title</code>.',
        icon: 'Icône remplaçant celle du ton.',
        hideIcon: 'Masque l’icône.',
        closable: 'Affiche un bouton de fermeture.',
        closeLabel: 'Nom accessible du bouton de fermeture. Utilise le dictionnaire par défaut.',
        live: 'Annonce l’alerte avec <code>role="status"</code>, ou <code>role="alert"</code> pour le ton <code>danger</code>.',
        vModelOpen:
          'Indique si l’alerte est affichée. Le bouton de fermeture la passe à <code>false</code>.',
      },
      events: {
        close:
          'Le bouton de fermeture a été activé. <code>open</code> vaut déjà <code>false</code>.',
      },
      slots: {
        default: 'Message.',
        title: 'Contenu personnalisé du titre.',
        actions: 'Boutons ou liens sous le message.',
      },
    },
  },
}
