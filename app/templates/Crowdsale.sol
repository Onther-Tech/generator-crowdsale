pragma solidity ^0.4.18;

<%import_contracts()%>

contract <%= _symbol %>Crowdsale <%inherit()%> {

  using SafeMath for uint256;

  MultiAccountRefundVault public vault;
  <%= _symbol %>Token public token;
  <% if(_maxBuyerFundedIncluded) {%>uint public maxBuyerFunded = <%= _maxBuyerFunded %> ether;<% } %>
  <% if(_tokenDistributionIncluded) { %>address[] public tokenDistributionWallets;
  uint[] public tokenDistributionRatios;<% } %>
  <% if(_kycIncluded) {%>KYC public kyc;<% } %>

  uint public maxEtherCap;
  uint public minEtherCap;
  mapping (address => uint) public beneficiaryFunded;
  address public nextTokenOwner;
  <% if(_tokenDistributionIncluded) {%>uint public contributorsRatio = <%= _contributorsRatio %>;<% } %>
  uint public startTime;
  uint public endTime;
  bool public isFinalized;
  uint public finalizedTime;
  uint public weiRaised;

  event ClaimedTokens(address indexed claimToken, address owner, uint balance);
  event Finalized();
  event CrowdSaleTokenPurchase(address indexed buyer, address indexed beneficiary, uint indexed toFund, uint tokens);

  function <%= _symbol %>Crowdsale (
    <% if(_kycIncluded) {%>address _kyc,
    <% } %>address _vault,
    address _token,
    <% if(_tokenDistributionIncluded) {%>address[] _tokenDistributionWallets,
    uint[] _tokenDistributionRatios,
    <% } %>uint _startTime,
    uint _endTime,
    uint _maxEtherCap,
    uint _minEtherCap,
    <% if(_maxBuyerFundedIncluded) {%>uint _maxBuyerFunded,
    <% } %>address _nextTokenOwner,
    <% if(_rateVariablility) {%>uint[] _tokenRates,
    uint[] _tokenRateTimelines<% } else { %>uint _tokenRate<% } %>
    ) Rate(
      <% if(_rateVariablility) {%>_tokenRates,
      _tokenRateTimelines<% } else { %>_tokenRate<% } %>
      )
    {
      <% if(_kycIncluded) {%>kyc = KYC(_kyc);<% } %>
      vault = MultiAccountRefundVault(_vault);
      token = <%= _symbol %>Token(_token);
      <% if(_tokenDistributionIncluded) {%>tokenDistributionWallets = _tokenDistributionWallets;
      tokenDistributionRatios = _tokenDistributionRatios;<% } %>
      startTime = _startTime;
      endTime = _endTime;
      maxEtherCap = _maxEtherCap;
      minEtherCap = _minEtherCap;
      <% if(_maxBuyerFundedIncluded) {%>maxBuyerFunded = _maxBuyerFunded;<% } %>
      nextTokenOwner = _nextTokenOwner;

    }
  function () public payable {
    buy(msg.sender);
  }

  function buy(address beneficiary)
    public
    payable
    whenNotPaused
  {
    require(beneficiary != 0x00);
    <% if(_kycIncluded) {%>
    require(kyc.registeredAddress(beneficiary));<% } %>
    require(validPurchase());
    require(!isFinalized);

    uint weiAmount = msg.value;
    uint toFund;
    uint postWeiRaised = weiRaised.add(weiAmount);

    if (postWeiRaised > maxEtherCap) {
      toFund = maxEtherCap.sub(weiRaised);
    } else {
      toFund = weiAmount;
    }
    <% if(_maxBuyerFundedIncluded)
    {%>if (toFund.add(beneficiaryFunded[beneficiary]) > maxBuyerFunded) {
      toFund = maxBuyerFunded.sub(beneficiaryFunded[beneficiary]);
    }<% } %>

    require(toFund > 0);
    uint rate = getRate();
    uint tokens = toFund.mul(rate);
    uint toReturn = weiAmount.sub(toFund);

    weiRaised = weiRaised.add(toFund);
    beneficiaryFunded[beneficiary] = beneficiaryFunded[beneficiary].add(toFund);

    <% if (_tokenType == 'zeppelin') { %>
    token.mint(beneficiary, tokens);
    <% } else {%>
    token.generateTokens(beneficiary, tokens);
    <% } %>

    if (toReturn > 0) {
      msg.sender.transfer(toReturn);
    }
    forwardFunds(toFund);
    CrowdSaleTokenPurchase(msg.sender, beneficiary, toFund, tokens);
  }

  function validPurchase() internal view returns (bool) {
    bool nonZeroPurchase = msg.value != 0;
    return nonZeroPurchase && !maxReached();
  }

  function forwardFunds(uint256 toFund) internal {
    vault.deposit.value(toFund)(msg.sender);
  }

  /**
   * @dev Checks whether minEtherCap is reached
   * @return true if min ether cap is reaced
   */
  function minReached() public view returns (bool) {
    return weiRaised >= minEtherCap;
  }
  /**
   * @dev Checks whether maxEtherCap is reached
   * @return true if max ether cap is reaced
   */
  function maxReached() public view returns (bool) {
    return weiRaised == maxEtherCap;
  }

  function finalize() public onlyOwner {
    require(!isFinalized);
    require(now > endTime || maxReached());

    finalizedTime = now;

    finalization();
    Finalized();

    isFinalized = true;
  }

  /**
   * @dev end token minting on finalization, mint tokens for dev team and reserve wallets
   */
  function finalization() internal {
    if (minReached()) {
      vault.close();
      <% if (_tokenDistributionIncluded) { %>
      distributeToken();
      <% } %>
      //TODO: token transfer enable needed ?
    } else {
      vault.enableRefunds();
    }
    //TODO: finish token minting ?
    <% if (_tokenType == 'zeppelin') { %>
    token.transferOwnership(nextTokenOwner);<% } else {%>
    token.changeController(nextTokenOwner);
    <% } %>
  }

  <% if (_tokenDistributionIncluded) { %>
  function distributeToken() internal {

    uint contributorsToken = token.totalSupply();
    uint distributionAmount;

    for (uint i = 0; i < tokenDistributionWallets.length; i++) {
      distributionAmount = contributorsToken.mul(tokenDistributionRatios[i]).div(contributorsRatio);
      <% if (_tokenType == 'zeppelin') { %>
      token.mint(tokenDistributionWallets[i], distributionAmount);
      <% } else {%>
      token.generateTokens(tokenDistributionWallets[i], distributionAmount);
      <% } %>
    }
  }
  <% } %>

  function claimRefund(address investor) public {
    require(isFinalized);
    require(!minReached());

    vault.refund(investor);
  }


  function claimTokens(address _claimToken) public onlyOwner {
    <% if (_tokenType == 'zeppelin') { %>
    if (token.owner() == address(this)) {
      token.claimTokens(_claimToken);
    }
    <% } else { %>
    if (token.controller() == address(this)) {
         token.claimTokens(_claimToken);
    }
    <% } %>
    if (_claimToken == 0x0) {
        owner.transfer(this.balance);
        return;
    }
    ERC20Basic claimToken = ERC20Basic(_claimToken);
    uint balance = claimToken.balanceOf(this);
    claimToken.transfer(owner, balance);

    ClaimedTokens(_claimToken, owner, balance);
  }
}


<%function inherit() {%>is Rate, Ownable, Pausable<%}%>

<% function import_contracts() {%>
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/lifecycle/Pausable.sol';
import './Rate.sol';
import './zeppelin/token/ERC20Basic.sol';
import './MultiAccountRefundVault.sol';
import './<%= _symbol %>Token.sol';<% if (_kycIncluded) { %>
import './KYC.sol';<% } %>
<%}%>
