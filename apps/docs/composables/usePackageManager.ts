/**
 * The package manager the reader installs with, and the command each one writes.
 *
 * The selection is MODULE-LEVEL state rather than a ref per block, so the choice follows the
 * reader down the page: the installation page shows two install blocks — one for Vite, one for
 * Nuxt — and the home page a third, and having picked `bun` once should not have to be picked
 * again two screens further. Nothing on the server ever writes it (the prerender bakes the
 * default into every page, and the first click is a client event), so the usual objection to
 * module-level state does not apply here.
 *
 * The commands differ in more than the binary's name, which is the whole reason this is a
 * TABLE and not a prefix substitution: npm INSTALLS where the other three ADD. The names
 * themselves are VALUES and never translated — they are what the reader types, spelled as they
 * are on a command line. Only the order is editorial: pnpm leads because it is what the
 * repository uses and what the rest of the documentation writes.
 */
export interface PackageManager {
  value: string
  /** The whole command adding `packages`, a space-separated list. */
  command: (packages: string) => string
}

export const PACKAGE_MANAGERS: PackageManager[] = [
  { value: 'pnpm', command: (packages) => `pnpm add ${packages}` },
  { value: 'npm', command: (packages) => `npm install ${packages}` },
  { value: 'yarn', command: (packages) => `yarn add ${packages}` },
  { value: 'bun', command: (packages) => `bun add ${packages}` },
]

const selected = ref<string>(PACKAGE_MANAGERS[0]!.value)

export function usePackageManager() {
  /**
   * The command for the manager currently chosen. The fallback is not decoration: `mandatory`
   * on the toggle is what normally keeps the value pointing at a real entry, and a block
   * printing its header above no command at all is the failure it guards against.
   */
  function commandFor(packages: string): string {
    const manager = PACKAGE_MANAGERS.find((entry) => entry.value === selected.value)
    return (manager ?? PACKAGE_MANAGERS[0]!).command(packages)
  }

  return { managers: PACKAGE_MANAGERS, packageManager: selected, commandFor }
}
