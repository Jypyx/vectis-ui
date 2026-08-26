export default {
  title: 'Puce',
  lead: "Une petite information : un statut, une étiquette, un filtre qui reste choisi. Elle partage mot pour mot sa table de variantes et de tons avec VButton, et ajoute les deux états qu'un bouton n'a pas.",

  tonesHeading: 'Tons et variantes',
  tonesBody:
    "Une puce porte cinq tons, et non trois : ici un ton est un STATUT plutôt qu'une intention, donc succès et avertissement y ont leur place.",
  sizesCaption:
    'Seulement les deux plus petites tailles de contrôle : une puce plus grande que cela est un bouton.',

  statesHeading: 'Choisie, et écartée',
  statesBody:
    "<code>selectable</code> fait de la puce une chose qui RESTE choisie, et l'emporte sur <code>href</code> et <code>clickable</code> ; <code>check</code> affiche une coche avant le libellé tant qu'elle est sélectionnée, en remplaçant l'icône de début. <code>dismissible</code> ajoute un bouton qui DEMANDE le retrait — enlever la puce reste votre décision, donc le composant émet <code>dismiss</code> et ne retire rien de lui-même.",

  colourHeading: 'Une couleur à vous',
  colourBody:
    "<code>color</code> REMPLACE le ton, et chaque nuance en est dérivée avec <code>color-mix()</code> — ce dont a besoin une liste d'étiquettes venue d'une base de données, dont les couleurs sont des données et non des décisions de design. Le clair et le sombre sont pris en charge pour vous.",

  apiHeading: 'API',
  apiColor: "<code>string</code> — n'importe quelle couleur CSS ; remplace le ton",
  apiCheck: '<code>boolean</code> — remplace <code>iconStart</code> tant que sélectionnée',
  apiDismissible: '<code>boolean</code> — émet <code>dismiss</code>',
  apiElement:
    "L'élément rendu suit la même priorité : <code>selectable</code> et <code>clickable</code> donnent un <code>&lt;button&gt;</code>, <code>href</code> un <code>&lt;a&gt;</code>, et une puce qui n'a rien de tout cela est un simple <code>&lt;span&gt;</code> — jamais une chose focalisable qui ne fait rien.",
}
