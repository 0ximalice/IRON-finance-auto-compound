const { ethers } = require("ethers");
var fs = require('fs');
require('dotenv').config()

// Customize your own
var compoundEvery = 1800; // second unit
var myVaultContract = "";

// If you don't specify a //url//, Ethers connects to the default 
// (i.e. ``http:/\/localhost:8545``)
const provider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com/");

// The provider also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, we need the account signer...
var wallet = new ethers.Wallet(process.env.MOMOPARADISE, provider);

async function compound() {
  console.log("____________________________ TITAN AUTO COMPOUND (by github.com/imalic3)_____________________________\n");

  var blockNumber = await provider.getBlockNumber();
  console.log("Signer address:", (await wallet.getAddress()));
  console.log("Current block:", blockNumber);
  console.log("Compound every:", (compoundEvery/2), "blocks\n")

  fs.readFile('./vault.json', async function (err, data) {
    if (err) {
      throw err; 
    }

    let json = JSON.parse(data);
    var vault = await new ethers.Contract(myVaultContract, json.result); // Contract

    fs.readFile('./titan.json', async function (err, titanData) {
      if (err) {
        throw err; 
      }

      let titanJson = JSON.parse(titanData);
      var titan = await new ethers.Contract('0xaaa5b9e6c589642f98a1cda99b9d024b8407285a', titanJson.result); // Titan Token Contract

      var compoundBlock = blockNumber + (compoundEvery/2); // Polygon produces the block every 2 seconds
      
      const info = await vault.connect(wallet).info();
      console.log("LPs balance in farm: ", ethers.utils.formatEther(info[1].toString()), "LPs");
      console.log("Pending rewards: (Componding)", ethers.utils.formatEther(info[2].toString()), "TITAN");
      console.log("TITAN balance on vault (Uncompounded):", ethers.utils.formatEther(await titan.connect(wallet).balanceOf(vault.address)), "TITAN");
      console.log("Compounding TITAN -> Swap -> LPs...");

      try {
        const txn = await vault.connect(wallet).compound();
        await txn.wait().then(function(transaction) {
          console.log("Done!");
        });
      } catch (err) {
          console.log(err)
      }
      
      console.log("\nApproximately next compounded block:", (compoundBlock), "\n...");
    });
  });
}

compound();
setInterval(function(){ compound(); }, compoundEvery * 1000);



