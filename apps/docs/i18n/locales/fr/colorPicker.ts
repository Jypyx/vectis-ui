export default {
  title: 'Sélecteur de couleur',
  lead: '<code>VColorPicker</code> choisit une couleur avec une zone de saturation et de luminosité, une piste de teinte et un champ qui accepte l’hexadécimal, <code>rgb()</code>, <code>hsl()</code> et <code>oklch()</code>. Ses pistes sont des curseurs natifs : les technologies d’assistance règlent chaque canal séparément.',
  examples: {
    formats: {
      title: 'Formats',
      text: '<code>format</code> fixe l’écriture de la valeur : <code>hex</code>, <code>rgb</code>, <code>hsl</code> ou <code>oklch</code>. Le menu à côté du champ ne change que l’affichage du champ. Le sélecteur travaille en sRGB et ramène dans cet espace une couleur <code>oklch()</code> qui en sort.',
    },
    alpha: {
      title: 'Opacité',
      text: '<code>alpha</code> ajoute une piste d’opacité. L’alpha n’est écrit dans la valeur qu’en dessous de 1.',
    },
    swatches: {
      title: 'Nuancier',
      text: '<code>swatches</code> propose des couleurs prédéfinies sous forme de boutons radio natifs. Passez <code>{ color, label }</code> pour nommer une pastille auprès des lecteurs d’écran.',
    },
  },
  api: {
    VColorPicker: {
      props: {
        format: 'Écriture de la valeur. Le champ accepte les quatre formats.',
        alpha: 'Ajoute une piste d’opacité et écrit l’alpha en dessous de 1.',
        swatches: 'Couleurs prédéfinies : une chaîne de couleur ou <code>{ color, label }</code>.',
        hideInput: 'Masque le champ de saisie et son menu de format.',
        hideEyeDropper:
          'Masque la pipette, affichée sinon là où le navigateur prend en charge l’API <code>EyeDropper</code>.',
        disabled: 'Désactive toutes les commandes.',
        label: 'Nom accessible du sélecteur. Par défaut, celui du dictionnaire de la bibliothèque.',
        name: 'Nom du champ à l’envoi du formulaire, par un input caché.',
        vModel: 'Couleur écrite selon <code>format</code>, ou <code>null</code> avant tout choix.',
      },
    },
  },
}
