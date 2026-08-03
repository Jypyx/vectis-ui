/**
 * Locale et dictionnaire du DS. Aucun texte utilisateur n'est en dur dans un
 * SFC : tout passe par ce module.
 *
 * État module-level (précédents : `VIcon/resolver.ts`, `VToast/state.ts` — c'est
 * le 3e état global du repo) plutôt que plugin Vue ou provide/inject : c'est de
 * la configuration, identique pour toutes les requêtes d'un processus, et elle
 * doit rester posable depuis un `.ts` quelconque (plugin Nuxt, `main.ts`).
 *
 * CONSÉQUENCE ASSUMÉE : une seule locale par processus. Le SSR multi-locale PAR
 * REQUÊTE n'est pas couvert — un site qui sert /fr et /en depuis le même
 * processus Node doit passer les props texte (et `locale` sur VCalendar /
 * VDatePicker / VTimePicker) explicitement. Cette limite est levable sans toucher
 * aux composants : cf. `useMessages` en fin de fichier.
 */
import { shallowRef, type ShallowRef } from 'vue'

import { isDev } from '../utils/env'

import { fr } from './fr'
import type { VectisMessages, VectisMessagesInput } from './types'

/** Balise BCP 47 par défaut — celle qu'avaient en dur VCalendar/VDatePicker/VTimePicker. */
export const DEFAULT_LOCALE = 'fr-FR'
const DEFAULT_LANG = 'fr'

/**
 * Dictionnaires indexés par SOUS-BALISE DE LANGUE (`'fr'`, `'en'`, `'de'`), et
 * non par balise complète : `'fr-FR'`, `'fr-CA'` et `'fr-BE'` partagent leurs
 * mots. Ce qui varie entre eux — ordre des champs de date, 1er jour de semaine,
 * cycle horaire — est dérivé d'`Intl` à partir de la balise COMPLÈTE, pas
 * traduit ici.
 *
 * Map non réactive : la réactivité est portée par `currentMessages`, que toute
 * mutation du registre recalcule.
 */
const registry = new Map<string, VectisMessages>([[DEFAULT_LANG, fr]])

const currentLocale = shallowRef<string>(DEFAULT_LOCALE)
const currentMessages = shallowRef<VectisMessages>(fr)

/** `'fr-CA'` → `'fr'`. Une balise invalide ressort telle quelle : elle ne matchera rien. */
function langOf(locale: string): string {
  return locale.toLowerCase().split('-')[0] ?? locale
}

function resolve(locale: string): VectisMessages {
  return registry.get(langOf(locale)) ?? registry.get(DEFAULT_LANG) ?? fr
}

/**
 * Fusion d'une surcharge partielle sur un dictionnaire complet.
 *
 * DEUX niveaux, et deux seulement — le type `VectisMessages` garantit que le niveau
 * 2 ne contient que des feuilles (chaîne ou fonction). Aucune récursion, donc
 * aucun risque qu'une valeur FONCTION soit traversée comme un objet et revienne
 * en `{}` : elle est copiée par référence, exactement comme une chaîne.
 */
function mergeMessages(base: VectisMessages, patch: VectisMessagesInput): VectisMessages {
  const out: Record<string, object> = { ...base }
  for (const [namespace, section] of Object.entries(patch)) {
    if (section) out[namespace] = { ...out[namespace], ...section }
  }
  return out as unknown as VectisMessages
}

/**
 * Pose la locale du DS.
 *
 * Attendu : une balise BCP 47 **complète** (`'en-GB'`, `'fr-CA'`, `'de-DE'`) et
 * non un code langue nu — elle sert à deux choses :
 *
 * 1. choisir le dictionnaire, par sa sous-balise de langue (`'en-GB'` → `'en'`) ;
 * 2. alimenter `Intl` chez VCalendar / VDatePicker / VTimePicker, dont la prop
 *    `locale` reste PRIORITAIRE. `Intl` accepte une balise nue (`'en'`) mais lui
 *    applique les conventions par défaut de la langue — `'en'` vaut 12 h et
 *    semaine au dimanche, ce qui n'est pas `'en-GB'`.
 *
 * À appeler au niveau MODULE — plugin Nuxt, `main.ts` — jamais dans un
 * `setup()`. En SSR l'état vit dans le processus : c'est correct pour de la
 * configuration, faux pour de l'état par requête. Attention aussi au
 * client-only : une locale posée dans un `plugins/*.client.ts` fait diverger
 * serveur et client, donc mismatch d'hydratation.
 */
export function setLocale(locale: string): void {
  const lang = langOf(locale)
  if (isDev && !registry.has(lang)) {
    console.warn(
      `[vectis] Aucun dictionnaire enregistré pour « ${lang} » : les textes restent en ` +
        `« ${DEFAULT_LANG} ». L'anglais est fourni — import { en } from '@vectis/ui' puis ` +
        `registerMessages('en', en). Pour une autre langue : registerMessages('${lang}', { … }).`,
    )
  }
  currentLocale.value = locale
  currentMessages.value = resolve(locale)
}

/**
 * Enregistre — ou complète — le dictionnaire d'une LANGUE. La clé est la
 * sous-balise de langue seule (`'en'`, pas `'en-GB'`).
 *
 * C'est le point d'extension unique : activer l'anglais fourni
 * (`registerMessages('en', en)`) et ajouter une langue que le DS ne livre pas
 * (`registerMessages('de', { … })`) sont le MÊME geste.
 *
 * La surcharge est PARTIELLE : ce que vous n'écrivez pas retombe sur le
 * dictionnaire déjà enregistré pour cette langue, sinon sur le socle `fr` —
 * jamais sur une chaîne vide (même contrat que les mappings partiels de
 * `setIconResolver`). Les appels successifs sur une même langue se CUMULENT :
 * `registerMessages('en', en)` puis `registerMessages('en', { common: { … } })`
 * ajuste une clé sans reperdre tout l'anglais.
 *
 * `undefined` RETIRE la surcharge (et restaure le socle pour `'fr'`).
 */
export function registerMessages(lang: string, messages: VectisMessagesInput | undefined): void {
  const key = langOf(lang)
  if (isDev && key !== lang.toLowerCase()) {
    console.warn(
      `[vectis] registerMessages('${lang}', …) : la clé attendue est une sous-balise de ` +
        `langue seule — enregistré sous « ${key} », qui couvre toutes ses variantes régionales.`,
    )
  }
  if (messages === undefined) {
    if (key === DEFAULT_LANG) registry.set(DEFAULT_LANG, fr)
    else registry.delete(key)
  } else {
    registry.set(key, mergeMessages(registry.get(key) ?? fr, messages))
  }
  currentMessages.value = resolve(currentLocale.value)
}

/**
 * Dictionnaire courant. **Interne** — consommé par les SFC, non exporté par
 * `src/index.ts` (précédent : `resolveIcon`).
 *
 * Rendre le `ShallowRef` et non l'objet est ce qui fait RE-RENDRE les composants
 * déjà montés quand `setLocale` est appelé après coup : lire `.value` dans un
 * `computed` (ou le ref dans un template, auto-déballé) enregistre la
 * dépendance auprès de l'effet de rendu.
 *
 * ⚠ Piège d'usage : `const t = useMessages().value.common.loading` dans le corps
 * d'un `setup()` FIGE la valeur. Toujours dans un `computed` ou le template.
 *
 * Forme de composable délibérée : le jour où une locale par sous-arbre (ou par
 * requête SSR) devient nécessaire, seul le CORPS de cette fonction change —
 * `inject(messagesKey, null) ?? currentMessages` — et aucun des SFC
 * consommateurs n'est touché. Elle reste par ailleurs appelable HORS composant
 * (elle ne fait que retourner un ref) ; un futur `inject` devra donc être gardé
 * par `getCurrentInstance()`.
 */
export function useMessages(): ShallowRef<VectisMessages> {
  return currentMessages
}

/**
 * Locale BCP 47 courante. Interne — sert de défaut à la prop `locale` de
 * VCalendar / VDatePicker / VTimePicker, et de locale de tri à VDataTable.
 */
export function useLocale(): ShallowRef<string> {
  return currentLocale
}
