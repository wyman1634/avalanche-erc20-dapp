import fs from "node:fs";
import { formatEther } from "ethers";
import { network } from "hardhat";

const LFJ_V1_FACTORY_FUJI = "0xF5c7d9733e5f53abCC1695820c4818C59B457C2C";
const WAVAX_FUJI = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
const factoryAbi = ["function getPair(address tokenA,address tokenB) view returns (address pair)"];
const pairAbi = [
  "function token0() view returns (address)",
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
];

async function main() {
  const { ethers } = await network.create();
  const deployment = JSON.parse(fs.readFileSync("deployments/avalancheFuji/AvalancheBootcampTokenV2.json", "utf8")) as {
    address: string;
    abi: [];
  };
  const token = new ethers.Contract(deployment.address, deployment.abi, ethers.provider);
  const factory = new ethers.Contract(LFJ_V1_FACTORY_FUJI, factoryAbi, ethers.provider);
  const pairAddress = await factory.getPair(deployment.address, WAVAX_FUJI);
  const pair = new ethers.Contract(pairAddress, pairAbi, ethers.provider);
  const token0 = await pair.token0();
  const [reserve0, reserve1] = await pair.getReserves();
  const tokenReserve = token0.toLowerCase() === deployment.address.toLowerCase() ? reserve0 : reserve1;
  const wavaxReserve = token0.toLowerCase() === deployment.address.toLowerCase() ? reserve1 : reserve0;
  const latestBlock = await ethers.provider.getBlockNumber();
  const purchases = await token.queryFilter(token.filters.TokensPurchased(), latestBlock - 5_000, latestBlock);
  const latestPurchase = purchases.at(-1);

  console.log(
    JSON.stringify(
      {
        network: "Avalanche Fuji (43113)",
        token: deployment.address,
        pair: pairAddress,
        configuredPair: await token.dexPair(),
        tokenReserve: `${formatEther(tokenReserve)} ABTv2`,
        wavaxReserve: `${formatEther(wavaxReserve)} WAVAX`,
        saleInventory: `${formatEther(await token.balanceOf(deployment.address))} ABTv2`,
        treasuryBalance: `${formatEther(await ethers.provider.getBalance(deployment.address))} AVAX`,
        latestPurchase: latestPurchase
          ? {
              transaction: latestPurchase.transactionHash,
              block: latestPurchase.blockNumber,
              buyer: latestPurchase.args[0],
              avaxPaid: formatEther(latestPurchase.args[1]),
              tokensReceived: formatEther(latestPurchase.args[2]),
            }
          : null,
      },
      null,
      2,
    ),
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
