const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = "onther onther onther onther onther onther onther onther onther onther onther onther ";
const providerUrl = "https://ropsten.infura.io";

const providerRopsten = new HDWalletProvider(mnemonic, providerUrl, 0);

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4500000,
      gasPrice: 30e9,
    },
    ropsten: {
      network_id: 3,
      provider: providerRopsten,
      gas: 4500000,
      gasPrice: 30e9,
    },
  },
};
