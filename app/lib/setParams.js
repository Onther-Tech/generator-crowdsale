const moment = require('moment');

const minimeOptions = {
  is_minime: true,
  token_name: "TEST TOKEN",
  token_symbol: "TT",
  decimal: 18,
  max_cap: 40000,
  min_cap: 400,
  start_time: moment("2020-09-09").unix(),
  end_time: moment("2020-10-10").unix(),
  is_static: false,
  base_rate: 2000,
  use_time_bonus: true,
  use_amount_bonus: true,
  max_purchase_limit: 5000,
  min_purchase_limit: 0,
  kyc_for_mainsale: true,
  kyc_for_presale: false,
  new_token_owner:  "0x6cda63dbeacc082150502e73c2f40f8ce9270ac6",
  contributorsRatio: 80,
  bonus_time_stage: [
    moment("2020-09-09").unix(),
    moment("2020-09-11").unix(),
    moment("2020-09-20").unix()
  ],
  bonus_time_ratio: [
    30,
    20,
    0
  ],
  bonus_amount_stage: [
    200,
    500,
    1000
  ],
  bonus_amount_ratio: [
    5,
    10,
    20
  ],
  ether_holder: [
    "0x6cda63dbeacc082150502e73c2f40f8ce9270ac6"
  ],
  ether_ratio: [
    100
  ],
  tokenDistributionIncluded: true,
  token_holder: [
    "0x6cda63dbeacc082150502e73c2f40f8ce9270ac6"
  ],
  token_ratio: [
    20
  ]
}

exports.minimeOptions = minimeOptions;
