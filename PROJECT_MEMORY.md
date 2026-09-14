# Project Memory

This file records durable, non-secret operational context for resuming the Avalanche Bootcamp work. Keep it updated when a deployment, submission, credential location, or branch changes.

## Security rules

- Never commit a private key, mnemonic, encryption password, decrypted keystore, or the contents of `packages/hardhat/.env`.
- `packages/hardhat/.env` is gitignored and contains the encrypted deployer JSON in `DEPLOYER_PRIVATE_KEY_ENCRYPTED`.
- The encryption password was generated during the earlier Codex-assisted setup. It was not chosen by the learner and is stored only in the local macOS Keychain.
- Keychain service: `avalanche-task2-deployer`
- Keychain account: `wyman1634`
- Expected deployer/owner address: `0x3cd247C0ebAb3D4702dB33250dA14D91AE79d430`

Confirm that the password entry still exists without revealing it:

```bash
security find-generic-password -s avalanche-task2-deployer -a wyman1634 >/dev/null
```

Copy the password to the clipboard without printing it in the terminal, then paste it into the prompt from `yarn account`, `yarn deploy`, or a Hardhat signing script:

```bash
security find-generic-password -s avalanche-task2-deployer -a wyman1634 -w | pbcopy
```

The macOS Keychain entry and the gitignored encrypted `.env` file are both required. The password alone is not the private key, and neither item should be published. If either is lost, do not overwrite the remaining item; first make a secure local backup and assess whether the deployer must be replaced.

## Task 5 implementation

- Working branch: `feat/task5-rwa-token`
- Implementation commit: `48031eed1f38b35efacf3072d141d2c13e149958`
- Deployment-evidence commit: `809d21c23f00854ef19afdba5df640f0f7a109fa`
- GitHub branch: <https://github.com/wyman1634/avalanche-erc20-dapp/tree/feat/task5-rwa-token>
- Contract: `GreenGridEnergyToken`
- Token: `GreenGrid Solar Energy Credit` (`GGSC`)
- Meaning: `1 GGSC` represents a certificate for `1 kWh` of verified renewable electricity; this is a testnet simulation, not a real asset or investment product.
- Important files:
  - `packages/hardhat/contracts/GreenGridEnergyToken.sol`
  - `packages/hardhat/test/GreenGridEnergyToken.ts`
  - `packages/hardhat/deploy/03_deploy_green_grid_energy_token.ts`
  - `packages/hardhat/scripts/setupTask5Fuji.ts`
  - `packages/hardhat/scripts/inspectTask5Fuji.ts`
  - `packages/hardhat/deployments/avalancheFuji/GreenGridEnergyToken.json`

## Task 5 Fuji evidence

- Network: Avalanche Fuji C-Chain
- Chain ID: `43113`
- Contract address: [`0x9b9e6d67197d8dde89d8a0f7f5542b0e7da2f5f8`](https://explorer-test.avax.network/c-chain/address/0x9b9e6d67197d8dde89d8a0f7f5542b0e7da2f5f8)
- Deployment transaction: [`0x3044d3e41bc38072e068dddbacfe11025f3b1cfdb2dbe04aba8afe03c6b798cf`](https://explorer-test.avax.network/c-chain/tx/0x3044d3e41bc38072e068dddbacfe11025f3b1cfdb2dbe04aba8afe03c6b798cf)
- Mint transaction (`1,000 GGSC`): [`0xcfe4c58eb3329d1c53aa960d5a8421740e82699355b448e10114e897c4c2f01c`](https://explorer-test.avax.network/c-chain/tx/0xcfe4c58eb3329d1c53aa960d5a8421740e82699355b448e10114e897c4c2f01c)
- Transfer transaction (`200 GGSC`): [`0x0dc6c130d5d19cdcade1bf6ba85cf4e5dccad5dd33f3cbfbd3930ed5be974121`](https://explorer-test.avax.network/c-chain/tx/0x0dc6c130d5d19cdcade1bf6ba85cf4e5dccad5dd33f3cbfbd3930ed5be974121)
- Burn transaction (`100 GGSC`): [`0x9d38b0851cc6ecb37724a396193756317610891705e7ef5603e9385303f41e2d`](https://explorer-test.avax.network/c-chain/tx/0x9d38b0851cc6ecb37724a396193756317610891705e7ef5603e9385303f41e2d)
- Demonstration recipient: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Final state: owner `700 GGSC`, recipient `200 GGSC`, total supply `900 GGSC`
- Read-only verification:

```bash
cd packages/hardhat
yarn hardhat run scripts/inspectTask5Fuji.ts --network avalancheFuji
```

The last verified result had successful receipts (`status = 1`), nonempty runtime bytecode, the expected contract identity, and `900 GGSC` total supply.

## Task 5 submission

- Course repository branch: `submission/wyman1634-task5`
- Official PR: <https://github.com/openbuildxyz/Avalanche-101-Bootcamp/pull/98>
- Submission path: `learn/wyman1634/task5/`
- Evidence: submission README plus four Fuji explorer screenshots for deployment, mint, transfer, and burn
- Status when last checked on 2026-09-14: open, ready for review, mergeable, clean, and limited to Task 5 files

## Verification baseline

The Task 5 handoff passed these checks on 2026-09-14:

- 7 Task 5 contract tests
- 17 contract tests in total
- Hardhat lint
- Next.js type check
- Next.js lint
- Next.js production build

`yarn hardhat:check-types` has pre-existing TypeScript errors in unrelated Task 3/Rocketh integration code and was not used as the Task 5 acceptance gate.

## Resume checklist

1. Read this file and `README.md` before changing deployment state.
2. Confirm the current branch and clean/dirty worktree with `git status --short --branch`.
3. Use `inspectTask5Fuji.ts` for read-only verification before sending transactions.
4. Retrieve the deployer password from Keychain only when a signing command prompts for it.
5. Never paste secrets into chat, documentation, commits, command output, or screenshots.
