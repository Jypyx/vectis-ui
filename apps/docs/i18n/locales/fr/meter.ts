export default {
  title: 'Jauge',
  lead: '<code>VMeter</code> affiche une mesure dans une plage connue, comme l’espace disque utilisé, le niveau d’une batterie ou la robustesse d’un mot de passe. Sa couleur peut dire si la mesure est bonne, moyenne ou mauvaise.',
  examples: {
    regions: {
      title: 'Zones',
      text: '<code>low</code>, <code>high</code> et <code>optimum</code> suivent les règles du <code>&lt;meter&gt;</code> natif. La partie de la plage qui contient <code>optimum</code> est bonne et peinte en succès, la partie voisine est moyenne en avertissement, et la partie opposée est mauvaise en danger. Sans aucune des trois, la jauge prend la couleur d’accent.',
    },
    tones: {
      title: 'Tons',
      text: '<code>tone</code> fixe la couleur quelle que soit la zone. <code>color</code> accepte une couleur de votre choix, dont la piste est dérivée.',
    },
    valueText: {
      title: 'Valeur',
      text: 'La valeur est par défaut un pourcentage de la plage. <code>formatOptions</code> formate la valeur elle-même selon la locale courante, et <code>valueText</code> la remplace par vos propres mots. Les lecteurs d’écran lisent le même texte.',
    },
    segments: {
      title: 'Segments',
      text: '<code>segments</code> découpe la barre en parts égales. La couleur seule ne distingue pas la zone : dites-la dans <code>valueText</code> quand elle compte.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> règle l’épaisseur de la barre, 4, 8 ou 12 pixels. La jauge occupe toute la largeur de son conteneur.',
    },
    hiddenText: {
      title: 'Texte masqué',
      text: '<code>hideLabel</code> et <code>hideValue</code> retirent le texte au-dessus de la barre. Les lecteurs d’écran entendent toujours le libellé et la valeur.',
    },
  },
  api: {
    VMeter: {
      props: {
        value: 'Mesure, ramenée dans la plage.',
        min: 'Borne inférieure de la plage.',
        max: 'Borne supérieure de la plage.',
        low: 'Fin de la partie basse de la plage.',
        high: 'Début de la partie haute de la plage.',
        optimum:
          'Meilleure valeur. Sa partie de la plage est bonne, la voisine moyenne et l’opposée mauvaise.',
        label:
          'Ce qui est mesuré, affiché au-dessus de la barre et la nommant. Utilise le dictionnaire par défaut ; les attributs ARIA de nommage fournis sont prioritaires.',
        hideLabel: 'Masque le libellé à l’écran. Les lecteurs d’écran le lisent toujours.',
        valueText: 'Texte remplaçant la valeur formatée, à l’écran et pour les lecteurs d’écran.',
        formatOptions: 'Options de <code>Intl.NumberFormat</code> formatant la valeur elle-même.',
        hideValue: 'Masque la valeur à l’écran. Les lecteurs d’écran la lisent toujours.',
        tone: 'Couleur du remplissage. Choisie selon la zone quand <code>low</code>, <code>high</code> ou <code>optimum</code> est défini, accent sinon.',
        color: 'Couleur CSS personnalisée remplaçant le ton.',
        segments: 'Nombre de parts égales de la barre.',
        size: 'Épaisseur de la barre et taille du texte.',
      },
    },
  },
}
