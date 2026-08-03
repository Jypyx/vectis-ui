import { computed, useAttrs, type ComputedRef, type StyleValue } from 'vue'

/**
 * Forme d'un binding `:class`. Redéclarée ici : `@vue/runtime-dom` l'exporte
 * sous le nom `ClassValue`, mais le paquet `vue` ne la réexporte pas — et sans
 * elle, `attrs.class` reste `unknown`, que le template refuse.
 */
type ClassBinding = false | null | undefined | string | Record<string, unknown> | ClassBinding[]

/**
 * Plomberie du **pattern wrapper-root** : un composant dont la racine n'est
 * qu'un conteneur (champs VInput/VTextarea, VCombobox, VDataTable, VDatePicker,
 * VTimePicker, barre de VTabs) doit répartir ses attributs hérités en deux —
 * `class`/`style` restent sur la racine (c'est elle que le consommateur
 * stylise), tout le reste descend sur l'élément FONCTIONNEL. Sans cette
 * répartition, `name`, `required` ou les `aria-*` atterrissent sur le wrapper
 * et cassent formulaires et accessibilité.
 *
 * `defineOptions({ inheritAttrs: false })` reste à la charge du composant :
 * c'est une option de compilation du SFC, pas un état.
 *
 * `attrs` est renvoyé tel quel pour les rares lectures ciblées (`attrs.id` qui
 * doit primer sur un `useId()`, `attrs['aria-describedby']` à agréger).
 */
export function useRootAttrs(): {
  attrs: Record<string, unknown>
  rootClass: ComputedRef<ClassBinding>
  rootStyle: ComputedRef<StyleValue>
  forwardedAttrs: ComputedRef<Record<string, unknown>>
} {
  const attrs = useAttrs()

  return {
    attrs,
    rootClass: computed(() => attrs.class as ClassBinding),
    rootStyle: computed(() => attrs.style as StyleValue),
    forwardedAttrs: computed(() =>
      Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
      ),
    ),
  }
}
