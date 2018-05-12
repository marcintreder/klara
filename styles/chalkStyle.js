const chalk = require("chalk");

const colors = {
  mint: "#00FFDE",
  blue: "#4D98FF"
};

module.exports = {
  colors: {
    mint: colors.mint,
    blue: colors.blue
  },
  text: {
    titleChalk: text => chalk.inverse.bold(text),
    headerChalk: text => chalk.reset.hex(colors.blue)(text),
    defaultChalk: text => chalk.reset.italic.hex(colors.mint)(text)
  }
};
