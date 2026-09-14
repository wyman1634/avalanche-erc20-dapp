import { artifacts, deployScript } from "../rocketh/deploy.js";

const INITIAL_ASSET_DOCUMENT = "urn:sha256:8d6fded9f38e68c1bff4cb4fa6f4e24ad9d116c5fd9be78be5f3a0c1399e0e71";

export default deployScript(
  async ({ deploy, namedAccounts, name }) => {
    if (name !== "avalancheFuji") return false;

    const { deployer } = namedAccounts;

    await deploy("GreenGridEnergyToken", {
      account: deployer,
      artifact: artifacts.GreenGridEnergyToken,
      args: [deployer, INITIAL_ASSET_DOCUMENT],
    });
  },
  { tags: ["GreenGridEnergyToken"] },
);
