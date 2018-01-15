'use strict';
const Generator = require('yeoman-generator');
const commandExists = require('command-exists').sync;
const yosay = require('yosay');
const chalk = require('chalk');
const wiredep = require('wiredep');
const mkdirp = require('mkdirp');
const _s = require('underscore.string');
const ncp = require('ncp').ncp;

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
      name: 'token_type',
      message: 'Which version of Token would you like to use?',
      choices: [{
        name: 'zeppelin',
        value: 'zeppelin'
      }, {
        name: 'minime',
        value: 'minime'
      }]
    }, {
      type: 'checkbox',
      name: 'token_features',
      message: 'Which additional features would you like to include in token contract?',
      choices: [{
        name: 'Burnable',
        value: 'includeBurnable',
        checked: false
      }, {
        name: 'Pausable',
        value: 'includePausable',
        checked: false
      }, {
        name: 'Vesting',
        value: 'includeVesting',
        checked: false
      }],
      when: answers => answers.token_type == 'zeppelin'
    }, {
      type: 'input',
      name: 'token_name',
      message: 'What is your token name?',
      validate: (input) => {
        if (input == '')
          return "You should provide token name"
        return true;
      }
    }, {
      type: 'input',
      name: 'token_symbol',
      message: 'What is your token symbol?',
      validate: (input) => {
        if (input == '')
          return "You should provide token symbol"
        return true;
      }
    }, {
      type: 'input',
      name: 'token_decimal',
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
      name: 'maxEtherCap',
      message: 'What is your Maximum Cap for Crowdsale in ether(not wei)?',
      filter: (input) => {
        return Number(input)
      },
      validate: (input) => {
        var reg = /^-?\d+\.?\d*$/
        if (!reg.test(input))
          return "Maximum Cap for Crowdsale should be a number!";
        else if (input <= 0)
          return "Maximum Cap for Crowdsale should be bigger than 0";
        else
          return true
      }
    }, {
      type: 'input',
      name: 'minEtherCap',
      message: 'What is your Minimum Cap for Crowdsale in ether(not wei)?',
      filter: (input) => {
        return Number(input)
      },
      validate: (input, answers) => {
        var reg = /^-?\d+\.?\d*$/
        if (!reg.test(input))
          return "Maximum Cap for Crowdsale should be a number!";
        else if (input <= 0)
          return "Maximum Cap for Crowdsale should be bigger than 0";
        else if (input >= answers.maxEtherCap)
          return "Minimum Cap for Crowdsale should be less than Maximum Cap"
        else
          return true
      }
    }, {
      type: 'input',
      name: 'startTime',
      message: 'When does your crowdsale start in utc?',
      filter: (input) => {
        return Number(input)
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
      name: 'endTime',
      message: 'When does your crowdsale end in utc?',
      filter: (input) => {
        return Number(input)
      },
      validate: (input, answers) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "End time should be a number!";
        else if (input < answers.startTime)
          return "End time unix timestamp should be bigger than start time unix timestamp"
        else
          return true
      }
    }, {
      type: 'confirm',
      name: 'rateVariability',
      value: true,
      message: 'Does your token sale rate for ether change over time?'
    }, {
      type: 'input',
      name: 'tokenRate',
      message: 'What is your token sale rate for 1 ether?',
      filter: (input) => {
        return Number(input)
      },
      validate: (input) => {
        var reg = /^-?\d+\.?\d*$/
        if (!reg.test(input))
          return "tokenRate for Crowdsale should be a number!";
        else if (input <= 0)
          return "tokenRate for Crowdsale should be bigger than 0";
        else
          return true
      },
      when: answers => !answers.rateVariability
    }, {
      type: 'input',
      name: 'tokenRate',
      message: 'What is your token sale rate for 1 ether for each period?\n [[period1 startTime, period1 rate], [period2 startTime, period2 rate], ...]\n (ex) [[1515484258, 2100],[1515496258, 2000], ...])\n',
      filter: (input) => {
        return JSON.parse(input)
      },
      validate: (input, answers) => {
        if (input == '')
          return "you should provide token rate"

        for (var i = 0; i < input.length; i++) {
          if (input[i].length != 2 || typeof input[i][0] != 'number' || typeof input[i][1] != 'number')
            return "invalid array"
          if (i != input.length - 1 && input[i][0] >= input[i + 1][0])
            return "previous period startTime should be less than the next period startTime"
        }

        if (input[0][0] != answers.startTime)
          return "first period startTime should be equal to crowdsale startTime";
        if (input[input.length - 1][0] >= answers.endTime)
          return "final period startTime should be less than crowdsale endTime";

        return true;
      },
      when: answers => answers.rateVariability
    }, {
      type: 'input',
      name: 'tokenDistribution',
      message: 'Give us your token distribution plan.\n First element must be "crowdsale" and sum of ratio must be 100\n [["crowdsale", "0x", token ratio for crowdsale]. ["name for other account to distribute token", "address of the account", token ratio for the account], ...]\n (ex) [["crowdsale","0x",80],["dev"," 0xe41a3427e6c90f9cf64f7d174a3c32c7e245f009",20]])\n',
      filter: (input) => {
        return JSON.parse(input);
      },
      validate: (input) => {
        if (input == '')
          return "You should provide token rate"
        var sum = 0;
        if (input[0][0] != "crowdsale")
          return "First element must be 'crowdsale'"
        for (var i = 0; i < input.length; i++) {
          if (input[i].length != 3 || typeof input[i][0] != 'string' || typeof input[i][1] != 'string' || typeof input[i][2] != 'number')
            return "invalid array"
          sum += input[i][2];
        }

        if (sum != 100)
          return "sum of distribution rate should be 100"

        return true;
      }
    }, {
      type: 'confirm',
      name: 'maxBuyerFundedIncluded',
      value: true,
      message: "Is there a ether limit for ico contributors?"
    }, {
      type: 'input',
      name: "maxBuyerFunded",
      message: "What is the ether limit for ico contributors?",
      validate: (input) => {
        var reg = /^\d+$/;
        if (!reg.test(input))
          return "Ether limit should be a number!";
        return true;
      },
      when: answers => answers.maxBuyerFundedIncluded
    }, {
      type: 'input',
      name: 'etherDistribution',
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
      type: 'confirm',
      name: 'kycIncluded',
      value: true,
      message: "Is KYC process needed for crowdsale?"
    }, {
      type: 'input',
      name: 'owner',
      message: "Give us the owner account address for contracts.",
      validate: (input) => {
        if (input == '')
          return "You should provide owner account"
        return true;
      }
    }];

    return this.prompt(prompts).then(answers => {
      const token_features = answers.token_features;
      const hasTokenFeature = feat => token_features && token_features.indexOf(feat) !== -1;

      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.token_type = answers.token_type;
      this.includeBurnable = hasTokenFeature('includeBurnable');
      this.includePausable = hasTokenFeature('includePausable');
      this.includeVesting = hasTokenFeature('includeVesting');
      this.token_name = answers.token_name;
      this.token_symbol = answers.token_symbol;
      this.token_decimal = answers.token_decimal;

      this.maxEtherCap = answers.maxEtherCap;
      this.minEtherCap = answers.minEtherCap;
      this.startTime = answers.startTime;
      this.endTime = answers.endTime;
      this.rateVariability = answers.rateVariability;
      this.tokenRate = answers.tokenRate;
      this.tokenDistribution = answers.tokenDistribution;
      this.maxBuyerFundedIncluded = answers.maxBuyerFundedIncluded;
      this.maxBuyerFunded = answers.maxBuyerFunded;
      this.etherDistribution = answers.etherDistribution;
      this.kycIncluded = answers.kycIncluded;
      this.contributorsRatio = this.tokenDistribution[0][2];

      if (this.tokenDistribution.length == 1)
        this.tokenDistributionIncluded = false;
      else
        this.tokenDistributionIncluded = true;

      if (this.rateVariability) {
        var tokenRates = [];
        var tokenRateTimelines = [];
        for (var i = 0; i < this.tokenRate.length; i++) {
          tokenRateTimelines.push(this.tokenRate[0]);
          tokenRates.push(this.tokenRate[1]);
        }
        this.tokenRates = tokenRates;
        this.tokenRateTimelines = tokenRateTimelines;
      }
    });
  }

  writing() {
    this._writingFolders();
    this._writingBaseContractfile();
    this._writingTokenContractfile();
    this._writingCrowdsaleContractfile();
    // this._writingMigrationfile();
    this._writingConfigfile();
  }

  _writingFolders() {
    mkdirp('contracts');
    mkdirp('migrations');
  }

  _writingBaseContractfile() {
    ncp(this.templatePath('zeppelin'), this.destinationPath('contracts/zeppelin'));
    ncp(this.templatePath('minime'), this.destinationPath('contracts/minime'));
  }

  _writingTokenContractfile() {
    if (this.token_type == 'zeppelin') {

      this.fs.copy(
        this.templatePath('ClaimableToken.sol'),
        this.destinationPath('contracts/ClaimableToken.sol')
      )

      this.fs.copyTpl(
        this.templatePath('Zeppelin_token.sol'),
        this.destinationPath('contracts/Token.sol'), {
          _name: this.token_name,
          _symbol: this.token_symbol,
          _decimals: this.token_decimal,
          includeBurnable: this.includeBurnable,
          includePausable: this.includePausable,
          includeVesting: this.includeVesting
        }
      )
    }
    if (this.token_type == 'minime') {
      this.fs.copyTpl(
        this.templatePath('Minime_token.sol'),
        this.destinationPath('contracts/Token.sol'), {
          _name: this.token_name,
          _symbol: this.token_symbol,
          _decimals: this.token_decimal
        }
      )
    }
  }
  _writingCrowdsaleContractfile() {
    if (this.rateVariability) {
      this.fs.copyTpl(
        this.templatePath('Rate.sol'),
        this.destinationPath('contracts/Rate.sol'), {
          _rateVariablility: this.rateVariability,
          _tokenRates: this.tokenRates,
          _tokenRateTimelines: this.tokenRateTimelines
        }
      )
    } else {
      this.fs.copyTpl(
        this.templatePath('Rate.sol'),
        this.destinationPath('contracts/Rate.sol'), {
          _rateVariablility: this.rateVariability,
          _tokenRate: this.tokenRate,
        }
      )
    }

    this.fs.copyTpl(
      this.templatePath('Crowdsale.sol'),
      this.destinationPath('contracts/Crowdsale.sol'), {
        _symbol: this.token_symbol,
        _rateVariablility: this.rateVariability,
        _maxBuyerFundedIncluded: this.maxBuyerFundedIncluded,
        _maxBuyerFunded: this.maxBuyerFunded,
        _tokenDistributionIncluded: this.tokenDistributionIncluded,
        _kycIncluded: this.kycIncluded,
        _tokenType: this.token_type,
        _contributorsRatio: this.contributorsRatio
      }
    )
  }
  _writingMigrationfile() {
    this.fs.copyTpl(
      this.templatePath('deploy_token.sol'),
      this.destinationPath('migrations/deploy_token.sol'), {
        _symbol: this.token_symbol,
      }
    )

    this.fs.copyTpl(
      this.templatePath('deploy_crowdsale.sol'),
      this.destinationPath('migrations/deploy_crowdsale.sol'), {
        //TODO: parameters
        _symbol: this.token_symbol,
        _rateVariablility: this.rateVariability,
        _tokenRate: this.tokenRate,
        _tokenDistribution: this.tokenDistribution,
        _maxBuyerFundedIncluded: this.maxBuyerFundedIncluded,
        _maxBuyerFunded: this.maxBuyerFunded,
        _etherDistribution: this.etherDistribution,
        _kycIncluded: this.kycIncluded
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
