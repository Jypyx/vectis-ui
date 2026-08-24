/**
 * The page for a component listed in the inventory but not documented yet.
 *
 * One message set covering thirty-six of the fifty routes: `pages/docs/[slug].vue`
 * renders it for every slug that has no file of its own.
 */
export default {
  lead: 'This page is not written yet.',
  body: 'The component exists upstream and is a legitimate part of the inventory; it is listed here so the shape of the library is honest. It is absent because it has not been read in full, not because it was judged unnecessary — and approximating it would document an API the library does not have.',
  quote:
    'Ask for it and it will be written the same way as the others: from the source, with values unrounded.',
  meantimeHeading: 'In the meantime',
  meantime:
    "The component's own stories and its <code>.mdx</code> page are the reference until then, and they are generated from the same source this documentation would be.",
  readSource: 'Read the source',
  backToInstallation: 'Back to installation',
  notFound: 'Not found',
}
