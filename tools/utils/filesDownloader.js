const fse = require("fs-extra");
const download = require("download");
const remote = require("remote-file-size");
/* CLI Dependencies */
//const progressBar = require("progress");
// const Spinner = require("cli-spinner").Spinner;
const chalk = require("chalk");
const styles = require("../../styles/chalkStyle");
/* Klara's tools and plugins */
const SVGO = require("svgo");
const svgSpriter = require("../svgSpriter");
const iconFontsCreator = require("../iconFontsCreator");
const pngConverter = require("../pngConverter");
const pngSpriter = require("../pngSpriter");
const pBar = require("./pBar");
const CONFIG = require(`${process.cwd()}/icons.config.js`);

/* Download all the files at once, so files can be used for
** transformations such as Icon Fonts, Sprites and PNG from SVG creations.
 */
module.exports = function filesDownloader(dir, assetsArr) {
  /* Progress bar */
  const downloadMsg = chalk.bold.hex(styles.colors.blue)(
    `⚛ Klara is checking assets on UXPin servers –`
  );
  const catName = dir.substring(dir.lastIndexOf("/") + 1);

  const bar = pBar(downloadMsg, catName, assetsArr.length);
  const svgo = new SVGO(CONFIG.svgo.settings);

  /* Attempt to download all files */
  Promise.all(
    assetsArr.map(item =>
      download(item.url)
        .then(data => {
          bar.tick();
          /* When file exists check if there were any changes */
          if (fse.existsSync(item.fullDirectory)) {
            function fileTester() {
              /* Load local file to string and check its size.
              ** This is used to check whether online and local files
              ** are the same for non-svg file formats.
              */
              const localFile = fse.readFileSync(item.fullDirectory, "utf8");
              const localFileSize = fse.statSync(item.fullDirectory).size;
              /* Check if file is an SVG and if SVGO is active */
              if (item.type === "svg" && CONFIG.svgo.active) {
                /* Optimize content of the file with SVGO so a comparison
                ** of local optimized file and file store on the server
                ** (pre–optimized) is going to be possible.
                 */
                return svgo.optimize(data).then(function(result) {
                  if (result.data !== localFile) {
                    console.log(`Overwriting: ${item.fullName}`);
                    fse.writeFile(item.fullDirectory, result.data);
                    /* Return a promise with the relevant data for
                    ** other operations.
                     */
                    return Promise.resolve({
                      modified: item.directory,
                      fileName: item.fullName
                    });
                  } else {
                    /* If local and online files are identical – resolve the promise
                    ** with an 'unmodified' flag.
                     */
                    return Promise.resolve({ unmodified: item.directory });
                  }
                });
              } else if (item.type === "svg" && !CONFIG.svgo.active) {
                /* Files comparison when SVGO clean-up is turned off */
                const svgString = data.toString();
                if (svgString !== localFile) {
                  console.log(`Overwriting: ${item.fullName}`);
                  fse.writeFile(item.fullDirectory, data);
                  return Promise.resolve({
                    modified: item.directory,
                    fileName: item.fullName
                  });
                } else {
                  return Promise.resolve({ unmodified: item.directory });
                }
              } else if (item.type !== "svg") {
                /* For non-svg files, compare the size on the server
                ** with the locally stored file.
                 */
                return new Promise((resolve, reject) => {
                  remote(item.url, (err, fileSize) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(fileSize);
                    }
                  });
                }).then(onlineSize => {
                  if (localFileSize !== onlineSize) {
                    console.log(`Overwriting: ${item.fullName}`);
                    fse.writeFileSync(item.fullDirectory, data);
                    return Promise.resolve({
                      modified: item.directory,
                      fileName: item.fullName
                    });
                  } else {
                    return Promise.resolve({ unmodified: item.directory });
                  }
                });
              }
            }
            /* Callback for the fileTester function */
            return fileTester();
          } else {
            /* If a directory doesn't exist yet, create it
            ** and download all the files.
            */
            if (item.type === "svg" && CONFIG.svgo.active) {
              return svgo.optimize(data).then(function(result) {
                fse.writeFileSync(item.fullDirectory, result.data);
                return Promise.resolve({
                  modified: item.directory,
                  fileName: item.fullName
                });
              });
            } else {
              fse.writeFileSync(item.fullDirectory, data);
              return Promise.resolve({
                modified: item.directory,
                fileName: item.fullName
              });
            }
          }
        })
        .catch(error => {
          console.log(error);
          return error;
        })
    )
  )
    .then(data => {
      /* Check if any files have been saved or modified.
      ** If yes then data passed from the Promise should have
      ** items with key "modified".
      */
      const modifiedCategory = data.filter(item => {
        return item["modified"];
      });

      const categoryName =
        modifiedCategory.length > 0
          ? modifiedCategory[0]["modified"].substring(
              modifiedCategory[0]["modified"].indexOf("/") + 1,
              modifiedCategory[0]["modified"].lastIndexOf("/")
            )
          : data[0]["unmodified"].substring(
              data[0]["unmodified"].indexOf("/") + 1,
              data[0]["unmodified"].lastIndexOf("/")
            );
      const confirmationMsg =
        modifiedCategory.length > 0
          ? chalk.hex(styles.colors.mint)(
              `✓ Klara checked ${
                assetsArr.length
              } files in category ${categoryName} and saved ${
                modifiedCategory.length
              } of them.`
            )
          : chalk.hex(styles.colors.mint)(
              `✓ Klara checked ${
                assetsArr.length
              } files in category ${categoryName} and didn't save any of them. Most likely no assets in the design system stored in UXPin were changed.`
            );

      bar.complete ? console.log(confirmationMsg) : "";

      if (modifiedCategory.length > 0) {
        /* Extract category name */
        const category = modifiedCategory[0]["modified"];
        /* Read files from the category */
        const filesArr = fse.readdirSync(category);
        /* Find the file type(s) */
        const fileType = filesArr.reduce((a, b) => {
          const aType = a.substring(a.lastIndexOf(".") + 1).toLowerCase();
          const bType = b.substring(b.lastIndexOf(".") + 1).toLowerCase();
          if (aType === bType) {
            return aType;
          } else {
            return "multiple";
          }
        });

        if (fileType === "png") {
          CONFIG.pngSprite.active ? pngSpriter(category) : "";
        } else if (fileType === "svg") {
          CONFIG.webfontConfig.active ? iconFontsCreator(category) : "";
          CONFIG.svgSprite.active ? svgSpriter(category) : "";
          CONFIG.pngConverter.active ? pngConverter(modifiedCategory) : "";
        }
      } else {
        /* Currently no tools are ready to work with other
        ** formats than SVG and PNG. These files will be downloaded though.
        */
        return;
      }
    })
    .catch(error => {
      console.log(error);
      return error;
    });
};
