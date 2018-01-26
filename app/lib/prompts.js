const validation = require('./validation');
const moment = require('moment');

const prompts = [{
  type: 'list',
  name: 'is_minime',
  message: 'Which version of Token would you like to use?',
  choices: [{
    name: 'zeppelin',
    value: false
  }, {
    name: 'minime',
    value: true
  }]
}, {
  type: 'checkbox',
  name: 'token_option',
  message: 'Which additional features would you like to include in token contract?',
  choices: [{
    name: 'Burnable',
    value: 'burnable',
    checked: false
  }, {
    name: 'Pausable',
    value: 'pausable',
    checked: false
  }, {
    name: 'Vesting',
    value: 'vesting',
    checked: false
  }],
  when: answers => answers.token_type == 'zeppelin'
}, {
  type: 'input',
  name: 'token_name',
  message: 'What is your token name?',
  validate: validation.tokenName
}, {
  type: 'input',
  name: 'token_symbol',
  message: 'What is your token symbol?',
  validate: validation.tokenSymbol
}, {
  type: 'input',
  name: 'decimal',
  message: 'What is your token decimal?(default: 18)',
  default: 18,
  validate: validation.decimal
}, {
  type: 'input',
  name: 'max_cap',
  message: 'What is your Maximum Cap for Crowdsale in ether(not wei)?',
  filter: (input) => {
    return Number(input)
  },
  validate: validation.maxCap
}, {
  type: 'input',
  name: 'min_cap',
  message: 'What is your Minimum Cap for Crowdsale in ether(not wei)?',
  filter: (input) => {
    return Number(input)
  },
  validate: validation.minCap
}, {
  type: 'input',
  name: 'start_time',
  message: 'When does your crowdsale start in utc? ( year-month-day hour:minute:second )',
  filter: (input) => {
    return moment(input).unix()
  },
  validate: validation.startTime
}, {
  type: 'input',
  name: 'end_time',
  message: 'When does your crowdsale end in utc? ( year-month-day hour:minute:second )',
  filter: (input) => {
    return moment(input).unix()
  },
  validate: validation.endTime
}, {
  type: 'confirm',
  name: 'is_static',
  value: true,
  message: 'Is your token sale rate for ether static over time?'
}, {
  type: 'input',
  name: 'base_rate',
  message: 'What is your token sale base rate for 1 ether?',
  filter: (input) => {
    return Number(input)
  },
  validate: validation.baseRate
}, {
  type: 'confirm',
  name: 'use_time_bonus',
  value: true,
  message: 'Does your token sale gives bonus based on time?',
  when: answers => !answers.is_static
}, {
  type: 'input',
  name: 'time_bonuses',
  message: 'What is your bonus ratio for each bonus stages?\n [ [bonus_time_stage1, bonus_ratio1], ...]\n (ex) [["2018-09-02", 30],["2018-10-05 14:20", 20], ...])\n',
  filter: (input) => {
    let jsonparsed = JSON.parse(input);
    for (var i = 0; i < jsonparsed.length; i++) {
      jsonparsed[i][0] = moment(jsonparsed[i][0]).unix();
    }
    return jsonparsed;
  },
  validate: validation.timeBonuses,
  when: answers => answers.use_time_bonus
}, {
  type: 'confirm',
  name: 'use_amount_bonus',
  value: true,
  message: 'Does your token sale gives bonus based on ether amount?',
  when: answers => !answers.is_static
}, {
  type: 'input',
  name: 'amount_bonuses',
  message: 'What is your bonus ratio for each bonus stages?\n [ [bonus_amount_stage1, bonus_ratio1], ...]\n (ex) [[300, 20], [500, 20], ...])\n',
  filter: (input) => {
    return JSON.parse(input)
  },
  validate: validation.amountBonuses,
  when: answers => answers.use_amount_bonus
}, {
  type: 'input',
  name: 'token_distribution',
  message: 'Give us your token distribution plan.\n First element must be "crowdsale" and sum of ratio must be 100\n [["crowdsale", "0x", token ratio for crowdsale]. ["name for other account to distribute token", "address of the account", token ratio for the account], ...]\n (ex) [["crowdsale",80],["0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",20]])\n',
  filter: (input) => {
    return JSON.parse(input);
  },
  validate: validation.tokenDistribution
}, {
  type: 'input',
  name: 'ether_distribution',
  message: 'Give us your ether distribution plan.\n Sum of ratio must be 100\n [["account1 address to distribute ether", account1 ratio], ["account2 address to distribute ether], account2 ratio]\n (ex) [["0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",80],["0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",20], ...])\n',
  filter: (input) => {
    return JSON.parse(input)
  },
  validate: validation.etherDistribution
}, {
  type: 'input',
  name: "max_purchase_limit",
  message: "What is the max purchase ether limit for ico contributors? ( 0 for no limit )",
  validate: validation.maxPurchaseLimit
}, {
  type: 'input',
  name: "min_purchase_limit",
  message: "What is the min purchase ether limit for ico contributors? ( 0 for no limit )",
  validate: validation.minPurchaseLimit
}, {
  type: 'confirm',
  name: 'kyc_for_mainsale',
  value: true,
  message: "Is KYC process needed for main sale?"
}, {
  type: 'confirm',
  name: 'kyc_for_presale',
  value: true,
  message: "Is KYC process needed for presale?"
},  {
  type: 'input',
  name: 'new_token_owner',
  message: "Give us the owner account address for contracts.",
  validate: validation.newTokenOwner
}]

module.exports = prompts;
