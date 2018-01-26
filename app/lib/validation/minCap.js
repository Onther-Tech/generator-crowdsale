module.exports = (input, answers) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "Maximum Cap for Crowdsale should be a number!";
  else if (input >= answers.max_cap)
    return "Minimum Cap for Crowdsale should be less than Maximum Cap"
  else
    return true
}
