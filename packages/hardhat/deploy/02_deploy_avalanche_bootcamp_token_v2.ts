import { artifacts, deployScript } from "../rocketh/deploy.js";

const LFJ_V1_ROUTER_FUJI = "0xd7f655E3376cE2D7A2b08fF01Eb3B1023191A901";

export default deployScript(
  async ({ deploy, namedAccounts, name }) => {
    if (name !== "avalancheFuji") return false;

    const { deployer } = namedAccounts;

    await deploy("AvalancheBootcampTokenV2", {
      account: deployer,
      artifact: artifacts.AvalancheBootcampTokenV2,
      args: [deployer, LFJ_V1_ROUTER_FUJI],
    });
  },
  { tags: ["AvalancheBootcampTokenV2"] },
);
