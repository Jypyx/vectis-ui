import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export type Appearance = 'system' | 'light' | 'dark'

/** Shared with the pre-paint script in `config.ts`; the two must resolve identically. */
const STORAGE_KEY = 'vectis-theme-appearance'

const APPEARANCES: readonly Appearance[] = ['system', 'light', 'dark']

const isAppearance = (value: string | null): value is Appearance =>
  value !== null && (APPEARANCES as readonly string[]).includes(value)

/**
 * The docs' theme store, mirroring `packages/ui/.storybook/preview.ts` — the design
 * system's canonical host implementation.
 *
 * Dark is 100% attribute-driven in the DS (`tokens.css` declares exactly `:root`,
 * `[data-theme='light']` and `[data-theme='dark']`, and no `prefers-color-scheme` query
 * anywhere), so resolving "system" is the host's job. Three states, not two: a two-state
 * switch would silently forget the OS preference, i.e. document a contract the DS does
 * not have.
 *
 * The media listener is ALWAYS detached before a re-apply — that is the `preview.ts`
 * invariant, and the bug it prevents is subtle: without it, going system → dark → system
 * leaves a stale listener that keeps overwriting the explicit choice.
 *
 * SSR: `appearance` is `'system'` on the server and on the first client render, then
 * corrected from `localStorage` in `onMounted`. The COLOURS are already right at that
 * point — the pre-paint script in `config.ts` wrote `data-theme` before the first paint —
 * so only the toggle's highlighted segment settles one frame later.
 */
export function useDocsTheme(): { appearance: Ref<Appearance> } {
  const appearance = ref<Appearance>('system')
  let media: MediaQueryList | null = null

  const applySystem = () => {
    document.documentElement.dataset.theme = media?.matches ? 'dark' : 'light'
  }

  const apply = (value: Appearance) => {
    media?.removeEventListener('change', applySystem)
    if (value === 'system') {
      applySystem()
      media?.addEventListener('change', applySystem)
    } else {
      document.documentElement.dataset.theme = value
    }
  }

  onMounted(() => {
    media = window.matchMedia('(prefers-color-scheme: dark)')

    const stored = localStorage.getItem(STORAGE_KEY)
    if (isAppearance(stored)) appearance.value = stored

    // Armed only once mounted, so nothing here ever runs on the server. `immediate`
    // re-applies the stored value, which the pre-paint script has already painted —
    // idempotent, and it is what installs the media listener in the `system` case.
    watch(
      appearance,
      (value) => {
        localStorage.setItem(STORAGE_KEY, value)
        apply(value)
      },
      { immediate: true },
    )
  })

  onBeforeUnmount(() => media?.removeEventListener('change', applySystem))

  return { appearance }
}
