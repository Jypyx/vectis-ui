export default {
  title: 'Accessibilité',
  lead: 'Navigation au clavier et sémantique ARIA sur chaque composant. <code>prefers-reduced-motion</code> est respecté partout, et axe audite chaque story dans les deux thèmes à chaque commit. Une violation fait échouer le build au lieu de produire un avertissement que personne ne lit.',

  guaranteedHeading: 'Ce qui est garanti',
  guarantees: [
    'Le patron ARIA menu : focus itinérant, et focus rendu au déclencheur à la fermeture.',
    '<code>role="switch"</code> sur VSwitch, pour qu\'il soit annoncé activé ou désactivé plutôt que coché.',
    'Les infobulles liées par <code>aria-describedby</code> et refermables avec Échap (WCAG 1.4.13).',
    '<code>role="status"</code> ou <code>role="alert"</code> selon la criticité.',
    "Un libellé accessible OBLIGATOIRE sur VIconButton. La prop n'est pas optionnelle, donc un bouton icône sans nom ne peut pas s'écrire par accident.",
  ],
  guaranteedBody:
    "La moitié du JavaScript comportemental de la bibliothèque existe pour cela plutôt que pour faire fonctionner quoi que ce soit. Les composants sont accessibles d'abord et interactifs ensuite, et le code est étiqueté pour que ce rapport se compte au lieu de se proclamer.",

  focusHeading: 'Focus',
  focusBody:
    "Le focus est un contour de 2px à 2px de décalage, tracé à l'extérieur de la boîte, donc sans coût de mise en page. Partout où le conteneur rogne son contenu, il est ramené vers l'intérieur : les boutons internes d'un champ, le résumé d'un accordéon, une ligne de navigation dans une branche animable. Un contour tracé hors d'une boîte qui rogne est un contour que personne ne voit.",
  focusCaption:
    "Un champ de texte fait exception : une bordure d'accent de 1px plus une ombre de la même couleur, parce que le mode couleurs forcées de Windows supprime les ombres portées et que le contour est le filet de sécurité.",

  validationHeading: 'Validation',
  validationBody:
    "<code>:user-invalid</code>, et non <code>:invalid</code> : un champ ne rougit qu'une fois que le lecteur l'a quitté, si bien qu'un e-mail à moitié saisi n'est jamais déclaré faux. La prop <code>invalid</code> force l'état pour une règle que seul le serveur peut vérifier.",

  motionHeading: 'Animation',
  motionBody:
    "Sous <code>prefers-reduced-motion</code>, les transitions passent à <code>none</code>, tandis que les animations en boucle ralentissent au lieu de s'arrêter. Un indicateur de chargement passe de 1s à 3s, parce qu'un indicateur figé se lit comme une page cassée.",

  forcedColorsHeading: 'Couleurs forcées',
  forcedColorsBody:
    "Deux décisions de la bibliothèque existent pour le mode couleurs forcées de Windows, et toutes deux méritent d'être reprises. Les icônes sont dessinées en <code>&lt;svg&gt;&lt;path fill=\"currentcolor\"&gt;</code> et jamais en fond masqué, qui y disparaît. Les filets sont peints avec une bordure plutôt qu'un fond : un fond est forcé à <code>Canvas</code>, la couleur de la page elle-même, tandis qu'une couleur de bordure est forcée à <code>CanvasText</code> et survit.",

  toolHeading: "Ce qu'un outil ne peut pas vous dire",
  toolBody:
    "axe lit les couleurs calculées : le contraste doit donc être vérifié deux fois, une par thème, et l'intégration continue de la bibliothèque fait exactement cela. Il ne sait pas non plus juger un texte peint par-dessus un frère qu'il ne recouvre qu'en partie : il déduit un fond des boîtes qui contiennent le rectangle de l'élément, si bien qu'un libellé rogné se mesure contre ce qui se trouve dessous. Les deux cas concernés sont exclus nommément dans la bibliothèque, chacun avec son raisonnement. Une exclusion couvre une limite de l'outil, jamais une vraie violation.",
  toolQuote:
    "Un outil qui tourne à chaque commit et bloque le build vaut mieux qu'un audit qui a lieu une fois. Ni l'un ni l'autre ne remplace l'usage de la chose au clavier.",
}
