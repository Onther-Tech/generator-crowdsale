module.exports = (input, answers) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "End time should be a number!";
  else if (input < answers.start_time)
    return "End time unix timestamp should be bigger than start time unix timestamp"
  else
    return true
}
