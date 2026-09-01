export default {
  title: 'Accessibilité',
  lead: "Navigation clavier intégrale, sémantique ARIA native et respect systématique de <code>prefers-reduced-motion</code> sur l'ensemble des composants.",

  guaranteedHeading: "Exigences et garanties d'accessibilité",
  guarantees: [
    "<strong>Navigation au clavier & Gestion du focus</strong> : Tous les composants interactifs sont accessibles et manipulables au clavier selon l'ordre logique du DOM, sans piège à focus (focus trap). Le témoin de focalisation (focus ring) est garanti. À la fermeture d'un composant flottant (menu, tiroir, boîte de dialogue), le focus est restitué à son élément déclencheur, et la touche Escape assure la fermeture systématique des vues superposées.",
    "<strong>Sémantique WAI-ARIA & Annonces dynamiques</strong> : Chaque composant implémente le motif ARIA adapté à son rôle, reflétant ses états dynamiques et les relations structurelles entre ses sous-éléments. Les restitutions sonores privilégient la fonction et le comportement plutôt que l'apparence visuelle. Les mises à jour contextuelles sont notifiées aux technologies d'assistance via des zones réactives (ARIA live regions).",
    "<strong>Contrainte de compilation sur les noms accessibles</strong> : Les contrôles visuels reposant uniquement sur des icônes exigent obligatoirement un nom accessible via leurs props. L'absence de ce libellé constitue une erreur de typage à la compilation et non un oubli silencieux au runtime.",
    "<strong>Ratios de contraste & Tokens d'état</strong> : Le contraste textuel respecte le seuil minimal WCAG AA dans les thèmes clair et sombre. Les états désactivés (disabled) sont gérés par des tokens de couleur dédiés plutôt que par une baisse d'opacité, préservant leur lisibilité quelle que soit la surface sous-jacente.",
  ],
  guaranteedBody:
    "Près de la moitié de la logique JavaScript comportementale du design system est dédiée exclusivement aux mécanismes d'accessibilité (gestion du focus, attributs ARIA, piégeage clavier). Les composants sont conçus selon un paradigme accessibility-first : l'accessibilité constitue la fondation avant toute surcouche d'interactivité. Enfin, la base de code est annotée de façon à pouvoir mesurer et auditer factuellement cette proportion, garantissant un engagement chiffrable plutôt qu'une simple intention.",

  focusHeading: 'Focus',
  focusBody:
    "L'indicateur de focus se matérialise sous la forme d'un contour de 2px avec un décalage (offset) de 2px, tracé à l'extérieur de la boîte de l'élément (<code>outline</code>). Ce rendu hors-flux garantit zéro coût de recalcul de mise en page (no reflow). Lorsque le composant parent applique un rognage de son contenu (<code>overflow: hidden</code>), l'indicateur est automatiquement ramené vers l'intérieur (notamment pour les boutons d'action intégrés aux champs, les en-têtes d'accordéons ou les lignes d'arborescences animées). En effet, un contour projeté à l'extérieur d'un conteneur avec masque de découpe est tronqué et devient invisible.",
  focusCaption:
    "Parcourez-les avec Tab. Un champ de texte fait exception à la règle, avec une bordure d'accent de 1px plus une ombre de la même couleur, et la croix qu'il contient prend l'anneau pour elle.",

  validationHeading: 'Validation',
  validationBody:
    "La gestion des erreurs repose sur la pseudo-classe native <code>:user-invalid</code> plutôt que sur <code>:invalid</code>. Le signalement visuel d'erreur ne se déclenche qu'une fois la saisie interrompue et le champ quitté (blur), évitant de marquer comme invalide un contenu en cours de frappe (par exemple une adresse e-mail à moitié renseignée). Pour les règles métiers ne pouvant être validées que par le serveur, la prop <code>invalid</code> permet de forcer programmatiquement l'état d'erreur du composant.",

  motionHeading: 'Animation',
  motionBody:
    "Lorsque la préférence système <code>prefers-reduced-motion</code> est active, les transitions d'état sont supprimées (<code>transition: none</code>), tandis que les animations en boucle sont ralenties au lieu d'être stoppées. Un indicateur de chargement (spinner) voit par exemple son cycle étendu de 1s à 3s. Ce maintien d'un mouvement minimal prévient toute ambiguïté d'affichage : un composant de statut totalement figé est perçu par l'utilisateur comme un plantage de l'application.",

  forcedColorsHeading: 'Couleurs forcées',
  forcedColorsBody:
    "Vectis UI intègre deux choix d'architecture spécifiquement conçus pour le mode Couleurs forcées de Windows (Forced Colors Mode / Contraste élevé) :",
   forcedColorsRules: ["<strong>Rendu des icônes</strong> : Les icônes sont exclusivement intégrées sous forme de balises <code>&lt;svg&gt;</code> avec <code>fill=\"currentColor\"</code>. L'usage de masques d'arrière-plan CSS (<code>mask-image</code>) est proscrit, car ces derniers sont entièrement masqués par le système en mode couleurs forcées.", "<strong>Lignes de séparation et séparateurs</strong> : Les filets sont réalisés via de véritables bordures CSS (<code>border</code>) plutôt que par des conteneurs filiformes à fond coloré (<code>background-color</code>). En effet, le système réinitialise les fonds sur la couleur système Canvas (identique au fond de page, ce qui rend le composant invisible), tandis que les bordures basculent sur <code>CanvasText</code>, garantissant leur lisibilité."]
}
