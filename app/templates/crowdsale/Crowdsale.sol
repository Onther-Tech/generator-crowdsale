pragma solidity ^0.4.18;

<%import_contracts()%>

contract <%= token_symbol %>Crowdsale <%inherit()%> {
  function <%= token_symbol %>Crowdsale (
    <% set_variable_list() %>
    )
    <% call_constructors() %>
}

<%function inherit() {%>is <% if(is_minime) { %>BaseCrowdsaleForMinime<% } else { %>BaseCrowdsaleForZeppelin<% } %><% if (!is_static) { %>, BonusCrowdsale<% } %><% if (kyc_for_mainsale) { %>, KYCCrowdsale<% } %><% if (max_purchase_limit !== 0) { %>, PurchaseLimitedCrowdsale<% } %><% if (min_purchase_limit !== 0) { %>, MinimumPaymentCrowdsale<% } %><% } %>

<% function import_contracts() {%>
<% if(is_minime) { %>import './crowdsale/BaseCrowdsaleForMinime.sol';<% } else { %>import './crowdsale/BaseCrowdsaleForZeppelin.sol';<% } %><% if (!is_static) { %>
import './crowdsale/BonusCrowdsale.sol';<% } %>
import './<%= token_symbol %>Token.sol';<% if (kyc_for_mainsale) { %>
import './crowdsale/KYCCrowdsale.sol';<% } %><% if (max_purchase_limit !== 0) { %>
import './crowdsale/PurchaseLimitedCrowdsale.sol';<% } %><% if (min_purchase_limit !== 0) { %>
import './crowdsale/MinimumPaymentCrowdsale.sol';<% } %>
<%}%>

<% function set_variable_list() { %>uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    uint256 _cap,
    uint256 _goal,
    address _vault,
    address _nextTokenOwner,
    address _token<% if (kyc_for_mainsale) { %>,
    address _kyc<% } %><% if (max_purchase_limit !== 0) { %>,
    uint256 _purchaseLimit<% } %><% if (min_purchase_limit !== 0) { %>,
    uint256 _minPayment<% } %><% } %>

<% function call_constructors() { %><% if(is_minime) { %>BaseCrowdsaleForMinime<% } else { %>BaseCrowdsaleForZeppelin<% } %>(
    _startTime,
    _endTime,
    _rate,
    _cap,
    _goal,
    _vault,
    _nextTokenOwner,
    _token
    )<% if (kyc_for_mainsale) { %>
    KYCCrowdsale(_kyc)<% } %><% if (max_purchase_limit !== 0) { %>
    PurchaseLimitedCrowdsale(_purchaseLimit)<% } %><% if (min_purchase_limit !== 0) { %>
    MinimumPaymentCrowdsale(_minPayment)<% } %> {}<% } %>
