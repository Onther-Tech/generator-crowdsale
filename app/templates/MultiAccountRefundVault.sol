pragma solidity ^0.4.18;

import './zeppelin/math/SafeMath.sol';
import './zeppelin/ownership/Ownable.sol';

/**
 * @title MultiAccountRefundVault
 * @dev This contract is used for storing funds while a crowdsale
 * is in progress. Supports refunding the money if crowdsale fails,
 * and forwarding it if crowdsale is successful.
 */
contract MultiAccountRefundVault is Ownable {
  using SafeMath for uint256;

  enum State { Active, Refunding, Closed }

  mapping (address => uint256) public deposited;
  address[] public wallets;
  uint[] public distributionRatios;
  State public state;

  event Closed();
  event RefundsEnabled();
  event Refunded(address indexed beneficiary, uint256 weiAmount);

  function MultiAccountRefundVault(address[] _wallets, uint[] _distributionRatios) public {
    require(_wallets.length == _distributionRatios.length);

    uint sumOfRatio = 0;
    for (uint i = 0; i < _wallets.length; i++) {
      require(_wallets[i] != address(0));
      require(_distributionRatios[i] > 0);
      sumOfRatio = sumOfRatio.add(_distributionRatios[i]);
    }

    require(sumOfRatio == 100);

    wallets = _wallets;
    distributionRatios = _distributionRatios;
    state = State.Active;
  }

  function deposit(address investor) onlyOwner public payable {
    require(state == State.Active);
    deposited[investor] = deposited[investor].add(msg.value);
  }

  function close() onlyOwner public {
    require(state == State.Active);
    state = State.Closed;
    Closed();

    for (uint i = 0; i < wallets.length; i++) {
        wallets[i].transfer(this.balance.mul(distributionRatios[i]).div(100));
    }
  }

  function enableRefunds() onlyOwner public {
    require(state == State.Active);
    state = State.Refunding;
    RefundsEnabled();
  }

  function refund(address investor) public {
    require(state == State.Refunding);
    uint256 depositedValue = deposited[investor];
    deposited[investor] = 0;
    investor.transfer(depositedValue);
    Refunded(investor, depositedValue);
  }
}
