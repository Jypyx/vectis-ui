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
      text: '<code>showValue</code> écrit la valeur après le libellé. C’est par défaut un pourcentage de la plage. <code>formatOptions</code> formate la valeur elle-même selon la locale courante, et <code>valueText</code> la remplace par vos propres mots. Les lecteurs d’écran lisent le même texte, écrit ou non.',
    },
    valuePosition: {
      title: 'Position de la valeur',
      text: '<code>valuePosition</code> écrit la valeur dans la barre, au début, au centre ou à la fin, comme dans <code>VProgressLinear</code>. Seule <code>size="xl"</code> est assez épaisse pour la contenir.',
    },
    segments: {
      title: 'Segments',
      text: '<code>segments</code> découpe la barre en parts égales. La couleur seule ne distingue pas la zone : dites-la dans <code>valueText</code> quand elle compte.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> règle l’épaisseur de la barre, de 2 à 20 pixels, sur la même échelle que <code>VProgressLinear</code>. La jauge occupe toute la largeur de son conteneur.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> remplit du bas vers le haut, segments et texte dans la barre compris. Définissez une hauteur pour régler la longueur de la barre.',
    },
    hiddenText: {
      title: 'Texte masqué',
      text: 'Sans <code>showValue</code>, la valeur n’est pas écrite, et <code>hideLabel</code> masque le libellé. Les lecteurs d’écran entendent toujours les deux.',
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
        showValue: 'Écrit la valeur. Les lecteurs d’écran la lisent dans tous les cas.',
        valuePosition:
          'Position de la valeur : après le libellé, ou dans la barre. En vertical, le début est en bas.',
        tone: 'Couleur du remplissage. Choisie selon la zone quand <code>low</code>, <code>high</code> ou <code>optimum</code> est défini, accent sinon.',
        color: 'Couleur CSS personnalisée remplaçant le ton.',
        segments: 'Nombre de parts égales de la barre.',
        size: 'Épaisseur de la barre. Seule <code>xl</code> contient la valeur dans la barre.',
        orientation:
          'Barre horizontale ou verticale. En vertical, le remplissage va du bas vers le haut.',
      },
    },
  },
}
