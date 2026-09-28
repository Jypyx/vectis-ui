/** Keep column labels computed so changing locale updates mounted tables. */
export function useDocsTable() {
  const { t } = useI18n()

  const apiColumns = computed(() => [
    t('common.table.prop'),
    t('common.table.type'),
    t('common.table.default'),
  ])

  return { apiColumns }
}
