# Hardhat Contracts

Read this reference for Solidity contracts, contract tests, deployment scripts, generated ABIs, or network configuration.

## Layout

- Contracts: `packages/hardhat/contracts/`
- Tests: `packages/hardhat/test/`
- Deploy scripts: `packages/hardhat/deploy/`
- Operational scripts: `packages/hardhat/scripts/`
- Network configuration: `packages/hardhat/hardhat.config.ts`
- Deployment records: `packages/hardhat/deployments/`
- Generated frontend ABI/address data: `packages/nextjs/contracts/deployedContracts.ts`

Inspect neighboring source and tests before editing. For OpenZeppelin-based code, the required implementation process is in `../skills/openzeppelin/SKILL.md`.

## Deployment

Tag a deploy function when the contract needs an independently runnable deployment:

```typescript
deployContract.tags = ["ContractName"];
```

Run the project scripts shown by `yarn run` and the package manifests rather than inventing parallel commands. A live-network signing operation additionally requires `../../PROJECT_MEMORY.md`.

Manual post-deploy calls can inherit the network `blockGasLimit` and fail. Estimate at the call site and add a margin:

```typescript
const gas = await contract.method.estimateGas(arg);
await contract.method(arg, { gasLimit: (gas * 120n) / 100n });
```

After deployment, verify the receipt status, runtime bytecode, and at least one ABI identity read. A transaction hash alone is not success evidence.

## Validation

Use the narrowest package-level test first, then run the relevant repository scripts for contract tests, lint, type checks, and frontend build when generated contract data changes. Record any unrelated pre-existing failure separately rather than masking it.
