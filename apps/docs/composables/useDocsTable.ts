/**
 * The column headings every component page's API table uses.
 *
 * Eight pages write the same three words, so they live here rather than being spelled out at
 * each call site — the admission rule the library applies to its own shared code: two or more
 * consumers and a genuinely common body.
 *
 * It is a `computed`, not a plain array, because the words come from the catalogue and the
 * reader can change language without the page remounting.
 */
export function useDocsTable() {
  const { t } = useI18n()

  /** Prop · Type · Default — the API table of a component page. */
  const apiColumns = computed(() => [
    t('common.table.prop'),
    t('common.table.type'),
    t('common.table.default'),
  ])

  return { apiColumns }
}
