export default {
  title: 'Thématisation',
  lead: "Toute personnalisation est une redéfinition de propriétés personnalisées. Il n'y a rien à recompiler, et aucune étape de build à configurer.",

  architectureHeading: 'Architecture des tokens',
  architectureIntro:
    'Deux niveaux de propriétés personnalisées, générés depuis une source TypeScript typée, dans un format inspiré du DTCG du W3C.',
  levels: [
    "<strong>Primitives</strong> — 26 palettes OKLCH de onze pas chacune (<code>--vectis-color-indigo-500</code>), plus l'échelle d'espacement, la typographie, les rayons, les ombres, les durées et les courbes.",
    "<strong>Rôles sémantiques</strong>, les seuls qu'un composant a le droit de nommer : <code>--vectis-color-surface</code>, <code>--vectis-color-text-muted</code>, <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code>, <code>--vectis-focus-ring-color</code>.",
  ],
  architectureBody:
    "Un composant demande l'accent et jamais un indigo précis : une application peut donc changer ce QU'EST l'accent sans qu'aucun composant en sache rien. Une valeur hexadécimale écrite en dur dans le CSS d'un composant est traitée comme un token manquant.",
  palettes:
    "Cinq palettes sont reliées à un rôle — gray pour les surfaces, le texte et les bordures, indigo pour l'accent, puis red, green et amber pour danger, succès et avertissement. Les vingt et une autres sont livrées inutilisées : pointer un rôle vers l'une d'elles ne coûte rien et n'attend aucune version. C'est exactement ce que fait ce site : son accent est violet.",

  darkHeading: 'Mode sombre',
  darkBody:
    "Le mode sombre déplace les RÔLES, jamais la palette. <code>data-theme</code> fonctionne sur n'importe quel sous-arbre du DOM — un panneau sombre dans une page claire, ou l'inverse — et pilote aussi <code>color-scheme</code>, si bien que les barres de défilement et les contrôles natifs suivent.",
  darkCaption: 'Un sous-arbre, un attribut.',
  darkNoQuery:
    "Les tokens générés ne contiennent délibérément aucune requête <code>prefers-color-scheme</code> : suivre le système est une décision qui revient à l'application, pas au design system, et c'est une ligne de JavaScript qui pose l'attribut. Le faire en CSS rendrait le choix impossible à surcharger par le lecteur.",

  overridesHeading: "Surcharges à l'exécution",
  oklch:
    "La couleur est écrite en OKLCH, toujours, et pour deux raisons que la bibliothèque énonce explicitement : un pas d'une palette est aussi clair que le même pas de n'importe quelle autre, et mélanger deux d'entre elles passe par les nuances attendues plutôt que par le gris. Ne convertissez jamais un token en hexadécimal.",

  layersHeading: 'Couches',
  layers:
    "Le CSS vit dans des couches — <code>vectis.reset</code> &lt; <code>vectis.tokens</code> &lt; <code>vectis.components</code> &lt; <code>vectis.utilities</code> — et tout style non calqué écrit côté consommateur l'emporte automatiquement. C'est le mécanisme de surcharge prévu, pas une faille : surcharger un composant ne demande jamais une guerre de spécificité.",
}
