export default {
  title: 'Accessibilité',
  lead: 'Navigation au clavier et sémantique ARIA sur chaque composant. <code>prefers-reduced-motion</code> est respecté partout, et axe audite chaque story dans les deux thèmes à chaque commit — une violation fait échouer le build au lieu de produire un avertissement.',

  guaranteedHeading: 'Ce qui est garanti',
  guarantees: [
    'Le patron ARIA menu : focus itinérant, et focus rendu au déclencheur à la fermeture.',
    '<code>role="switch"</code> sur VSwitch, pour qu\'il soit annoncé activé ou désactivé plutôt que coché.',
    'Les infobulles liées par <code>aria-describedby</code> et refermables avec Échap (WCAG 1.4.13).',
    '<code>role="status"</code> ou <code>role="alert"</code> selon la criticité.',
    "Un libellé accessible OBLIGATOIRE sur VIconButton — la prop n'est pas optionnelle, donc un bouton icône sans nom ne peut pas s'écrire par accident.",
  ],
  guaranteedBody:
    "La moitié du JavaScript comportemental de la bibliothèque existe pour cela plutôt que pour faire fonctionner quoi que ce soit : les composants sont accessibles d'abord et interactifs ensuite, et le code est étiqueté pour que ce rapport se compte au lieu de se proclamer.",

  focusHeading: 'Focus',
  focusBody:
    "Le focus est un contour de 2px à 2px de décalage, à l'extérieur de la boîte, donc sans coût de mise en page. Il est ramené VERS L'INTÉRIEUR partout où le conteneur rogne — les boutons internes d'un champ, le résumé d'un accordéon, une ligne de navigation dans une branche animable — parce qu'un contour tracé hors d'une boîte qui rogne est un contour que personne ne voit.",
  focusCaption:
    "Un champ de texte fait exception : une bordure d'accent de 1px plus une ombre de la même couleur, parce que le mode couleurs forcées de Windows supprime les ombres portées et que le contour est le filet de sécurité.",

  validationHeading: 'Validation',
  validationBody:
    "<code>:user-invalid</code>, et non <code>:invalid</code> : un champ ne rougit qu'une fois que le lecteur l'a quitté, si bien qu'un e-mail à moitié saisi n'est jamais déclaré faux. La prop <code>invalid</code> force l'état pour une règle que seul le serveur peut vérifier.",

  motionHeading: 'Animation',
  motionBody:
    "Sous <code>prefers-reduced-motion</code>, les transitions passent à <code>none</code>, tandis que les animations en boucle RALENTISSENT au lieu de s'arrêter — un indicateur de chargement passe de 1s à 3s, parce qu'un indicateur figé se lit comme une page cassée.",

  forcedColorsHeading: 'Couleurs forcées',
  forcedColorsBody:
    "Deux décisions de la bibliothèque existent pour le mode couleurs forcées de Windows, et toutes deux méritent d'être reprises. Les icônes sont dessinées en <code>&lt;svg&gt;&lt;path fill=\"currentcolor\"&gt;</code> et jamais en fond masqué, qui y disparaît. Les filets sont peints avec une BORDURE et non un fond, parce qu'un fond est forcé à <code>Canvas</code> — la couleur même de la page — tandis qu'une couleur de bordure est forcée à <code>CanvasText</code> et survit.",

  toolHeading: "Ce qu'un outil ne peut pas vous dire",
  toolBody:
    "axe lit les couleurs calculées : le contraste doit donc être vérifié DEUX FOIS — une par thème — et l'intégration continue de la bibliothèque fait exactement cela. Il ne sait pas non plus juger un texte peint par-dessus un frère qu'il ne recouvre qu'en partie : il déduit un fond des boîtes qui contiennent le rectangle de l'élément, si bien qu'un libellé rogné se lit contre ce qui se trouve dessous. Ces deux cas sont exclus nommément dans la bibliothèque, chacun avec son raisonnement ; une exclusion vaut pour une limite de l'outil, jamais pour une vraie violation.",
  toolQuote:
    "Un outil qui tourne à chaque commit et bloque le build vaut mieux qu'un audit qui a lieu une fois. Ni l'un ni l'autre ne remplace l'usage de la chose au clavier.",
}
