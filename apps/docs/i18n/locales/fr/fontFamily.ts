export default {
  title: 'Famille de police',
  lead: "Vectis UI n'embarque aucune police web externe. Sa configuration typographique repose exclusivement sur trois tokens de famille, chacun associé par défaut à une pile de polices système de la plateforme (system font stack). L'interface bénéficie ainsi d'un rendu natif, rapide et cohérent sur tous les environnements, sans nécessiter la moindre configuration typographique préalable.",

  threeHeading: "Les 3 polices d'écriture par défaut",
  families: [
    "<code>--vectis-font-family-sans</code> : Pile de polices système (system font stack) pour l'interface utilisateur (system-ui, -apple-system, Segoe UI, Roboto, etc.). Constitue la famille typographique par défaut de tous les composants.",
    "<code>--vectis-font-family-display</code> : Famille réservée aux titres. Sa valeur pointe par défaut sur var(<code>--vectis-font-family-sans</code>). Cette indirection évite la duplication de variables : une seule surcharge suffit à dissocier les titres du reste de l'interface.",
    "<code>--vectis-font-family-mono</code> : Pile monospace native (ui-monospace, Cascadia Code, Source Code Pro, Menlo, Consolas, etc.). Garantit la prise en charge du code et des données tabulaires en exploitant les ressources locales de la plateforme.",
  ],
  roles:
    "Une seconde couche d'abstraction introduit trois tokens sémantiques (ou rôles) directement consommés par l'interface : <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> et <code>--vectis-text-family-code</code>. En liant le CSS des composants à ces rôles plutôt qu'aux primitives typographiques, Vectis UI permet de confiner les surcharges à un sous-arbre DOM spécifique sans affecter la configuration globale du document.",

  wiringHeading: "Intégration d'une police web",
  wiringBody:
    "L'intégration d'une police personnalisée s'effectue en deux étapes, toutes deux indépendantes du design system : charger la ressource typographique, puis associer son nom au token de famille correspondant. Les tokens étant de simples variables CSS (custom properties), une déclaration au niveau du sélecteur <code>:root</code> répercute la modification sur l'intégralité de l'interface, tandis qu'une déclaration ciblée sur un conteneur spécifique restreint la nouvelle police à son sous-arbre DOM.",
  wiringSelfHosted:
    "L'hébergement local des fichiers de police (déclarés via <code>@font-face</code> et servis depuis votre propre origine) constitue l'approche recommandée pour les builds hors ligne, les applications garantissant l'absence de requêtes vers des tiers, ou la maîtrise directe de la mise en cache HTTP. Seul le mode de chargement des ressources diffère : le raccordement aux design tokens de Vectis UI demeure strictement identique.",

  splitHeading: 'Correspondance des rôles typographiques',
  splitBody:
    "Attribuer une police de titrage (display font) s'effectue en une seule re-déclaration CSS. Cette modification demeure toutefois ciblée : seuls cinq rôles typographiques consomment la famille de titrage, le reste de l'interface conservant la police de texte principale. La nomenclature ci-dessous détaille les éléments concernés afin de vous guider dans le choix d'une typographie adaptée.<br>Ce comportement ne nécessite aucun câblage : le composant <code>VTypography</code> détermine son rôle via la propriété <code>variant</code>, tandis que les composants composites (titres de boîtes de dialogue ou en-têtes d'accordéons) appliquent automatiquement le rôle sémantique qui leur incombe.",
  splitList: [
    "Famille de titrage (<code>--vectis-text-family-heading</code>) : Consommée exclusivement par les 5 variantes d'en-tête : <code>display</code> (48px), <code>heading-1</code> (36px), <code>heading-2</code> (24px), <code>heading-3</code> (18px) et <code>heading-4</code> (16px).",
    "Famille de texte courant (<code>--vectis-text-family</code>) : Appliquée par défaut à l'ensemble des autres variantes (<code>subtitle</code>, les 4 niveaux de corps de texte, <code>label</code>, <code>caption</code>, <code>overline</code>) ainsi qu'à la typographie interne de tous les composants de contrôle (<code>v-control</code>).",
    'Famille de code (<code>--vectis-text-family-code</code>) : Restreinte strictement au rôle <code>code</code>.',
  ],

  iconHeading: "Gestion de la police d'icônes (dépendance facultative)",
  iconBefore:
    "Le token --vectis-font-family-icon référence par défaut la police Material Symbols Rounded. Fidèle au principe de zéro dépendance réseau, la bibliothèque n'effectue aucun chargement automatique de ce fichier. Cette ressource est uniquement nécessaire pour le rendu d'icônes par ligatures hors du registre natif. Pour affranchir l'application de cette dépendance, reportez-vous à la section ",
  iconAfter: ' pour implémenter un résolveur personnalisé.',
}
