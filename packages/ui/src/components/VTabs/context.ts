import type { InjectionKey } from 'vue'

import type { TabsActivation, TabsSize, TabsTone, TabsVariant } from './Tabs.vue'

/**
 * Contrat Tabs → Tab / TabPanel. Les ids sont dérivés d'un `useId()` unique
 * posé par la racine : Tab et TabPanel calculent le même identifiant à partir
 * de leur `value`, sans registre ni échange d'état.
 *
 * `size`/`compact` transitent par l'injection (et non par héritage CSS comme
 * dans Accordion) : chaque Tab rend un Button, qui pose lui-même
 * `v-control[data-size]` sur son propre élément.
 */
export interface TabsContext {
  /** Valeur sélectionnée ; undefined si le v-model ne référence aucun onglet. */
  readonly value: string | number | undefined
  select: (value: string | number) => void
  tabId: (value: string | number) => string
  panelId: (value: string | number) => string
  /** Le slot #panels est fourni : les onglets peuvent poser aria-controls. */
  readonly hasPanels: boolean
  readonly variant: TabsVariant
  readonly tone: TabsTone
  readonly size: TabsSize
  readonly compact: boolean
  readonly activation: TabsActivation
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('v-tabs')

/**
 * `aria-controls` est une LISTE d'IDREF séparée par des espaces : une valeur
 * contenant un blanc y référencerait deux ids inexistants. Les caractères
 * hostiles aux sélecteurs sont écartés au passage.
 */
const slug = (value: string | number) => String(value).replace(/[^\w-]+/g, '_')

export const tabIdFor = (base: string, value: string | number) => `${base}-tab-${slug(value)}`
export const panelIdFor = (base: string, value: string | number) => `${base}-panel-${slug(value)}`
