const fse = require("fs-extra");
const path = require("path");
const CONFIG = require(`${process.cwd()}/icons.config.js`);
const svg2png = require("svg2png");
const pBar = require("../utils/pBar");
const chalk = require("chalk");
const styles = require("../../styles/chalkStyle");
const spinner = require("../utils/spinner");
const { fork } = require("child_process");

const PNG_CONVERTER_CONFIG = CONFIG.pngConverter.settings;

/* Invokes forked child process on message from the parent */
process.on("message", data => {
  pngConverter(data);
});

async function pngConverter(data) {
  /* Create an array of modified files */
  const filesArr = data.map(item => {
    return item.fileName;
  });
  /* Builds destination directory for PNG files */
  const dir = data[0]["modified"];
  const upperDir = dir.substr(0, dir.lastIndexOf("/"));
  const categoryName = dir.substr(
    dir.indexOf("/") + 1,
    dir.lastIndexOf("/") - 2
  );
  const destination = `${upperDir}/PNG`;
  fse.ensureDir(`${destination}`);

  /* Set Progress Bar and Spinner */
  const processMsg = chalk.hex(styles.colors.blue)(
    `⚛ Klara is converting ${categoryName} to PNG files`
  );
  const spin = spinner("");
  spin.setSpinnerString(27);
  process.stderr.clearLine();
  process.stdout.cursorTo(0);
  /* Start spinner */
  return Promise.all(
    /* Iterate over array of files to be converted into png */
    filesArr.map(async file => {
      /* Find full path to every SVG to be converted into PNG*/
      const fullPath = `${dir}/${file}`;
      const fileName = file.substr(0, file.indexOf(".svg"));

      /* Read file and start conversion.
      ** svg2png doesn't support readable streams.
      */
      return await fse
        .readFile(fullPath)
        .then(async sourceBuffer => {
          return await svg2png(sourceBuffer, {
            width: PNG_CONVERTER_CONFIG.width,
            height: PNG_CONVERTER_CONFIG.height
          }).then(async buffer => {
            await fse.writeFile(`${destination}/${fileName}.png`, buffer);
            return Promise.resolve({ destination });
          });
        })
        .catch(error => console.error(error));
    })
  )
    .then(async data => {
      /* Send information that process has been done to the parent */
      process.stderr.clearLine();
      process.stdout.cursorTo(0);
      console.log(
        chalk.hex(styles.colors.mint)(
          `✓ ${chalk.bold(categoryName)}: ${data.length} PNG ${
            data.length > 1 ? "files" : "file"
          } saved!\r`
        )
      );

      /* Fork the pngSpriter and if png spriter is active in the config – run it */
      const forkedPNGSpriter = fork(`${path.resolve(__dirname)}/pngSpriter.js`);
      CONFIG.pngSprite.active ? forkedPNGSpriter.send(`${destination}`) : "";

      forkedPNGSpriter.on("close", () => {
        /* Make sure that the process exits */
        process.exit();
        process.kill("SIGTERM");
      });
    })
    .catch(err => console.error(err));
}
