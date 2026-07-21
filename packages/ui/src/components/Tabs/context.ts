import type { InjectionKey, Ref } from 'vue'

/** Contrat Tabs → Tab/TabPanel : état actif partagé + liaison des IDs ARIA. */
export interface TabsContext {
  active: Ref<string>
  select: (value: string) => void
  tabId: (value: string) => string
  panelId: (value: string) => string
}

export const tabsKey: InjectionKey<TabsContext> = Symbol('ds-tabs')
