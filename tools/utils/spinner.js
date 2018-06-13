const Spinner = require("cli-spinner").Spinner;
const chalk = require("chalk");

const styles = require("../../styles/chalkStyle");

module.exports = function spinner(message) {
  const chalkSpinner = chalk.hex(styles.colors.blue)(`%s ${message}\r`);
  return new Spinner({
    text: `${chalkSpinner}`,
    onTick: function(msg) {
      this.clearLine(this.stream);
      this.stream.write(msg);
    }
  });
};
