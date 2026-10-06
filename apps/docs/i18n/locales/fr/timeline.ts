export default {
  title: 'Frise chronologique',
  lead: '<code>VTimeline</code> liste des événements datés dans l’ordre. Chaque <code>VTimelineItem</code> a un marqueur sur la ligne, une date, un titre et son propre contenu.',
  examples: {
    split: {
      title: 'Dates en colonne',
      text: '<code>layout="split"</code> place les dates dans une colonne de l’autre côté de la ligne, aussi large que la date la plus longue, jusqu’au tiers de la largeur. Sous 30rem, la frise revient à <code>stacked</code>.',
    },
    alternate: {
      title: 'Côtés alternés',
      text: '<code>layout="alternate"</code> envoie un événement sur deux de l’autre côté de la ligne, face à sa date, et revient à <code>stacked</code> sous 36rem. Une année ou un mois s’écrit à cette précision. Les deux dispositions côte à côte prennent leur largeur de leur parent : dans une rangée flex, donnez à la frise une base propre.',
    },
    horizontal: {
      title: 'Horizontale',
      text: '<code>orientation="horizontal"</code> dispose les événements en largeur, marqueurs, dates et titres alignés. Quand ils ne tiennent plus, la liste défile et devient un arrêt de tabulation pour qu’on puisse la faire défiler au clavier.',
    },
    markers: {
      title: 'Marqueurs',
      text: '<code>tone</code> colore le marqueur et <code>icon</code> le dessine dans une pastille ronde. Le slot <code>marker</code> le remplace, par exemple par un avatar. Les marqueurs sont masqués aux lecteurs d’écran : dites dans le titre ce que signifie le ton.',
    },
    dates: {
      title: 'Dates',
      text: '<code>timeText</code> affiche une date relative tandis que <code>&lt;time&gt;</code> garde la date exacte. <code>locale</code> et <code>formatOptions</code> changent l’écriture des jours et des instants. Sur une page rendue côté serveur, définissez <code>timeZone</code> dans <code>formatOptions</code> pour les dates qui portent un décalage.',
    },
  },
  api: {
    VTimeline: {
      props: {
        orientation: 'Événements de haut en bas ou de gauche à droite.',
        layout:
          'Place des dates d’une frise verticale : au-dessus des titres, en colonne de l’autre côté de la ligne, ou face au contenu sur des côtés alternés.',
        size: 'Densité des espacements, des marqueurs et du texte du contenu.',
        headingLevel:
          'Rend les titres en <code>h1</code> à <code>h6</code>. Sans elle, ce sont des paragraphes.',
        locale: 'Locale d’écriture des dates. Par défaut, celle du design system.',
        formatOptions:
          'Options <code>Intl.DateTimeFormat</code> des jours et des instants. Les années et les mois gardent leur format.',
      },
      slots: {
        default: 'Enfants <code>VTimelineItem</code>.',
      },
    },
    VTimelineItem: {
      props: {
        datetime:
          'Année, mois, jour ou instant ISO, écrit dans la locale à l’intérieur d’un <code>&lt;time&gt;</code>.',
        timeText: 'Texte visible qui remplace la date écrite.',
        title: 'Ce qui s’est passé. Remplacé par le slot <code>title</code>.',
        tone: 'Couleur du marqueur.',
        icon: 'Icône dessinée dans une pastille ronde à la place du point.',
      },
      slots: {
        default: 'Détails de l’événement.',
        title: 'Titre avec balisage.',
        marker: 'Remplace le point ou la pastille. C’est une décoration.',
      },
    },
  },
}
