export default {
  title: 'Famille de police',
  lead: "La bibliothèque ne livre AUCUNE police web. Trois tokens de famille sont tout ce qu'elle déclare, et chacun retombe sur une pile de la plateforme, si bien qu'un design system auquel on ne donne jamais de caractère s'affiche correctement partout.",

  threeHeading: 'Les trois familles',
  families: [
    "<code>--vectis-font-family-sans</code> : la pile d'interface de la plateforme (<code>system-ui</code>, <code>-apple-system</code>, Segoe UI, Roboto…). Tout est écrit dedans sauf mention contraire.",
    "<code>--vectis-font-family-display</code> : le caractère de titrage. Sa valeur par défaut est <code>var(--vectis-font-family-sans)</code>, délibérément. Une indirection plutôt qu'une pile dupliquée fait que donner aux titres un caractère propre est UNE surcharge au lieu de deux.",
    "<code>--vectis-font-family-mono</code> : <code>ui-monospace</code>, Cascadia Code, Source Code Pro, Menlo, Consolas. Il n'y a aucune police web à charger, et les recours de la pile gèrent l'absence.",
  ],
  roles:
    "Par-dessus se posent les trois rôles qu'un composant nomme réellement : <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> et <code>--vectis-text-family-code</code>. Le CSS des composants lit le RÔLE et jamais la primitive, ce qui permet à la surcharge ci-dessous de s'appliquer à un sous-arbre plutôt qu'au document entier.",

  wiringHeading: 'Brancher une police web',
  wiringBody:
    "Deux gestes, et aucun des deux n'appartient à la bibliothèque : charger le caractère, puis pointer un token de famille vers lui. Le token est une propriété personnalisée ordinaire : une déclaration sans couche sur <code>:root</code> atteint donc tous les composants d'un coup, et une déclaration sur un élément n'atteint que son sous-arbre.",
  wiringSelfHosted:
    "La même chose avec les fichiers servis depuis votre propre origine. C'est la version à préférer pour un build hors ligne, pour un site qui n'envoie aucune requête à un tiers, ou simplement pour maîtriser la mise en cache. Seul le chargement change : les tokens du dessous sont ceux du dessus, à l'identique.",

  splitHeading: 'Quel texte utilise quelle famille',
  splitBody:
    "Donner un caractère de titrage à la bibliothèque tient en une déclaration, mais cela ne repeint pas tout : cinq rôles typographiques lisent la famille de titrage, et le reste de l'interface demeure dans celle de texte. La liste ci-dessous est ce qu'il faut regarder avant de choisir un caractère, puisqu'elle dit quel texte sera réellement composé dedans. Rien n'est à brancher pour cela : un VTypography nomme son rôle par <code>variant</code>, et les composants qui rendent du texte de leur côté, un titre de boîte de dialogue ou un résumé d'accordéon par exemple, choisissent le leur eux-mêmes.",
  splitList: [
    '<strong>Famille de titrage</strong> (<code>--vectis-text-family-heading</code>) : <code>display</code> 48px, <code>heading-1</code> 36px, <code>heading-2</code> 24px, <code>heading-3</code> 18px, <code>heading-4</code> 16px.',
    '<strong>Famille de texte</strong> (<code>--vectis-text-family</code>) : tout le reste. <code>subtitle</code>, les quatre tailles de corps, <code>label</code>, <code>caption</code>, <code>overline</code>, et le texte à l’intérieur de chaque contrôle.',
    '<strong>Famille de code</strong> (<code>--vectis-text-family-code</code>) : le rôle <code>code</code>, et rien d’autre.',
  ],
  splitWhy:
    "Deux conséquences en découlent. Un caractère de titrage doit ici tenir jusqu'à 16px, puisque <code>heading-4</code> fait partie du groupe : un caractère qui ne tient qu'au-dessus de 24px est donc le mauvais choix pour cette échelle. Et la frontière se déplace. Redéfinir <code>--vectis-text-family-heading</code> sur un élément rend ce sous-arbre au caractère de texte, titres compris, et un rôle isolé se déplace tout seul en surchargeant la famille qu'il lit, une règle sans couche l'emportant sur celle du composant.",

  iconHeading: "L'unique police optionnelle",
  iconBefore:
    "<code>--vectis-font-family-icon</code> nomme Material Symbols Rounded, et la bibliothèque ne la charge jamais. Elle n'est nécessaire que pour adresser des glyphes par ligature en dehors du registre intégré. Voyez",
  iconAfter: ', où l’alternative est un résolveur à vous.',
}
