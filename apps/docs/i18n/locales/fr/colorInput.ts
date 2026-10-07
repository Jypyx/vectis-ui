export default {
  title: 'Champ de couleur',
  lead: '<code>VColorInput</code> est un champ de formulaire qui contient une couleur. On peut la saisir dans n’importe quel format, et la pastille au début du champ ouvre <code>VColorPicker</code> dans un panneau.',
  examples: {
    formats: {
      title: 'Formats',
      text: 'Le champ accepte l’hexadécimal, <code>rgb()</code>, <code>hsl()</code> et <code>oklch()</code>. Entrée ou la sortie du champ réécrit la couleur selon <code>format</code> ; toute autre saisie remet le champ dans son état précédent.',
    },
    alphaAndSwatches: {
      title: 'Opacité et nuancier',
      text: '<code>alpha</code> et <code>swatches</code> sont transmis au sélecteur. La pastille du champ montre l’opacité sur un damier.',
    },
    clearable: {
      title: 'Effaçable',
      text: '<code>clearable</code> ajoute une croix qui remet la valeur à <code>null</code>.',
    },
    validation: {
      title: 'Validation',
      text: 'VColorInput suit le modèle des champs : <code>error</code> remplace l’aide et est annoncé. Les attributs comme <code>name</code> et <code>required</code> vont au champ de saisie.',
    },
    sizes: {
      title: 'Tailles',
      text: '<code>size</code> fixe la hauteur du champ à 32, 40 ou 48 pixels.',
    },
    states: {
      title: 'Lecture seule et désactivé',
      text: '<code>readonly</code> affiche la couleur sans sélecteur. <code>disabled</code> bloque le champ et la pastille.',
    },
  },
  api: {
    VColorInput: {
      props: {
        format: 'Écriture de la valeur. Le champ accepte les quatre formats.',
        alpha: 'Ajoute une piste d’opacité au sélecteur et écrit l’alpha en dessous de 1.',
        swatches: 'Couleurs prédéfinies proposées dans le sélecteur.',
        hideEyeDropper: 'Masque la pipette du sélecteur.',
        label:
          'Libellé visible. Sans nom visible, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        hint: 'Texte d’aide relié par <code>aria-describedby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Définit <code>aria-invalid</code> et est annoncé à son apparition.',
        placeholder: 'Texte indicatif affiché quand le champ est vide.',
        size: 'Taille du composant.',
        compact: 'Réduit la hauteur du contrôle sans changer le texte ni les icônes.',
        disabled: 'Désactive l’interaction.',
        readonly: 'Empêche la saisie et retire le sélecteur. Le champ reste focalisable.',
        invalid:
          'Définit <code>aria-invalid</code> et le style d’erreur. Ne bloque pas l’envoi du formulaire à lui seul.',
        clearable: 'Ajoute un bouton qui vide la valeur.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Par défaut, celui du dictionnaire de la bibliothèque.',
        pickerLabel:
          'Nom accessible de la pastille qui ouvre le sélecteur. Par défaut, celui du dictionnaire de la bibliothèque.',
        placement: 'Position préférée du panneau par rapport au champ.',
        vModel:
          'Couleur écrite selon <code>format</code>, ou <code>null</code> quand le champ est vide. Le texte saisi la met à jour sur Entrée ou à la sortie du champ.',
      },
      events: {
        clear: 'La valeur a été effacée ; le modèle est déjà réinitialisé.',
      },
      slots: {
        valueEnd: 'Contenu placé avant le bouton d’effacement.',
      },
    },
  },
}
