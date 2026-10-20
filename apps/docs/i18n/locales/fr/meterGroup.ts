export default {
  title: 'Groupe de jauges',
  lead: '<code>VMeterGroup</code> montre comment un total se répartit : plusieurs mesures partageant une même plage, dessinées comme les parts d’une seule barre avec une légende.',
  examples: {
    colours: {
      title: 'Couleurs',
      text: 'Chaque item prend un <code>tone</code> ou une <code>color</code>. Sans l’un ni l’autre, sa teinte est dérivée de sa position à partir de l’accent, et suit le thème. Une <code>icon</code> remplace la pastille de la légende.',
    },
    values: {
      title: 'Valeurs',
      text: '<code>showValue</code> écrit la somme après le libellé. La somme et chaque montant sont par défaut des pourcentages de <code>max</code> ; <code>formatOptions</code> les formate selon la locale courante, et <code>valueText</code> remplace la somme.',
    },
    overflow: {
      title: 'Dépassement',
      text: 'Quand les montants dépassent <code>max</code>, les parts se partagent toute la barre au prorata. La légende garde les vrais montants.',
    },
    slots: {
      title: 'Slots',
      text: 'Le slot <code>value</code> remplace la somme. <code>item-leading</code>, <code>item-label</code> et <code>item-value</code> remplacent la pastille, le libellé et le montant d’une ligne de la légende.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> règle l’épaisseur de la barre, de 2 à 20 pixels, sur la même échelle que <code>VMeter</code>. <code>hideLegend</code> masque la légende à l’écran ; les lecteurs d’écran la lisent toujours.',
    },
    orientation: {
      title: 'Orientation',
      text: '<code>orientation="vertical"</code> remplit du bas vers le haut et place la légende à côté de la barre. Définissez une hauteur pour régler la longueur de la barre.',
    },
  },
  api: {
    VMeterGroup: {
      props: {
        items: 'Parts, dans l’ordre où elles remplissent la barre.',
        max: 'Total auquel les montants se mesurent. Les parts se partagent la barre au prorata quand ils le dépassent.',
        label:
          'Ce qui est mesuré, affiché au-dessus de la barre et nommant le groupe. Utilise le dictionnaire par défaut ; les attributs ARIA de nommage fournis sont prioritaires.',
        hideLabel: 'Masque le libellé à l’écran. Les lecteurs d’écran le lisent toujours.',
        showValue: 'Écrit la somme des montants après le libellé.',
        valueText: 'Texte remplaçant la somme formatée.',
        formatOptions:
          'Options de <code>Intl.NumberFormat</code> formatant la somme et chaque montant.',
        hideLegend: 'Masque la légende à l’écran. Les lecteurs d’écran la lisent toujours.',
        size: 'Épaisseur de la barre.',
        orientation:
          'Barre horizontale ou verticale. En vertical, le remplissage va du bas vers le haut, la légende à côté.',
      },
      slots: {
        value:
          'Contenu remplaçant la somme. Reçoit <code>value</code>, <code>max</code> et <code>percent</code>.',
        itemLeading:
          'Contenu décoratif remplaçant la pastille ou l’icône d’une ligne. Reçoit <code>item</code>, <code>index</code> et <code>percent</code>.',
        itemLabel:
          'Contenu remplaçant le libellé d’une ligne. Reçoit <code>item</code>, <code>index</code> et <code>percent</code>.',
        itemValue:
          'Contenu remplaçant le montant d’une ligne. Reçoit <code>item</code>, <code>index</code> et <code>percent</code>.',
      },
    },
  },
}
