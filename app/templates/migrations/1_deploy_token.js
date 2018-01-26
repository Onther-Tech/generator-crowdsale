const <%=token_symbol%>Token = artifacts.require("<%=token_symbol%>Token.sol");

module.exports = async function (deployer, network, accounts) {
  const logAccount = (account, i) => console.log(`[${ i }] ${ account }`);
  accounts.map(logAccount);

  try {
    deployer.deploy(<%= token_symbol %>Token)
  } catch (e) {
    console.log(e)
  }
}
