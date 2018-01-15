const <%=_symbol%>Token = artifacts.require("<%=_symbol%>Token.sol");

module.exports = async function (deployer, network, accounts) {
  const logAccount = (account, i) => console.log(`[${ i }] ${ account }`);
  accounts.map(logAccount);

  try {
    deployer.deploy(<%=_symbol%>Token)
  } catch (e) {
    console.log(e)
  }
}
