import fs from "node:fs";
import { formatEther, parseEther } from "ethers";
import { network } from "hardhat";

const ISSUE_AMOUNT = parseEther("1000");
const TRANSFER_AMOUNT = parseEther("200");
const BURN_AMOUNT = parseEther("100");
const RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();
  const deployment = JSON.parse(fs.readFileSync("deployments/avalancheFuji/GreenGridEnergyToken.json", "utf8")) as {
    address: string;
    abi: [];
  };
  const token = new ethers.Contract(deployment.address, deployment.abi, deployer);

  let mintTxHash: string | undefined;
  let transferTxHash: string | undefined;
  let burnTxHash: string | undefined;

  if ((await token.totalSupply()) === 0n) {
    const mintTx = await token.mint(deployer.address, ISSUE_AMOUNT);
    await mintTx.wait();
    mintTxHash = mintTx.hash;
  }

  if ((await token.balanceOf(RECIPIENT)) === 0n) {
    const transferTx = await token.transfer(RECIPIENT, TRANSFER_AMOUNT);
    await transferTx.wait();
    transferTxHash = transferTx.hash;
  }

  if ((await token.balanceOf(deployer.address)) === ISSUE_AMOUNT - TRANSFER_AMOUNT) {
    const burnTx = await token.burn(BURN_AMOUNT);
    await burnTx.wait();
    burnTxHash = burnTx.hash;
  }

  console.log(
    JSON.stringify(
      {
        network: "Avalanche Fuji (43113)",
        token: deployment.address,
        owner: await token.owner(),
        assetDocument: await token.assetDocument(),
        mintTx: mintTxHash ?? "already completed",
        transferTx: transferTxHash ?? "already completed",
        burnTx: burnTxHash ?? "already completed",
        ownerBalance: `${formatEther(await token.balanceOf(deployer.address))} GGSC`,
        recipient: RECIPIENT,
        recipientBalance: `${formatEther(await token.balanceOf(RECIPIENT))} GGSC`,
        totalSupply: `${formatEther(await token.totalSupply())} GGSC`,
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
