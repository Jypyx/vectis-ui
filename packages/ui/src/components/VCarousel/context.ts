/**
 * Context getters preserve reactive props and messages; slide positions are supplied during
 * rendering.
 */

import type { InjectionKey } from 'vue'

export interface CarouselContext {
  /** What a screen reader says a slide IS, in place of the bare word "group". */
  readonly slideRoleDescription: string
  /**
   * What a slide is called: "3 of 8". The position is given as code counts it, from zero;
   * the sentence counts as a human does.
   */
  slideLabel: (index: number) => string
}

export const carouselKey: InjectionKey<CarouselContext> = Symbol('v-carousel')
