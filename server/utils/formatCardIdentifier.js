module.exports = (statement) => {
  if (statement.cardLast4) return statement.cardLast4;
  if (statement.cardLast2) return `XX${statement.cardLast2}`;
  return null;
};