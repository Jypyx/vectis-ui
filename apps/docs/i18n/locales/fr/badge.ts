export default {
  title: 'Badge',
  lead: "Un petit compteur ou un marqueur, seul ou épinglé au coin d'autre chose. Il n'est jamais interactif : ce qu'il rapporte appartient à l'élément sur lequel il se pose.",

  examples: {
    tones: {
      title: 'Tons',
      text: '<code>tone</code> définit la couleur : <code>accent</code>, <code>neutral</code>, <code>success</code>, <code>warning</code> ou <code>danger</code>.',
    },
    colors: {
      title: 'Couleurs personnalisées',
      text: '<code>color</code> remplace le ton, donnée en hexadécimal, en nom de couleur CSS ou en <code>oklch()</code>.',
    },
    counters: {
      title: 'Compteurs',
      text: '<code>count</code> affiche un nombre. Au-delà de 99, il devient <code>99+</code>.',
    },
    icon: {
      title: 'Avec une icône',
      text: "<code>icon</code> prend la place du nombre, et l'emporte sur <code>count</code> quand les deux sont donnés.",
    },
    dot: {
      title: 'Point',
      text: '<code>dot</code> dessine 10px de couleur sans rien dedans, en ignorant <code>count</code> et <code>icon</code>.',
    },
    inline: {
      title: 'En ligne',
      text: 'Le slot par défaut fournit un élément cible, à côté duquel le badge est posé.',
    },
    overlay: {
      title: 'En incrustation',
      text: '<code>overlay</code> épingle le badge dans un coin de la cible au lieu de le poser à côté.',
    },
    overlayPosition: {
      title: "Position de l'incrustation",
      text: "<code>overlayPosition</code> fait passer le coin de l'incrustation du haut vers le bas. Le côté horizontal suit le sens de lecture.",
    },
    bordered: {
      title: 'Avec anneau',
      text: "<code>bordered</code> dessine un anneau de 2px autour du badge, et <code>ringColor</code> définit sa couleur pour l'accorder à la surface derrière.",
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
