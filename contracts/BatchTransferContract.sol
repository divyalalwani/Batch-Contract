// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BatchTransferContract is ReentrancyGuard {
  event BatchTransfer(
    address fromAddress,
    address[] indexed toAddress,
    uint[] recipientAmount
  );
  event BatchTransferMultiToken(
    address indexed fromAddress,
    address[] indexed tokenAddress,
    address[] indexed toAddress,
    uint[] recipientAmount
  );
  event BatchTransferToken(
    address indexed fromAddress,
    address indexed tokenAddress,
    address[] indexed toAddress,
    uint[] recipientAmount
  );
  event SimpleBatchTransferToken(
    address indexed fromAddress,
    address indexed tokenAddress,
    address[] indexed toAddress,
    uint[] recipientAmount
  );
  event BatchTransferCombinedMultiTokens(
    address indexed fromAddress,
    address[] indexed tokenAddress,
    address[] tokenRecipientAddress,
    uint[] tokenAmount,
    address[] indexed recipients,
    uint[] amount
  );

  function batchTransfer(
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external payable nonReentrant {
    uint totalEthers;
    require(
      recipients.length == amounts.length,
      "The input array must have the same length"
    );
    for (uint i = 0; i < recipients.length; i++) {
      require(recipients[i] != address(0), "Recipient address is zero");
      totalEthers += amounts[i];
    }
    require(msg.value == totalEthers, "Insufficient balance passed");
    for (uint i = 0; i < recipients.length; i++) {
      (bool success, ) = recipients[i].call{ value: amounts[i] }("");
      require(success, "BatchTransfer failed");
    }
    emit BatchTransfer(msg.sender, recipients, amounts);
  }

  fallback() external {}

  function simpleBatchTransferToken(
    address tokenAddress,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external nonReentrant {
    require(recipients.length == amounts.length,"The input arrays must have the same length");
    IERC20 requestedToken = IERC20(tokenAddress);
    for (uint256 i = 0; i < recipients.length; i++) {
      (bool status, ) = address(requestedToken).call(
        abi.encodeWithSignature(
          "transferFrom(address,address,uint256)",
          msg.sender,
          recipients[i],
          amounts[i]
        )
      );
      require(status, "BatchTransfer Token failed");
    }
    emit SimpleBatchTransferToken(
      msg.sender,
      tokenAddress,
      recipients,
      amounts
    );
  }

  function batchTransferMultiTokens(
    address[] calldata tokenAddress,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external nonReentrant {
    require(tokenAddress.length == recipients.length && tokenAddress.length == amounts.length, "The input arrays must have the same length");
    for (uint i = 0; i < tokenAddress.length; i++) {
      IERC20 requestedToken = IERC20(tokenAddress[i]);
      (bool success, ) = address(requestedToken).call(
        abi.encodeWithSignature(
          "transferFrom(address,address,uint256)",
          msg.sender,
          recipients[i],
          amounts[i]
        )
      );
      require(success, "BatchTransfer Token failed");
    }
    emit BatchTransferMultiToken(msg.sender, tokenAddress, recipients, amounts);
  }

  function batchTransferToken(
    address tokenAddress,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external nonReentrant {
    require(recipients.length == amounts.length,"The input arrays must have the same length");
    IERC20 requestedToken = IERC20(tokenAddress);
    uint256 amount = 0;

    for (uint256 i = 0; i < recipients.length; i++) {
      amount += amounts[i];
    }
    uint allowance = IERC20(tokenAddress).allowance(msg.sender, address(this));
    require(
      allowance >= amount,
      "Error: insufficient allowance provided to the contract"
    );
    (bool success, ) = address(requestedToken).call(abi.encodeWithSignature(
        "transferFrom(address,address,uint256)",msg.sender,address(this),amount)
    );
    require(success, "BatchTransfer Token failed");
    for (uint256 i = 0; i < recipients.length; i++) {
      (bool status, ) = address(requestedToken).call(abi.encodeWithSignature(
          "transfer(address,uint256)",recipients[i],amounts[i])
      );
      require(status, "BatchTransfer Token failed");
    }
    emit BatchTransferToken(msg.sender, tokenAddress, recipients, amounts);
  }

  function batchTransferCombinedMultiTokens(
    address[] calldata tokenAddress,
    address[] calldata tokenRecipients,
    uint256[] calldata tokenAmounts,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external payable nonReentrant {
    require(
      tokenAddress.length == tokenRecipients.length && tokenAddress.length == tokenAmounts.length && recipients.length == amounts.length,
      "The input arrays must have the same length"
    );
    uint256 totalEthers = 0;
    for (uint i = 0; i < recipients.length; i++) {
      require(recipients[i] != address(0), "Recipient address is zero");
      totalEthers += amounts[i];
    }
    require(msg.value == totalEthers, "Insufficient balance passed");
    for (uint i = 0; i < recipients.length; i++) {
      (bool success, ) = recipients[i].call{ value: amounts[i] }("");
      require(success, "BatchTransfer failed");
    }
    for (uint i = 0; i < tokenAddress.length; i++) {
      IERC20 requestedToken = IERC20(tokenAddress[i]);
      (bool success, ) = address(requestedToken).call(abi.encodeWithSignature(
        "transferFrom(address,address,uint256)",msg.sender,tokenRecipients[i],tokenAmounts[i])
      );
      require(success, "BatchTransfer Token failed");
    }
    emit BatchTransferCombinedMultiTokens(
      msg.sender,
      tokenAddress,
      tokenRecipients,
      tokenAmounts,
      recipients,
      amounts
    );
  }
}
