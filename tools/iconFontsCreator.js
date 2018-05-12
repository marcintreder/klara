const fse = require("fs-extra");
const webfontsGenerator = require("webfonts-generator");
const config = require(`${process.cwd()}/icons.config.js`);
const progressBar = require("progress");
const path = require("path");
const chalk = require("chalk");
const styles = require("../styles/chalkStyle");

/* IconFontsGenerator uses webfontsGenerator package to generate iconfonts
** from SVGs downloaded from UXPin design system.
 */

const webfontConfig = config.webfontConfig.settings;

module.exports = function iconFontsCreator(dir) {
  const fontGenerator = (filesArr, directory) => {
    /* Merge of configs affected by the application and the configs
    ** independent from the app (stored in the main config JSON)
     */

    /* Array of all the files to be converted to an iconfont */
    const files = filesArr;
    /* Destination for iconFont files */
    const upperDir = dir.substr(0, dir.lastIndexOf("/"));
    const dirName = dir.substr(dir.indexOf("/") + 1);
    const spriterDestObj = { dest: `${upperDir}/IconFonts` };
    fse.ensureDirSync(`${upperDir}/IconFonts`);
    /* Name of the font generated from the asset category name in UXPin */
    const fontName = upperDir.replace("./", "").toLowerCase();
    /* Merge of config object for WebfontsGenerator */
    const mergedConfig = Object.assign(
      webfontConfig,
      spriterDestObj,
      { fontName: fontName },
      { files: files }
    );

    /* WebfontsGenerator generates iconfonts from SVGs */
    webfontsGenerator(mergedConfig, function(error) {
      if (error) {
        console.log("Fail!", error);
      } else {
        process.stderr.clearLine();
        process.stdout.cursorTo(0);
        console.log(
          chalk.hex(styles.colors.mint)(`✓ Icon Fonts for ${dirName} saved!`)
        );
      }
    });
  };
  /* Self-executing function prepares environment for generating iconfonts */
  (function() {
    /* Check if directory for iconfonts from main config exists,
    ** if not - create it.
     */
    const files = fse.readdirSync(dir);

    /* Activate WebfontsGenerator */
    return fontGenerator(
      files.map(item => {
        return `${dir}/${item}`;
      }),
      dir
    );
  })();
};
