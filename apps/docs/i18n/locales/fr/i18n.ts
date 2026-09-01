export default {
  title: 'Localisation (i18n)',
  lead: "Aucun libellé destiné à l'utilisateur n'est codé en dur au sein des composants : l'intégralité des chaînes de caractères est résolue dynamiquement via un dictionnaire de traduction. La bibliothèque est configurée en anglais (<code>en</code>) par défaut et fournit nativement la locale française (<code>fr</code>). L'ajout de langues supplémentaires s'effectue directement au niveau de l'application consommatrice.",
  split:
    "La localisation repose sur un découplage strict entre le vocabulaire et le formatage. Les libellés textuels sont issus des dictionnaires de traduction, tandis que le formatage des données (dates, nombres, premier jour de la semaine et cycle 12/24h) s'appuie directement sur l'API native <code>Intl</code> à partir du tag de langue. Ainsi, déclarer une locale sans dictionnaire associé applique immédiatement les conventions régionales appropriées pour les données, tout en conservant les libellés d'interface en anglais. Ce comportement constitue une stratégie de dégradation gracieuse (graceful degradation) parfaitement maîtrisée.",

  frenchHeading: 'Changer de langue',
  frenchBody:
    "L'activation d'une locale repose sur deux étapes distinctes : l'enregistrement du dictionnaire de traduction, puis le choix de la locale active. Bien que fourni par la bibliothèque, le dictionnaire français (<code>fr</code>) est optionnel : l'omettre de vos imports suffit à l'exclure du bundle final (tree-shaking). Au-delà de l'optimisation du poids (inférieur à 1 Ko gzippé), ce modèle unifie l'intégration : activer la locale française intégrée ou ajouter une langue sur mesure s'effectue via un mécanisme rigoureusement identique, sans distinction de statut entre dictionnaires natifs et tiers.",
  frenchWhere:
    "L'enregistrement des dictionnaires et la sélection initiale de la locale s'effectuent au niveau du module (dans <code>main.ts</code> ou un plugin Nuxt), en dehors du hook <code>setup()</code> des composants. Par la suite, setLocale peut être invoqué dynamiquement depuis n'importe quel point de l'application. La table de traduction s'appuyant sur l'état réactif de Vue, sa mise à jour déclenche le re-rendu immédiat de tous les composants montés, sans nécessiter de navigation ni de rechargement de page.",
  processBody:
    "L'état d'i18n étant conservé au niveau du module, la locale est globale pour un processus d'exécution donné. Ce choix d'architecture implique une contrainte explicite : un même processus Node.js ne maintient qu'une seule locale active à la fois. Le rendu côté serveur (SSR) dynamique et concurrentiel par requête n'est donc pas pris en charge nativement ; dans ce scénario, les libellés doivent être transmis explicitement via les props des composants.<br>En revanche, cette limitation est sans impact sur le pré-rendu statique (SSG), les routes étant générées de façon séquentielle : la locale est définie juste avant la compilation de chaque page, garantissant la génération conforme de l'interface dans la langue ciblée.",

  addHeading: 'Ajouter une langue',
  addBody:
    "Un dictionnaire sur mesure est un simple objet JavaScript. La déclaration de dictionnaires partiels est totalement valide : toute clé absente retombe automatiquement sur le dictionnaire anglais au lieu d'afficher une clé technique brute. Enregistrez l'objet sous son sous-tag de langue, puis définissez la locale active.",
  addTyping:
    "En typant l'objet avec <code>VectisMessagesInput</code>, l'éditeur fournit l'autoplétion complète pour les espaces de noms, les clés et les arguments des messages paramétrés. Les entrées textuelles sont formulées sous forme de fonctions TypeScript typées, sans dépendance à un moteur ICU ou de pluralisation complexe : la gestion des pluriels s'effectue par de simples expressions ternaires au sein des fonctions. La fusion des dictionnaires est non récursive par conception, l'arborescence étant strictement limitée à deux niveaux afin de préserver l'intégrité des fonctions de message.",
  precedenceBody:
    "La résolution textuelle s'appuie sur le <strong>sous-tag</strong> de langue (ex. <code>en-GB</code> et <code>en-US</code> partagent le dictionnaire <code>en</code> et ne diffèrent que par leurs formats <code>Intl</code>). Au sommet de la hiérarchie, les props explicites restent prioritaires : la chaîne de résolution pour le nom accessible d'un composant suit l'ordre de préséance suivant : <code>aria-labelledby</code> -> <code>aria-label</code> -> prop <code>label</code> -> dictionnaire actif -> dictionnaire anglais de secours. L'interface garantit l'absence de chaînes vides, de clés brutes à l'écran ou d'échecs silencieux en mode développement.",

  demoHeading: 'Langues et les formats',
  demoBody:
    "Le dictionnaire de traduction et la locale de formatage constituent deux réglages strictement indépendants. Tandis que <code>registerMessages</code> et <code>setLocale</code> déterminent la couche lexicale (les chaînes traduites), le code de locale (ainsi que la prop <code>locale</code> disponible sur les composants concernés) pilote les conventions régionales dérivées de l'API <code>Intl</code> (ordonnancement et séparateurs de dates, premier jour de la semaine, format 12/24h). Cette étanchéité permet d'associer librement un dictionnaire linguistique à un code régional distinct : une application peut par exemple afficher ses libellés en français tout en appliquant les formats canadiens anglais (<code>en-CA</code>), ou conserver une interface en anglais avec un formatage adapté à l'Allemagne (<code>de-DE</code>).",
  demoLanguage: 'Langue',
  demoFormats: 'Formats',

  keysHeading: 'Nomenclature et référence des clés de traduction',
  keysBody:
    "Le dictionnaire complet de Vectis UI s'articule autour de 134 clés réparties au sein de 22 espaces de noms (namespaces), présentées ci-dessous avec leurs valeurs françaises à titre de référence. L'enregistrement supportant l'injection partielle, vous n'avez besoin de déclarer que les espaces de noms et les clés que vous souhaitez explicitement traduire.",
  keysFunctions:
    "Parmi ces clés, 23 sont des fonctions TypeScript paramétrées. Leur signature expose la liste des arguments attendus ainsi que leur placement dans la chaîne produite. En l'absence de moteur ICU ou de parseur de pluriel dédié, la gestion des formes grammaticales (dont la pluralisation) repose directement sur la logique conditionnelle native (expressions ternaires JS/TS), offrant toute la souplesse nécessaire aux langues complexes.",
  keysColumnKey: 'Clé',
  keysColumnDefault: 'Valeur française',
}
