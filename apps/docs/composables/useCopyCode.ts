import { snackbar } from 'vectis-ui'

/**
 * Puts a code sample on the clipboard, and says so.
 *
 * Two consumers, `DocsCode` and `DocsExample`, and a genuinely common body: the admission rule
 * the library applies to its own shared code. What is shared is not the one clipboard call but
 * the two decisions around it, which are easy to get wrong differently in two places.
 */
export function useCopyCode() {
  const { t } = useI18n()

  /**
   * Trims the leading newline and the trailing blanks a template literal or a file leaves
   * behind, so a sample can be written on its own lines and still print flush.
   *
   * The carriage returns go too. A sample read off disk with `?raw` arrives exactly as the file
   * was checked out, so a contributor working with `autocrlf` would otherwise put a `\r` into
   * every code block of the prerendered site, and into everything anyone copied out of one.
   */
  function trim(code: string): string {
    return code.replace(/\r\n/g, '\n').replace(/^\n/, '').replace(/\s+$/, '')
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(trim(code))
    } catch {
      // A refused clipboard (an insecure origin, a permission policy) must not be reported as
      // a success — saying nothing is the honest outcome, and the sample is still selectable.
      return
    }
    // No icon, and none is deduced from the tone: a confirmation of six words is read, not
    // scanned. No close cross either — a bar that tidies itself must not ask to be tidied, which
    // is why VSnackbar has none to turn off.
    snackbar({
      message: t('common.code.copied'),
      placement: 'bottom-center',
      duration: 1600,
    })
  }

  return { copy, trim }
}
