module.exports = (input) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "Maximum Cap for Crowdsale should be a number!";
  else if (input == 0)
    return "Maximum Cap for Crowdsale should be bigger than 0"
  else
    return true
}
