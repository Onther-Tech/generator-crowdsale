module.exports = (input) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "Min purchase ether limit should be a number!";
  return true;
}
