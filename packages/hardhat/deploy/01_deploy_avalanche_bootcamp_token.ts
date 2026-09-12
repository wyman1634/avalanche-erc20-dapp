import { artifacts, deployScript } from "../rocketh/deploy.js";

export default deployScript(
  async ({ deploy, namedAccounts }) => {
    const { deployer } = namedAccounts;

    await deploy("AvalancheBootcampToken", {
      account: deployer,
      artifact: artifacts.AvalancheBootcampToken,
      args: [deployer],
    });
  },
  { tags: ["AvalancheBootcampToken"] },
);
