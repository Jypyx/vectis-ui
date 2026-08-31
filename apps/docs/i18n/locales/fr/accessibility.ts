export default {
  title: 'Accessibilité',
  lead: 'Navigation au clavier et sémantique ARIA sur chaque composant. <code>prefers-reduced-motion</code> est respecté partout, et axe audite chaque story dans les deux thèmes à chaque commit.',

  guaranteedHeading: 'Ce qui est garanti',
  guarantees: [
    "Tout ce qui est interactif s'atteint et s'utilise au clavier, dans l'ordre où la page se lit, sans impasse pour en sortir.",
    "Chaque composant porte le patron ARIA que son comportement implique : le rôle qu'il joue, l'état à mesure qu'il change, et les relations entre ses parties. Ce qui est annoncé est ce que la chose fait, pas ce à quoi elle ressemble.",
    'Le focus est toujours visible, et il retourne là où il était quand un panneau, un menu ou une boîte de dialogue se referme.',
    "Tout ce qui s'ouvre se referme avec Échap, et tout ce qui apparaît ou se met à jour de lui-même est annoncé au lieu d'être laissé à la vigilance du lecteur.",
    "Un contrôle qui ne contient qu'une icône ne peut pas s'écrire sans nom accessible : la prop est obligatoire, l'oubli est donc une erreur de compilation et non une erreur silencieuse.",
    "Le contraste du texte tient le plancher WCAG AA dans le thème clair comme dans le sombre, et les états désactivés se grisent par les tokens de couleur plutôt que par l'opacité, ce qui les garde lisibles sur n'importe quelle surface.",
  ],
  guaranteedBody:
    "La moitié du JavaScript comportemental de la bibliothèque existe pour cela plutôt que pour faire fonctionner quoi que ce soit. Les composants sont accessibles d'abord et interactifs ensuite, et le code est étiqueté pour que ce rapport se compte au lieu de se proclamer.",

  focusHeading: 'Focus',
  focusBody:
    "Le focus est un contour de 2px à 2px de décalage, tracé à l'extérieur de la boîte, donc sans coût de mise en page. Partout où le conteneur rogne son contenu, il est ramené vers l'intérieur : les boutons internes d'un champ, le résumé d'un accordéon, une ligne de navigation dans une branche animable. Un contour tracé hors d'une boîte qui rogne est un contour que personne ne voit.",
  focusCaption:
    "Parcourez-les avec Tab. Un champ de texte fait exception à la règle, avec une bordure d'accent de 1px plus une ombre de la même couleur, et la croix qu'il contient prend l'anneau pour elle.",

  validationHeading: 'Validation',
  validationBody:
    "<code>:user-invalid</code>, et non <code>:invalid</code> : un champ ne rougit qu'une fois que le lecteur l'a quitté, si bien qu'un e-mail à moitié saisi n'est jamais déclaré faux. La prop <code>invalid</code> force l'état pour une règle que seul le serveur peut vérifier.",

  motionHeading: 'Animation',
  motionBody:
    "Sous <code>prefers-reduced-motion</code>, les transitions passent à <code>none</code>, tandis que les animations en boucle ralentissent au lieu de s'arrêter. Un indicateur de chargement passe de 1s à 3s, parce qu'un indicateur figé se lit comme une page cassée.",

  forcedColorsHeading: 'Couleurs forcées',
  forcedColorsBody:
    "Deux décisions de la bibliothèque existent pour le mode couleurs forcées de Windows, et toutes deux méritent d'être reprises. Les icônes sont dessinées en <code>&lt;svg&gt;&lt;path fill=\"currentcolor\"&gt;</code> et jamais en fond masqué, qui y disparaît. Les filets sont peints avec une bordure plutôt qu'un fond : un fond est forcé à <code>Canvas</code>, la couleur de la page elle-même, tandis qu'une couleur de bordure est forcée à <code>CanvasText</code> et survit.",
}
