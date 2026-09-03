export default {
  title: 'Groupe de boutons',
  lead: "Assemble des boutons en un seul contrôle segmenté : bordures fusionnées, coins arrondis aux extrémités seulement. La rangée est un objet unique, donc c'est le groupe qui porte la variante, le ton, la taille et la densité, et chaque bouton à l'intérieur les reprend.",

  api: {
    VButtonGroup: {
      props: {
        orientation:
          'Le sens dans lequel les boutons sont assemblés : une rangée par défaut, ou une colonne avec <code>vertical</code>.',
        variant:
          "Le poids visuel que porte chaque segment, sur les valeurs de VButton : <code>solid</code>, <code>outline</code>, <code>ghost</code> ou <code>soft</code>. Il l'emporte sur la variante donnée à un bouton, un segment d'une autre silhouette ne se lisant plus comme un morceau de la rangée. Omis, chaque bouton garde la sienne.",
        tone: 'La couleur des segments, parmi <code>accent</code>, <code>neutral</code> et <code>danger</code>. Celui-ci est un repli et non un ordre : un bouton qui nomme son propre ton le garde, ce qui permet à une seule action destructrice de se signaler dans la rangée.',
        size: "La hauteur des segments, tirée de l'échelle de tailles partagée par tous les contrôles : <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> ou <code>xl</code>. Elle l'emporte sur la taille donnée à un bouton. Omise, chaque bouton garde la sienne.",
        compact:
          "Retire 4px à la hauteur de chaque segment. Il l'emporte sur la valeur donnée à un bouton. Omis, chaque bouton garde la sienne.",
        elevated:
          "Soulève chaque segment de la page avec l'échelle d'ombres, aux conditions de la prop de VButton. Il l'emporte sur la valeur donnée à un bouton. Omis, chaque bouton garde la sienne.",
      },
      slots: {
        default: 'Les VButton et VIconButton à assembler.',
      },
    },
  },
}
