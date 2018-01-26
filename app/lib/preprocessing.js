const preprocessing = (answers, self) => {
  console.log("self :", self)
  const token_option = answers.token_option;
  const hasTokenOption = opt => token_option && token_option.indexOf(opt) !== -1;
  // manually deal with the response, get back and store the results.
  // we change a bit self way of doing to automatically do self in the self.prompt() method.

  for (var key in answers) {
    self[key] = answers[key];
  }

  self.burnable = hasTokenOption('burnable');
  self.pausable = hasTokenOption('pausable');
  self.vesting = hasTokenOption('vesting');

  self.contributorsRatio = self.token_distribution[0][1];

  if (self.use_time_bonus) {
    self.bonus_time_stage = [];
    self.bonus_time_ratio = [];
    for (var i = 0; i < self.time_bonuses.length; i++) {
      self.bonus_time_stage.push(self.time_bonuses[i][0]);
      self.bonus_time_ratio.push(self.time_bonuses[i][1]);
    }
  }

  if (self.use_amount_bonus) {
    self.bonus_amount_stage = [];
    self.bonus_amount_ratio = [];
    for (var i = 0; i < self.amount_bonuses.length; i++) {
      self.bonus_amount_stage.push(self.amount_bonuses[i][0]);
      self.bonus_amount_ratio.push(self.amount_bonuses[i][1]);
    }
  }

  self.ether_holder = [];
  self.ether_ratio = [];
  for (i = 0; i < self.ether_distribution.length; i++) {

    self.ether_holder.push(self.ether_distribution[i][0]);
    self.ether_ratio.push(self.ether_distribution[i][1]);
  }

  self.tokenDistributionIncluded = self.token_distribution.length == 1;

  if (self.tokenDistributionIncluded) {
    self.token_holder = [];
    self.token_ratio = [];
    for (i = 1; i < self.token_distribution.length; i++) {
        self.token_holder.push(self.token_distribution[i][0]);
        self.token_ratio.push(self.token_distribution[i][1]);
    }
  }
}

module.exports = preprocessing;
