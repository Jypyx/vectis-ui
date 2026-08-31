<script lang="ts">
import type { TypographyTone, TypographyVariant } from 'vectis-ui'
import type { PropType } from 'vue'

import { VTypography } from 'vectis-ui'

/**
 * A bulleted list of documentation, taken from an ARRAY message.
 *
 * `tm` rather than `t` is what returns the array itself, and `rt` is what resolves each entry:
 * vue-i18n hands back compiled message functions rather than plain strings once its build-time
 * compiler has run. Mapping with `String()` instead works perfectly in dev and prints
 * `[object Object]` in the built site, since the compiler only runs on the production build.
 *
 * The raw-HTML argument and the render-function trap are `DocsProse`'s — read them there.
 */
export default defineComponent({
  name: 'DocsProseList',
  props: {
    /** Dotted path to an ARRAY of strings in the catalogue. */
    keypath: { type: String, required: true },
    /** `ul` unless the order carries meaning. */
    tag: { type: String, default: 'ul' },
    /**
     * A VTypography role, as on DocsProse. Given one, the list is rendered by the design
     * system's text component, so the recipe comes from the tokens. Unlike DocsProse, the
     * content reaches it through the SLOT rather than `innerHTML`: the `<li>` are real vnodes
     * here, and only their own text is raw markup.
     */
    variant: { type: String as PropType<TypographyVariant>, default: undefined },
    /** A VTypography tone. Only read when `variant` is given. */
    tone: { type: String as PropType<TypographyTone>, default: undefined },
  },
  setup(props) {
    const { tm, rt } = useI18n()

    const items = computed(() =>
      (tm(props.keypath) as unknown[]).map((entry) => rt(entry as never)),
    )

    const children = () =>
      items.value.map((item, index) => h('li', { key: index, innerHTML: item }))

    return () =>
      props.variant
        ? h(VTypography, { as: props.tag, variant: props.variant, tone: props.tone }, children)
        : h(props.tag, children())
  },
})
</script>
