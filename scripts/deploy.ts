import { ethers } from "hardhat";

async function main() {
  const BatchTransferContract = await ethers.getContractFactory(
    "BatchTransferContract"
  );
  const batchTransferContract = await BatchTransferContract.deploy();
  await batchTransferContract.deployed();
  console.log(`BatchTransafer address ${batchTransferContract.address}`);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
