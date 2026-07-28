import { computed, useAttrs, type ComputedRef } from 'vue'

/**
 * Nom accessible d'un conteneur nommé (tablist, group, nav…) selon la
 * précédence ARIA : `aria-labelledby` > `aria-label` > prop `label`.
 *
 * La prop `label` n'est qu'un DÉFAUT. Un `aria-label` du consommateur le
 * remplace ; un `aria-labelledby` le supprime, sinon les deux noms
 * cohabiteraient sur l'élément.
 *
 * Indispensable dès que le composant est en `inheritAttrs: false` et rend
 * lui-même `v-bind="forwardedAttrs"` **et** `:aria-label` : sans arbitrage, les
 * deux s'appliquent. En fallthrough naturel, Vue laisse déjà l'attribut du
 * consommateur gagner — le composable n'y sert alors qu'à retirer le défaut
 * devenu redondant.
 */
export function useAriaLabel(label: () => string | undefined): ComputedRef<string | undefined> {
  const attrs = useAttrs()
  return computed(() =>
    attrs['aria-labelledby'] !== undefined
      ? undefined
      : ((attrs['aria-label'] as string | undefined) ?? label()),
  )
}
