// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IJoeFactory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IJoePair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

interface IJoeRouter {
    function factory() external view returns (address);

    function WAVAX() external view returns (address);

    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts);
}

contract AvalancheBootcampTokenV2 is ERC20, ERC20Burnable, Ownable, ReentrancyGuard {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;

    address public immutable dexRouter;
    address public immutable wavax;
    address public dexPair;

    error ZeroAddress();
    error ZeroAmount();
    error InvalidDexPair();
    error DexPairNotConfigured();
    error PairHasNoLiquidity();
    error SlippageExceeded(uint256 minimumOutput, uint256 actualOutput);
    error InsufficientSaleInventory(uint256 available, uint256 required);
    error InsufficientTreasuryBalance(uint256 available, uint256 required);
    error NativeTransferFailed();

    event DexPairConfigured(address indexed pair);
    event TokensPurchased(address indexed buyer, uint256 avaxPaid, uint256 tokensReceived);
    event TreasuryWithdrawal(address indexed recipient, uint256 amount);

    constructor(
        address initialOwner,
        address router
    ) ERC20("Avalanche Bootcamp Token V2", "ABTv2") Ownable(initialOwner) {
        if (router == address(0)) revert ZeroAddress();

        address wrappedAvax = IJoeRouter(router).WAVAX();
        if (wrappedAvax == address(0)) revert ZeroAddress();

        dexRouter = router;
        wavax = wrappedAvax;
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function setDexPair(address pair) external onlyOwner {
        if (pair == address(0)) revert ZeroAddress();

        address factoryPair = IJoeFactory(IJoeRouter(dexRouter).factory()).getPair(address(this), wavax);
        if (pair != factoryPair) revert InvalidDexPair();

        IJoePair joePair = IJoePair(pair);
        address token0 = joePair.token0();
        address token1 = joePair.token1();
        if (!((token0 == address(this) && token1 == wavax) || (token0 == wavax && token1 == address(this)))) {
            revert InvalidDexPair();
        }

        (uint112 reserve0, uint112 reserve1, ) = joePair.getReserves();
        if (reserve0 == 0 || reserve1 == 0) revert PairHasNoLiquidity();

        dexPair = pair;
        emit DexPairConfigured(pair);
    }

    function getDexReserves() public view returns (uint256 tokenReserve, uint256 wavaxReserve) {
        address pair = dexPair;
        if (pair == address(0)) revert DexPairNotConfigured();

        IJoePair joePair = IJoePair(pair);
        (uint112 reserve0, uint112 reserve1, ) = joePair.getReserves();
        if (reserve0 == 0 || reserve1 == 0) revert PairHasNoLiquidity();

        if (joePair.token0() == address(this)) {
            return (uint256(reserve0), uint256(reserve1));
        }
        return (uint256(reserve1), uint256(reserve0));
    }

    function quoteTokensForAvax(uint256 avaxAmount) public view returns (uint256 tokenAmount) {
        if (avaxAmount == 0) revert ZeroAmount();
        getDexReserves();

        address[] memory path = new address[](2);
        path[0] = wavax;
        path[1] = address(this);

        uint256[] memory amounts = IJoeRouter(dexRouter).getAmountsOut(avaxAmount, path);
        return amounts[1];
    }

    function buyWithAvax(uint256 minTokenOut) external payable nonReentrant returns (uint256 tokenAmount) {
        if (msg.value == 0) revert ZeroAmount();

        tokenAmount = quoteTokensForAvax(msg.value);
        if (tokenAmount < minTokenOut) revert SlippageExceeded(minTokenOut, tokenAmount);

        uint256 inventory = balanceOf(address(this));
        if (inventory < tokenAmount) revert InsufficientSaleInventory(inventory, tokenAmount);

        _transfer(address(this), msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }

    function withdrawAvax(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert ZeroAddress();

        uint256 available = address(this).balance;
        if (amount > available) revert InsufficientTreasuryBalance(available, amount);

        (bool success, ) = recipient.call{ value: amount }("");
        if (!success) revert NativeTransferFailed();

        emit TreasuryWithdrawal(recipient, amount);
    }
}
