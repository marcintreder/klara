const Spinner = require("cli-spinner").Spinner;
const chalk = require("chalk");

const styles = require("../../styles/chalkStyle");

module.exports = function spinner(message) {
  const chalkSpinner = chalk.hex(styles.colors.mint)(`${message} %s`);
  return new Spinner(`${chalkSpinner}`);
};
