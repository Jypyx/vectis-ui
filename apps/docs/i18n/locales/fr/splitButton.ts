export default {
  title: 'Bouton divisé',
  lead: '<code>VSplitButton</code> associe une action principale à un menu d’actions voisines. L’action principale est un <code>VButton</code> ; le bouton accolé ouvre un <code>VMenu</code>.',
  examples: {
    variants: {
      title: 'Variantes et tons',
      text: '<code>variant</code>, <code>tone</code>, <code>size</code>, <code>compact</code> et <code>elevated</code> reprennent les valeurs de <code>VButton</code> et s’appliquent aux deux moitiés. Un trait les sépare toujours.',
    },
    sizes: {
      title: 'Tailles',
      text: 'Le bouton de menu reste carré à toutes les tailles.',
    },
    states: {
      title: 'Chargement et désactivation',
      text: '<code>loading</code> place l’indicateur dans l’action principale et désactive aussi le bouton de menu, puisqu’une action est déjà en cours. <code>disabled</code> désactive les deux moitiés.',
    },
    linkAndIcons: {
      title: 'Lien et icônes',
      text: '<code>href</code> fait de l’action principale un lien. <code>iconStart</code> et <code>iconEnd</code> appartiennent à l’action principale, et <code>menuIcon</code> remplace le chevron. <code>menuLabel</code> remplace le nom que les lecteurs d’écran donnent au bouton de menu, « Plus d’options » par défaut.',
    },
    fullWidth: {
      title: 'Pleine largeur et position du menu',
      text: 'Le menu est ancré à l’ensemble du contrôle et s’aligne par défaut sur sa fin. Avec <code>fullWidth</code>, l’action principale prend la place et le bouton de menu reste carré ; <code>matchWidth</code> garde le menu au moins aussi large que le contrôle.',
    },
  },
  api: {
    VSplitButton: {
      props: {
        label: 'Texte de l’action principale.',
        variant: 'Poids visuel des deux moitiés.',
        tone: 'Couleur des deux moitiés.',
        size: 'Hauteur des deux moitiés, sur l’échelle commune des contrôles.',
        compact: 'Retire 4px à la hauteur.',
        elevated: 'Surélève le contrôle avec une ombre.',
        fullWidth:
          'Remplit le parent. L’action principale prend la place ; le bouton de menu reste carré.',
        href: 'Fait de l’action principale un lien, inerte s’il est désactivé ou en chargement.',
        type: 'Type natif du bouton principal.',
        disabled: 'Désactive les deux moitiés.',
        loading: 'Affiche un indicateur dans l’action principale et désactive le bouton de menu.',
        iconStart: 'Icône avant le libellé de l’action principale.',
        iconEnd: 'Icône après le libellé de l’action principale.',
        iconFilled: 'Affiche les icônes de l’action principale en version pleine.',
        menuLabel: 'Nom accessible du bouton de menu. « Plus d’options » par défaut.',
        menuIcon: 'Icône du bouton de menu.',
        placement:
          'Position du menu par rapport à l’ensemble du contrôle ; s’ajuste si la place manque.',
        menuSize: 'Hauteur des lignes du menu.',
        menuWidth:
          'Largeur du menu. Un nombre est lu en pixels ; une chaîne en longueur ou mot-clé CSS.',
        matchWidth: 'Garde le menu au moins aussi large que l’ensemble du contrôle.',
        vModelOpen: 'État d’ouverture du menu.',
      },
      events: {
        click: 'L’action principale a été activée.',
      },
      slots: {
        default:
          'Enfants <code>VMenuItem</code>, <code>VMenuGroup</code> et <code>VMenuSeparator</code>.',
      },
    },
  },
}
