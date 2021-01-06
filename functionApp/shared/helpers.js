const { v4: uuidv4 } = require("uuid");

module.exports = {
  getGUID: (numberChars) => {
    return uuidv4().slice(0, numberChars);
  },
};
