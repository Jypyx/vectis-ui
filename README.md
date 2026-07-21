# Socle

Monorepo pnpm du design system **[@socle/ui](packages/ui/README.md)** — Vue 3 + TypeScript, HTML/CSS d'abord, tokens surchargeables au runtime, compatible Nuxt 3.

```
packages/ui   → le design system (@socle/ui) — voir son README pour tout : installation, theming, contribution
apps/         → réservé à la future app de theming temps réel
```

## Démarrage

```bash
corepack enable pnpm
pnpm install
pnpm storybook
```

## Scripts racine

`pnpm lint` · `pnpm format` · `pnpm typecheck` · `pnpm test` · `pnpm build` · `pnpm tokens` · `pnpm storybook` · `pnpm build-storybook`
