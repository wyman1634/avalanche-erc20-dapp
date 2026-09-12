// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockJoeFactory {
    mapping(address => mapping(address => address)) public getPair;

    function setPair(address tokenA, address tokenB, address pair) external {
        getPair[tokenA][tokenB] = pair;
        getPair[tokenB][tokenA] = pair;
    }
}

contract MockJoePair {
    address public immutable token0;
    address public immutable token1;

    uint112 private reserve0;
    uint112 private reserve1;

    constructor(address tokenA, address tokenB) {
        token0 = tokenA;
        token1 = tokenB;
    }

    function setReserves(uint112 newReserve0, uint112 newReserve1) external {
        reserve0 = newReserve0;
        reserve1 = newReserve1;
    }

    function getReserves() external view returns (uint112, uint112, uint32) {
        return (reserve0, reserve1, uint32(block.timestamp));
    }
}

contract MockJoeRouter {
    address public immutable factory;
    address public immutable WAVAX;
    uint256 public tokensPerAvax;

    constructor(address factoryAddress, address wrappedAvax, uint256 initialTokensPerAvax) {
        factory = factoryAddress;
        WAVAX = wrappedAvax;
        tokensPerAvax = initialTokensPerAvax;
    }

    function setTokensPerAvax(uint256 newTokensPerAvax) external {
        tokensPerAvax = newTokensPerAvax;
    }

    function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts) {
        require(path.length == 2 && path[0] == WAVAX, "invalid path");
        amounts = new uint256[](2);
        amounts[0] = amountIn;
        amounts[1] = (amountIn * tokensPerAvax) / 1 ether;
    }
}
