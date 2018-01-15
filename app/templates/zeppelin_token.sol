pragma solidity ^0.4.18;

<%import_contracts()%>

contract <%=_symbol %>Token <%inherit()%> {
  string public name = "<%= _name %>";
  string public symbol = "<%= _symbol %>";
  uint8 public decimals = <%= _decimals %>;
}

<% function inherit() {%>is StandardToken, MintableToken, ClaimableToken<%if(includeBurnable){%>, BurnableToken<%}%><%if(includePausable){%>, PausableToken<%}%><%if(includeVesting){%>, TokenVesting<%}%>
<%}%>

<% function import_contracts() {%>
import './zeppelin/token/StandardToken.sol';
import './zeppelin/MintableToken.sol';
import './ClaimableToken.sol';
<%if(includeBurnable) {%>import './zeppelin/BurnableToken.sol';<%}%>
<%if(includePausable) {%>import './zeppelin/PausableToken.sol';<%}%>
<%if(includeVesting) {%>import './zeppelin/TokenVesting.sol';<%}%>
<%}%>
