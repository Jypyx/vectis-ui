import { computed, useAttrs, type ComputedRef, type StyleValue } from 'vue'

/**
 * The shape of a class binding. It is written out here rather than imported because the
 * type exists in Vue's DOM runtime under another name and the `vue` package does not
 * pass it on. Without it the class stays untyped, and a template refuses to bind it.
 */
type ClassBinding = false | null | undefined | string | Record<string, unknown> | ClassBinding[]

// @a11y
/**
 * Splits the attributes a consumer wrote on a component in two, for the components whose
 * outermost element is only a container: the two text fields, the search field, the
 * table, the two pickers, the row of tabs.
 *
 * Everything a consumer writes on a component lands, by default, on that outermost
 * element. Here that is the wrong place for most of it. Styling belongs on the container,
 * since that is the box the consumer sees and positions; everything else belongs on the
 * element that actually DOES something — the real input, the real control. Left
 * unsplit, the field's name, the fact that it is required and everything describing it
 * for a screen reader all end up on a decorative box, where a form ignores them and a
 * screen reader never finds them.
 *
 * Turning the default placement off stays the component's own business: that is a
 * compilation option of the file, not something that can be arranged from here.
 *
 * The whole set is handed back as well, for the few components that need to look
 * something up in it — an identifier the consumer supplied, which must win over the
 * generated one, or a description that has to be merged rather than replaced.
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
