/** Share compact navigation state between the header and rail; reuse one tree at every width. */
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
