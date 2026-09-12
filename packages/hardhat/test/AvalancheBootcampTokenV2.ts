import { expect } from "chai";
import { parseEther } from "ethers";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("AvalancheBootcampTokenV2", function () {
  async function deployFixture(options: { configurePair?: boolean; fundSale?: boolean } = {}) {
    const { configurePair = true, fundSale = true } = options;
    const [owner, alice, wavax, recipient] = await ethers.getSigners();

    const factory = await ethers.deployContract("MockJoeFactory");
    const router = await ethers.deployContract("MockJoeRouter", [
      await factory.getAddress(),
      wavax.address,
      parseEther("200000"),
    ]);
    const token = await ethers.deployContract("AvalancheBootcampTokenV2", [owner.address, await router.getAddress()]);
    const pair = await ethers.deployContract("MockJoePair", [await token.getAddress(), wavax.address]);

    await factory.setPair(await token.getAddress(), wavax.address, await pair.getAddress());
    await pair.setReserves(parseEther("10000"), parseEther("0.05"));

    if (configurePair) {
      await token.setDexPair(await pair.getAddress());
    }
    if (fundSale) {
      await token.transfer(await token.getAddress(), parseEther("100000"));
    }

    return { token, pair, factory, router, owner, alice, wavax, recipient };
  }

  it("keeps the ERC-20 metadata, ownership, and initial supply", async function () {
    const { token, owner, router, wavax } = await deployFixture();

    expect(await token.name()).to.equal("Avalanche Bootcamp Token V2");
    expect(await token.symbol()).to.equal("ABTv2");
    expect(await token.owner()).to.equal(owner.address);
    expect(await token.totalSupply()).to.equal(parseEther("1000000"));
    expect(await token.dexRouter()).to.equal(await router.getAddress());
    expect(await token.wavax()).to.equal(wavax.address);
  });

  it("accepts only the factory pair with live liquidity", async function () {
    const { token, pair, factory, owner, alice, wavax } = await deployFixture({ configurePair: false });

    await expect(token.connect(alice).setDexPair(await pair.getAddress()))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);

    const wrongPair = await ethers.deployContract("MockJoePair", [await token.getAddress(), wavax.address]);
    await expect(token.setDexPair(await wrongPair.getAddress())).to.be.revertedWithCustomError(token, "InvalidDexPair");

    await pair.setReserves(0, 0);
    await expect(token.setDexPair(await pair.getAddress())).to.be.revertedWithCustomError(token, "PairHasNoLiquidity");

    await pair.setReserves(parseEther("10000"), parseEther("0.05"));
    await expect(token.setDexPair(await pair.getAddress()))
      .to.emit(token, "DexPairConfigured")
      .withArgs(await pair.getAddress());
    expect(await factory.getPair(await token.getAddress(), wavax.address)).to.equal(await pair.getAddress());
    expect(await token.owner()).to.equal(owner.address);
  });

  it("uses the live DEX quote to determine the purchased token amount", async function () {
    const { token, router, alice } = await deployFixture();
    const payment = parseEther("0.001");
    const firstQuote = parseEther("200");

    expect(await token.quoteTokensForAvax(payment)).to.equal(firstQuote);
    await expect(token.connect(alice).buyWithAvax(firstQuote, { value: payment }))
      .to.emit(token, "TokensPurchased")
      .withArgs(alice.address, payment, firstQuote);
    expect(await token.balanceOf(alice.address)).to.equal(firstQuote);

    await router.setTokensPerAvax(parseEther("150000"));
    const secondQuote = parseEther("150");
    expect(await token.quoteTokensForAvax(payment)).to.equal(secondQuote);

    await token.connect(alice).buyWithAvax(secondQuote, { value: payment });
    expect(await token.balanceOf(alice.address)).to.equal(firstQuote + secondQuote);
  });

  it("enforces slippage and sale inventory limits", async function () {
    const payment = parseEther("0.001");
    const { token, alice } = await deployFixture();

    await expect(token.connect(alice).buyWithAvax(parseEther("201"), { value: payment }))
      .to.be.revertedWithCustomError(token, "SlippageExceeded")
      .withArgs(parseEther("201"), parseEther("200"));

    const emptySale = await deployFixture({ fundSale: false });
    await expect(emptySale.token.connect(emptySale.alice).buyWithAvax(0, { value: payment }))
      .to.be.revertedWithCustomError(emptySale.token, "InsufficientSaleInventory")
      .withArgs(0, parseEther("200"));
  });

  it("rejects zero-value quotes and purchases", async function () {
    const { token, alice } = await deployFixture();

    await expect(token.quoteTokensForAvax(0)).to.be.revertedWithCustomError(token, "ZeroAmount");
    await expect(token.connect(alice).buyWithAvax(0)).to.be.revertedWithCustomError(token, "ZeroAmount");
  });

  it("allows only the owner to withdraw collected AVAX", async function () {
    const { token, alice, recipient } = await deployFixture();
    const payment = parseEther("0.001");
    await token.connect(alice).buyWithAvax(0, { value: payment });

    await expect(token.connect(alice).withdrawAvax(recipient.address, payment))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);

    await expect(token.withdrawAvax(recipient.address, payment))
      .to.emit(token, "TreasuryWithdrawal")
      .withArgs(recipient.address, payment);
    expect(await ethers.provider.getBalance(await token.getAddress())).to.equal(0);
  });
});
