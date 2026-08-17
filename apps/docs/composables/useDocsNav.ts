/**
 * Whether the compact documentation rail is unfolded.
 *
 * Below 1024px the sidebar is not a grid track: the same tree is revealed by a data attribute
 * on `.vd-docs`, which is what avoids a second copy of forty rows kept in step by hand. The
 * flag is shared because the button that toggles it and the rail that reads it are siblings,
 * and because every link in the rail has to close it on the way out.
 */
export function useDocsNav() {
  const navOpen = useState('docs-nav-open', () => false)

  return {
    navOpen,
    toggleNav: () => {
      navOpen.value = !navOpen.value
    },
    closeNav: () => {
      navOpen.value = false
    },
  }
}
