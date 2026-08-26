export default {
  title: 'Navigation latérale',
  lead: "La navigation d'une barre latérale : un arbre de liens, montré sur place plutôt que dans un panneau flottant, dont les branches s'ouvrent et se referment. Il s'écrit niveau par niveau avec ses propres sous-composants, jamais décrit comme une liste de données.",
  self: 'Le rail à gauche de cette page EST ce composant, alimenté par la liste de pages du site.',

  treeHeading: 'Un arbre de liens',
  treeBody:
    "Un libellé de groupe est du texte simple : il ne peut être ni focalisé ni cliqué, parce qu'un titre qui a l'air cliquable sans l'être vaut moins que pas de titre du tout. <code>compact</code> est un réglage de DENSITÉ, pas un rail replié réduit aux icônes — ce composant n'en propose pas.",

  branchesHeading: 'Branches',
  branchesBody:
    "Donner à un élément un slot <code>#items</code> en fait une branche, et l'imbrication n'est pas limitée. Une branche se replie ; elle ne mène nulle part. Le repli est un vrai <code>&lt;details&gt;</code>, si bien que l'état, le clavier et l'animation viennent du navigateur, et <code>exclusive</code> le rend « un seul ouvert à la fois » PAR NIVEAU.",

  routerHeading: 'Avec un routeur',
  routerBody:
    "<code>active</code> est MANUEL : le composant ne connaît aucun routeur, et lui en donner un le lierait à celui-là. Comparez la route vous-même et passez-lui la réponse. Il éclaire en revanche tout seul un ancêtre REPLIÉ, en CSS, à partir de l'<code>[aria-current]</code> qu'il trouve à l'intérieur.",

  invariantsHeading: 'Invariants',
  invariants: [
    "Le libellé est le SLOT PAR DÉFAUT et il est obligatoire — il n'y a pas de prop <code>label</code>, si bien qu'une ligne peut porter un badge ou une abréviation à côté de ses mots.",
    "Une entrée ne porte jamais à la fois <code>#items</code> et <code>href</code>. Si on lui donne les deux, elle devient silencieusement un <code>&lt;button&gt;</code>, sur lequel l'interception de clic d'un routeur renonce.",
    "Le slot <code>#end</code> d'une BRANCHE ne doit pas être focalisable : une ligne de branche est un <code>&lt;summary&gt;</code>, et un contrôle dans un contrôle relève de WCAG 4.1.2 et du <code>nested-interactive</code> d'axe. Sur une feuille il est libre — le lien est étiré sur la ligne par un pseudo-élément, si bien que le slot de fin reste son frère et non son enfant.",
    "La profondeur se compte entièrement en CSS, par deux noms de propriétés personnalisées qui ALTERNENT. PIÈGE — la forme évidente à un seul nom est un cycle du point de vue de CSS, et l'arbre entier s'affiche à plat sans rien dans la console pour dire pourquoi.",
  ],

  apiHeading: 'API',
  apiNavLabel:
    "<code>string</code> — ce que les lecteurs d'écran annoncent pour le <code>&lt;nav&gt;</code>",
  apiNavLabelDefault: 'dictionnaire',
  apiExclusive: '<code>boolean</code> — une seule branche ouverte par niveau',
  apiIcons: '<code>IconSource</code> — donnez les deux et elles permutent au lieu de pivoter',
  apiActive: '<code>boolean</code> — <code>aria-current</code>',
  apiHref: '<code>string</code> — ignoré sur une branche',
  apiOpen: "<code>boolean | null</code> — <code>null</code> laisse l'état au navigateur",
  apiSlots:
    "Slots : <code>#default</code> (le libellé, obligatoire), <code>#items</code> (la branche), <code>#sublabel</code>, <code>#start</code>, <code>#end</code>. Une feuille émet <code>select</code> au clic et à l'activation clavier ; il n'y a délibérément pas d'émission <code>click</code>, si bien que votre propre <code>@click</code> atteint toujours le lien.",
  apiQuote:
    "Le balisage est fait de vrais <code>&lt;ul&gt;</code> et <code>&lt;li&gt;</code>, contrairement à celui de VMenu. Ce n'est pas une différence de style : le patron ARIA menu interdit les listes, alors que pour une navigation le dénombrement et l'imbrication SONT l'information.",
}
