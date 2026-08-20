<script lang="ts">
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
  },
  setup(props) {
    const { tm, rt } = useI18n()

    const items = computed(() =>
      (tm(props.keypath) as unknown[]).map((entry) => rt(entry as never)),
    )

    return () =>
      h(
        props.tag,
        items.value.map((item, index) => h('li', { key: index, innerHTML: item })),
      )
  },
})
</script>
