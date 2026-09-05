export default {
  title: 'Groupe de boutons',
  lead: "Assemble des boutons en un seul contrôle segmenté : bordures fusionnées, coins arrondis aux extrémités seulement. La rangée est un objet unique, donc c'est le groupe qui décide de son dessin, depuis le fait même d'assembler les boutons jusqu'à la variante, le ton, la taille et la densité que chacun d'eux reprend.",

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'Le sens dans lequel les boutons sont assemblés : une rangée par défaut, ou une colonne avec <code>vertical</code>.',
        detached:
          'Laisse les boutons séparés, avec un écart entre eux et chacun gardant ses propres coins, au lieu de les assembler en contrôle segmenté. Tout ce que le groupe transmet circule toujours, et une rangée surélevée laisse alors chaque bouton porter sa propre ombre.',
        seamless:
          "Retire les traits entre les boutons assemblés : aucune couture n'est dessinée, et les bordures des deux côtés de chaque arête partagée sont effacées, si bien que la rangée se lit comme un cadre unique plutôt que comme des segments. Les arêtes extérieures restent. Sans effet sous <code>detached</code>, où aucune arête n'est partagée.",
        fullWidth:
          "Étire la rangée sur toute la largeur de son parent, chaque segment prenant une part égale de cette largeur quel que soit son libellé. Un segment ne descend jamais sous la largeur de son propre libellé : une rangée de libellés trop longs pour le parent le déborde au lieu d'être écrasée. Sous <code>vertical</code>, il ne reste que la largeur, une colonne étirant déjà chaque segment.",
        variant:
          "Le poids visuel que porte chaque segment, sur les valeurs de VButton : <code>solid</code>, <code>outline</code>, <code>ghost</code> ou <code>soft</code>. Il l'emporte sur la variante donnée à un bouton, un segment d'une autre silhouette ne se lisant plus comme un morceau de la rangée. Omis, chaque bouton garde la sienne.",
        tone: 'La couleur des segments, parmi <code>accent</code>, <code>neutral</code> et <code>danger</code>. Celui-ci est un repli et non un ordre : un bouton qui nomme son propre ton le garde, ce qui permet à une seule action destructrice de se signaler dans la rangée.',
        size: "La hauteur des segments, tirée de l'échelle de tailles partagée par tous les contrôles : <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> ou <code>xl</code>. Elle l'emporte sur la taille donnée à un bouton. Omise, chaque bouton garde la sienne.",
        compact:
          "Retire 4px à la hauteur de chaque segment. Il l'emporte sur la valeur donnée à un bouton. Omis, chaque bouton garde la sienne.",
        elevated:
          "Soulève la rangée avec l'échelle d'ombres, aux conditions de la prop de VButton. L'ombre est celle de la rangée et non celle de chaque segment, ce qui garde les joints nets : trois ombres qui se chevauchent y dessineraient une bande sombre. Il l'emporte sur la valeur donnée à un bouton. Omis, chaque bouton garde la sienne.",
        disabled:
          "Rend chaque segment inutilisable. Celui-ci s'ajoute au lieu de trancher : un bouton qui se désactive lui-même le reste dans une rangée qui ne dit rien, et un segment ne peut pas se réactiver une fois la rangée éteinte.",
      },
      slots: {
        default: 'Les VButton et VIconButton à assembler.',
      },
    },
  },
}
