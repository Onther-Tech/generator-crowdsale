'use strict';
const Generator = require('yeoman-generator');
const yosay = require('yosay');
const mkdirp = require('mkdirp');
const ncp = require('ncp');
const moment = require('moment');
const validation = require('./lib').validation;
const path = require('path');
const prompts = require('./lib').prompts;
const preprocessing = require('./lib').preprocessing;

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);
  }

  //TODO: account address check
  // prompting() {
  //   if (!this.options['skip-welcome-message']) {
  //     this.log(yosay('\'Allo \'allo! Check this one first !! https://docs.google.com/spreadsheets/d/1Pg0I9QnB0AheoiBgheaFfqHpfI3Cr6Pf6-80yipl16Y/edit?usp=sharing.'));
  //   }
  //   return this.prompt(prompts).then(answers => {
  //     preprocessing(answers, this);
  //   });
  // }

  writing() {
    //for test
    const minimeOptions = require('./lib').minimeOptions
    for (var key in minimeOptions) {
      this[key] = minimeOptions[key];
    }

    this._writingBasefiles();
    this._writingTokenContractfile();
    this._writingCrowdsaleContractfile();
    // this._writingMigrationfile();
    this._writingConfigfile();
  }

  _writingBasefiles() {
    ncp(
      this.templatePath('./tokyo-reusable-crowdsale/contracts'),
      this.destinationPath('contracts')
    )
    mkdirp('migrations');
  }


  _writingTokenContractfile() {
    if (this.is_minime == false) {

      this.fs.copyTpl(
        this.templatePath('./token/Zeppelin_token.sol'),
        this.destinationPath('contracts/'.concat(this.token_symbol).concat('Token.sol')), {
          token_name: this.token_name,
          token_symbol: this.token_symbol,
          decimal: this.decimal,
          burnable: this.burnable,
          pausable: this.pausable,
          vesting: this.vesting
        }
      )
    }
    if (this.is_minime == true) {
      this.fs.copyTpl(
        this.templatePath('./token/Minime_token.sol'),
        this.destinationPath('contracts/'.concat(this.token_symbol).concat('Token.sol')), {
          token_name: this.token_name,
          token_symbol: this.token_symbol,
          decimal: this.decimal
        }
      )
    }
  }
  _writingCrowdsaleContractfile() {
    this.fs.copyTpl(
      this.templatePath('./crowdsale/Crowdsale.sol'),
      this.destinationPath('contracts/'.concat(this.token_symbol).concat('Crowdsale.sol')), {
        is_minime: this.is_minime,
        token_symbol: this.token_symbol,
        is_static: this.is_static,
        max_purchase_limit: this.max_purchase_limit,
        min_purchase_limit: this.min_purchase_limit,
        kyc_for_mainsale: this.kyc_for_mainsale,
        kyc_for_presale: this.kyc_for_presale,
        contributorsRatio: this.contributorsRatio,
        tokenDistributionIncluded: this.tokenDistributionIncluded,
      }
    )
  }
  _writingMigrationfile() {
    this.fs.copyTpl(
      this.templatePath('migrations/1_deploy_token.js'),
      this.destinationPath('migrations/1_deploy_token.js'), {
        token_symbol: this.token_symbol,
      }
    )

    this.fs.copyTpl(
      this.templatePath('migrations/2_deploy_crowdsale.js'),
      this.destinationPath('migrations/2_deploy_crowdsale.js'), {
        //TODO: parameters
        is_minime: this.is_minime,
        token_symbol: this.token_symbol,
        max_cap: this.max_cap,
        min_cap: this.min_cap,
        start_time: this._startTime,
        end_time: this.end_time,
        is_static: this.is_static,
        base_rate: this.base_rate,
        use_time_bonus: this.use_time_bonus,
        use_amount_bonus: this.use_amount_bonus,
        max_purchase_limit: this.max_purchase_limit,
        min_purchase_limit: this.min_purchase_limit,
        kyc_for_mainsale: this.kyc_for_mainsale,
        kyc_for_presale: this.kyc_for_presale,
        new_token_owner: this.new_token_owner,
        contributorsRatio: this.contributorsRatio,
        bonus_time_stage: this.bonus_time_stage,
        bonus_time_ratio: this.bonus_time_ratio,
        bonus_amount_stage: this.bonus_amount_stage,
        bonus_amount_ratio: this.bonus_amount_ratio,
        tokenDistributionIncluded: this.tokenDistributionIncluded,
        token_holder: this.token_holder,
        token_ratio: this.token_ratio
      }
    )
  }
  _writingConfigfile() {
    this.fs.copyTpl(
      this.templatePath('./truffle/truffle-config.js'),
      this.destinationPath('truffle-config.js')
    )
  }
}
