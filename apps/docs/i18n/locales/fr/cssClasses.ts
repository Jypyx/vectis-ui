export default {
  title: 'Classes CSS utilitaires',
  lead: 'Utilisez <code>v-visually-hidden</code> pour les textes destinés aux lecteurs d’écran. Personnalisez les styles des composants avec les variables CSS et les surcharges hors couche.',

  hiddenHeading: 'v-visually-hidden',
  hiddenBody:
    'Masque visuellement le texte tout en le laissant accessible aux technologies d’assistance. La classe est incluse dans <code>vectis-ui/styles.css</code>.',

  layersHeading: 'Couches CSS',
  layersIntro: 'La bibliothèque déclare ses couches dans cet ordre :',
  layersBody:
    'Écrivez les surcharges hors couche pour qu’elles priment sur les déclarations normales de la bibliothèque. Si votre application utilise des couches, déclarez sa couche de surcharge après celles de la bibliothèque.',

  internalHeading: 'Classes internes',
  internalBody:
    'Les classes comme <code>.v-control</code>, <code>.v-panel</code> et <code>.v-tone</code> servent aux styles des composants et peuvent changer. Préférez les variables CSS publiques pour la personnalisation.',

  propertiesHeading: 'Variables CSS',
  propertiesBody:
    'Redéfinissez le token du style à modifier, comme <code>--vectis-color-accent</code>, <code>--vectis-radius-interactive</code> ou <code>--vectis-text-family-heading</code>. Utilisez <code>--vectis-icon-size</code> pour la taille des icônes et <code>--vectis-focus-ring-color</code> pour les contours de focus.',
}
