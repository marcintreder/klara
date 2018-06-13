const SVGSpriter = require("svg-sprite");
const mkdirp = require("mkdirp");
const path = require("path");
const fse = require("fs-extra");
const CONFIG = require(`${process.cwd()}/icons.config.js`);
const progressBar = require("progress");
const download = require("download");
const chalk = require("chalk");
const styles = require("../styles/chalkStyle");

const SPRITES_CONFIG = CONFIG.svgSprite.settings;

process.on("message", data => {
  svgSpriter(data);
});

async function svgSpriter(dir) {
  const upperDir = dir.substr(0, dir.lastIndexOf("/"));
  const spriterDestObj = { dest: `${upperDir}/Sprites/svgSprite` };
  const mergedConfig = Object.assign(SPRITES_CONFIG, spriterDestObj);
  const spriter = new SVGSpriter(mergedConfig);
  /* Read directory */
  const filesArr = fse.readdirSync(dir);
  const fullFilesArr = filesArr.map(item => `${dir}/${item}`);
  const categoryName = dir.substr(dir.indexOf("/") + 1);
  /* Create sprites directory */
  fse.ensureDirSync(SPRITES_CONFIG.dest);

  const spriteMap = async () => {
    const spriteFilesArr = fullFilesArr.map(async file => {
      const fullPath = `${dir}/${file}`;
      const data = await fse.readFile(file, { encoding: "utf-8" });
      return spriter.add(file, null, data);
    });
    return await Promise.all(spriteFilesArr).catch(error => console.log(error));
  };

  const compileSprite = async () => {
    await spriter.compile((error, result) => {
      const spriteTypesArr = Object.keys(result);
      return spriteTypesArr.map(item => {
        fse.ensureDirSync(`${SPRITES_CONFIG.dest}/${item}`);
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
  };

  spriteMap()
    .then(() => compileSprite())
    .then(() => {
      /* Build string of sprite formats */
      const formatKeys = Object.keys(SPRITES_CONFIG.mode);
      const filteredFormatObj = formatKeys.filter(key => {
        return SPRITES_CONFIG.mode[key] === true;
      });

      const filteredFormatStr = JSON.stringify(filteredFormatObj)
        .replace(/\[|"|"|]/gi, "")
        .replace(/,/g, ", ");

      const name = categoryName.substring(
        categoryName.indexOf("./"),
        categoryName.lastIndexOf("/")
      );

      process.stderr.clearLine();
      process.stdout.cursorTo(0);
      console.log(
        chalk.hex(styles.colors.mint)(
          `✓ ${chalk.bold(
            categoryName
          )}: SVG sprite files saved! Format: ${filteredFormatStr}.\r`
        )
      );
      process.exit(0);
      process.kill("SIGKILL");
    });
}
