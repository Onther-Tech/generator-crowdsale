pragma solidity ^0.4.18;

contract Rate {

  <% if(_rateVariablility) {%>uint[] public tokenRates;
  uint[] public tokenRateTimelines;<% } else { %>uint public tokenRate;<% } %>

  function Rate (
    <% if(_rateVariablility) {%>uint[] _tokenRates,
    uint[] _tokenRateTimelines<% } else { %>uint _tokenRate<% } %>
    ) {
      <% if(_rateVariablility) {%>tokenRates = _tokenRates;
      tokenRateTimelines = _tokenRateTimelines;<% } else { %>tokenRate = _tokenRate;<% } %>
    }

  function getRate() public view returns (uint256) {
    <% if(_rateVariablility) {%>uint presentRate;
      for (uint i = 0; i < tokenRateTimelines.length; i++) {
        if (now >= tokenRateTimelines[i]) {
          presentRate = tokenRates[i];
        } else {
          break;
        }
      return presentRate;
    }<% } else { %>return tokenRate;<% } %>
  }
}
