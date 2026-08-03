import { computed, useId, type ComputedRef } from 'vue'

/**
 * Identifiants d'un champ à wrapper (VInput, VTextarea) : association
 * label/`for`, id du hint, et agrégation d'`aria-describedby`.
 *
 * Deux subtilités :
 * - un `id` fourni par le consommateur PRIME sur le `useId()` interne, sinon
 *   son `<label for>` externe ne pointerait sur rien ;
 * - `aria-describedby` est une LISTE d'IDREF : le hint interne s'ajoute à celui
 *   du consommateur au lieu de l'écraser.
 *
 * `useId()` (et non un compteur) : SSR-safe, identique serveur et client.
 */
export function useFieldIds(
  attrs: Record<string, unknown>,
  hasHint: () => boolean,
): { fieldId: ComputedRef<string>; hintId: string; describedBy: ComputedRef<string | undefined> } {
  const uid = useId()
  const hintId = useId()

  return {
    fieldId: computed(() => (attrs.id as string | undefined) ?? uid),
    hintId,
    describedBy: computed(() => {
      const ids = [attrs['aria-describedby'] as string | undefined, hasHint() ? hintId : undefined]
      return ids.filter(Boolean).join(' ') || undefined
    }),
  }
}
