<script lang="ts">
import type { TypographyTone, TypographyVariant } from 'vectis-ui'
import type { PropType } from 'vue'

import { VTypography } from 'vectis-ui'

/**
 * Resolve array messages through the i18n resolver; String() can print compiled message objects
 * in production.
 */
export default defineComponent({
  name: 'DocsProseList',
  props: {
    /** Dotted path to an ARRAY of strings in the catalogue. */
    keypath: { type: String, required: true },
    /** `ul` unless the order carries meaning. */
    tag: { type: String, default: 'ul' },
    /** A VTypography role, as on DocsProse. */
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
