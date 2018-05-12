const progressBar = require("progress");
const chalk = require("chalk");

const styles = require("../../styles/chalkStyle");

module.exports = function pBar(message, category, length) {
  if (category.length > 0) {
    return new progressBar(
      `${message} ${chalk.hex(styles.colors.blue)(
        `category: ${category}`
      )}: ${chalk.hex(styles.colors.blue)(":bar :current/:total")}`,
      {
        total: length,
        complete: "▌",
        incomplete: "⠸",
        width: 20
      }
    );
  }
  if (category.length <= 0) {
    return new progressBar(
      `${message}: ${chalk.hex(styles.colors.blue)(":bar :current/:total")}`,
      {
        total: length,
        complete: "▌",
        incomplete: "⠸",
        width: 20
      }
    );
  }
};
