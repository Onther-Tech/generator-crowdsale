const MultiAccountRefundVault = artifacts.require("MultiAccountRefundVault.sol");
const <%=_symbol%>Crowdsale = artifacts.require("<%=_symbol%>Crowdsale.sol");
const <%=_symbol%>Token = artifacts.require("<%=_symbol%>Token.sol");
<% if (_kycIncluded) { %>const KYC = artifacts.require("KYC.sol"); <% } %>

module.exports = async function (deployer, network, accounts) {
  const logAccount = (account, i) => console.log(`[${ i }] ${ account }`);
  accounts.map(logAccount);

  let queue = [];
  const clearQueue = async () => {
    await Promise.all(queue);
    queue = [];
  };

  //params setting
  let <%= _symbol %>token, <%= _symbol %>crowdsale, multiAccountRefundVault;
  <% if (_kycIncluded) { %>let kyc;<%}%>
  const etherDistributionWallets = [<% for(var i = 0; i < _etherDistributionWallets.length; i++) {%>"<%= _etherDistributionWallets[i] %>"<% if(i != _etherDistributionWallets.length - 1) { %>,<% } %><% } %>];
  const etherDistributionRatios = [<%= _etherDistributionRatios %>];
  <% if(_tokenDistributionIncluded) {%>const tokenDistributionWallets = [<% for(var i = 0; i < _tokenDistributionWallets.length; i++) {%>"<%= _tokenDistributionWallets[i] %>"<% if(i != _tokenDistributionWallets.length - 1) { %>,<% } %><% } %>];
  const tokenDistributionRatios = [<%= _tokenDistributionRatios %>];
  <% } %>
  const startTime = <%= _startTime %>;
  const endTime = <%= _endTime %>;
  const maxEtherCap = <%= _maxEtherCap %>e18;
  const minEtherCap = <%= _minEtherCap %>e18;
  <% if(_maxBuyerFundedIncluded) {%>const maxBuyerFunded = <%= _maxBuyerFunded %>;<% } %>
  const nextTokenOwner = "<%= _nextTokenOwner%>";
  <% if(_rateVariablility) {%>const tokenRates = [<%= _tokenRates %>];
  const tokenRateTimelines = [<%= _tokenRateTimelines %>]<% } else { %>const tokenRate = <%= _tokenRate %><% } %>

  //deploy
  try {
    deployer.deploy([
      [
        MultiAccountRefundVault,
        etherDistributionWallets,
        etherDistributionRatios
      ]<% if (_kycIncluded) { %>,
      KYC<%}%>
    ]).then(async () => {
      <% if (_kycIncluded) { %>kyc = await KYC.deployed();<%}%>
      multiAccountRefundVault = await MultiAccountRefundVault.deployed();
      <%=_symbol%>token = await <%=_symbol%>Token.deployed();

      return deployer.deploy(
        <%=_symbol%>Crowdsale,
        <% if(_kycIncluded) {%>kyc.address,
        <% } %>multiAccountRefundVault.address,
        <%=_symbol%>token.address,
        <% if(_tokenDistributionIncluded) {%>tokenDistributionWallets,
        tokenDistributionRatios,
        <% } %>startTime,
        endTime,
        maxEtherCap,
        minEtherCap,
        <% if(_maxBuyerFundedIncluded) {%>maxBuyerFunded,
        <% } %>nextTokenOwner,
        <% if(_rateVariablility) {%>tokenRates,
        tokenRateTimelines<% } else { %>tokenRate<% } %>
      );
    }).then(async () => {
      <%= _symbol %>crowdsale = await <%= _symbol %>Crowdsale.deployed();
      queue.push(multiAccountRefundVault.transferOwnership(<%= _symbol %>crowdsale.address));
      <% if(_tokenType == 'zeppelin') { %>queue.push(<%= _symbol %>token.transferOwnership(<%= _symbol %>crowdsale.address));<% } else { %>queue.push(<%= _symbol %>token.changeController(<%= _symbol %>crowdsale.address));<% } %>

      return clearQueue();
    }).then(() => {
      console.log('Transfer vault ownership to crowdsale');
      console.log('Transfer token ownership to crowdsale');
    })
  } catch (e) {
    console.log(e)
  }
}
