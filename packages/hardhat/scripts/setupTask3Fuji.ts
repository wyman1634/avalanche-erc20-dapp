import fs from "node:fs";
import { formatEther, parseEther } from "ethers";
import { network } from "hardhat";

const LFJ_V1_FACTORY_FUJI = "0xF5c7d9733e5f53abCC1695820c4818C59B457C2C";
const LFJ_V1_ROUTER_FUJI = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901";
const WAVAX_FUJI = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";

const TOKEN_LIQUIDITY = parseEther("10000");
const AVAX_LIQUIDITY = parseEther("0.05");
const SALE_INVENTORY = parseEther("100000");
const DEMO_PAYMENT = parseEther("0.001");

const routerAbi = [
  "function factory() view returns (address)",
  "function WAVAX() view returns (address)",
  "function addLiquidityAVAX(address token,uint256 amountTokenDesired,uint256 amountTokenMin,uint256 amountAVAXMin,address to,uint256 deadline) payable returns (uint256 amountToken,uint256 amountAVAX,uint256 liquidity)",
];
const factoryAbi = ["function getPair(address tokenA,address tokenB) view returns (address pair)"];
const pairAbi = [
  "function token0() view returns (address)",
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
];

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();
  const deployment = JSON.parse(fs.readFileSync("deployments/avalancheFuji/AvalancheBootcampTokenV2.json", "utf8")) as {
    address: string;
    abi: [];
  };

  const token = new ethers.Contract(deployment.address, deployment.abi, deployer);
  const router = new ethers.Contract(LFJ_V1_ROUTER_FUJI, routerAbi, deployer);
  const factory = new ethers.Contract(LFJ_V1_FACTORY_FUJI, factoryAbi, deployer);

  if ((await router.factory()) !== LFJ_V1_FACTORY_FUJI) throw new Error("LFJ Router factory mismatch");
  if ((await router.WAVAX()) !== WAVAX_FUJI) throw new Error("LFJ Router WAVAX mismatch");

  let approveTxHash: string | undefined;
  let liquidityTxHash: string | undefined;
  let pairAddress = await factory.getPair(deployment.address, WAVAX_FUJI);

  if (pairAddress === ethers.ZeroAddress) {
    const allowance = await token.allowance(deployer.address, LFJ_V1_ROUTER_FUJI);
    if (allowance < TOKEN_LIQUIDITY) {
      const approveTx = await token.approve(LFJ_V1_ROUTER_FUJI, TOKEN_LIQUIDITY);
      approveTxHash = approveTx.hash;
      await approveTx.wait();
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1_200);
    const liquidityTx = await router.addLiquidityAVAX(
      deployment.address,
      TOKEN_LIQUIDITY,
      (TOKEN_LIQUIDITY * 99n) / 100n,
      (AVAX_LIQUIDITY * 99n) / 100n,
      deployer.address,
      deadline,
      { value: AVAX_LIQUIDITY },
    );
    liquidityTxHash = liquidityTx.hash;
    await liquidityTx.wait();
    pairAddress = await factory.getPair(deployment.address, WAVAX_FUJI);
  }

  if ((await token.dexPair()) === ethers.ZeroAddress) {
    const pairTx = await token.setDexPair(pairAddress);
    await pairTx.wait();
  }

  const currentInventory = await token.balanceOf(deployment.address);
  if (currentInventory < SALE_INVENTORY) {
    const inventoryTx = await token.transfer(deployment.address, SALE_INVENTORY - currentInventory);
    await inventoryTx.wait();
  }

  const pair = new ethers.Contract(pairAddress, pairAbi, deployer);
  const token0 = await pair.token0();
  const [reserve0, reserve1] = await pair.getReserves();
  const tokenReserve = token0.toLowerCase() === deployment.address.toLowerCase() ? reserve0 : reserve1;
  const wavaxReserve = token0.toLowerCase() === deployment.address.toLowerCase() ? reserve1 : reserve0;

  const quote = await token.quoteTokensForAvax(DEMO_PAYMENT);
  let receivedTokens: bigint | undefined;
  let purchaseTxHash: string | undefined;
  let purchaseBlock: number | undefined;
  let purchaseStatus: number | undefined;

  // Keep this setup script safe to rerun after the first on-chain demo purchase.
  if ((await ethers.provider.getBalance(deployment.address)) === 0n) {
    const minTokenOut = (quote * 99n) / 100n;
    const balanceBefore = await token.balanceOf(deployer.address);
    const purchaseTx = await token.buyWithAvax(minTokenOut, { value: DEMO_PAYMENT });
    const purchaseReceipt = await purchaseTx.wait();
    const balanceAfter = await token.balanceOf(deployer.address);
    receivedTokens = balanceAfter - balanceBefore;
    purchaseTxHash = purchaseTx.hash;
    purchaseBlock = purchaseReceipt?.blockNumber;
    purchaseStatus = purchaseReceipt?.status;
  }

  console.log(
    JSON.stringify(
      {
        network: "Avalanche Fuji",
        deployer: deployer.address,
        token: deployment.address,
        router: LFJ_V1_ROUTER_FUJI,
        factory: LFJ_V1_FACTORY_FUJI,
        wavax: WAVAX_FUJI,
        pair: pairAddress,
        approveTx: approveTxHash,
        liquidityTx: liquidityTxHash,
        tokenReserve: formatEther(tokenReserve),
        wavaxReserve: formatEther(wavaxReserve),
        paymentAvax: formatEther(DEMO_PAYMENT),
        quotedTokens: formatEther(quote),
        receivedTokens: receivedTokens === undefined ? "already completed" : formatEther(receivedTokens),
        purchaseTx: purchaseTxHash ?? "already completed",
        purchaseBlock,
        purchaseStatus,
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
