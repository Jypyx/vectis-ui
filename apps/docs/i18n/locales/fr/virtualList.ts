export default {
  title: 'Liste virtuelle',
  lead: '<code>VVirtualList</code> ne rend que les lignes proches de sa zone visible, pour des listes trop longues pour être rendues entières. Elle défile elle-même : donnez-lui une hauteur avec <code>height</code>, ou une hauteur bornée dans votre CSS.',
  examples: {
    variableHeights: {
      title: 'Lignes de hauteurs différentes',
      text: '<code>itemSize</code> n’est que la hauteur supposée des lignes pas encore rendues. Chaque ligne est mesurée une fois et retenue sous son <code>itemKey</code> ; renseignez-le si des lignes peuvent être insérées, retirées ou réordonnées.',
    },
    scrollToIndex: {
      title: 'Défiler jusqu’à une ligne',
      text: 'La méthode <code>scrollToIndex(index, align)</code> rend la ligne si besoin et l’amène dans la zone visible : en haut (<code>start</code>), au centre (<code>center</code>), en bas (<code>end</code>), ou avec le plus petit déplacement par défaut.',
    },
    infiniteScroll: {
      title: 'Défilement infini',
      text: '<code>hasMore</code> émet <code>load-more</code> quand la fin de la liste approche. Ajoutez les lignes suivantes à <code>items</code> ; pendant ce temps, <code>loading</code> termine la liste par une ligne de chargement.',
    },
    focusableRows: {
      title: 'Lignes focusables',
      text: 'La liste a le rôle <code>list</code> et reçoit le focus, le clavier la fait donc défiler. La ligne qui a le focus reste rendue quand la liste défile. Si chaque ligne contient un contrôle, <code>tabindex="-1"</code> retire l’arrêt de tabulation de la liste. La recherche dans la page n’atteint que les lignes rendues : proposez une recherche pour les longues listes.',
    },
  },
  api: {
    VVirtualList: {
      props: {
        items:
          'Toutes les lignes de la liste. Seules celles proches de la zone visible sont rendues.',
        itemKey:
          'Champ qui identifie une ligne, sous lequel sa hauteur mesurée est retenue. Par défaut, la position de la ligne.',
        itemSize:
          'Hauteur supposée d’une ligne pas encore rendue, en pixels. Une simple estimation.',
        overscan: 'Lignes rendues au-delà de chaque bord de la zone visible.',
        initialCount: 'Lignes rendues côté serveur et jusqu’à l’hydratation.',
        height: 'Hauteur de la liste : pixels ou toute longueur CSS.',
        label: 'Nom accessible de la liste.',
        loading:
          'Termine la liste par une ligne de chargement et la marque <code>aria-busy</code>.',
        loadingText:
          'Texte de la ligne de chargement. Par défaut, celui du dictionnaire de la bibliothèque.',
        hasMore:
          'Émet <code>load-more</code> quand la fin de la liste approche. Le total est alors annoncé comme inconnu.',
      },
      events: {
        loadMore: 'La fin de la liste approche : ajoutez les lignes suivantes.',
      },
      slots: {
        default: 'Une ligne. Reçoit <code>item</code> et <code>index</code>.',
        loading: 'Contenu qui remplace l’indicateur et le texte de la ligne de chargement.',
      },
    },
  },
}
