import { computed, useAttrs, type ComputedRef, type StyleValue } from 'vue'

/**
 * Redeclared locally: `@vue/runtime-dom` exports this as `ClassValue` and the `vue` package
 * does not re-export it. Typed `unknown` instead, a template refuses to bind it.
 */
type ClassBinding = false | null | undefined | string | Record<string, unknown> | ClassBinding[]

// @a11y
/**
 * The attribute split of the wrapper-root pattern, for components whose root is only a
 * container: VInput, VTextarea, VTabs, VCombobox, VDataTable, VDateInput, VTimeInput.
 *
 * `class`/`style` stay on the root, which is the box the consumer positions; everything
 * else is forwarded to the functional element. Unsplit, `name`, `required` and every
 * `aria-*` land on a decorative wrapper, where the form ignores them and assistive
 * technology never finds them.
 *
 * `defineOptions({ inheritAttrs: false })` stays in the SFC — it is a compilation option.
 * `attrs` is returned whole for the components that need to read one back: a consumer `id`
 * that must beat the generated one, a `describedby` to merge rather than replace.
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
