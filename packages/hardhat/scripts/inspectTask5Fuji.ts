import fs from "node:fs";
import { formatEther } from "ethers";
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.create();
  const deployment = JSON.parse(fs.readFileSync("deployments/avalancheFuji/GreenGridEnergyToken.json", "utf8")) as {
    address: string;
    abi: [];
    receipt: { blockNumber: string };
    transaction: { hash: string };
  };
  const token = new ethers.Contract(deployment.address, deployment.abi, ethers.provider);
  const deploymentBlock = Number.parseInt(deployment.receipt.blockNumber, 16);
  const logs = await ethers.provider.getLogs({ address: deployment.address, fromBlock: deploymentBlock });
  const transactions = new Map<string, { event: string; status?: number }>();

  for (const log of logs) {
    const event = token.interface.parseLog(log);
    if (!event || !["CertificatesIssued", "Transfer"].includes(event.name)) continue;

    const receipt = await ethers.provider.getTransactionReceipt(log.transactionHash);
    transactions.set(log.transactionHash, { event: event.name, status: receipt?.status });
  }

  const deploymentReceipt = await ethers.provider.getTransactionReceipt(deployment.transaction.hash);
  const code = await ethers.provider.getCode(deployment.address);

  console.log(
    JSON.stringify(
      {
        network: "Avalanche Fuji (43113)",
        contract: deployment.address,
        deploymentTransaction: deployment.transaction.hash,
        deploymentStatus: deploymentReceipt?.status,
        hasRuntimeBytecode: code !== "0x",
        name: await token.name(),
        symbol: await token.symbol(),
        owner: await token.owner(),
        assetDocument: await token.assetDocument(),
        totalSupply: `${formatEther(await token.totalSupply())} GGSC`,
        transactions: Object.fromEntries(transactions),
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
