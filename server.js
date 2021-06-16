const { ethers } = require("ethers");
var fs = require("fs");
require("dotenv").config();

// Customize your own
var compoundEvery = 3600;
var myVaultContract = "";

const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc-mainnet.maticvigil.com/"
);
// The provider also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, we need the account signer...
var wallet = new ethers.Wallet(process.env.MOMOPARADISE, provider);

console.log(
  "____________________________ TITAN AUTO COMPOUND (by github.com/imalic3)_____________________________\n"
);

console.log("Signer address:", wallet.getAddress());
console.log("Compound every:", compoundEvery / 2, "blocks\n");

const vaultContractInterface = JSON.parse(
  fs.readFileSync("./quickswap.usdc_iron.lps.private.vault.json")
);
var vaultContract = new ethers.Contract(
  myVaultContract,
  vaultContractInterface.result,
  wallet
); // IRON vault contract

var nextCompoundedBlockNumber = 0;
provider.on("block", async (blockNumber) => {
  // check
  if (blockNumber < nextCompoundedBlockNumber) {
    return;
  }

  // affect
  nextCompoundedBlockNumber = compoundEvery / 2 + blockNumber; // Polygon produces the block every 2 seconds

  // interact
  const info = await vaultContract.info();
  console.log(
    "LPs balance in farm: ",
    ethers.utils.formatEther(info[1].toString()),
    "LPs"
  );
  console.log(
    "Pending rewards: (Componding)",
    ethers.utils.formatEther(info[2].toString()),
    "TITAN"
  );
  console.log("Compounding TITAN -> Swap -> LPs...");
  const txn = await vaultContract.connect(wallet).compound();
  await txn.wait().then(function (transaction) {
    console.log("Done!");
  });

  console.log("\nNext compounded block:", nextCompoundedBlockNumber, "\n...");
});
