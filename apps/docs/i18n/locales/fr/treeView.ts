export default {
  title: 'Arborescence',
  lead: '<code>VTreeView</code> affiche une hiérarchie que le lecteur déplie et replie, comme des fichiers ou un plan de site. Il suit le motif ARIA tree : un seul arrêt de tabulation, les flèches pour se déplacer, ouvrir et fermer, et la saisie pour aller à un libellé.',
  examples: {
    selection: {
      title: 'Sélection',
      text: '<code>selectionMode="single"</code> sélectionne un nœud au clic, avec Entrée ou Espace, et <code>v-model</code> contient sa valeur. Le chevron replie une branche sans la sélectionner. Un nœud désactivé reste accessible au clavier.',
    },
    checkboxes: {
      title: 'Cases à cocher',
      text: '<code>selectionMode="multiple"</code> donne une case à cocher à chaque ligne. Cocher une branche coche tout son sous-arbre, et une branche cochée en partie affiche un tiret. Le modèle liste les nœuds cochés dans l’ordre de l’arbre, une branche comprise dès que tout ce qu’elle contient est coché. Les nœuds désactivés gardent leur état.',
    },
    links: {
      title: 'Liens',
      text: 'Un nœud avec <code>href</code> est un lien, et <code>current</code> marque la page consultée. Pour confier la navigation à un routeur, appelez <code>preventDefault()</code> sur l’événement que reçoit <code>activate</code>.',
    },
    lazyLoading: {
      title: 'Chargement à la demande',
      text: '<code>loadChildren</code> récupère les enfants d’un nœud <code>lazy</code> à sa première ouverture, et l’arbre les conserve. Un échec referme le nœud et l’annonce ; l’ouverture suivante réessaie.',
    },
    endContent: {
      title: 'Contenu de fin',
      text: 'Le slot <code>#end</code> ajoute un contenu au bout de chaque ligne, comme un compteur. Il ne doit contenir aucun élément focusable : une ligne est un seul contrôle.',
    },
  },
  api: {
    VTreeView: {
      props: {
        items:
          'Premier niveau de l’arbre. Chaque nœud a une <code>value</code> unique et un <code>label</code>, et en option <code>icon</code>, <code>children</code>, <code>lazy</code>, <code>href</code>, <code>current</code> et <code>disabled</code>.',
        selectionMode:
          'Si les nœuds peuvent être sélectionnés : pas du tout, un à la fois, ou plusieurs avec des cases à cocher.',
        loadChildren:
          'Récupère les enfants d’un nœud <code>lazy</code> à sa première ouverture. Un échec referme le nœud ; l’ouverture suivante réessaie.',
        size: 'Hauteur des lignes.',
        label: 'Nom accessible de l’arbre. Par défaut, celui du dictionnaire de la bibliothèque.',
        vModel:
          'Sélection : une valeur ou <code>null</code> en mode <code>single</code>, un tableau en mode <code>multiple</code>. Une valeur donnée pour une branche coche son sous-arbre.',
        vModelExpanded: 'Valeurs des nœuds dépliés. Sans liaison, l’arbre garde cet état lui-même.',
      },
      events: {
        activate:
          'Un nœud a été cliqué ou validé avec Entrée. Reçoit le nœud et l’événement ; <code>preventDefault()</code> annule un lien.',
      },
      slots: {
        icon: 'Contenu remplaçant l’icône. Reçoit <code>item</code>, <code>level</code> et <code>expanded</code>.',
        label: 'Contenu remplaçant le libellé. Reçoit les mêmes props.',
        end: 'Contenu au bout de la ligne. Ne doit pas être focusable.',
      },
    },
  },
}
