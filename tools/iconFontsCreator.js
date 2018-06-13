const fse = require("fs-extra");
const webfontsGenerator = require("webfonts-generator");
const svg2ttf = require("svg2ttf");
const config = require(`${process.cwd()}/icons.config.js`);
const progressBar = require("progress");
const path = require("path");
const chalk = require("chalk");
const sleep = require("sleep");
const styles = require("../styles/chalkStyle");

/* IconFontsGenerator uses webfontsGenerator package to generate iconfonts
** from SVGs downloaded from UXPin design system.
 */

const webfontConfig = config.webfontConfig.settings;

process.on("message", data => {
  iconFontsCreator(data);
});

async function iconFontsCreator(dir) {
  const upperDir = dir.substr(0, dir.lastIndexOf("/"));
  const fontName = upperDir.replace("./", "").toLowerCase();
  fontsPreparer();

  function fontsPreparer() {
    /* Check if directory for iconfonts from main config exists,
    ** if not - create it.
    */
    return fse.readdir(dir, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const filesPaths = data.map(item => `${dir}/${item}`);
        return fontGenerator(filesPaths);
      }
    });
  }

  async function fontGenerator(filesArr) {
    /* Merge of configs affected by the application and the configs
    ** independent from the app (stored in the main config JSON)
     */

    /* Array of all the files to be converted to an iconfont */
    /* Destination for iconFont files */
    const spriterDestObj = { dest: `${upperDir}/IconFonts` };
    const htmlTemplateObj = {
      htmlTemplate: `${path.resolve(__dirname)}/../templates/html.hbs`
    };
    await fse.ensureDirSync(`${upperDir}/IconFonts`);
    /* Name of the font generated from the asset category name in UXPin */
    /* Merge of config object for WebfontsGenerator */
    const mergedConfig = await Object.assign(
      webfontConfig,
      spriterDestObj,
      htmlTemplateObj,
      { fontName: fontName },
      { files: filesArr }
    );
    return await fontSaver(mergedConfig, filesArr);
  }

  /* WebfontsGenerator generates iconfonts from SVGs */
  async function fontSaver(mergedConfig, filesArr) {
    return await webfontsGenerator(mergedConfig, async function(error, result) {
      const name = dir.substring(dir.indexOf("/") + 1, dir.lastIndexOf("/"));
      if (error) {
        process.stderr.clearLine();
        process.stdout.cursorTo(0);
        console.error(
          chalk.hex(styles.colors.red)(
            `☝︎ ${name}: There's a problem with your SVG files ☹︎. Please, check if your files are standard, clean, SVGs.\n
            SVGs from exported from Sketch and Illustrator may be problematic\r`
          )
        );
        console.error(error);
        /* On Error Try again */
        return await fontSaver();
      } else {
        /* If There's no error – check if file content is OK */
        const svg = result["svg"];

        const countGlyphs = (str, glyphString) =>
          str.split(glyphString).length - 1;

        const glyphsSVG = countGlyphs(svg, "glyph-name");

        const numberOfGlyphs = filesArr.length;

        if (glyphsSVG !== numberOfGlyphs) {
          /* If number of glyphs in file is different than repeat*/
          return await fontSaver();
        } else if (svg.indexOf("NaN") > 0) {
          return await fontSaver();
        } else {
          /* Inform user that the operation has been completed */

          /* Build string of icon fonts formats */
          const filteredFormatStr = JSON.stringify(webfontConfig.types)
            .replace(/\[|"|"|]/gi, "")
            .replace(/,/g, ", ");

          process.stderr.clearLine();
          process.stdout.cursorTo(0);
          console.log(
            chalk.hex(styles.colors.mint)(
              `✓ ${chalk.bold(
                name
              )}: Icon Font files saved! Format: ${filteredFormatStr}.\r`
            )
          );

          /* Exit Process when the operation is done */
          process.exit(0);
          process.kill("SIGKILL");
        }
      }
    });
  }
}
