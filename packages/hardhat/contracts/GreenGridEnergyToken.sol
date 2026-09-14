// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract GreenGridEnergyToken is ERC20, ERC20Burnable, Ownable {
    error EmptyAssetDocument();

    string public assetDocument;

    event CertificatesIssued(address indexed issuer, address indexed recipient, uint256 amount);
    event AssetDocumentUpdated(string previousDocument, string newDocument, address indexed updater);

    constructor(
        address initialOwner,
        string memory initialAssetDocument
    ) ERC20("GreenGrid Solar Energy Credit", "GGSC") Ownable(initialOwner) {
        if (bytes(initialAssetDocument).length == 0) revert EmptyAssetDocument();
        assetDocument = initialAssetDocument;
        emit AssetDocumentUpdated("", initialAssetDocument, initialOwner);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit CertificatesIssued(_msgSender(), to, amount);
    }

    function updateAssetDocument(string calldata newAssetDocument) external onlyOwner {
        if (bytes(newAssetDocument).length == 0) revert EmptyAssetDocument();

        string memory previousDocument = assetDocument;
        assetDocument = newAssetDocument;
        emit AssetDocumentUpdated(previousDocument, newAssetDocument, _msgSender());
    }
}
