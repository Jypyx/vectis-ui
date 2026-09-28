import { computed, useAttrs, type ComputedRef, type StyleValue } from 'vue'

/**
 * Redeclared locally: `@vue/runtime-dom` exports this as `ClassValue` and the `vue` package
 * does not re-export it. Typed `unknown` instead, a template refuses to bind it.
 */
type ClassBinding = false | null | undefined | string | Record<string, unknown> | ClassBinding[]

// @a11y
/**
 * The attribute split of the wrapper-root pattern, for components whose root is only a
 * container: VInput, VTextarea, VTabs, VCombobox, VDataTable, VDateInput, VTimeInput, VSlider,
 * and the three choice controls, whose root holds the <label> and its hint.
 */
export function useRootAttrs(): {
  attrs: Record<string, unknown>
  rootClass: ComputedRef<ClassBinding>
  rootStyle: ComputedRef<StyleValue>
  forwardedAttrs: ComputedRef<Record<string, unknown>>
} {
  const attrs = useAttrs()
  // Read the styling keys even when absent: enumerating an empty attrs object tracks no reads.
  const split = computed(() => {
    const { class: rootClass, style: rootStyle, ...forwardedAttrs } = attrs
    return { rootClass, rootStyle, forwardedAttrs }
  })

  return {
    attrs,
    rootClass: computed(() => split.value.rootClass as ClassBinding),
    rootStyle: computed(() => split.value.rootStyle as StyleValue),
    forwardedAttrs: computed(() => split.value.forwardedAttrs),
  }
}
