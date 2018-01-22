'use strict';
const Generator = require('yeoman-generator');
const commandExists = require('command-exists').sync;
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const _s = require('underscore.string');
const ncp = require('ncp').ncp;
const moment = require('moment');

//TODO: package.json



module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  //TODO: account address check
  prompting() {
    if (!this.options['skip-welcome-message']) {
      this.log(yosay('\'Allo \'allo! Check this one first !! https://docs.google.com/spreadsheets/d/1Pg0I9QnB0AheoiBgheaFfqHpfI3Cr6Pf6-80yipl16Y/edit?usp=sharing.'));
    }

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
      validate: (input) => {
        if (input.trim() == '')
          return "You should provide token name"
        return true;
      }
    }, {
      type: 'input',
      name: 'token_symbol',
      message: 'What is your token symbol?',
      validate: (input) => {
        if (input.trim() == '')
          return "You should provide token symbol"
        return true;
      }
    }, {
      type: 'input',
      name: 'decimal',
      message: 'What is your token decimal?(default: 18)',
      default: 18,
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Token decimal should be a number!";
        return true;
      }
    }, {
      type: 'input',
      name: 'max_cap',
      message: 'What is your Maximum Cap for Crowdsale in ether(not wei)?',
      filter: (input) => {
        return Number(input)
      },
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Maximum Cap for Crowdsale should be a number!";
        else if (input == 0)
          return "Maximum Cap for Crowdsale should be bigger than 0"
        else
          return true
      }
    }, {
      type: 'input',
      name: 'min_cap',
      message: 'What is your Minimum Cap for Crowdsale in ether(not wei)?',
      filter: (input) => {
        return Number(input)
      },
      validate: (input, answers) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Maximum Cap for Crowdsale should be a number!";
        else if (input >= answers.max_cap)
          return "Minimum Cap for Crowdsale should be less than Maximum Cap"
        else
          return true
      }
    }, {
      type: 'input',
      name: 'start_time',
      message: 'When does your crowdsale start in utc? ( year-month-day hour:minute:second )',
      filter: (input) => {
        return moment(input).unix()
      },
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Start time should be a number!";
        else if (input < Date.now() / 1000)
          return "Start time unix timestamp should be bigger than unix timestamp for now"
        else
          return true
      }
    }, {
      type: 'input',
      name: 'end_time',
      message: 'When does your crowdsale end in utc? ( year-month-day hour:minute:second )',
      filter: (input) => {
        return moment(input).unix()
      },
      validate: (input, answers) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "End time should be a number!";
        else if (input < answers.start_time)
          return "End time unix timestamp should be bigger than start time unix timestamp"
        else
          return true
      }
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
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "token rate for Crowdsale should be a number!";
        else if (input == 0)
          return "token rate for Crowdsale should be bigger than 0!"
        else
          return true
      }
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
      validate: (input, answers) => {
        for (var i = 0; i < input.length; i++) {
          if (input[i].length != 2 || typeof input[i][0] != 'number' || typeof input[i][1] != 'number')
            return "invalid array"
          if (i != input.length - 1 && input[i][0] >= input[i + 1][0])
            return "previous bonus time stage should be less than the next bonus time stage"
        }

        if (input[0][0] != answers.start_time)
          return "first bonus time stage should be equal to crowdsale start_time";
        if (input[input.length - 1][0] >= answers.end_time)
          return "final bonus time stage should be less than crowdsale end_time";

        return true;
      },
      when: answers => answers.use_time_bonus
    }, {
      type: 'confirm',
      name: 'use_amount_bonus',
      value: true,
      message: 'Does your token sale gives bonus based on time?',
      when: answers => !answers.is_static
    }, {
      type: 'input',
      name: 'amount_bonuses',
      message: 'What is your bonus ratio for each bonus stages?\n [ [bonus_amount_stage1, bonus_ratio1], ...]\n (ex) [[300, 20], [500, 20], ...])\n',
      filter: (input) => {
        return JSON.parse(input)
      },
      validate: (input, answers) => {
        for (var i = 0; i < input.length; i++) {
          if (input[i].length != 2 || typeof input[i][0] != 'number' || typeof input[i][1] != 'number')
            return "invalid array"
          if (i != input.length - 1 && input[i][0] >= input[i + 1][0])
            return "previous bonus amout stage value should be less than next bonus amount stage value"
        }
        return true;
      },
      when: answers => answers.use_amount_bonus
    }, {
      type: 'input',
      name: 'token_distribution',
      message: 'Give us your token distribution plan.\n First element must be "crowdsale" and sum of ratio must be 100\n [["crowdsale", "0x", token ratio for crowdsale]. ["name for other account to distribute token", "address of the account", token ratio for the account], ...]\n (ex) [["crowdsale",80],["0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",20]])\n',
      filter: (input) => {
        return JSON.parse(input);
      },
      validate: (input) => {
        var sum = 0;
        if (input[0][0] != "crowdsale")
          return "First element must be 'crowdsale'"
        for (var i = 0; i < input.length; i++) {
          if (input[i].length != 2 || typeof input[i][0] != 'string' || typeof input[i][1] != 'number')
            return "invalid array"
          sum += input[i][1];
        }

        if (sum != 100)
          return "sum of distribution rate should be 100"

        return true;
      }
    }, {
      type: 'input',
      name: 'ether_distribution',
      message: 'Give us your ether distribution plan.\n Sum of ratio must be 100\n [["account1 address to distribute ether", account1 ratio], ["account2 address to distribute ether], account2 ratio]\n (ex) [["0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",80],["0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",20], ...])\n',
      filter: (input) => {
        return JSON.parse(input)
      },
      validate: (input) => {
        var sum = 0;
        for (var i = 0; i < input.length; i++) {
          if (input[i].length != 2 || typeof input[i][0] != 'string' || typeof input[i][1] != 'number')
            return "invalid array"
          sum += input[i][1];
        }
        if (sum != 100)
          return "Sum of ratio must be 100"
        return true;
      }
    }, {
      type: 'input',
      name: "max_purchase_limit",
      message: "What is the max purchase ether limit for ico contributors? ( 0 for no limit )",
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Max purchase ether limit limit should be a number!";
        return true;
      }
    }, {
      type: 'input',
      name: "min_purchase_limit",
      message: "What is the min purchase ether limit for ico contributors? ( 0 for no limit )",
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Min purchase ether limit should be a number!";
        return true;
      }
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
      validate: (input) => {
        if (input.trim() == '')
          return "You should provide owner account"
        return true;
      }
    }];

    return this.prompt(prompts).then(answers => {
      const token_option = answers.token_option;
      const hasTokenOption = opt => token_option && token_option.indexOf(opt) !== -1;

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.token_type = answers.token_type;
      this.burnable = hasTokenOption('burnable');
      this.pausable = hasTokenOption('pausable');
      this.vesting = hasTokenOption('vesting');
      this.token_name = answers.token_name;
      this.token_symbol = answers.token_symbol;
      this.decimal = answers.decimal;

      this.max_cap = answers.max_cap;
      this.min_cap = answers.min_cap;
      this.start_time = answers.start_time;
      this.end_time = answers.end_time;
      this.is_static = answers.is_static;
      this.base_rate = answers.base_rate;
      this.use_time_bonus = answers.use_time_bonus;
      this.time_bonuses = answers.time_bonuses;
      this.use_amount_bonus = answers.use_amount_bonus;
      this.amount_bonuses = answers.amount_bonuses;
      this.token_distribution = answers.token_distribution;
      this.ether_distribution = answers.ether_distribution;
      this.max_purchase_limit = answers.max_purchase_limit;
      this.min_purchase_limit = answers.min_purchase_limit;
      this.kyc_for_mainsale = answers.kyc_for_mainsale;
      this.kyc_for_presale = answers.kyc_for_presale;
      this.new_token_owner = answers.new_token_owner;

      this.refundable = this.min_cap !== 0;

      this.contributorsRatio = this.tokenDistribution[0][1];

      if (this.tokenDistribution.length == 1)
        this.tokenDistributionIncluded = false;
      else
        this.tokenDistributionIncluded = true;

      if (this.use_time_bonus) {
        this.bonus_time_stage = [];
        this.bonus_time_ratio = [];
        for (var i = 0; i < this.time_bonuses.length; i++) {
          this.bonus_time_stage.push(this.time_bonuses[i][0]);
          this.bonus_time_ratio.push(this.time_bonuses[i][1]);
        }
      }

      if (this.use_amount_bonus) {
        this.bonus_amount_stage = [];
        this.bonus_amount_ratio = [];
        for (var i = 0; i < this.time_bonuses.length; i++) {
          this.bonus_time_stage.push(this.time_bonuses[i][0]);
          this.bonus_amount_ratio.push(this.time_bonuses[i][1]);
        }
      }

      this.ether_holder = [];
      this.ether_ratio = [];
      for (i = 0; i < this.ether_distribution.length; i++) {

        this.ether_holder.push(this.ether_distribution[i][0]);
        this.ether_ratio.push(this.ether_distribution[i][1]);
      }

      this.tokenDistributionIncluded = this.token_distribution.length == 1;

      if (this.tokenDistributionIncluded) {
        this.token_holder = [];
        this.token_ratio = [];
        for (i = 1; i < this.token_distribution.length; i++) {
            this.token_holder.push(this.token_distribution[i][0]);
            this.token_ratio.push(this.token_distribution[i][1]);
        }
      }

    });
  }

  writing() {

    this._writingFolders();
    this._writingTokenContractfile();
    this._writingCrowdsaleContractfile();
    this._writingMigrationfile();
    this._writingConfigfile();
  }

  _writingFolders() {
    mkdirp('contracts');
    mkdirp('migrations');
  }

  _writingTokenContractfile() {
    if (this.is_minime == false) {

      this.fs.copyTpl(
        this.templatePath('Zeppelin_token.sol'),
        this.destinationPath('contracts/'.concat(this.token_symbol).concat('Token.sol')), {
          _name: this.token_name,
          _symbol: this.token_symbol,
          _decimal: this.decimal,
          burnable: this.burnable,
          pausable: this.pausable,
          vesting: this.vesting
        }
      )
    }
    if (this.is_minime == true) {
      this.fs.copyTpl(
        this.templatePath('Minime_token.sol'),
        this.destinationPath('contracts/'.concat(this.token_symbol).concat('Token.sol')), {
          _name: this.token_name,
          _symbol: this.token_symbol,
          _decimal: this.decimal
        }
      )
    }
  }
  _writingCrowdsaleContractfile() {
    this.fs.copyTpl(
      this.templatePath('Crowdsale.sol'),
      this.destinationPath('contracts/'.concat(this.token_symbol).concat('Crowdsale.sol')), {
        _symbol: this.token_symbol,
        is_static: this.is_static,
      }
    )
  }
  _writingMigrationfile() {
    this.fs.copyTpl(
      this.templatePath('migrations/1_deploy_token.js'),
      this.destinationPath('migrations/1_deploy_token.js'), {
        _symbol: this.token_symbol,
      }
    )

    this.fs.copyTpl(
      this.templatePath('migrations/2_deploy_crowdsale.js'),
      this.destinationPath('migrations/2_deploy_crowdsale.js'), {
        //TODO: parameters
        _symbol: this.token_symbol,
        _tokenType: this.token_type,
        _kycIncluded: this.kycIncluded,
        _tokenDistributionIncluded: this.tokenDistributionIncluded,
        _etherDistributionWallets: this.etherDistributionWallets,
        _etherDistributionRatios: this.etherDistributionRatios,
        _tokenDistributionWallets: this.tokenDistributionWallets,
        _tokenDistributionRatios: this.tokenDistributionRatios,
        _startTime: this.start_time,
        _endTime: this.end_time,
        _maxEtherCap: this.max_cap,
        _minEtherCap: this.min_cap,
        _maxBuyerFundedIncluded: this.maxBuyerFundedIncluded,
        _maxBuyerFunded: this.maxBuyerFunded,
        _nextTokenOwner: this.nextTokenOwner,
        _rateVariablility: this.rate_is_static,
        _tokenRates: this.tokenRates,
        _tokenRateTimelines: this.tokenRateTimelines,
        _tokenRate: this.tokenRate
      }
    )
  }
  _writingConfigfile() {
    this.fs.copyTpl(
      this.templatePath('truffle-config.js'),
      this.destinationPath('truffle-config.js')
    )
  }
}
