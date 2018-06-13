const progressBar = require("progress");
const chalk = require("chalk");

const styles = require("../../styles/chalkStyle");

module.exports = function pBar(message, category, length) {
  const BAR_CONFIG = {
    total: length,
    complete: "▌",
    incomplete: "⠸",
    width: 20
  };

  if (category.length > 0) {
    return new progressBar(
      `${chalk.hex(styles.colors.blue)(message)} ${chalk.hex(
        styles.colors.blue
      )(`${category}`)} ${chalk.hex(styles.colors.blue)(
        ":bar :current/:total"
      )}`,
      BAR_CONFIG
    );
  }
  if (category.length <= 0) {
    return new progressBar(
      `${chalk.hex(styles.colors.blue)(message)} ${chalk.hex(
        styles.colors.blue
      )(":bar :current/:total")}`,
      BAR_CONFIG
    );
  }
};
