# Frontend

Read this reference for Next.js UI, wallet interaction, Scaffold-ETH hooks, components, or styling.

## Layout and conventions

- App Router pages: `packages/nextjs/app/`
- Contract hooks: `packages/nextjs/hooks/scaffold-eth/`
- Generated deployed contracts: `packages/nextjs/contracts/deployedContracts.ts`
- External contract definitions: `packages/nextjs/contracts/externalContracts.ts`
- Target network and polling configuration: `packages/nextjs/scaffold.config.ts`
- Use the `~~` alias for imports within the Next.js package.

Inspect the current exported types and neighboring components before using a hook. Preferred contract hooks include:

- `useScaffoldReadContract` for reads
- `useScaffoldWriteContract` for writes
- `useScaffoldEventHistory` for historical events
- `useScaffoldWatchContractEvent` for live events
- `useDeployedContractInfo` and `useScaffoldContract` for contract metadata/access

Use components from `@scaffold-ui/components` when available: `Address`, `AddressInput`, `Balance`, `EtherInput`, and `IntegerInput`. Use DaisyUI component classes for established UI patterns.

Use `notification` and `getParsedError` from `~~/utils/scaffold-eth` for transaction feedback. Preserve the distinction between free RPC reads and wallet-signed, gas-paying writes in both behavior and copy.

Run the Next.js type check and lint after UI changes. Run the production build when routing, configuration, generated contract data, or build-sensitive behavior changes.
