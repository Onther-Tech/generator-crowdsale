module.exports = (input) => {
  if (input.trim() == '')
    return "You should provide owner account"
  return true;
}
