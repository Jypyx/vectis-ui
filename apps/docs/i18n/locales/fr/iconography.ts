export default {
  title: 'Iconographie',
  lead: 'Vectis UI inclut des icônes SVG issues de Material Symbols Rounded de Google (graisse 400, GRAD 0, taille optique 24, licence Apache 2.0). Vous pouvez aussi utiliser vos propres SVG, images, composants Vue ou polices d’icônes.',
  weight:
    'Les icônes intégrées sont des modules distincts. Le bundle inclut les icônes importées par votre application et ses composants ; importer <code>VButton</code> seul n’inclut pas tout le jeu d’icônes.',
  gridCaption:
    'Les icônes check_circle et notifications sont présentées en versions contour et pleine.',

  importHeading: 'Importer une icône',
  importBody:
    'Importez les icônes depuis <code>vectis-ui/icons</code>. Passez la valeur importée à <code>VIcon.name</code> ou à une prop d’icône comme <code>VButton.iconStart</code>.',
  importWhy:
    'Une chaîne comme <code>"close"</code> ne charge pas de SVG intégré. Elle passe par votre résolveur, puis utilise une ligature de police en dernier recours. Importez la valeur de l’icône pour inclure son tracé SVG.',

  ownHeading: 'Utiliser vos propres icônes',
  ownBody:
    'Enregistrez un résolveur avec <code>setIconResolver</code> pour associer les noms d’icônes à vos propres visuels. Le résolveur est prioritaire sur les tracés intégrés. Utilisez l’un des helpers ci-dessous ou écrivez votre propre fonction.',
  ownWhere:
    'Configurez le résolveur au démarrage de l’application, dans <code>main.ts</code> ou un plugin Nuxt universel. Utilisez la même configuration pour le SSR et l’hydratation afin que le serveur et le navigateur affichent les mêmes icônes.',
  ownPartial:
    'Retournez <code>undefined</code> pour les noms non gérés. <code>VIcon</code> utilise alors le tracé de l’icône importée, s’il existe, ou une ligature de police.',
  ownQuote:
    'Un nom non résolu apparaît sous forme de texte tronqué si aucune police d’icônes correspondante n’est chargée.',

  classHeading: 'Classes CSS',
  classBody:
    'Chargez le CSS de votre bibliothèque d’icônes, puis utilisez <code>classIconResolver</code>. Sa fonction <code>className</code> reçoit le nom après résolution de l’alias et l’état <code>filled</code>, puis renvoie les classes à appliquer.',
  classPartial:
    '<code>strict</code> vaut <code>true</code> par défaut : les noms intégrés sans alias renvoient <code>undefined</code>, ce qui préserve leur SVG de secours s’il est disponible. Les autres noms sont transmis à <code>className</code>, même sans alias.',

  ligatureHeading: 'Polices à ligatures',
  ligatureBody:
    'Chargez une police à ligatures et définissez <code>--vectis-font-family-icon</code>. <code>ligatureIconResolver</code> affiche chaque nom comme texte pour cette police, avec des alias facultatifs.',
  ligaturePartial:
    'Ce résolveur traite tous les noms et remplace les tracés SVG intégrés. Les noms sans alias sont transmis tels quels : la police doit donc les prendre en charge.',

  componentHeading: 'Composants Vue',
  componentBody:
    'Utilisez <code>componentIconResolver</code> pour associer les noms à des composants Vue importés. Chaque composant d’icône doit avoir une seule racine <code>&lt;svg&gt;</code> pour être dimensionné. La fonction facultative <code>props</code> fournit les props du composant.',
  componentPartial:
    'Les noms absents de <code>components</code> renvoient <code>undefined</code>, ce qui permet d’utiliser le SVG importé ou une ligature en dernier recours.',

  handHeading: 'Résolveur personnalisé',
  handBody:
    'Un résolveur reçoit le nom de l’icône et un contexte contenant <code>filled</code>. Retournez un objet <code>IconRender</code> ou <code>undefined</code>. Cet exemple résout les icônes du site de documentation :',

  sizingHeading: 'Taille',
  sizingBody:
    'Une icône utilise la taille définie par son conteneur, ou <code>1em</code> si aucune taille n’est définie.',
  sizingOverrides: [
    'Définissez <code>size</code> en pixels sur <code>VIcon</code> pour remplacer la taille héritée.',
    'Définissez <code>--vectis-icon-size</code> sur un conteneur pour dimensionner les icônes qu’il contient.',
  ],
  sizingReason:
    'Les contrôles, comme les boutons, définissent <code>--vectis-icon-size</code> selon leur propre taille.',
  sizingCaption: 'La même icône à 16, 24 et 40 pixels.',

  orderHeading: 'Priorité des sources',
  orderBody: '<code>VIcon</code> utilise la première source disponible dans cet ordre :',
  orderRules: [
    '<code>render</code> : un objet <code>IconRender</code> décrivant un tracé, un composant, une image, du texte ou une classe CSS.',
    '<code>src</code> : une URL d’image non vide.',
    '<code>name</code> : traité par votre résolveur, puis par le tracé SVG de l’icône importée s’il existe, puis comme ligature de police.',
    'Slot par défaut : utilisé lorsqu’aucune source n’est fournie.',
  ],
  noHeuristic:
    'Les chaînes dans les props d’icône comme <code>iconStart</code> sont des noms, y compris les identifiants comme <code>mdi:close</code>. Utilisez un objet pour les autres sources : <code>{ src }</code>, <code>{ component }</code>, <code>{ path }</code>, <code>{ text }</code> ou <code>{ class }</code>. Avec <code>VIcon</code> directement, passez ces objets à <code>VIcon.render</code>.',

  listHeading: 'Icônes intégrées',
  listBody:
    'Importez ces icônes depuis <code>vectis-ui/icons</code>, ou utilisez leurs noms dans la table d’alias de votre résolveur pour les remplacer.',
  listFilled:
    '<code>filled</code> sélectionne le tracé plein s’il existe. Sinon, l’icône conserve son tracé de contour.',
}
