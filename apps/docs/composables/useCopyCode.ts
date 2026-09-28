import { snackbar } from 'vectis-ui'

export function useCopyCode() {
  const { t } = useI18n()

  function trim(code: string): string {
    return code.replace(/\r\n/g, '\n').replace(/^\n/, '').replace(/\s+$/, '')
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(trim(code))
    } catch {
      // Report clipboard success only after the write resolves.
      return
    }
    snackbar({
      message: t('common.code.copied'),
      placement: 'bottom-center',
      duration: 1600,
    })
  }

  return { copy, trim }
}
