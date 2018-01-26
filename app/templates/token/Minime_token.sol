pragma solidity ^0.4.18;

<%import_contracts()%>

contract <%= token_symbol %>Token <%inherit()%> {

  function <%= token_symbol %>Token (address _tokenFactory)
    MiniMeToken(
      _tokenFactory,
      0x0,
      0,
      "<%= token_name %>",
      <%= decimal %>,
      "<%= token_symbol %>",
      false
    ){}
}

<% function inherit() {%>is MiniMeToken
<%}%>

<% function import_contracts() {%>
import './minime/MiniMeToken.sol';
<%}%>
