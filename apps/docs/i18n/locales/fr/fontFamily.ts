export default {
  title: 'Polices',
  lead: 'Vectis UI utilise les polices système par défaut et ne charge aucune police web. Redéfinissez les tokens de famille pour utiliser vos propres polices.',

  threeHeading: 'Familles par défaut',
  families: [
    '<code>--vectis-font-family-sans</code> : polices système pour le texte de l’interface.',
    '<code>--vectis-font-family-display</code> : police des titres. Vaut <code>var(--vectis-font-family-sans)</code> par défaut.',
    '<code>--vectis-font-family-mono</code> : polices système à chasse fixe pour le code.',
  ],
  roles:
    'Les composants utilisent trois tokens sémantiques : <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> et <code>--vectis-text-family-code</code>. Redéfinissez-les sur un conteneur pour changer les polices d’une section ; les alias de primitives déclarés à la racine ne sont pas recalculés dans ce conteneur.',

  wiringHeading: 'Charger une police web',
  wiringBody:
    'Chargez la police, puis affectez son nom de famille CSS aux tokens correspondants. Ces exemples définissent les polices du texte courant et des titres pour toute la page.',
  wiringSelfHosted:
    'Pour servir la police depuis votre application, déclarez son fichier avec <code>@font-face</code> :',

  splitHeading: 'Rôles des polices',
  splitBody:
    '<code>VTypography</code> choisit sa famille de police selon sa prop <code>variant</code> :',
  splitList: [
    '<code>--vectis-text-family-heading</code> : <code>display</code> et <code>heading-1</code> à <code>heading-4</code>.',
    '<code>--vectis-text-family</code> : texte courant, sous-titres, libellés, légendes et surtitres.',
    '<code>--vectis-text-family-code</code> : variante <code>code</code>. Également utilisée par <code>VInputOTP</code>.',
  ],

  iconHeading: 'Police d’icônes facultative',
  iconBefore:
    'Les icônes SVG intégrées ne nécessitent aucune police. Pour les icônes à ligatures, chargez une police et définissez <code>--vectis-font-family-icon</code>, qui vaut Material Symbols Rounded par défaut. Consultez',
  iconAfter: ' pour les imports d’icônes et les résolveurs.',
}
