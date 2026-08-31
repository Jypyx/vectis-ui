export default {
  title: 'Thématisation',
  lead: "Un thème est un ensemble de propriétés personnalisées CSS, et thématiser consiste à en redéfinir quelques-unes. Il n'y a rien à recompiler et aucune étape de build à configurer. Aucun composant ne détient sa propre couleur, son propre rayon ni sa propre durée : chacun se peint à partir de rôles sémantiques <code>--vectis-*</code>, si bien que redéfinir un rôle change tous les composants qui le lisent, où qu'ils soient. Le thème affiché tient dans un attribut, <code>data-theme</code>, et celui-ci se pose sur n'importe quel élément et pas seulement sur la page.",

  switchHeading: 'Changer de thème',
  switchBody:
    "La bibliothèque livre deux thèmes, clair et sombre. Ce sont les mêmes rôles pointant vers des pas différents des mêmes palettes : basculer ne charge donc pas une seconde feuille de styles et ne rend rien différemment. C'est un attribut que l'on pose, à tout moment, sans recompilation et sans clignotement de contenu restylé.",
  switchLight: 'Clair',
  switchDark: 'Sombre',
  switchScope:
    "Les deux panneaux ci-dessus sont le même balisage dans la même page, chacun nommant son propre thème. C'est tout l'intérêt d'en faire un attribut : on le pose généralement sur <code>&lt;html&gt;</code>, où il couvre tout, mais il fonctionne sur <strong>n'importe quel élément du DOM</strong>, et c'est le plus proche qui l'emporte pour son sous-arbre. Un rail de navigation sombre dans une application claire, une carte de prévisualisation claire dans un éditeur sombre, une facture qui reste claire alors que l'outil autour d'elle est sombre : aucun de ces cas ne demande un second thème, seulement un second attribut.",
  switchScopeBody:
    "Tout ce qui est imbriqué hérite du thème qu'il n'a pas nommé, parce que ce que l'attribut pose réellement est un bloc de propriétés personnalisées, et les propriétés personnalisées héritent le long de l'arbre. L'imbrication est donc gratuite, et réversible à n'importe quelle profondeur.",
  switchColorScheme:
    "L'attribut pose aussi <code>color-scheme</code> : les parties de la page que le design system ne dessine pas suivent donc le thème au lieu de rester claires dans un panneau sombre. Les barres de défilement, les contrôles de formulaire et les widgets propres au navigateur sont les premiers concernés.",
  switchSystem:
    "Les tokens générés ne contiennent délibérément aucune requête <code>prefers-color-scheme</code>. Suivre le système est une décision qui revient à l'application et non au design system, et elle tient en une ligne de JavaScript qui lit la requête média et pose l'attribut. Écrite dans le CSS, elle serait impossible à outrepasser pour un lecteur qui veut l'autre thème, ce que fait précisément le bouton de l'en-tête de ce site.",

  tokensHeading: 'Personnaliser les couleurs et les tokens',
  tokensBody:
    'Tout ce avec quoi la bibliothèque peint est un token, généré depuis une source TypeScript typée dans un format inspiré du DTCG du W3C et publié comme de simples propriétés personnalisées, sur deux niveaux.',
  tokensLevels: [
    "<strong>Primitives</strong> : cinq palettes OKLCH de onze pas chacune (<code>--vectis-color-indigo-500</code>), plus l'échelle d'espacement, l'échelle typographique, les rayons, les ombres, les durées et les courbes.",
    "<strong>Rôles sémantiques</strong>, les seuls qu'un composant a le droit de nommer : <code>--vectis-color-surface</code>, <code>--vectis-color-text-muted</code>, <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-focus-ring-color</code>.",
  ],
  tokensRoles:
    "Un composant demande l'accent et jamais un indigo précis, et c'est ce qui rend la bibliothèque personnalisable : changez ce QU'EST l'accent, aucun composant n'a besoin de le savoir. Personnaliser ne consiste donc jamais à surcharger le CSS d'un composant. Redéfinissez le rôle, et chaque bouton, puce, anneau de focus et sélection suit.",
  tokensOverride:
    "Une redéfinition est une déclaration CSS ordinaire : elle va donc là où va le CSS, sur <code>:root</code> pour toute l'application, sur une classe pour une seule zone, ou sous <code>[data-theme='dark']</code> pour différer d'un thème à l'autre. Sa valeur peut être une couleur, un autre token ou un <code>calc()</code>. Le panneau ci-dessous repointe les six rôles d'accent vers un corail et le rayon interactif vers le token pill : sept déclarations, et aucun composant touché.",
  tokensDemoCaption:
    "Un bouton plein, un bouton contour et une puce. Aucun des trois ne nomme de couleur ni de rayon : tous suivent donc la redéfinition, et il en irait de même de n'importe quel autre composant placé dans ce panneau.",
  tokensOklch:
    "La couleur est écrite en OKLCH, toujours, et pour deux raisons : un pas d'une palette est aussi clair que le même pas de n'importe quelle autre, et mélanger deux d'entre elles passe par les nuances attendues plutôt que par le gris. La bibliothèque dérive les survols, les teintes et les états désactivés de vos rôles avec <code>color-mix()</code> : une valeur donnée dans un espace dont l'axe de clarté se comporte autrement fait donc dériver ces dérivations. Gardez vos valeurs en OKLCH et elles ne le peuvent plus.",
  tokensPalettes:
    "La bibliothèque livre cinq palettes et pas une de plus, parce que cinq est ce avec quoi elle peint : gray pour les surfaces, le texte et les bordures, indigo pour l'accent, puis red, green et amber pour danger, succès et avertissement. Une palette inutilisée resterait onze propriétés personnalisées dans chaque page qui charge la feuille de styles : une sixième couleur revient donc à l'application. Déclarez ses onze pas sous votre propre nom, pointez le rôle vers eux, et c'est tout, sans rien à recompiler ni aucune version à attendre. C'est exactement ce que fait ce site pour son accent violet.",

  layersHeading: 'Couches CSS',
  layersBody:
    "Le CSS de la bibliothèque est déclaré dans quatre couches de cascade, dans cet ordre : <code>vectis.reset</code>, <code>vectis.tokens</code>, <code>vectis.components</code>, <code>vectis.utilities</code>. Une couche est une étape de la cascade consultée <strong>avant</strong> toute comparaison de spécificité, et les déclarations hors de toute couche sont consultées en dernier. Une règle que vous écrivez dans aucune couche l'emporte donc sur celles de la bibliothèque, quelle que soit la composition des deux sélecteurs.",
  layersConsequence:
    "C'est le mécanisme de surcharge prévu et non une faille, et c'est lui qui rend inutiles les échappatoires habituelles : pas de <code>!important</code>, pas de sélecteur rembourré d'une classe de plus ou d'un <code>id</code>, pas d'élément d'enrobage ajouté pour acheter de la spécificité. Un seul nom de classe suffit à changer n'importe quelle propriété de n'importe quel composant, et votre feuille de styles reste aussi lisible que ce qu'elle surcharge.",
  layersTrap:
    "Une chose à éviter : n'écrivez pas vos propres règles à l'intérieur de <code>@layer vectis.components</code>. Les noms de couches sont globaux, si bien que le navigateur fondrait votre bloc dans la couche de la bibliothèque et l'y arbitrerait par ordre d'apparition au lieu de lui donner le dernier mot. Gardez vos surcharges hors couche, ou, si votre application a ses propres couches, déclarez-les après celles de la bibliothèque.",
}
