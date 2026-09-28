export default {
  title: 'Accessibilité',
  lead: 'Navigation au clavier, noms accessibles, styles de focus et préférences d’animation dans Vectis UI.',
  guaranteedHeading: 'Comportement des composants',
  guarantees: [
    '<strong>Clavier et focus</strong> : les composants interactifs s’utilisent au clavier. Les dialogues modaux maintiennent le focus à l’intérieur tant qu’ils sont ouverts, puis le rendent au déclencheur à la fermeture. La documentation de chaque composant précise ses commandes clavier.',
    '<strong>ARIA</strong> : les composants exposent leurs rôles, leurs états et leurs relations aux technologies d’assistance. Les messages de statut utilisent des régions dynamiques si nécessaire.',
    '<strong>Noms accessibles</strong> : donnez un nom à chaque contrôle. <code>VIconButton</code> exige une prop <code>label</code> qui décrit l’action, par exemple « Rechercher ».',
    '<strong>Contraste</strong> : les thèmes par défaut prévoient des couleurs de texte et de focus pour les fonds clairs et sombres. Vérifiez à nouveau le contraste si vous les modifiez.',
  ],
  guaranteedBody:
    'Testez les parcours clavier, les noms accessibles et la restitution par un lecteur d’écran dans votre application. Les tests des composants ne couvrent pas toutes les combinaisons de contenus et de styles personnalisés.',
  focusHeading: 'Focus',
  focusBody:
    'Conservez des indicateurs de focus visibles lorsque vous personnalisez les styles. Vérifiez que les conteneurs ne les rognent pas. Les boutons d’action des champs utilisent un contour intérieur.',
  focusCaption:
    'Parcourez les contrôles avec Tab. Les champs de texte mettent leur bordure en évidence ; le bouton d’effacement possède son propre contour de focus.',
  validationHeading: 'Validation',
  validationBody:
    'Les champs utilisent <code>:user-invalid</code> pour signaler les erreurs de validation native après une interaction. Pour les erreurs de l’application, comme une réponse du serveur, utilisez la prop <code>invalid</code> et fournissez un message d’erreur.',
  motionHeading: 'Animations',
  motionBody:
    'Avec <code>prefers-reduced-motion</code>, les composants suppriment ou réduisent les animations. <code>VSpinner</code> continue de tourner plus lentement pour signaler une activité en cours.',
  forcedColorsHeading: 'Couleurs forcées',
  forcedColorsBody: 'En mode couleurs forcées :',
  forcedColorsRules: [
    '<strong>Icônes</strong> : les icônes SVG intégrées utilisent <code>currentColor</code> pour suivre la couleur du texte. Vérifiez les icônes ou images personnalisées que vous fournissez.',
    '<strong>Séparateurs</strong> : les bordures CSS gardent les séparateurs visibles lorsque le navigateur remplace les couleurs de fond.',
  ],
}
