export default {
  title: 'Famille de police',
  lead: "La bibliothèque ne livre AUCUNE police web. Trois tokens de famille sont tout ce qu'elle déclare, et chacun retombe sur une pile de la plateforme — si bien qu'un design system auquel on ne donne jamais de caractère s'affiche correctement partout.",

  threeHeading: 'Les trois familles',
  families: [
    "<code>--vectis-font-family-sans</code> — la pile d'interface de la plateforme (<code>system-ui</code>, <code>-apple-system</code>, Segoe UI, Roboto…). Tout est écrit dedans sauf mention contraire.",
    "<code>--vectis-font-family-display</code> — le caractère de titrage. Sa valeur par défaut est <code>var(--vectis-font-family-sans)</code>, délibérément : une indirection plutôt qu'une pile dupliquée, si bien que donner aux titres un caractère propre est UNE surcharge au lieu de deux.",
    "<code>--vectis-font-family-mono</code> — <code>ui-monospace</code>, Cascadia Code, Source Code Pro, Menlo, Consolas. Il n'y a aucune police web à charger, et les recours de la pile gèrent l'absence.",
  ],
  roles:
    "Par-dessus se posent les trois rôles qu'un composant nomme réellement : <code>--vectis-text-family</code>, <code>--vectis-text-family-heading</code> et <code>--vectis-text-family-code</code>. Le CSS des composants lit le RÔLE, jamais la primitive — et c'est ce qui fait que la surcharge ci-dessous s'applique à un sous-arbre plutôt qu'au document entier.",

  wiringHeading: 'Brancher une police web',
  wiringBody:
    "Ce site est l'exemple travaillé. Ses titres sont en Josefin Sans et son texte en Geist, et ni l'un ni l'autre ne vient de la bibliothèque : les deux sont chargés et désignés depuis une feuille de style non calquée, propre au site, et c'est tout.",
  demoText:
    'Geist porte tous les rôles à partir du sous-titre, à 14px pour le décor applicatif et 16px pour la prose longue.',
  wiringCdn:
    "Charger par <code>@import</code> depuis un CDN est la version la plus courte, pas la meilleure : un build hors ligne ou soucieux de vie privée voudra plutôt les fichiers woff2 servis depuis sa propre origine et des règles <code>@font-face</code> locales. Rien de ce qui précède ne change — seulement d'où viennent les octets.",

  splitHeading: 'Où passe la frontière',
  splitBody:
    "Cinq rôles prennent la famille de titrage, et ce sont exactement les cinq qui sont des titres : <code>display</code> (48px) et <code>heading-1</code> (36px) jusqu'à <code>heading-4</code> (16px). <code>subtitle</code> et tout ce qui suit restent dans le caractère de texte.",
  splitList: [
    '<strong>Famille de titrage :</strong> display, heading-1, heading-2, heading-3, heading-4.',
    '<strong>Famille de texte :</strong> subtitle, body-lg, body-md, body-sm, label, caption, overline.',
    '<strong>Famille de code :</strong> code, et rien d’autre.',
  ],
  splitWhy:
    "Un caractère de titrage géométrique à faible hauteur d'x — Josefin Sans en est un — se lit bien à 48px et devient flou à 16px. C'est une propriété du CARACTÈRE, pas des rôles, et c'est pourquoi la bibliothèque ne tranche pas : elle vous donne la frontière et vous laisse décider jusqu'où elle descend.",

  overrideHeading: 'Surcharger une famille',
  overrideBody:
    "Si <code>heading-3</code> (18px) ou <code>heading-4</code> (16px) manquent de tenue dans votre caractère de titrage, surchargez la famille de titrage sur ce sous-arbre plutôt que de modifier les rôles : ce sont les rôles qui empêchent deux textes d'un même rôle de diverger.",
  overrideWeights:
    "Préférez une graisse 500–600 au 400 pour un caractère de titrage, et conservez l'approche de <code>-0.015em</code> que portent déjà les rôles supérieurs — elle est sur <code>display</code>, <code>heading-1</code> et <code>heading-2</code> seulement, et nulle part ailleurs.",

  iconHeading: "L'unique police optionnelle",
  iconBefore:
    "<code>--vectis-font-family-icon</code> nomme Material Symbols Rounded, et la bibliothèque ne la charge jamais. Elle n'est nécessaire que pour adresser des glyphes par ligature en dehors du registre intégré — voyez",
  iconAfter: ', où l’alternative est un résolveur à vous.',
}
