export default {
  documentTitle: 'Une bibliothèque UI moderne pour qui aime HTML et CSS',
  /* La coupure tombe après « moderne » : c'est la phrase française qui la décide, pas la mise
     en page — l'anglais coupe après « library ». */
  heroTitle:
    'Une bibliothèque UI moderne<br><span class="vd-hero-accent">pour qui aime HTML et CSS</span>',
  heroBody:
    'Vectis UI est une bibliothèque de composants bâtie sur les dernières fonctionnalités HTML et CSS, sans compromis et sans besoin de plugins externes.',
  heroCta: 'Installer la bibliothèque',

  whyHeading: 'Pourquoi elle existe',
  whyBody:
    "Trois décisions portent toute la bibliothèque. Chacune est énoncée avec sa raison, parce qu'une règle sans raison est une règle que personne ne peut appliquer au cas suivant.",

  htmlFirstTitle: "HTML et CSS d'abord",
  htmlFirstBody:
    'Les accordéons sont des <code>&lt;details&gt;</code>, les menus et les infobulles reposent sur la couche supérieure sans bibliothèque de positionnement, les formulaires signalent leur validité via <code>:user-invalid</code>. Là où du JavaScript comportemental existe, un commentaire dans le fichier le justifie.',
  tokensTitle: 'Une source de tokens typée',
  tokensBody:
    "Des primitives en OKLCH, puis des rôles sémantiques — et un composant n'a le droit de nommer que les seconds. Une valeur hexadécimale brute dans le CSS d'un composant est traitée comme un token manquant, et c'est ce qui permet à une application de repointer l'accent sans qu'aucun composant en sache rien.",
  overridesTitle: 'Surcharger sans se battre',
  overridesBody:
    "Le CSS vit dans quatre couches, et tout style non calqué écrit côté consommateur l'emporte automatiquement. C'est le mécanisme de surcharge prévu, pas une faille : surcharger un composant ne demande jamais une guerre de spécificité.",

  installHeading: "Trois lignes pour l'installer",
  installBody:
    "Le paquet est précompilé en ESM et sûr en SSR. Les imports nommés sont élagués par Vite et Nitro, si bien qu'aucune entrée <code>build.transpile</code> n'est nécessaire.",
  installCta: "Lire le guide d'installation",

  statFamilies: 'familles de composants',
  statPalettes: 'palettes OKLCH, cinq reliées à un rôle',
  statCssValue: '6,7 ko',
  statCss: 'gzip, la feuille de style du noyau',
  statDeps: 'dépendance à l’exécution en dehors de Vue',

  a11yHeading: 'Accessibilité, garantie',
  a11yPoints: [
    'Le patron ARIA menu : focus itinérant, focus rendu au déclencheur.',
    '<code>role="switch"</code> sur VSwitch, annoncé activé ou désactivé plutôt que coché.',
    'Les infobulles liées par <code>aria-describedby</code> et refermables avec Échap.',
    '<code>prefers-reduced-motion</code> honoré dans chaque composant : les transitions s’arrêtent, les boucles ralentissent.',
  ],

  supportHeading: 'Prise en charge des navigateurs',
  supportBody:
    "Chrome et Edge 125+, Safari 26+. Baseline sans compromis : l'API Popover, <code>&lt;dialog&gt;</code>, <code>:has()</code>, <code>color-mix()</code>, <code>@layer</code>.",
  supportFirefox:
    "Le positionnement par ancre CSS n'est pas stable sur Firefox, et il n'y a délibérément aucun repli JavaScript : les panneaux s'y ouvrent, ils ne sont simplement pas ancrés à leur déclencheur.",
}
