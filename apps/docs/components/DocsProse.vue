<script lang="ts">
import type { TypographyTone, TypographyVariant } from 'vectis-ui'
import type { PropType } from 'vue'

import { VTypography } from 'vectis-ui'

/**
 * A paragraph of documentation, taken from the message catalogue.
 *
 * The documentation's prose is dense with inline markup — a sentence names four
 * <code>props</code> and a <code>&lt;tag&gt;</code> before its verb. Splitting each of those into
 * a translatable fragment and a slot would leave neither half a sentence anyone could
 * translate, so a message carries its own markup and this component renders it.
 *
 * Rendering raw HTML is safe HERE and would not be elsewhere: every string this touches is an
 * authored constant in `i18n/locales/`, compiled into the bundle. No value a reader can
 * influence ever reaches it. Route new prose through this component rather than reproducing
 * the mechanism somewhere the argument no longer holds.
 *
 * `innerHTML` is a PROP the server renderer honours, which is what lets the design system's own
 * VTypography carry the paragraph when `variant` is given: its root is a single element with an
 * empty slot, so the HTML lands there with nothing to compete against. That is the whole of how
 * a message with markup in it still gets the token recipe rather than a hand-written one.
 *
 * TRAP — this is a RENDER FUNCTION, and `<script setup>` with `<component :is v-html>` is what
 * it replaces. The SSR compiler has no directive transform for `v-html` at all: it special-
 * cases the directive when it meets a plain ELEMENT, and a `<component :is>` is a component
 * node, where the unknown directive is dropped without a word. The result renders correctly in
 * the browser and prerenders as an EMPTY `<p></p>` — which on a statically generated site means
 * every paragraph is missing from the artefact and present in dev. Building the vnode by hand
 * skips the compiler entirely; `innerHTML` is a prop the server renderer does honour.
 */
export default defineComponent({
  name: 'DocsProse',
  props: {
    /** Dotted path into the catalogue, e.g. `switch.lead`. */
    keypath: { type: String, required: true },
    /** The element to render. Anything the prose needs: `p`, `td`, `h1`, `blockquote`. */
    tag: { type: String, default: 'p' },
    /**
     * A VTypography role. Given one, the paragraph is rendered BY the design system's text
     * component rather than as a bare element, so the recipe comes from the tokens instead of
     * being restated here. Left out, the element is bare and `.vd-prose > p` dresses it — which
     * is what the documentation pages want, their prose being styled as a block.
     */
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
