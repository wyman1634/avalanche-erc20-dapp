import { expect } from "chai";
import { parseEther } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("GreenGridEnergyToken", function () {
  const initialDocument = "urn:sha256:initial-solar-generation-report";

  async function deployToken() {
    const [owner, alice, bob] = await ethers.getSigners();
    const token = await ethers.deployContract("GreenGridEnergyToken", [owner.address, initialDocument]);

    return { token, owner, alice, bob };
  }

  it("deploys with the expected metadata, owner, document, and zero supply", async function () {
    const { token, owner } = await deployToken();

    expect(await token.name()).to.equal("GreenGrid Solar Energy Credit");
    expect(await token.symbol()).to.equal("GGSC");
    expect(await token.decimals()).to.equal(18);
    expect(await token.owner()).to.equal(owner.address);
    expect(await token.assetDocument()).to.equal(initialDocument);
    expect(await token.totalSupply()).to.equal(0);
    expect(await token.balanceOf(owner.address)).to.equal(0);
  });

  it("rejects deployment without an asset document", async function () {
    const [owner] = await ethers.getSigners();

    await expect(ethers.deployContract("GreenGridEnergyToken", [owner.address, ""])).to.be.revertedWithCustomError(
      await ethers.getContractFactory("GreenGridEnergyToken"),
      "EmptyAssetDocument",
    );
  });

  it("allows only the owner to issue certificates", async function () {
    const { token, owner, alice } = await deployToken();
    const amount = parseEther("1000");

    await expect(token.mint(alice.address, amount))
      .to.emit(token, "CertificatesIssued")
      .withArgs(owner.address, alice.address, amount)
      .and.to.emit(token, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, amount);
    expect(await token.balanceOf(alice.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(amount);

    await expect(token.connect(alice).mint(alice.address, amount))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
  });

  it("allows holders to transfer certificates", async function () {
    const { token, alice, bob } = await deployToken();
    const issued = parseEther("100");
    const transferred = parseEther("25");
    await token.mint(alice.address, issued);

    await expect(token.connect(alice).transfer(bob.address, transferred))
      .to.emit(token, "Transfer")
      .withArgs(alice.address, bob.address, transferred);
    expect(await token.balanceOf(alice.address)).to.equal(issued - transferred);
    expect(await token.balanceOf(bob.address)).to.equal(transferred);
    expect(await token.totalSupply()).to.equal(issued);
  });

  it("allows holders to retire certificates by burning them", async function () {
    const { token, alice } = await deployToken();
    const issued = parseEther("100");
    const retired = parseEther("40");
    await token.mint(alice.address, issued);

    await expect(token.connect(alice).burn(retired))
      .to.emit(token, "Transfer")
      .withArgs(alice.address, ethers.ZeroAddress, retired);
    expect(await token.balanceOf(alice.address)).to.equal(issued - retired);
    expect(await token.totalSupply()).to.equal(issued - retired);
  });

  it("rejects transfers and burns that exceed the holder balance", async function () {
    const { token, alice, bob } = await deployToken();
    const amount = parseEther("1");

    await expect(token.connect(alice).transfer(bob.address, amount)).to.be.revertedWithCustomError(
      token,
      "ERC20InsufficientBalance",
    );
    await expect(token.connect(alice).burn(amount)).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("allows only the owner to replace the asset proof", async function () {
    const { token, owner, alice } = await deployToken();
    const newDocument = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3pte72s3tjd6bvcxk5zshwqka/report.json";

    await expect(token.updateAssetDocument(newDocument))
      .to.emit(token, "AssetDocumentUpdated")
      .withArgs(initialDocument, newDocument, owner.address);
    expect(await token.assetDocument()).to.equal(newDocument);

    await expect(token.connect(alice).updateAssetDocument(initialDocument))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);
    await expect(token.updateAssetDocument("")).to.be.revertedWithCustomError(token, "EmptyAssetDocument");
  });
});
