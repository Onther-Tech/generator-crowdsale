pragma solidity ^0.4.18;
<% if (token_type == 'zeppelin') { %>
import './zeppelin/token/StandardToken.sol';
<%   } else { %>
import './minime/MiniMeToken.sol';
<% } %>

contract Token <%token_inherit()%>
  {
  string public name = <%= _name %>;
  string public symbol = <%= _symbol %>;
  uint8 public decimals = <%= _decimals %>;
}

<% function token_inherit() {%><% if (token_type == 'zeppelin') { %>is StandardToken<% } else{ %>is MiniMeToken<% } %><%if(includeBurnable){%>, BurnableToken<%}%><%if(includePausable){%>, PausableToken<%}%><%if(includeMintable){%>, MintableToken<%}%><%if(includeVesting){%>, TokenVesting<%}%><% } %>
