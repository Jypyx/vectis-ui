import type { InjectionKey } from 'vue'

/**
 * The VCarousel → VCarouselItem contract. Getters: the root's props and its
 * dictionary stay reactive across the injection.
 *
 * The slide's own POSITION does not travel through here — VCarousel passes it as
 * an `index` prop through `cloneVNode`, which is what keeps the "N of M" label
 * identical on the server and on the client. A context member fed at mount would
 * be a registry, and a registry renders 0 slides on the server and N on the
 * client.
 */
export interface CarouselContext {
  /** Total number of slides, counted off the slot's VNodes. */
  readonly count: number
  /** aria-roledescription spoken in place of "group". */
  readonly slideRoleDescription: string
  /** Accessible name of the slide at `index` (0-based; the message is 1-based). */
  slideLabel: (index: number) => string
}

export const carouselKey: InjectionKey<CarouselContext> = Symbol('v-carousel')
