export default {
  title: 'Navigation latérale',
  lead: "La navigation d'une barre latérale : un arbre de liens, montré sur place plutôt que dans un panneau flottant, dont les branches s'ouvrent et se referment. Il s'écrit niveau par niveau avec ses propres sous-composants, jamais décrit comme une liste de données.",

  examples: {
    links: {
      title: 'Liens et actions',
      text: "Une ligne mène quelque part ou déclenche quelque chose, et c'est <code>href</code> qui tranche. Avec lui, la ligne est un vrai lien : clic du milieu, adresse copiable, et un robot d'indexation la suit. Sans lui, la ligne devient un bouton et signale son activation par <code>select</code>, ce qui est la forme juste pour ce qui change de vue plutôt que pour ce qui possède une adresse. <code>active</code> marque la seule ligne où se trouve le lecteur, et ce n'est pas de la décoration : la ligne est annoncée comme la page courante, donc un lecteur d'écran dit ce que la mise en évidence montre. Une ligne qui a des sous-items ignore <code>href</code>, une telle ligne s'ouvrant et se refermant au lieu de mener ailleurs.",
    },
    sublabels: {
      title: 'Sous-libellés',
      text: "Une seconde ligne sous le libellé, pour ce que la ligne ne dit pas déjà : un décompte, un état de synchronisation, une taille. La ligne grandit pour tenir les deux et l'icône reste centrée sur la paire plutôt que sur la première. Le slot <code>#sublabel</code> prend la même place quand cette seconde ligne demande du balisage.",
    },
    endContent: {
      title: 'Du contenu en fin de ligne',
      text: "Un compteur, un badge, un petit contrôle, placés après le libellé et avant le chevron. Ce qui peut y aller dépend de la forme de la ligne, et la différence mérite d'être connue. Sur une feuille, le lien couvre toute la ligne par un calque et le slot de fin reste son frère : un vrai contrôle y a sa place, et le cliquer ne suit pas le lien. Sur une branche, la ligne est un résumé de <code>&lt;details&gt;</code> natif, qui doit contenir la ligne entière : ce qu'on y met est à l'intérieur du contrôle que la ligne est déjà. Un compteur ou un badge, donc, jamais un bouton. Un contrôle imbriqué dans un contrôle échoue au WCAG 4.1.2, et un résumé sert aussi de nom accessible, que certains lecteurs d'écran aplatissent en une seule chaîne.",
    },
    groups: {
      title: 'Groupes et séparateurs',
      text: "VSideNavigationGroup nomme un bloc de lignes, VSideNavigationSeparator trace une règle entre deux d'entre eux, et les deux ne disent pas la même chose. Le groupe nomme la sous-liste qu'il coiffe, si bien qu'un lecteur d'écran lit la section et ses items comme un tout ; le séparateur est purement visuel et n'est annoncé comme rien. Un titre de section n'est pas une ligne : rien ne se passe au clic et les flèches ne s'y arrêtent jamais. Il prend malgré tout la hauteur d'une ligne, ce qui préserve le rythme de la liste là où il l'interrompt. Un groupe n'est pas non plus un niveau de la hiérarchie : les items qu'il contient sont indentés comme s'il n'était pas là.",
    },
    depth: {
      title: 'Imbrication',
      text: "Une ligne à qui l'on donne un slot <code>#items</code> devient une branche, et une branche peut en contenir d'autres aussi loin que va l'arbre. Chaque niveau est indenté exactement de la place que prend une icône de début, si bien que le libellé d'un sous-item tombe sur la même verticale que celui de la branche qui le contient, dans les deux tailles. L'indentation se calcule en CSS depuis l'imbrication elle-même, et c'est pourquoi rien n'est à déclarer niveau par niveau.",
    },
    chevrons: {
      title: 'Le chevron des sections',
      text: "Le glyphe en fin de ligne de branche, qui dit si la section est ouverte. <code>expandIcon</code> donne celui de la section fermée, et seul, il pivote de 180° à l'ouverture : la bonne forme pour un glyphe qui se lit dans les deux sens, un triangle ou un chevron vers le bas. Nommer aussi <code>collapseIcon</code> échange un dessin contre l'autre, ce que veut un arbre de fichiers, un chevron pointant dans le sens de lecture quand la branche est fermée et vers le bas quand elle est ouverte. Les deux se posent sur la navigation entière, et tous les niveaux suivent.",
    },
    exclusive: {
      title: 'Une section à la fois',
      text: "Ouvrir une section referme celle d'à côté. Le navigateur le fait seul, par un nom que partagent les sections d'un même niveau, si bien qu'il n'y a aucun état à tenir ni rien à réinitialiser. L'exclusivité est locale à chaque niveau : deux sections rattachées à des parents différents s'ignorent, et ouvrir une sous-section laisse intactes les sections voisines de son parent. C'est désactivé par défaut, une barre latérale laissant normalement plusieurs sections ouvertes à la fois.",
    },
    openState: {
      title: 'Savoir si une section est ouverte',
      text: "<code>defaultOpen</code> décide de l'état dans lequel une branche démarre, puis passe la main : le navigateur en est propriétaire à partir de là et personne ne l'observe. <code>v-model:open</code> est l'autre arrangement, où chaque pliage remonte au modèle et où écrire dans le modèle ouvre ou referme la branche. Liez-le quand cet état vous regarde : ouvrir la section qui contient la page courante après un changement de route, ou retenir ce qui était ouvert d'une visite à l'autre. Ne rien lier reste le plus léger des deux, et le bon défaut.",
    },
    disabled: {
      title: 'Lignes désactivées',
      text: "Une ligne dont on ne peut rien faire. Elle se grise par les tokens de couleur plutôt que par une opacité, donc elle garde son contraste sur la barre latérale, et elle quitte le chemin du clavier : les flèches l'enjambent comme si elle n'existait pas. Sur une feuille, le lien cesse de mener où que ce soit. Sur une branche, cela va plus loin : la section ne se déplie plus du tout, et ce qu'elle contient reste hors d'atteinte tant que la ligne est désactivée.",
    },
    sizes: {
      title: 'Tailles',
      text: "Deux hauteurs de ligne, 32 et 40 pixels, chacune avec sa variante <code>compact</code> plus courte de 4px. La taille se pose une fois sur la navigation entière et tous les niveaux la lisent de là, aussi profonds soient-ils : une sous-liste ne la redit jamais, donc une branche imbriquée ne peut pas se désaccorder de son parent. Les titres de section prennent la hauteur d'une ligne à chaque densité, ce qui préserve le rythme vertical. <code>compact</code> est un réglage de densité et non un rail replié sur ses icônes, que ce composant ne propose pas.",
    },
  },

  api: {
    VSideNavigation: {
      props: {
        label:
          "Ce que les lecteurs d'écran annoncent pour cette navigation. Une page en compte souvent plusieurs, une principale, une latérale, une de pied de page, et c'est ce qui les distingue. Il retombe sur le dictionnaire du design system.",
        size: 'La hauteur des lignes, 32 ou 40 pixels, héritée par tous les niveaux.',
        compact:
          "Retire 4px à la hauteur de chaque ligne. C'est un réglage de densité et non un rail replié en icônes seules, que ce composant ne propose pas.",
        exclusive:
          "Ne garde qu'une section ouverte à la fois au sein de chaque niveau, ce que le navigateur fait seul. Désactivé par défaut : une barre latérale laisse normalement plusieurs sections ouvertes.",
        expandIcon: "Le chevron d'une section fermée.",
        collapseIcon:
          "Le chevron d'une section ouverte. Sans lui, celui de la section fermée est simplement pivoté de 180°.",
      },
      slots: {
        default: "Le premier niveau de l'arbre : items, groupes et séparateurs.",
      },
    },
    VSideNavigationItem: {
      props: {
        label: 'Ce que dit la ligne, et où elle mène. Le slot par défaut la remplace.',
        sublabel: 'Une seconde ligne sous le libellé, pour un statut ou une courte explication.',
        icon: 'Une icône avant le libellé. Le slot <code>#start</code> la remplace.',
        href: "Où mène cette ligne, ce qui en fait un lien. Elle est ignorée sur une ligne qui a des sous-items : une telle ligne s'ouvre et se referme plutôt que de naviguer.",
        active:
          'Marque cette ligne comme la page actuellement consultée. Elle est mise en évidence et annoncée comme la page courante.',
        disabled:
          'Rend la ligne inutilisable : elle se grise par les tokens de couleur et quitte le chemin du clavier.',
        defaultOpen:
          "Rend une branche déjà ouverte. Cela ne fixe que l'état initial ; le navigateur le possède ensuite.",
        vModelOpen:
          "Si la branche est ouverte, quand vous voulez la piloter ou l'observer. Non liée, le navigateur garde cet état pour lui et <code>defaultOpen</code> n'en donne que la valeur initiale.",
      },
      events: {
        select: 'La ligne a été activée. Une branche le rapporte comme un lien.',
      },
      slots: {
        default:
          'Le libellé de la ligne. Il est obligatoire : une ligne de navigation doit dire où elle mène.',
        sublabel:
          'Une seconde ligne faite de balisage, qui remplace la prop <code>sublabel</code>.',
        start: 'Du contenu libre avant le libellé, qui prend la place de <code>icon</code>.',
        end: 'Du contenu libre à la fin de la ligne, avant le chevron : un compteur, un badge. Sur une branche il ne doit pas être focalisable, la ligne étant déjà un contrôle.',
        items:
          "Les sous-items, qui font de cette ligne une branche. La profondeur n'est pas limitée.",
      },
    },
    VSideNavigationGroup: {
      props: {
        label:
          "Le nom de la section, que le slot <code>#label</code> remplace. L'un des deux est nécessaire : c'est lui qui nomme la sous-liste qu'il coiffe.",
      },
      slots: {
        default: 'Les items appartenant à cette section.',
        label: 'Un nom fait de balisage, qui remplace la prop <code>label</code>.',
      },
    },
  },
}
