module.exports = (input) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "Start time should be a number!";
  else if (input < Date.now() / 1000)
    return "Start time unix timestamp should be bigger than unix timestamp for now"
  else
    return true
}
