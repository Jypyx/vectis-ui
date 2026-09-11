export default {
  title: 'Curseur',
  lead: "Une valeur choisie en glissant, avec une poignée ou deux. Il est bâti sur de vrais champs range : le clavier, le formulaire et les technologies d'assistance viennent donc tous du navigateur.",

  examples: {
    range: {
      title: 'Intervalle',
      text: "Deux pouces au lieu d'un, pour un intervalle plutôt qu'une valeur. C'est la forme du modèle qui tranche : un nombre seul donne un pouce, une paire en donne deux, si bien qu'il n'y a rien à tenir accordé à la main. Les pouces sont empêchés de se croiser, ce qui garde la paire ordonnée quoi que fasse le lecteur, et chacun est annoncé comme le début ou la fin de l'intervalle plutôt que comme deux sliders répondant au même nom.",
    },
    minMax: {
      title: 'Minimum et maximum',
      text: "Les bornes de la valeur, 0 et 100 sauf indication contraire, et l'une comme l'autre peuvent valoir n'importe quoi, négatifs compris. Ce sont les premières choses à poser, puisque tout le reste se mesure par rapport à elles : le pas divise l'écart qui les sépare, les graduations marquent cette division, et une liste de libellés doit compter une entrée par arrêt.",
    },
    steps: {
      title: 'Pas',
      text: "L'écart entre deux valeurs sur lesquelles le pouce peut s'arrêter, et aussi ce dont une flèche le déplace. <code>ticks</code> marque chacun de ces arrêts sur la piste, et un pas fractionnaire ne pose pas de problème, la valeur étant ramenée sur le pas plutôt que d'accumuler ce que laisse le calcul flottant. Un cas mérite d'être connu : quand l'écart ne se divise pas rond par le pas, le dernier arrêt tombe en deçà du maximum, et les graduations le disent au lieu de dessiner une marque là où le pouce ne peut pas aller. Au-delà de cinquante pas, plus aucune graduation n'est tracée, un peigne aussi dense étant illisible.",
    },
    textLabels: {
      title: 'Libellés texte',
      text: "Un libellé par pas, dans l'ordre. Ils nomment les arrêts sous la piste, et ils deviennent ce qu'un lecteur d'écran annonce à la place du nombre brut, ce dont le slider a besoin dès que ses valeurs ne sont pas des quantités : une taille se lit « M » et non « 2 ». Fournir des libellés allume les graduations tout seul, un libellé sans marque sous laquelle se placer n'ayant rien à désigner.",
    },
    iconLabels: {
      title: 'Libellés icône',
      text: "Un pas peut être nommé par une icône plutôt que par un mot, et le mot vient alors avec : l'icône est ce qu'on voit, le libellé ce qui est annoncé et ce comme quoi la valeur se lit. Les deux formes se mélangent dans la même liste, donc une échelle peut être dessinée là où elle parle d'elle-même et écrite là où elle ne parle pas.",
    },
    tooltip: {
      title: 'Montrer la valeur pendant le glissement',
      text: "Une bulle au-dessus du pouce, pendant qu'on le déplace ou tant qu'il garde le focus clavier. C'est ce dont a besoin une piste qui ne porte aucun chiffre, et chaque pouce d'un intervalle porte la sienne. Elle est décorative et masquée aux technologies d'assistance, la valeur faisant déjà partie de ce que le slider annonce : rien n'est dit deux fois.",
    },
    inputs: {
      title: 'Saisir la valeur exactement',
      text: "Glisser est rapide et imprécis, et voici l'issue : un champ numérique à côté de la piste, un par extrémité en mode intervalle. Ce qui est tapé n'est validé qu'en quittant le champ ou sur Entrée, jamais au fil de la frappe, car lire touche par touche ramènerait le 1 de 15 dans les bornes avant même que le 5 ne soit pressé. Une saisie hors bornes est ramenée dedans et alignée sur le pas ; une saisie illisible, champ vide compris, remet silencieusement la valeur précédente.",
    },
    orientation: {
      title: 'Orientation',
      text: "Debout, la plus petite valeur en bas. Tout le reste est inchangé : les graduations, les libellés, les bulles et les champs numériques suivent l'axe, et le clavier reste celui du navigateur. Un slider vertical n'a aucun conteneur d'où tirer sa longueur : il lit un token à la place, et c'est lui qu'il faut redéfinir pour l'allonger ou le raccourcir.",
    },
    disabled: {
      title: 'Désactivé',
      text: "Le seul état du slider. Il grise la piste, le pouce et les graduations par les tokens de couleur plutôt que par une opacité, sort les pouces de l'ordre de tabulation et désactive les champs numériques avec eux : il n'existe pas de slider à moitié utilisable dont la valeur pourrait encore être tapée.",
    },
    form: {
      title: 'Dans un formulaire',
      text: "La racine du composant est une boîte de mise en page qui porte les libellés, la piste et les champs éventuels : <code>name</code>, <code>id</code> et les aria-* sont donc redirigés sur le vrai input range en dessous, car laissés sur l'enveloppe, un name ne soumettrait rien et un label pointerait sur un div. Nommer le slider passe par la prop <code>label</code>, qui pose un aria-label et l'emporterait donc sur un libellé visible à vous : choisissez l'un des deux. L'intervalle est le cas sans bonne réponse : deux pouces n'ont pas une valeur unique à soumettre, seul celui de fin porte le name, et le composant le signale en développement. Liez plutôt le modèle à deux champs à vous.",
    },
  },

  api: {
    VSlider: {
      props: {
        min: 'La valeur la plus basse que la poignée peut atteindre.',
        max: 'La valeur la plus haute que la poignée peut atteindre.',
        step: "L'écart entre deux valeurs sur lesquelles la poignée peut s'arrêter. C'est aussi le pas des flèches, et ce sur quoi une valeur saisie dans le champ voisin est alignée.",
        range:
          'Propose deux poignées pour choisir un intervalle, ce qui fait de la valeur une paire.',
        disabled: 'Rend le curseur inutilisable.',
        label:
          "Ce que les lecteurs d'écran annoncent pour le curseur. En mode intervalle, les deux poignées sont annoncées comme le début et la fin de celui-ci.",
        orientation: 'Dresse le curseur à la verticale, la valeur la plus basse en bas.',
        inputs:
          "Ajoute un champ numérique à côté du curseur pour poser la valeur exactement, un champ ou un par extrémité en mode intervalle. Glisser est rapide mais imprécis ; c'est la porte de sortie.",
        ticks:
          "Marque chaque pas sur la piste. Fournir des libellés l'implique. Au-delà de cinquante pas, les marques formeraient un peigne illisible et ne sont pas dessinées du tout.",
        labels:
          "Un libellé pour chaque pas, dans l'ordre : un texte, ou une icône avec les mots qui la nomment pour les lecteurs d'écran. Ils deviennent aussi ce qu'un lecteur d'écran annonce à la place du nombre brut.",
        tooltip:
          "Affiche la valeur dans une bulle au-dessus de la poignée pendant qu'on la déplace ou qu'elle a le focus.",
        vModel:
          'La valeur, et sa FORME est ce qui met le curseur en mode intervalle : un nombre unique donne une poignée, une paire en donne deux. La paire est toujours ordonnée, les poignées étant empêchées de se croiser.',
      },
    },
  },
}
