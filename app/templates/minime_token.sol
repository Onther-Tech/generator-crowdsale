pragma solidity ^0.4.18;

import './minime/MiniMeToken.sol';

contract <%= _symbol %>Token <%token_inherit()%> {

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
