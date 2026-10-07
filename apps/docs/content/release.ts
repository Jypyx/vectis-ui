/**
 * The library's current release, read from its manifest at build time so publishing a version
 * never requires editing the site. Kept apart from `site.ts`, which the Node scripts also load
 * and where a JSON import would need an import attribute.
 */
import { version } from '../../../packages/ui/package.json'

import { SITE_REPO_URL } from './site'

export const LIBRARY_VERSION = version

/** The GitHub release for that version; release tags are `v` followed by the version. */
export const RELEASE_URL = `${SITE_REPO_URL}/releases/tag/v${version}`
