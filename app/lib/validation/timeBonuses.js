module.exports = (input, answers) => {
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
}
