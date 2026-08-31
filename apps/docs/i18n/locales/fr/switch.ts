export default {
  title: 'Interrupteur',
  lead: "Un réglage qui prend effet immédiatement. Il est annoncé avec <code>role=\"switch\"</code>, si bien qu'un lecteur d'écran dit activé ou désactivé plutôt que coché, et c'est toute la raison pour laquelle ce n'est pas une case à cocher.",

  choiceHeading: 'Interrupteur ou case à cocher',
  choiceBody:
    "Un interrupteur agit sur-le-champ ; une case à cocher énonce une intention qu'un envoi exécutera. Si le changement demande un bouton Enregistrer, c'est une case à cocher.",
  spread:
    "<code>spread</code> pousse le libellé et l'interrupteur aux extrémités opposées. C'est la forme habituelle d'une liste de réglages, où les interrupteurs s'alignent alors le long d'un bord.",
  labelSlot:
    "Le libellé est le SLOT PAR DÉFAUT plutôt qu'une prop, ce qui lui permet de contenir un lien ou une emphase. Il se trouve à l'intérieur du <code>&lt;label&gt;</code> englobant, donc cliquer les mots bascule l'interrupteur.",

  builtHeading: 'Comment il est construit',
  built: [
    'Un vrai <code>&lt;input type="checkbox"&gt;</code>, masqué par <code>opacity</code> et jamais par <code>display: none</code>, qui sortirait le champ de l\'ordre de tabulation et du formulaire.',
    'Le curseur porte <code>shadow-xs</code>, la seule ombre du groupe des formulaires.',
    "La piste fait 40 × 20px, valeur venue de la table des contrôles, et il n'y a délibérément aucune prop <code>size</code> : un interrupteur est un élément de décor à taille fixe, pas un contrôle sur l'échelle.",
    "L'état désactivé se grise par les tokens de couleur plutôt que par l'opacité, ce qui le garde lisible sur n'importe quelle surface.",
  ],

  apiHeading: 'API',
  apiSpread: '<code>boolean</code> : libellé et interrupteur aux extrémités opposées',
  apiBody:
    "Le libellé est le slot <code>#default</code>. <code>name</code>, <code>required</code>, <code>value</code> et tous les autres attributs retombent sur le champ masqué, si bien que l'interrupteur s'envoie avec le formulaire comme n'importe quelle case à cocher.",
}
