const chalk = require("chalk");

const colors = {
  mint: "#00FFDE",
  green: "#108043",
  blue: "#4D98FF",
  orange: "#F49342",
  red: "#D85853"
};

module.exports = {
  colors: {
    mint: colors.mint,
    green: colors.green,
    blue: colors.blue,
    orange: colors.orange,
    red: colors.red
  },
  text: {
    titleChalk: text => chalk.inverse.bold(text),
    headerChalk: text => chalk.reset.hex(colors.blue)(text),
    defaultChalk: text => chalk.reset.italic.hex(colors.mint)(text)
  }
};