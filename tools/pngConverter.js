const fse = require("fs-extra");
const path = require("path");
const config = require(`${process.cwd()}/icons.config.js`);
const svg2png = require("svg2png");
const pngSpriter = require("./pngSpriter");
const pBar = require("./utils/pBar");
const chalk = require("chalk");
const styles = require("../styles/chalkStyle");
const spinner = require("./utils/spinner");

const pngConverterConfig = config.pngConverter.settings;

module.exports = function pngConverter(data) {
  /* Create an array of modified files */
  const filesArr = data.map(item => {
    return item.fileName;
  });
  const dir = data[0]["modified"];
  const upperDir = dir.substr(0, dir.lastIndexOf("/"));

  // const filesArr = fse.readdirSync(dir);
  const categoryName = dir.substr(dir.indexOf("/") + 1);
  const destination = `${upperDir}/PNG`; // pngConverterConfig.dest;
  fse.ensureDirSync(`${destination}`);

  const confirmationMsg = chalk.hex(styles.colors.blue)(
    `⚛ Klara is converting ${categoryName} to PNG files`
  );

  /* Loader and Spinner */
  const bar = pBar(confirmationMsg, "", filesArr.length);
  const spin = spinner("❊ Preparing SVGs for PNG conversion...");

  spin.setSpinnerString(27);
  spin.start();
  process.stderr.clearLine();
  process.stdout.cursorTo(0);

  Promise.all(
    filesArr.map(file => {
      const fullPath = `${dir}/${file}`;
      const fileName = file.substr(0, file.indexOf(".svg"));

      return fse
        .readFile(fullPath)
        .then(sourceBuffer => {
          return svg2png(sourceBuffer, {
            width: pngConverterConfig.width,
            height: pngConverterConfig.height
          });
        })
        .then(buffer => {
          spin.stop(true);
          bar.tick();
          fse.writeFile(`${destination}/${fileName}.png`, buffer);
          return Promise.resolve({ fileName });
        })
        .catch(e => console.error(e));
    })
  ).then(data => {
    spin.stop(true);
    bar.complete
      ? console.log(
          chalk.hex(styles.colors.mint)(
            `✓ Klara saved ${data.length} PNG ${
              data.length > 1 ? "files" : "files"
            } generated from SVGs`
          )
        )
      : console.log("");

    config.pngSprite.active ? pngSpriter(`${destination}`) : "";
  });
};
