export default {
  title: 'Accordéon',
  lead: "Des sections qui se replient. Il est construit sur <code>&lt;details&gt;</code> et <code>&lt;summary&gt;</code>, si bien que l'état ouvert, le comportement clavier et la recherche dans la page viennent tous du navigateur.",

  exclusiveHeading: 'Exclusif, ou non',
  exclusiveBody:
    "N'avoir qu'un élément ouvert à la fois n'est pas du JavaScript ici : c'est ce que fait le navigateur dès que tous les éléments partagent un <code>name</code>. Le groupe en génère un, donc <code>exclusive</code> vaut <strong>true par défaut</strong>. Mettez-le à <code>false</code> et chaque section garde son propre état.",

  variantsHeading: 'Variantes',
  variantsBody:
    "<code>flat</code> ne dessine rien du tout, ni fond, ni bordure, ni rayon : l'accordéon hérite donc de la surface sur laquelle il repose. <code>outlined</code> donne la carte canonique : <code>surface-raised</code>, une bordure de 1px, <code>radius-surface</code>, et aucune ombre. C'est la même échelle de décoration qu'emploient VDataTable et VTabs, si bien que les trois s'accordent sans être couplés.",
  variantsRadius:
    "Un coin imbriqué se dérive avec <code>calc(var(--vectis-radius-surface) - 1px)</code>. C'est pourquoi l'échelle de rayons porte un <code>none</code> qui vaut <code>0px</code> et non <code>0</code> : soustraire d'un zéro sans unité est du CSS invalide.",

  densityHeading: 'Densité',
  densityBody:
    "<code>compact</code> retire 4px à chaque rembourrage, bloc, en ligne et air autour du contenu compris, par un unique delta dont les éléments héritent. La typographie et les icônes ne changent pas : un accordéon n'a pas de hauteur fixe, il reste donc entièrement hors de l'échelle de tailles des contrôles.",

  animationHeading: 'Animation',
  animationBody:
    "L'animation de hauteur est une amélioration progressive, via <code>::details-content</code> et <code>interpolate-size</code>. Là où elles ne sont pas prises en charge, la section s'ouvre simplement d'un coup. Aucun JavaScript ne mesure quoi que ce soit, et rien ne saute.",

  disablingHeading: 'Désactiver un élément',
  disablingBody:
    '<code>&lt;summary&gt;</code> n\'a pas de <code>disabled</code> natif : un élément désactivé reçoit donc <code>aria-disabled</code>, <code>tabindex="-1"</code> et un clic annulé, le seul JavaScript du composant. Et non <code>pointer-events: none</code>, qui supprimerait le curseur <code>not-allowed</code> et la possibilité de sélectionner le texte.',

  apiHeading: 'API',
  apiExclusive:
    '<code>boolean</code> : un seul ouvert à la fois, via <code>&lt;details name&gt;</code>',
  apiCompact: '<code>boolean</code> : chaque rembourrage perd 4px',
  apiCollapseIcon:
    '<code>IconSource</code> : donnez les deux et elles permutent au lieu de pivoter',
  apiTitles: '<code>string</code>, ou les slots <code>#title</code> / <code>#subtitle</code>',
  apiIconStart: '<code>IconSource</code>, ou le slot <code>#start</code>',
  apiDefaultOpen:
    '<code>boolean</code> : au premier rendu seulement, ensuite le navigateur en est maître',
  apiQuote:
    "Il n'y a pas de <code>v-model:open</code>, et c'est voulu : l'état appartient à l'élément <code>&lt;details&gt;</code>. Le refléter dans Vue donnerait deux sources de vérité pour une chose que le navigateur sait déjà.",
}
