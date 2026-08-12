// @devwarn
/**
 * Whether the library is running in a development build. It is what the design system's
 * warnings are gated on — an icon-only button with no name, two options that contradict
 * each other — so that none of them reaches a finished application.
 *
 * The flag comes from the build tool the library is developed with, and it is looked up
 * cautiously: an application built with a different tool may not provide it at all, and
 * every warning then simply stays silent rather than failing.
 */
export const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true
