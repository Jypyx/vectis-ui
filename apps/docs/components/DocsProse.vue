<script lang="ts">
import type { TypographyTone, TypographyVariant } from 'vectis-ui'
import type { PropType } from 'vue'

import { VTypography } from 'vectis-ui'

/** Use a render function for authored inline HTML: SSR drops v-html on dynamic component nodes. */
export default defineComponent({
  name: 'DocsProse',
  props: {
    /** Dotted path into the catalogue, e.g. `switch.lead`. */
    keypath: { type: String, required: true },
    /** The element to render. Anything the prose needs: `p`, `td`, `h1`, `blockquote`. */
    tag: { type: String, default: 'p' },
    /** Optional VTypography role for the paragraph. */
    variant: { type: String as PropType<TypographyVariant>, default: undefined },
    /** A VTypography tone. Only read when `variant` is given. */
    tone: { type: String as PropType<TypographyTone>, default: undefined },
  },
  setup(props) {
    const { t } = useI18n()
    return () =>
      props.variant
        ? h(VTypography, {
            as: props.tag,
            variant: props.variant,
            tone: props.tone,
            innerHTML: t(props.keypath),
          })
        : h(props.tag, { innerHTML: t(props.keypath) })
  },
})
</script>
