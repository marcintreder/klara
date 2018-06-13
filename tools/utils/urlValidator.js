const styles = require("../../styles/chalkStyle");
const chalk = require("chalk");

module.exports = function urlValidator(url) {
  if (url.indexOf("designtokens") < 0) {
    /* check if url leads to UXPin DS */
    if (url.indexOf("app.uxpin.com/design-system") > 0) {
      const dsLocation = url.replace(
        "https://app.uxpin.com/design-system/",
        ""
      );
      const dsID =
        dsLocation.substring(0, dsLocation.indexOf("/")).length !== 0
          ? dsLocation.substring(0, dsLocation.indexOf("/"))
          : dsLocation.substring(dsLocation.indexOf("/") - 1);
      return `https://designtokens.uxpin.com/designSystems/hash/${dsID}/data/json`;
    } else {
      return console.log(
        chalk.hex(styles.colors.red)(
          `☝︎ Incorrect URL. Please provide URL to a design system stored in UXPin (http://uxpin.com)\r`
        )
      );
    }
  } else {
    return url;
  }
};
