export default {
  title: 'Badge',
  lead: "Un petit compteur ou un marqueur, seul ou épinglé au coin d'autre chose. Il n'est jamais interactif : ce qu'il rapporte appartient à l'élément sur lequel il se pose.",

  examples: {
    tones: {
      title: 'Tons',
      text: "Cinq sens, cinq couleurs : <code>accent</code> pour le compteur ordinaire, <code>neutral</code> pour celui qui ne porte aucune urgence, puis <code>success</code>, <code>warning</code> et <code>danger</code> pour un état. La pilule est toujours pleine, et il n'y a pas de variante à choisir à côté du ton : à cette taille, un contour ne laisserait rien à lire.",
    },
    colors: {
      title: 'Couleurs personnalisées',
      text: 'Une <code>color</code> remplace le ton, donnée en hexadécimal, en nom de couleur CSS ou en <code>oklch()</code>. Là où <code>contrast-color()</code> est pris en charge, le texte passe au noir ou au blanc de lui-même, ce qui garde lisible le badge jaune ci-dessous ; partout ailleurs il se rabat sur le blanc, et vérifier une couleur claire vous revient.',
    },
    counters: {
      title: 'Compteurs',
      text: "La pilule est au moins aussi large que haute : un seul chiffre sort donc rond, et deux restent une pilule plutôt qu'une ovale. Au-delà de 99, le nombre devient <code>99+</code> : un compte que personne ne lit précisément ne doit pas pouvoir étirer le badge en travers de sa cible.",
    },
    icon: {
      title: 'Avec une icône',
      text: "Une <code>icon</code> prend la place du nombre, et l'emporte sur <code>count</code> quand les deux sont donnés. Une icône et rien d'autre : la pilule fait 20px de surface, laissez donc le ton porter le reste du sens au lieu d'ajouter une seconde marque.",
    },
    dot: {
      title: 'Point',
      text: "Un <code>dot</code> fait 10px de couleur et rien dedans, pour dire que quelque chose a changé sans dire combien. Il ignore <code>count</code> et <code>icon</code>, qui n'y tiendraient pas, et c'est la forme que veut d'ordinaire un marqueur de présence ou de non-lu.",
    },
    inline: {
      title: 'En ligne',
      text: "Quand une cible lui est donnée par le slot par défaut, le badge se pose à côté d'elle avec un écart, du côté où finit le sens de lecture. La cible peut être n'importe quoi : un libellé, comme ci-dessous, un contrôle, une image. La pilule comme le point s'y lisent bien.",
    },
    overlay: {
      title: 'En incrustation',
      text: "<code>overlay</code> épingle le badge dans un coin de la cible au lieu de le poser à côté, débordant du quart de sa propre taille hors de la boîte pour que la cible garde la place qu'elle avait. Sur un badge sans cible, la prop ne fait rien : il n'y a aucun coin où l'épingler.",
    },
    overlayPosition: {
      title: "Position de l'incrustation",
      text: "Le coin est celui du haut par défaut, et <code>overlayPosition</code> le fait passer en bas, là où un marqueur de présence a sa place. Le côté horizontal n'est pas configurable : il suit le sens de lecture, si bien que le badge tombe à droite en français et à gauche en arabe, sans rien à régler.",
    },
    bordered: {
      title: 'Avec anneau',
      text: "<code>bordered</code> dessine un anneau de 2px dans la couleur de la surface derrière le badge, ce qui le détache d'une cible chargée. CSS ne peut pas lire ce que peint un parent : cette couleur est donc le fond de page par défaut, et <code>ringColor</code> est la façon de nommer toute autre. Les deux tuiles ci-dessous passent la couleur de la carte et l'accent sur lesquels elles posent.",
    },
  },

  api: {
    VBadge: {
      props: {
        tone: "Ce que le badge signifie, exprimé en couleur. La pastille en est remplie et le texte s'adapte pour rester lisible : il n'y a donc qu'un seul rendu et aucune variante à choisir à côté.",
        color:
          'Une couleur à vous, en hexadécimal, en nom CSS ou en <code>oklch()</code>, qui remplace le ton. Là où <code>contrast-color()</code> est pris en charge, le texte passe au noir ou au blanc de lui-même ; ailleurs il retombe sur le blanc, donc avec une couleur claire le contraste reste à votre charge.',
        count:
          "Le nombre à afficher. Au-delà de 99, il devient 99+, pour qu'un compteur chargé ne puisse pas étirer la pastille indéfiniment.",
        icon: "Une icône unique affichée à la place d'un nombre. Elle l'emporte sur <code>count</code>, et elle est ignorée quand le badge est un point.",
        dot: "Réduit le badge à un point de 10px sans contenu, la façon discrète de signaler qu'il y a du nouveau sans dire combien.",
        overlay:
          "Épingle le badge à un coin de l'élément cible au lieu de le placer à côté. Sans cible, cette prop ne fait rien.",
        overlayPosition:
          "À quel coin un badge épinglé se fixe : celui du haut par défaut, celui du bas pour un marqueur qui appartient au pied de sa cible, comme un point de présence sous un avatar. Le côté horizontal suit le sens de lecture et n'est pas configurable.",
        bordered:
          "Dessine un anneau de 2px dans la couleur de la surface derrière le badge, ce qui le détache d'une cible chargée comme une photo. Cette couleur vaut par défaut le fond de la page, et <code>ringColor</code> est ce qui permet d'en changer.",
        ringColor:
          "La couleur de l'anneau dessiné par <code>bordered</code>. Elle vaut par défaut le fond de la page : un badge posé sur une carte ou un bandeau coloré doit donc recevoir la couleur de cette surface. Sans <code>bordered</code>, elle ne fait rien.",
      },
      slots: {
        default:
          "L'élément auquel le badge appartient. Sans lui, le badge existe seul ; avec lui, le badge est placé à côté de l'élément, ou dans son coin avec <code>overlay</code>.",
      },
    },
  },
}
