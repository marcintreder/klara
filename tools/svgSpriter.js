const SVGSpriter = require("svg-sprite");
const mkdirp = require("mkdirp");
const path = require("path");
const fse = require("fs-extra");
const config = require(`${process.cwd()}/icons.config.js`);
const progressBar = require("progress");
const download = require("download");
const chalk = require("chalk");
const styles = require("../styles/chalkStyle");

const spritesConfig = config.svgSprite.settings;

module.exports = function svgSpriter(dir) {
  const upperDir = dir.substr(0, dir.lastIndexOf("/"));
  const spriterDestObj = { dest: `${upperDir}/Sprites/svgSprite` };
  const mergedConfig = Object.assign(spritesConfig, spriterDestObj);
  const spriter = new SVGSpriter(mergedConfig);
  /* Read directory */
  const filesArr = fse.readdirSync(dir);
  const fullFilesArr = filesArr.map(item => `${dir}/${item}`);
  const categoryName = dir.substr(dir.indexOf("/") + 1);
  /* Create sprites directory */
  fse.ensureDirSync(spritesConfig.dest);

  const spriteMap = fullFilesArr.map(file => {
    const fullPath = `${dir}/${file}`;
    return spriter.add(
      file,
      null,
      fse.readFileSync(file, { encoding: "utf-8" })
    );
  });

  Promise.all(spriteMap)
    .then(() => {
      spriter.compile((error, result) => {
        const spriteTypesArr = Object.keys(result);
        return spriteTypesArr.map(item => {
          fse.ensureDirSync(`${spritesConfig.dest}/${item}`);

          for (var mode in result) {
            for (var resource in result[mode]) {
              mkdirp.sync(path.dirname(result[mode][resource].path));
              fse.writeFileSync(
                result[mode][resource].path,
                result[mode][resource].contents
              );
            }
          }
        });
      });
    })
    .then(() => {
      process.stderr.clearLine();
      process.stdout.cursorTo(0);
      console.log(
        chalk.hex(styles.colors.mint)(
          `✓ SVG sprite files for ${categoryName} saved!`
        )
      );
    });
};
