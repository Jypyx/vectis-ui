export default {
  title: 'Champ numérique',
  lead: '<code>VNumberInput</code> est un champ pour un nombre, avec des boutons de pas, le clavier d’un spinbutton et un formatage selon la locale.',
  examples: {
    controls: {
      title: 'Boutons',
      text: '<code>controls</code> place les boutons de pas de part et d’autre, les empile à la fin ou les retire. Ils restent hors de l’ordre de tabulation : les flèches du clavier agissent depuis le champ.',
    },
    formatting: {
      title: 'Formatage',
      text: "<code>formatOptions</code> reçoit les options d’<code>Intl.NumberFormat</code>. La valeur est formatée hors édition et affichée brute pendant la saisie. Avec <code>style: 'percent'</code>, 0,15 s’affiche et se saisit 15.",
    },
    step: {
      title: 'Pas',
      text: '<code>step</code> fixe de combien les flèches et les boutons déplacent la valeur, sur une grille qui part de <code>min</code>. Les pas décimaux ne dérivent pas.',
    },
  },
  api: {
    VNumberInput: {
      props: {
        min: 'Plus petite valeur. Une valeur saisie inférieure y est ramenée à la validation.',
        max: 'Plus grande valeur. Une valeur saisie supérieure y est ramenée à la validation.',
        step: 'Déplacement des flèches et des boutons. Page précédente et Page suivante déplacent de dix pas.',
        formatOptions:
          'Options d’<code>Intl.NumberFormat</code> pour la valeur affichée : devise, unité, pourcentage ou décimales.',
        locale:
          'Locale utilisée pour formater et lire le nombre. Par défaut, celle de la bibliothèque.',
        controls: 'Position des boutons de pas.',
        incrementLabel:
          'Nom accessible du bouton plus. Par défaut, celui du dictionnaire de la bibliothèque.',
        decrementLabel:
          'Nom accessible du bouton moins. Par défaut, celui du dictionnaire de la bibliothèque.',
        size: 'Taille du champ. Remplacée quand <code>VInputGroup</code> définit <code>size</code>.',
        compact:
          'Réduit la hauteur sans changer les marges ni le texte. Remplacé quand <code>VInputGroup</code> définit <code>compact</code>.',
        label:
          'Libellé visible lié au champ. Sans lui, fournissez <code>aria-label</code> ou <code>aria-labelledby</code>.',
        hint: 'Aide sous le champ, liée par <code>aria-describedby</code>.',
        error:
          'Message d’erreur affiché à la place de l’aide. Définit <code>aria-invalid</code> et est annoncé quand il apparaît.',
        invalid: 'Définit <code>aria-invalid</code> et le style d’erreur.',
        disabled: 'Désactive le champ et ses boutons.',
        readonly: 'Empêche la saisie et les pas, en laissant le focus et la copie possibles.',
        clearable: 'Ajoute un bouton d’effacement qui met la valeur à <code>null</code>.',
        clearLabel:
          'Nom accessible du bouton d’effacement. Par défaut, celui du dictionnaire de la bibliothèque.',
        loading: 'Affiche un indicateur de chargement à la fin du champ.',
        loadingText:
          'Texte accessible de l’indicateur. Par défaut, celui du dictionnaire de la bibliothèque.',
        vModel:
          'Valeur du champ, un nombre, ou <code>null</code> quand il est vide. La saisie est validée à la sortie du champ et sur Entrée.',
      },
      events: {
        clear: 'Émis après que le bouton d’effacement a mis la valeur à <code>null</code>.',
      },
    },
  },
}
