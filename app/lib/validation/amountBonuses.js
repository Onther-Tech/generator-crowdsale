module.exports = (input, answers) => {
  for (var i = 0; i < input.length; i++) {
    if (input[i].length != 2 || typeof input[i][0] != 'number' || typeof input[i][1] != 'number')
      return "invalid array"
    if (i != input.length - 1 && input[i][0] >= input[i + 1][0])
      return "previous bonus amout stage value should be less than next bonus amount stage value"
  }
  return true;
}
