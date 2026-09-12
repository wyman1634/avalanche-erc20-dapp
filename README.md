# Avalanche ERC-20 DApp

A full-stack ERC-20 application built for Task 2 of the Avalanche 101 Bootcamp. The contract is deployed with Scaffold-ETH 2 and the user interface targets Avalanche Fuji.

## Token design

`AvalancheBootcampToken` uses audited OpenZeppelin Contracts components:

- ERC-20 name: `Avalanche Bootcamp Token`
- Symbol: `ABT`
- Initial supply: `1,000,000 ABT`, minted to the deployer
- Additional minting: contract owner only
- Burning: available to token holders
- Standard transfers and allowances

The DApp displays total supply and the connected wallet balance, lets the owner mint tokens, and lets holders transfer ABT.

## Tech stack

- Solidity 0.8.30
- OpenZeppelin Contracts 5
- Hardhat 3 and hardhat-deploy 2
- Next.js, TypeScript, Wagmi, Viem, and RainbowKit
- Avalanche Fuji testnet (chain ID `43113`)

## Prerequisites

- Node.js 22.10 or newer
- Yarn 4 (the repository pins the version)
- Git

## Local development

Install dependencies:

```bash
yarn install
```

Start the local Hardhat chain in terminal 1:

```bash
yarn chain
```

Deploy the contract in terminal 2:

```bash
yarn deploy
```

Start the frontend in terminal 3:

```bash
yarn start
```

Open `http://localhost:3000/erc20`.

## Quality checks

```bash
yarn test
yarn lint
yarn next:check-types
yarn next:build
```

The contract tests cover initial ownership and supply, owner-only minting, transfers, and holder burns.

## Deploy to Avalanche Fuji

Create an encrypted, dedicated testnet deployer account:

```bash
yarn generate
yarn account
```

Fund the displayed address with Fuji AVAX, then deploy:

```bash
yarn deploy --network avalancheFuji
```

The encrypted private key is stored in `packages/hardhat/.env`, which is ignored by Git. Never commit a private key, seed phrase, or environment file.

## Fuji deployment

- Contract address: `0x64E19587FDc01613AC823ffd71Cb5F2F7d09b0BB`
- Deployment transaction: `0x45d684d9a1bf77e9558a25aa42c23dd7cdcc926e8df484bd5fe007579d8b1836`
- Contract explorer: [Avalanche L1 Explorer](https://subnets-test.avax.network/c-chain/address/0x64E19587FDc01613AC823ffd71Cb5F2F7d09b0BB)
- Transaction explorer: [Avalanche L1 Explorer](https://subnets-test.avax.network/c-chain/tx/0x45d684d9a1bf77e9558a25aa42c23dd7cdcc926e8df484bd5fe007579d8b1836)
- Deployment block: `58,327,922`
- Deployer and owner: `0x3cd247C0ebAb3D4702dB33250dA14D91AE79d430`

The Fuji receipt has status `1`. Independent RPC calls confirm deployed bytecode, 18 decimals, a total supply of `1,000,000 ABT`, and the full initial supply assigned to the owner.

## Project structure

- `packages/hardhat/contracts/AvalancheBootcampToken.sol` — token contract
- `packages/hardhat/test/AvalancheBootcampToken.ts` — contract tests
- `packages/hardhat/deploy/01_deploy_avalanche_bootcamp_token.ts` — deployment script
- `packages/nextjs/app/erc20/page.tsx` — token interaction UI
- `packages/nextjs/scaffold.config.ts` — Avalanche Fuji frontend configuration

## License

MIT
