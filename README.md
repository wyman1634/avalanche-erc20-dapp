# Avalanche ERC-20 DApp

A full-stack ERC-20 application built for Tasks 2 and 3 of the Avalanche 101 Bootcamp. The project includes the original ERC-20 DApp plus a Fuji deployment whose token-sale price comes from a live LFJ V1 liquidity pool.

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

## Task 3: LFJ-priced token sale

`AvalancheBootcampTokenV2` uses the LFJ V1 Router to quote the live `WAVAX → ABTv2` path. `buyWithAvax` consumes that quote to determine how many tokens the buyer receives, applies a caller-provided minimum output, and transfers tokens from the contract's sale inventory.

- DEX: [LFJ V1 on Fuji](https://developers.lfj.gg/deployment-addresses/fuji)
- Token: [`0x9DFbC832E8036e794F33dD80612f7d12E44B39f2`](https://testnet.routescan.io/address/0x9DFbC832E8036e794F33dD80612f7d12E44B39f2?chainid=43113)
- WAVAX: `0xd00ae08403B9bbb9124bB305C09058E32C39A48c`
- Pair: [`0xb337Bc4A330bF4736162E668AdF2fb2179452cE7`](https://testnet.routescan.io/address/0xb337Bc4A330bF4736162E668AdF2fb2179452cE7?chainid=43113)
- Initial liquidity: `10,000 ABTv2 / 0.05 WAVAX`
- [Deployment transaction](https://testnet.routescan.io/tx/0x90a19fe9a191dee3b5fb88e74e99ae696530f4773da3e12390f37627134e0738?chainid=43113)
- [Liquidity transaction](https://testnet.routescan.io/tx/0x05263c8f5318dcab265603d182a1428c70a6dd487a428dccd9442321625680c8?chainid=43113)
- [Demo purchase transaction](https://testnet.routescan.io/tx/0x4d18d943f34a9642b38e20470ba09218ca341e22adf37d38f9c81559dc3f17f7?chainid=43113): `0.001 AVAX → 195.50169617820656117 ABTv2`

Reproduce the public-chain inspection with:

```bash
yarn hardhat run scripts/inspectTask3Fuji.ts --network avalancheFuji
```

The Router spot quote is suitable for this testnet exercise, but a production protocol should not treat a shallow AMM pool as a manipulation-resistant oracle. Production designs should consider a TWAP or a robust external oracle, deviation limits, and liquidity-depth checks.

## Project structure

- `packages/hardhat/contracts/AvalancheBootcampToken.sol` — token contract
- `packages/hardhat/test/AvalancheBootcampToken.ts` — contract tests
- `packages/hardhat/deploy/01_deploy_avalanche_bootcamp_token.ts` — deployment script
- `packages/hardhat/contracts/AvalancheBootcampTokenV2.sol` — LFJ-priced token-sale contract
- `packages/hardhat/test/AvalancheBootcampTokenV2.ts` — DEX quote and business-flow tests
- `packages/hardhat/scripts/setupTask3Fuji.ts` — idempotent Fuji liquidity and demo setup
- `packages/hardhat/scripts/inspectTask3Fuji.ts` — read-only Fuji evidence check
- `packages/nextjs/app/erc20/page.tsx` — token interaction UI
- `packages/nextjs/scaffold.config.ts` — Avalanche Fuji frontend configuration

## License

MIT
