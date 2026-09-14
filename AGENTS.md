# Agent Guide

This repository is the Hardhat flavor of Scaffold-ETH 2. It contains Avalanche Bootcamp Tasks 2, 3, and 5: Solidity contracts in `packages/hardhat` and a Next.js DApp in `packages/nextjs`.

## Working loop

1. Inspect `git status`, the relevant package scripts, and the files nearest the requested change.
2. Load only the branch-specific reference listed below.
3. Make the smallest change that satisfies the request and preserve unrelated user work.
4. Run the narrowest relevant deterministic checks, then expand validation in proportion to risk.
5. Report changed files, verification results, and any remaining limitation. Work is complete when the requested behavior is implemented and the relevant checks pass or a concrete blocker is documented.

Use the repository-pinned Yarn version and existing scripts. Treat package manifests, compiler configuration, and source code as the source of truth instead of duplicating their current values here.

## Context routing

- **Live deployment, signing account, Fuji evidence, or Task 5 continuation:** read [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) before any account or network action. It contains public state and the non-secret credential recovery procedure.
- **Solidity, OpenZeppelin, tests, deployment scripts, or generated ABI:** read [`.agents/references/hardhat-contracts.md`](.agents/references/hardhat-contracts.md). For every OpenZeppelin change, also read [`.agents/skills/openzeppelin/SKILL.md`](.agents/skills/openzeppelin/SKILL.md) completely before editing.
- **Next.js pages, wallet interaction, hooks, components, or styling:** read [`.agents/references/frontend.md`](.agents/references/frontend.md).
- **NFT, wallet batching, indexing, SIWE, x402, database, subgraph, or specialist review:** read [`.agents/references/capabilities.md`](.agents/references/capabilities.md) and then only the matched skill/agent file.

## Repository guardrails

- Keep secrets in the gitignored `packages/hardhat/.env` and macOS Keychain. Commit only public addresses and transaction evidence.
- Let the deployment workflow generate `packages/nextjs/contracts/deployedContracts.ts`; avoid hand-editing generated ABI data.
- Keep contract, deployment, tests, and public evidence consistent when behavior or a live address changes.
- Limit commits to the requested task; do not fold unrelated cleanup into the change.
