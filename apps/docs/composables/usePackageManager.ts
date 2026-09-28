/** Shared client selection; server rendering only reads the default package manager. */
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
  /** The command for the manager currently chosen. */
  function commandFor(packages: string): string {
    const manager = PACKAGE_MANAGERS.find((entry) => entry.value === selected.value)
    return (manager ?? PACKAGE_MANAGERS[0]!).command(packages)
  }

  return { managers: PACKAGE_MANAGERS, packageManager: selected, commandFor }
}
