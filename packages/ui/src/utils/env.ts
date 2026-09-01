// @devwarn
/**
 * Whether the library is running in a development build. Every integrator-facing warning
 * is gated on it, so none reaches a finished application.
 *
 * Looked up cautiously: the flag comes from the build tool the library is developed with,
 * and an application built with another may not provide it — the warnings then stay silent
 * rather than failing.
 */
export const isDev = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV === true
