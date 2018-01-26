module.exports = (input) => {
  var reg = /^\d+$/;
  if (!reg.test(input))
    return "Token decimal should be a number!";
  return true;
}
