/**
 * What a carousel passes down to its slides. Everything is exposed through getters, which
 * is what keeps the props and the dictionary reactive on the other side of the injection.
 *
 * A slide's own POSITION deliberately does NOT travel through here: the carousel hands it
 * to each slide as it renders them. Passed through the context instead, it would have to
 * be registered by the slides as they mounted — and such a register holds nothing during
 * the server render and everything in the browser, so the "3 of 8" announced would differ
 * between the two.
 */

import type { InjectionKey } from 'vue'

export interface CarouselContext {
  /** How many slides there are, counted from what the slot renders. */
  readonly count: number
  /** What a screen reader says a slide IS, in place of the bare word "group". */
  readonly slideRoleDescription: string
  /**
   * What a slide is called — "3 of 8". The position is given as code counts it, from zero;
   * the sentence counts as a human does.
   */
  slideLabel: (index: number) => string
}

export const carouselKey: InjectionKey<CarouselContext> = Symbol('v-carousel')
