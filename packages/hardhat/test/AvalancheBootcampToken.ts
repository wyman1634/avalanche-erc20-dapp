import { expect } from "chai";
import { parseEther } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("AvalancheBootcampToken", function () {
  async function deployToken() {
    const [owner, alice, bob] = await ethers.getSigners();
    const token = await ethers.deployContract("AvalancheBootcampToken", [owner.address]);

    return { token, owner, alice, bob };
  }

  it("assigns the metadata, ownership, and initial supply", async function () {
    const { token, owner } = await deployToken();
    const initialSupply = parseEther("1000000");

    expect(await token.name()).to.equal("Avalanche Bootcamp Token");
    expect(await token.symbol()).to.equal("ABT");
    expect(await token.decimals()).to.equal(18);
    expect(await token.owner()).to.equal(owner.address);
    expect(await token.totalSupply()).to.equal(initialSupply);
    expect(await token.balanceOf(owner.address)).to.equal(initialSupply);
  });

  it("allows only the owner to mint", async function () {
    const { token, owner, alice } = await deployToken();
    const amount = parseEther("250");

    await expect(token.mint(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);

    await expect(token.connect(alice).mint(alice.address, amount))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
    expect(await token.owner()).to.equal(owner.address);
  });

  it("transfers tokens between accounts", async function () {
    const { token, owner, alice } = await deployToken();
    const amount = parseEther("100");

    await expect(token.transfer(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
  });

  it("allows holders to burn their tokens", async function () {
    const { token, owner } = await deployToken();
    const amount = parseEther("50");
    const supplyBefore = await token.totalSupply();

    await expect(token.burn(amount)).to.emit(token, "Transfer").withArgs(owner.address, ethers.ZeroAddress, amount);
    expect(await token.totalSupply()).to.equal(supplyBefore - amount);
  });
});
