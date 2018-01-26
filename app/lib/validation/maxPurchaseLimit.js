module.exports = (input) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "Max purchase ether limit limit should be a number!";
  return true;
}
