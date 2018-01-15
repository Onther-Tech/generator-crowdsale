pragma solidity ^0.4.18;

import '/zeppelin/crowdsale/RefundVault.sol'

contract MultiAccountRefundVault is RefundVault {
  address[] public wallets;
  uint[] public distributionRates;

  function MultiAccountRefundVault(address[] _wallets, uint[] _distributionRates) public {
    require(_wallets.length == _distributionRates.length);

    uint sum = 0;
    for (uint i = 0; i < _wallets.length; i++) {
      require(_wallets[i] != address(0));
      require(_distributionRates[i] > 0);
      sum = sum.add(_distributionRates[i]);
    }

    require(sum == 100);

    wallets = _wallets;
    distributionRates = _distributionRates;
    state = State.Active;
  }

  function close() onlyOwner public {
    require(state == State.Active);
    state = State.Closed;
    Closed();

    for (uint i = 0; i < _wallets.length; i++) {
        _wallets[i].transfer(this.balance.mul(_distributionRates[i]).div(100))
    }
  }
}
