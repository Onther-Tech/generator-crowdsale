const MultiAccountRefundVault = artifacts.require("MultiAccountRefundVault.sol");
const <%=_symbol%>Crowdsale = artifacts.require("<%=_symbol%>Crowdsale.sol");

//TODO: kycIncluded, vault ether distribution

module.exports = async function (deployer, network, accounts) {
  const logAccount = (account, i) => console.log(`[${ i }] ${ account }`);
  accounts.map(logAccount);

  let <%=_symbol%>Token_address, MultiAccountRefundVault_address

  try {
    deployer.deploy(
      MultiAccountRefundVault,
      <%=wallets%>,
      <%=distributionRates%>
    ).then(async () => {
      await <%=_symbol%>Token_address = <%=_symbol%>Token.deployed();
      await MultiAccountRefundVault_address = MultiAccountRefundVault.deployed();

      deployer.deploy(
        <%=_symbol%>Crowdsale,
        <%=_symbol%>Token_address,
        MultiAccountRefundVault_address,
      );
    })
  } catch (e) {
    console.log(e)
  }
}
