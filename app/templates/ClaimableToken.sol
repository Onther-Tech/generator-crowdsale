pragma solidity ^0.4.18;

import './zeppelin/ownership/Ownable.sol';
import './zeppelin/token/ERC20Basic.sol';

contract ClaimableToken is Ownable {

  event ClaimedTokens(address indexed _token, address indexed _owner, uint _amount);

  function claimTokens(address _token) public onlyOwner {
      if (_token == 0x0) {
          owner.transfer(this.balance);
          return;
      }

      ERC20Basic token = ERC20Basic(_token);
      uint balance = token.balanceOf(this);
      token.transfer(owner, balance);
      ClaimedTokens(_token, owner, balance);
  }
}
