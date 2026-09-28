/*
 * Declare process locally so the consumer's bundler can replace NODE_ENV without leaking Node
 * ambient types into library declarations.
 */
declare const process: { env: { NODE_ENV?: string } }

// @devwarn
/**
 * Use process.env.NODE_ENV so the consumer chooses development warnings; import.meta.env would
 * be folded during library build and erase them.
 */
export const isDev = process.env.NODE_ENV !== 'production'
