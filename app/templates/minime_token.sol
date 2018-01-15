pragma solidity ^0.4.18;

<%import_contracts()%>

contract <%= _symbol %>Token <%inherit()%> {

  function <%= _symbol %>Token (address _tokenFactory)
    MiniMeToken(
      _tokenFactory,
      0x0,
      0,
      "<%= _name %>",
      <%= _decimals %>,
      "<%= _symbol %>",
      false
    ){}
}

<% function inherit() {%>is MiniMeToken
<%}%>



<% function import_contracts() {%>
import './minime/MiniMeToken.sol';
<%}%>
