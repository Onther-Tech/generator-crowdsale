module.exports = (input) => {
  if (input.trim() == '')
    return "You should provide token name"
  return true;
}
