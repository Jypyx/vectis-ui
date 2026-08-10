import { computed, useAttrs, type ComputedRef, type StyleValue } from 'vue'

/**
 * Shape of a `:class` binding. Redeclared here: `@vue/runtime-dom` exports it as
 * `ClassValue`, but the `vue` package does not re-export it — and without it
 * `attrs.class` stays `unknown`, which the template rejects.
 */
type ClassBinding = false | null | undefined | string | Record<string, unknown> | ClassBinding[]

// @a11y
/**
 * Plumbing of the **wrapper-root pattern**: a component whose root is only a
 * container (VInput/VTextarea fields, VCombobox, VDataTable, VDatePicker,
 * VTimePicker, the VTabs bar) must split its inherited attributes in two —
 * `class`/`style` stay on the root (that is what the consumer styles), and
 * everything else goes down to the FUNCTIONAL element. Without that split,
 * `name`, `required` or the `aria-*` land on the wrapper and break forms and
 * accessibility.
 *
 * `defineOptions({ inheritAttrs: false })` stays the component's responsibility:
 * it is an SFC compilation option, not state.
 *
 * `attrs` is returned as-is for the rare targeted reads (`attrs.id`, which must
 * win over a `useId()`; `attrs['aria-describedby']`, to be aggregated).
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
