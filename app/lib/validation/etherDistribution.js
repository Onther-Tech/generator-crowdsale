module.exports = (input) => {
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
