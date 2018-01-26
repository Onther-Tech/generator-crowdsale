module.exports = (input) => {
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
