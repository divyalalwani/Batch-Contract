import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

//import { BigNumber} from 'ethers';
//import { string } from "hardhat/internal/core/params/argumentTypes";

describe("Batch contract", () => {
  let batchcontract: Contract;
  let ERC20contract: Contract;
  let ERC20contract2: Contract;
  let signers: SignerWithAddress[];
  let Batchaddress: string;
  let Tokenaddress1: string;
  let Tokenaddress2: string;
  let owner: string;
  let userOne: string;
  let userTwo: string;

  before(async () => {
    const Batch = await ethers.getContractFactory("BatchTransferContract");
    batchcontract = await Batch.deploy();
    await batchcontract.deployed();
    // Kindly copy the Token.sol file to contracts folder;
    const ERC20 = await ethers.getContractFactory("Token");
    ERC20contract = await ERC20.deploy("Amrit", "AMRT");
    await ERC20contract.deployed();
    ERC20contract2 = await ERC20.deploy("Amrit2", "AMRT2");
    await ERC20contract2.deployed();
    signers = await ethers.getSigners();
    Batchaddress = batchcontract.address;
    Tokenaddress1 = ERC20contract.address;
    Tokenaddress2 = ERC20contract2.address;
    owner = signers[0].address;
    userOne = signers[0].address;
    userTwo = signers[0].address;
  });

  describe("batchTransferMultiTokens()", () => {
    it("should be reverted if the amount is greater than the token address length", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "20", "30"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the contract address is not passed", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [],
        [userOne, userTwo],
        ["10", "20", "30"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient address is not passed", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [],
        ["10", "20", "30"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount is not passed", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
  });

  describe("batchTransferMultiTokensForApproval", () => {
    it("should be reverted if the there is no approval for batch contract", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "10"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if there is approval for one smart contract", async () => {
      await ERC20contract.approve(Batchaddress, 10000);
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "10"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if there is no approval for second smart contract", async () => {
      await ERC20contract2.approve(Batchaddress, 10000);
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "100000000000000000"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the recipient address is zero/empty", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        ["0x0000000000000000000000000000000000000000", userTwo],
        ["10", "10"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the amount is empty", async () => {
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
  });

  describe("batchTransferMultiTokensForApproval", () => {
    it("should be reverted if the approval is given by different users", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, 10000);
      await ERC20contract2.approve(Batchaddress, 1000);
      const transaction = batchcontract
        .connect(signers[2])
        .batchTransferMultiTokens(
          [Tokenaddress1, Tokenaddress2],
          [userOne, userTwo],
          ["10000", "10000"]
        );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the user does not hold enough tokens", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, 10000);
      await ERC20contract2.connect(signers[2]).approve(Batchaddress, 1000);
      const transaction = batchcontract
        .connect(signers[2])
        .batchTransferMultiTokens(
          [Tokenaddress1, Tokenaddress2],
          [userOne, userTwo],
          ["10000", "10000"]
        );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the amount is greater than approved tokens", async () => {
      await ERC20contract.approve(Batchaddress, 10);
      await ERC20contract2.approve(Batchaddress, 10);
      const transaction = batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10000", "10000"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
  });
  describe("batchTransferMultiTokensCompleted", () => {
    it("batchTransferMultiTokens function should be completed successfully", async () => {
      await ERC20contract.approve(Batchaddress, 1000);
      await ERC20contract2.approve(Batchaddress, 1000);
      const balanceuser1 = await ERC20contract.balanceOf(signers[7].address);
      const balanceuser2 = await ERC20contract2.balanceOf(signers[8].address);
      console.log(",", balanceuser1, ",", balanceuser2);
      const transaction = await batchcontract.batchTransferMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [signers[7].address, signers[8].address],
        ["1000", "1000"]
      );
      const receive = await transaction.wait();
      const args = receive.events[4].args;
      const balanceuserAfter1 = await ERC20contract.balanceOf(
        signers[7].address
      );
      const balanceuserAfter2 = await ERC20contract2.balanceOf(
        signers[8].address
      );
      console.log(",", balanceuserAfter1, ",", balanceuserAfter2);
      expect(balanceuserAfter1).to.equals(balanceuser1 + 1000);
      expect(balanceuserAfter2).to.equals(balanceuser2 + 1000);
    });
  });

  describe("simpleBatchTransferToken", () => {
    it("should be reverted if the recipient contract array length is less than amount array length", async () => {
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [userOne, userTwo, userOne],
        ["100", "200", "10", "1000"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient contract array length is greater than amount array length", async () => {
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [userOne, userTwo, userOne],
        ["100", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient address is not passed", async () => {
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [],
        ["10"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount parameter is not passed", async () => {
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [userOne, userTwo, userOne],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount parameter is not passed", async () => {
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [userOne, userTwo],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the batch contract does not have the allowance to pay", async () => {
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [userOne, userTwo],
        ["100", "200"]
      );
      expect(transaction).to.be.revertedWith("BatchTransfer Token failed");
    });
    it("should be reverted if the user does not have the funds to transfer", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, "100000");
      const transaction = batchcontract
        .connect(signers[2])
        .simpleBatchTransferToken(
          Tokenaddress1,
          [userOne, userTwo],
          ["100", "200"]
        );
      await expect(transaction).to.revertedWith("BatchTransfer Token failed");
    });
    it("should be reverted if the approval is from different contract but is being called from another contract", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, "10000");
      const transaction = batchcontract
        .connect(signers[2])
        .simpleBatchTransferToken(
          ERC20contract2.address,
          [userOne, userTwo],
          ["100", "200"]
        );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the approved balance is less than the total amount", async () => {
      await ERC20contract.approve(Batchaddress, "200");
      const transaction = batchcontract.simpleBatchTransferToken(
        ERC20contract2.address,
        [userOne, userTwo],
        ["1000", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the recipient address is zero bytes", async () => {
      await ERC20contract.approve(Batchaddress, "1000");
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        ["0x0000000000000000000000000000000000000000", userTwo],
        ["500", "500"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if every recipient's address is zero bytes", async () => {
      await ERC20contract.approve(Batchaddress, "1000");
      const transaction = batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
        ],
        ["500", "500"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
  });
  describe("simpleBatchTransferToken function should complete", () => {
    it("simpleBatchTransferToken should be completed successfully with event logs", async () => {
      await ERC20contract.approve(Batchaddress, "2000");
      const balanceuserOne = await ERC20contract.balanceOf(signers[7].address);
      const balanceuserTwo = await ERC20contract.balanceOf(signers[8].address);
      const transaction = await batchcontract.simpleBatchTransferToken(
        Tokenaddress1,
        [signers[7].address, signers[8].address],
        ["500", "1500"]
      );
      const receive = await transaction.wait();
      const args = receive.events;
      const balanceuserOneAfter = await ERC20contract.balanceOf(
        signers[7].address
      );
      const balanceuserTowAfter = await ERC20contract.balanceOf(
        signers[8].address
      );
      expect(balanceuserOneAfter).to.equals(balanceuserOne.add(500));
      expect(balanceuserTowAfter).to.equals(balanceuserTwo.add(1500));
    });
  });

  describe("batchTransferToken", () => {
    it("should be reverted if the recipient contract array length is less than amount array length", async () => {
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [userOne, userTwo, userOne],
        ["100", "200", "10", "1000"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient contract array length is greater than amount array length", async () => {
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [userOne, userTwo, userOne],
        ["100", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient address is not passed", async () => {
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [],
        ["10"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount parameter is not passed", async () => {
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [userOne, userTwo, userOne],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount parameter is not passed", async () => {
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [userOne, userTwo],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the batch contract does not have the allowance to pay", async () => {
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [userOne, userTwo],
        ["100", "200"]
      );
      expect(transaction).to.be.revertedWith("BatchTransfer Token failed");
    });
    it("should be reverted if the user does not have the funds to transfer", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, "100000");
      const transaction = batchcontract
        .connect(signers[2])
        .batchTransferToken(Tokenaddress1, [userOne, userTwo], ["100", "200"]);
      await expect(transaction).to.revertedWith("BatchTransfer Token failed");
    });
    it("should be reverted if the approval is from different contract but is being called from another contract", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, "10000");
      const transaction = batchcontract
        .connect(signers[2])
        .batchTransferToken(
          ERC20contract2.address,
          [userOne, userTwo],
          ["100", "200"]
        );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the approved balance is less than the total amount", async () => {
      await ERC20contract.approve(Batchaddress, "200");
      const transaction = batchcontract.batchTransferToken(
        ERC20contract2.address,
        [userOne, userTwo],
        ["1000", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "Error: insufficient allowance provided to the contract"
      );
    });
    it("should be reverted if the recipient address is zero bytes", async () => {
      await ERC20contract.approve(Batchaddress, "1000");
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        ["0x0000000000000000000000000000000000000000", userTwo],
        ["500", "500"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if every recipient's address is zero bytes", async () => {
      await ERC20contract.approve(Batchaddress, "1000");
      const transaction = batchcontract.batchTransferToken(
        Tokenaddress1,
        [
          "0x0000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000",
        ],
        ["500", "500"]
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
  });
  describe("batchTransferToken function should complete", () => {
    it("batchTransferToken should be completed successfully with event logs", async () => {
      await ERC20contract.approve(Batchaddress, "2000");
      const balanceuserOne = await ERC20contract.balanceOf(signers[5].address);
      const balanceuserTwo = await ERC20contract.balanceOf(signers[6].address);
      //console.log("before balance ,",balanceuserOne, ", balance of two,", balanceuserTwo)
      const transaction = await batchcontract.batchTransferToken(
        Tokenaddress1,
        [signers[5].address, signers[6].address],
        ["500", "1500"]
      );
      const receive = await transaction.wait();
      const args = receive.events;
      const balanceuserOneAfter = await ERC20contract.balanceOf(
        signers[5].address
      );
      const balanceuserTowAfter = await ERC20contract.balanceOf(
        signers[6].address
      );
      //console.log("after balance",balanceuserOneAfter, "before balance",balanceuserTowAfter);
      //console.log({args});
      expect(balanceuserOneAfter).to.equals(balanceuserOne + 500);
      expect(balanceuserTowAfter).to.equals(balanceuserTwo + 1500);
    });
  });
  describe("batchTransfer() revert functions", () => {
    it("should be reverted if the recipient array length is less than amount array length", async () => {
      const transaction = batchcontract.batchTransfer(
        [userOne],
        ["100", "2000"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input array must have the same length"
      );
    });
    it("should be reverted if the recipient array length is greater than amount array length", async () => {
      const transaction = batchcontract.batchTransfer(
        [userOne, userTwo],
        ["100"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input array must have the same length"
      );
    });
    it("should be reverted if the recipient address is empty", async () => {
      const transaction = batchcontract.batchTransfer([], ["100", "2000"]);
      await expect(transaction).to.be.revertedWith(
        "The input array must have the same length"
      );
    });
    it("should be reverted if the amount is empty", async () => {
      const transaction = batchcontract.batchTransfer([userOne, userTwo], []);
      await expect(transaction).to.be.revertedWith(
        "The input array must have the same length"
      );
    });
    it("should be reverted if ethers are not allowed to spend", async () => {
      const transaction = batchcontract.batchTransfer(
        [userOne, userTwo],
        ["1000", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "Insufficient balance passed"
      );
    });
    it("should be reverted if the first recipient's address is zero bytes", async () => {
      const price = 30;
      const transaction = batchcontract.batchTransfer(
        ["0x0000000000000000000000000000000000000000", userTwo],
        ["10", "20"],
        { value: price }
      );
      await expect(transaction).to.be.revertedWith("Recipient address is zero");
    });
    it("should be reverted if the second recipient's address is zero bytes", async () => {
      const price = 30;
      const transaction = batchcontract.batchTransfer(
        [userOne, "0x0000000000000000000000000000000000000000"],
        ["10", "20"],
        { value: price }
      );
      await expect(transaction).to.be.revertedWith("Recipient address is zero");
    });
    it("should be reverted if the amount is less than available ethers", async () => {
      const Ethprice = 3000000;
      const transaction = batchcontract.batchTransfer(
        [userOne, userTwo],
        ["100", "200"],
        { value: Ethprice }
      );
      await expect(transaction).to.be.revertedWith(
        "Insufficient balance passed"
      );
    });
    it("should be reverted if the amount is greater than available ethers", async () => {
      const Ethprice = 10;
      const transaction = batchcontract.batchTransfer(
        [userOne, userTwo],
        ["100", "200"],
        { value: Ethprice }
      );
      await expect(transaction).to.be.revertedWith(
        "Insufficient balance passed"
      );
    });
  });

  describe("batchTransfer() completed ", () => {
    it("should be completed successfully even if we pass zero ethers", async () => {
      const Ethprice = 10;
      const ethebalance1 = await signers[1].getBalance();
      const ethebalance2 = await signers[2].getBalance();
      const transaction = await batchcontract.batchTransfer(
        [userOne, userTwo],
        ["10", "0"],
        { value: Ethprice }
      );
      const receipt = await transaction.wait();
      // console.log({receipt});
    });
    it("should be completed successfully without any issue", async () => {
      const Ethprice = 50;
      const ethebalance1 = await signers[3].getBalance();
      const ethebalance2 = await signers[4].getBalance();
      //console.log(",",ethebalance1,",",ethebalance2);
      const transaction = await batchcontract.batchTransfer(
        [signers[3].address, signers[4].address],
        ["20", "30"],
        { value: Ethprice }
      );
      const receipt = await transaction.wait();
      //await new Promise(r => setTimeout(r,100));
      const ethebalanceAfter1 = await signers[3].getBalance();
      const ethebalanceAfter2 = await signers[4].getBalance();
      // console.log(",",ethers.utils.formatEther(ethebalanceAfter1),",",ethers.utils.formatEther(ethebalanceAfter2));
      expect(ethebalanceAfter1).to.equals(ethebalance1.add(20));
      expect(ethebalanceAfter2).to.equals(ethebalance2.add(30));
    });
  });
  describe("batchTransferCombinedMultiTokens()", () => {
    it("should revert if the amount is greater than the token address length", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "20", "30"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the contract address is not passed", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [userOne, userTwo],
        ["10", "20", "30"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient's address is not passed", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [],
        ["10", "20", "30"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount is not passed", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        [],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
  });
  describe("batchTransferMultiTokensForApproval", () => {
    it("it should be reverted if the there is no approval for batch contract ", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "10"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if there is no approval for even a single contract", async () => {
      await ERC20contract.approve(Batchaddress, 10000);
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "10"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if there is no approval for another contract", async () => {
      await ERC20contract.approve(Batchaddress, 10000);
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10", "10"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the recipient address is zero/empty", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        ["0x0000000000000000000000000000000000000000", userTwo],
        ["10", "10"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the amount is empty", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        [],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
  });

  describe("batchTransferMultiTokensForApproval", () => {
    it("should be reverted if the user does not have the sufficient token in his balance", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, 10000);
      await ERC20contract2.approve(Batchaddress, 1000);
      const transaction = batchcontract
        .connect(signers[2])
        .batchTransferCombinedMultiTokens(
          [Tokenaddress1, Tokenaddress2],
          [userOne, userTwo],
          ["10000", "10000"],
          [],
          []
        );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the user does not hold enough Tokens", async () => {
      await ERC20contract.connect(signers[2]).approve(Batchaddress, 10000);
      await ERC20contract2.connect(signers[2]).approve(Batchaddress, 1000);
      const transaction = batchcontract
        .connect(signers[2])
        .batchTransferCombinedMultiTokens(
          [Tokenaddress1, Tokenaddress2],
          [userOne, userTwo],
          ["10000", "10000"],
          [],
          []
        );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
    it("should be reverted if the amount is greater than approved", async () => {
      await ERC20contract.approve(Batchaddress, 10);
      await ERC20contract2.approve(Batchaddress, 10);
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [userOne, userTwo],
        ["10000", "10000"],
        [],
        []
      );
      await expect(transaction).to.be.revertedWith(
        "BatchTransfer Token failed"
      );
    });
  });
  describe("batchTransferCombinedMultiTokensForEthers() revert functions", () => {
    it("should be reverted if the recipient array length is less than amount array length", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne],
        ["100", "2000"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the recipient array length is greater than amount array length", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne, userTwo],
        ["100"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the amount is empty", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne],
        ["1000", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "The input arrays must have the same length"
      );
    });
    it("should be reverted if the Ether were not allowed to spend", async () => {
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne, userTwo],
        ["1000", "200"]
      );
      await expect(transaction).to.be.revertedWith(
        "Insufficient balance passed"
      );
    });
    it("should be reverted if the first recipient's address is zero bytes", async () => {
      const price = 30;
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        ["0x0000000000000000000000000000000000000000", userTwo],
        ["10", "20"],
        { value: price }
      );
      await expect(transaction).to.be.revertedWith("Recipient address is zero");
    });
    it("should be reverted if the second recipient's address is zero bytes", async () => {
      const price = 30;
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne, "0x0000000000000000000000000000000000000000"],
        ["10", "20"],
        { value: price }
      );
      await expect(transaction).to.be.revertedWith("Recipient address is zero");
    });
    it("should be reverted if the amount is less than Ether funds", async () => {
      const Ethprice = 3000000;
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne, userTwo],
        ["100", "200"],
        { value: Ethprice }
      );
      await expect(transaction).to.be.revertedWith(
        "Insufficient balance passed"
      );
    });
    it("should be reverted if the amount is greater than Ether funds", async () => {
      const Ethprice = 10;
      const transaction = batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne, userTwo],
        ["100", "200"],
        { value: Ethprice }
      );
      await expect(transaction).to.be.revertedWith(
        "Insufficient balance passed"
      );
    });
  });

  describe("batchTransferCombinedMultiTokens() completed", () => {
    it("should be completed successfully even if we pass zero ethers", async () => {
      const Ethprice = 10;
      const ethebalance1 = await signers[1].getBalance();
      const ethebalance2 = await signers[2].getBalance();
      const transaction = await batchcontract.batchTransferCombinedMultiTokens(
        [],
        [],
        [],
        [userOne, userTwo],
        ["10", "0"],
        { value: Ethprice }
      );
      const receipt = await transaction.wait();
      // console.log({receipt});
    });
    it("should be completed successfully without any issue", async () => {
      const Ethprice = 50;
      const ethebalance1 = await signers[9].getBalance();
      const ethebalance2 = await signers[10].getBalance();
      await ERC20contract.approve(Batchaddress, 1000);
      await ERC20contract2.approve(Batchaddress, 1000);
      const balanceuser1 = await ERC20contract.balanceOf(signers[9].address);
      const balanceuser2 = await ERC20contract2.balanceOf(signers[10].address);
      //console.log(",",ethebalance1,",",ethebalance2);
      const transaction = await batchcontract.batchTransferCombinedMultiTokens(
        [Tokenaddress1, Tokenaddress2],
        [signers[9].address, signers[10].address],
        ["1000", "1000"],
        [signers[9].address, signers[10].address],
        ["20", "30"],
        { value: Ethprice }
      );
      const receipt = await transaction.wait();
      const args = receipt.events[4].args;
      const balanceuserAfter1 = await ERC20contract.balanceOf(
        signers[9].address
      );
      const balanceuserAfter2 = await ERC20contract2.balanceOf(
        signers[10].address
      );
      const ethebalanceAfter1 = await signers[9].getBalance();
      const ethebalanceAfter2 = await signers[10].getBalance();
      console.log(",", balanceuserAfter1, ",", balanceuserAfter2);
      expect(balanceuserAfter1).to.equals(balanceuser1 + 1000);
      expect(balanceuserAfter2).to.equals(balanceuser2 + 1000);
      expect(ethebalanceAfter1).to.equals(ethebalance1.add(20));
      expect(ethebalanceAfter2).to.equals(ethebalance2.add(30));
      console.log("Ether hexa converter", ethers.BigNumber.from("0x2a"));
      console.log(
        "Ether hexa converter 2nd value     === ",
        ethers.utils.defaultAbiCoder
          .decode(
            ["address"],
            "0x000000000000000000000000f05f8bc8a0d5fe5d2eb2fb1d0f900b20e71dd966"
          )[0]
          .toString()
      );
      console.log(
        "Ether hexa converter 3nd value     === ",
        ethers.utils.defaultAbiCoder
          .decode(
            ["uint256", "string"],
            "0x0000000000000000000000000000000000000000000000056bc75e2d63100000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000195472616e73666572205769746820486f6c6420746f6b656e7300000000000000"
          )
          .toString()
      );
    });
  });
});
