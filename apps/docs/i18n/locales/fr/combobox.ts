export default {
  title: 'Liste déroulante',
  lead: "Un champ qui cherche dans une liste et retient ce qui est choisi, une valeur ou plusieurs. Les options peuvent être à plat, groupées ou séparées, et elles peuvent arriver d'un serveur à mesure que le lecteur saisit.",

  api: {
    VCombobox: {
      props: {
        options:
          "Ce que la liste propose. Une entrée peut être une option, un bloc nommé d'options, ou un séparateur ; une simple liste d'options reste parfaitement valable.",
        multiple:
          'Permet de choisir plusieurs valeurs, ce qui fait de la valeur une liste et montre ce qui a été choisi en puces dans le champ.',
        size: 'La hauteur du champ : 32, 40 ou 48 pixels. Le panneau et ses lignes la suivent.',
        compact: 'Retire 4px à la hauteur, comme partout ailleurs dans le design system.',
        placeholder: "Ce que dit le champ tant que rien n'est choisi et que rien n'a été saisi.",
        disabled: 'Rend le champ inutilisable, grisé par les tokens de couleur.',
        invalid: 'Marque le champ comme invalide, pour une règle à vous.',
        clearable: 'Propose une croix qui vide à la fois la sélection et la recherche.',
        emptyText: 'Ce que dit le panneau quand la recherche ne correspond à rien.',
        filter:
          'Comment la liste se resserre à la saisie. La couper signifie que les options arrivent déjà filtrées par leur source et sont montrées telles quelles. Une règle à vous reçoit la requête TELLE QUE SAISIE, simplement rognée, et non la forme insensible aux accents utilisée en interne.',
        searchDebounce:
          "Combien de temps attendre avant de dire à la source ce qui est cherché, en millisecondes. Zéro le lui dit aussitôt, ce qui convient à une source qui n'est pas une requête réseau.",
        loading:
          'Dit que quelque chose est en cours de chargement. Sans option encore, tout le panneau le dit ; avec des options déjà listées, un indicateur apparaît au pied de la liste, puisque ce qui charge est alors la page suivante. Dans les deux cas, le champ remplace son chevron par un indicateur.',
        loadingText:
          "Ce qui est dit pendant le chargement, et ce comme quoi l'indicateur est annoncé.",
        hasMore:
          "Dit qu'il reste des pages à venir, ce qui est ce qui pousse le composant à demander la suivante quand la fin de la liste entre dans le champ de vision.",
        vModel:
          "La valeur de l'option choisie, ou leur liste quand <code>multiple</code> est posé. Elle part sur une chaîne vide, et le tableau n'est jamais muté sur place.",
      },
      events: {
        search:
          "Ce qui est cherché, à envoyer à la source. C'est retardé de <code>searchDebounce</code> pendant la saisie, et émis aussitôt à l'ouverture du panneau pour qu'une première page puisse être chargée. Le même terme n'est jamais émis deux fois de suite.",
        loadMore:
          'La fin de la liste est entrée dans le champ de vision : envoyez la page suivante.',
      },
      slots: {
        option:
          "Ce qu'une ligne de la liste montre, à la place du simple libellé : un sous-titre, un avatar, un badge. On lui dit si la ligne est celle mise en évidence et si elle est déjà choisie.",
        chip: "Remplace la puce qui représente une valeur choisie. Elle reçoit <code>remove</code>, sans quoi la valeur ne pourrait plus être retirée, ainsi que la taille et la densité calculées pour tenir dans le champ, qui ne se devinent pas de l'extérieur. L'option elle-même peut manquer, si cette valeur n'a jamais figuré parmi les options.",
        empty: 'Ce que le panneau montre quand rien ne correspond. Il reçoit le terme cherché.',
        loading: 'Ce que le panneau montre pendant le chargement de ses premières options.',
      },
    },
  },
}
