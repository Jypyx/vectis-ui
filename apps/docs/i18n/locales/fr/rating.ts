export default {
  title: 'Notation',
  lead: '<code>VRating</code> permet de donner une note sur quelques icônes. C’est un groupe de boutons radio natifs : les flèches, l’envoi de formulaire et <code>required</code> fonctionnent comme dans tout formulaire.',
  examples: {
    clearable: {
      title: 'Effaçable',
      text: '<code>clearable</code> permet de revenir à <code>null</code> : recliquez la valeur courante, ou atteignez « Aucune note » avec les flèches.',
    },
    readonly: {
      title: 'Lecture seule',
      text: '<code>readonly</code> affiche la valeur comme une seule image nommée d’après elle, par exemple « 3,7 sur 5 ». Une valeur fractionnaire remplit une partie d’icône.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> règle les icônes sur 20, 24 ou 32 pixels.',
    },
    tones: {
      title: 'Tons et icônes',
      text: '<code>tone</code> colore les icônes remplies, et <code>color</code> le remplace par une couleur de votre choix. <code>icon</code> remplace l’étoile par n’importe quelle icône ; les vides sont dessinées en contour et les remplies avec sa forme pleine.',
    },
    validation: {
      title: 'Validation',
      text: 'VRating suit le modèle des champs : <code>error</code> remplace l’aide et est annoncé, et <code>required</code> ajoute un astérisque et rend le choix obligatoire pour le navigateur.',
    },
  },
  api: {
    VRating: {
      props: {
        max: 'Nombre d’icônes, et valeur la plus haute.',
        label:
          'Légende du groupe. Par défaut, le nom accessible vient du dictionnaire de la bibliothèque.',
        hideLabel: 'Masque visuellement le libellé, qui reste le nom du groupe.',
        hint: 'Texte d’aide sous les icônes.',
        error: 'Message d’erreur qui remplace l’aide. Annoncé quand il apparaît ou change.',
        required: 'Rend la note obligatoire dans un formulaire et ajoute un astérisque.',
        name: 'Nom du champ dans l’envoi du formulaire.',
        clearable:
          'Permet de revenir à aucune note, en recliquant la valeur courante ou avec le choix « Aucune note ».',
        readonly:
          'Affiche la valeur comme une seule image. Une valeur fractionnaire remplit une partie d’icône.',
        disabled: 'Désactive tout le groupe.',
        size: 'Taille des icônes.',
        tone: 'Couleur des icônes remplies.',
        color:
          'Couleur personnalisée des icônes remplies (hex, nom CSS ou <code>oklch()</code>), qui remplace le ton. Vérifiez son contraste.',
        icon: 'Icône qui remplace l’étoile.',
        vModel:
          'Note de 1 à <code>max</code>, ou <code>null</code>. Peut être fractionnaire en lecture seule.',
      },
    },
  },
}
