pragma solidity ^0.4.18;

<%import_contracts()%>

//TODO: maxBuyerFunded
contract <%= _symbol %>Crowdsale <%inherit()%> {

  using SafeMath for uint256;

  address vault;
  address token;
  <% if(_tokenDistributionIncluded) { %>address[] public tokenDistributionWallets;
  uint[] public tokenDistributionRatios;<% } %>
  <% if(_kycIncluded) {%>address public kyc;<% } %>

  uint public maxEtherCap;
  uint public minEtherCap;
  mapping (address => uint) public beneficiaryFunded;
  uint finalizedTime;
  address nextTokenOwner;

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
    address _nextTokenOwner,
    <% if(_rateVariablility) {%>uint[] _tokenRates,
    uint[] _tokenRateTimelines<% } else { %>uint _tokenRate<% } %>
    ) Rate(
      <% if(_rateVariablility) {%>_tokenRates,
      _tokenRateTimelines<% } else { %>_tokenRate<% } %>
      )
    {
      <% if(_kycIncluded) {%>kyc = _kyc;<% } %>
      vault = _vault;
      token = _token;
      <% if(_tokenDistributionIncluded) {%>tokenDistributionWallets = _tokenDistributionWallets;
      tokenDistributionRatios = _tokenDistributionRatios;<% } %>
      startTime = _startTime;
      endTime = _endTime;
      maxEtherCap = _maxEtherCap;
      minEtherCap = _minEtherCap;
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

    uint rate = getRate();
    uint tokens = mul(toFund, rate);
    uint toReturn = sub(weiAmount, toFund);

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
    for (uint i = 0; i < tokenDistributionWallets; i++) {
      distributionAmount = contributorsToken.mul(tokenDistributionRatios[i]).div(<%= _contributorsRatio %>)
      <% if (_tokenType == 'zeppelin') { %>
      token.mint(tokenDistributionWallets[i], distributionAmount);
      <% } else {%>
      token.generateTokens(tokenDistributionWallets[i], distributionAmount);
      <% } %>
    }
  }
  <% } %>

  function claimRefund(address investor) returns (bool) {
    require(isFinalized);
    require(!minReached());

    return vault.refund(investor);
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
    uint256 balance = claimToken.balanceOf(this);
    claimToken.transfer(owner, balance);

    ClaimedTokens(_claimToken, owner, balance);
  }
}


<%function inherit() {%>is Ownable, SafeMath, Pausable, Rate, ERC20Basic<%}%>

<% function import_contracts() {%>
import './zeppelin/ownership/Ownable.sol';
import './zeppelin/math/SafeMath.sol';
import './zeppelin/lifecycle/Pausable.sol';
import './Rate.sol';
import './zeppelin/token/ERC20Basic.sol';
<%}%>
