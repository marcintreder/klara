const fse = require("fs-extra");
const path = require("path");
const request = require("superagent");
const remote = require("remote-file-size");
const Throttle = require("superagent-throttle");
/* CLI Dependencies */
const chalk = require("chalk");
const styles = require("../../styles/chalkStyle");
/* Klara's tools and plugins */
const SVGO = require("svgo");
const CONFIG = require(`${process.cwd()}/icons.config.js`);

const { fork } = require("child_process");

/* Download all the files at once, so files can be used for
** transformations such as Icon Fonts, Sprites and PNG from SVG creations.
*/

module.exports = function filesDownloader(dir, assetsArr) {
  const catName = dir.substring(dir.lastIndexOf("/") + 1);

  const svgo = new SVGO(CONFIG.svgo.settings);

  /* Downloads all the files and passes buffers over to a function responsible for writing files */
  async function getFiles() {
    let throttle = new Throttle({
      active: true, // set false to pause queue
      rate: 3, // how many requests can be sent every `ratePer`
      ratePer: 1000, // number of ms in which `rate` requests may be sent
      concurrent: 1 // how many requests can be sent concurrently
    });

    const filesArr = await assetsArr.map(async item => {
      const cdnURL = `https://uc.uxpin.com${item.url.replace(
        "https://s3.amazonaws.com/upload.uxpin",
        ""
      )}`;
      return await new Promise((resolve, reject) => {
        return request
          .get(cdnURL)
          .use(throttle.plugin())
          .timeout({
            response: 5000, // Wait 5 seconds for the server to start sending,
            deadline: 100000 // but allow 10 minute for the file to finish loading.
          })
          .retry(3)
          .then(res => {
            return resolve({
              name: item.name,
              type: item.type,
              url: cdnURL,
              fullName: item.fullName,
              category: item.category,
              directory: item.directory,
              fullDirectory: item.fullDirectory,
              buffer: res.body
            });
          })
          .catch(error => {
            console.error(error);
            process.stderr.clearLine();
            process.stdout.cursorTo(0);
            return reject(
              chalk.hex(styles.colors.red)(
                `☝︎ ${chalk.bold(item.category)}: Error while downloading ${
                  item.fullName
                }. \n  Don't worry! Klara will attempt to download this file again at the end of the process.\r`
              )
            );
          });
      });
    });
    return Promise.all(filesArr);
  }

  async function writeFiles(data) {
    const filesArr = await data.map(async item => {
      /* Check if file exists */

      if (fse.existsSync(item.fullDirectory)) {
        /* Load local file to string and check its size.
				** This is used to check whether online and local files
				** are the same for non-svg file formats.
			  */
        const localFile = await fse.readFile(item.fullDirectory, "utf-8");
        const localFileSize = fse.statSync(item.fullDirectory).size;

        /* Check if file is an SVG and if SVGO is active */
        if (item.type === "svg" && CONFIG.svgo.active) {
          /* Optimize content of the file with SVGO so a comparison
										** of local optimized file and file store on the server
										** (pre–optimized) is going to be possible.
											*/
          return await svgo.optimize(item.buffer).then(async function(result) {
            if (result.data !== localFile.toString()) {
              process.stderr.clearLine();
              process.stdout.cursorTo(0);
              console.log(
                chalk.hex(styles.colors.orange)(
                  `✍︎ Overwriting: ${item.fullName}`
                )
              );
              await fse.writeFile(item.fullDirectory, result.data);
              //writeStream.write(result.data);
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
          if (result.data !== localFile.toString()) {
            process.stderr.clearLine();
            process.stdout.cursorTo(0);
            console.log(
              chalk.hex(styles.colors.orange)(
                `✍︎ Overwriting: ${item.fullName}`
              )
            );
            fse.writeFile(item.fullDirectory, item.buffer);
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
          return new Promise(async (resolve, reject) => {
            await remote(item.url, (err, fileSize) => {
              if (err) {
                reject(err);
              } else {
                resolve(fileSize);
              }
            });
          }).then(async onlineSize => {
            if (localFileSize !== onlineSize) {
              process.stderr.clearLine();
              process.stdout.cursorTo(0);
              console.log(
                chalk.hex(styles.colors.orange)(`Overwriting: ${item.fullName}`)
              );
              await fse.writeFile(item.fullDirectory, item.buffer);
              //writeStream.write(item.buffer);
              return Promise.resolve({
                modified: item.directory,
                fileName: item.fullName
              });
            } else {
              return Promise.resolve({ unmodified: item.directory });
            }
          });
        }
      } else {
        /* File doesn't exist */
        /* If a directory doesn't exist yet, create it
						** and download all the files.
						*/
        if (item.type === "svg" && CONFIG.svgo.active) {
          await svgo.optimize(item.buffer).then(async function(result) {
            return await fse.writeFile(item.fullDirectory, result.data);
          });
          //writeStream.end();
          return Promise.resolve({
            modified: item.directory,
            fileName: item.fullName
          });
        } else {
          //writeStream.write(item.buffer);
          //writeStream.end();
          await fse.writeFile(item.fullDirectory, item.buffer);
          return Promise.resolve({
            modified: item.directory,
            fileName: item.fullName
          });
        }
      }
    });
    return await Promise.all(filesArr);
  }

  async function transformFiles(data) {
    /* Check if any files have been saved or modified.
            ** If yes then data passed from the Promise should have
            ** items with key "modified".
            */
    return await new Promise(async (resolve, reject) => {
      const modifiedCategory = await data.filter(item => {
        if (item["modified"]) {
          return item["modified"];
        } else {
          return false;
        }
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

      if (modifiedCategory.length > 0) {
        const category = modifiedCategory[0]["modified"];

        /*const categoryName = modifiedCategory[0]["modified"].substring(
          modifiedCategory[0]["modified"].indexOf("/") + 1,
          modifiedCategory[0]["modified"].lastIndexOf("/")
        );
        /*
          modifiedCategory.length > 0
            ? modifiedCategory[0]["modified"].substring(
                modifiedCategory[0]["modified"].indexOf("/") + 1,
                modifiedCategory[0]["modified"].lastIndexOf("/")
              )
            : data[0]["unmodified"].substring(
                data[0]["unmodified"].indexOf("/") + 1,
                data[0]["unmodified"].lastIndexOf("/")
              )*/

        const filesArr = await modifiedCategory.map(item => item.fileName);
        const filesTypesArr = await filesArr.map(item => {
          return item.substring(item.lastIndexOf(".") + 1).toLowerCase();
        });
        const fileType = (await filesTypesArr.every(item => filesTypesArr[0]))
          ? filesTypesArr[0]
          : "multiple";

        const confirmationMsg =
          modifiedCategory.length > 0
            ? chalk.hex(styles.colors.mint)(
                `✓ ${chalk.bold(categoryName)}: Klara checked ${
                  assetsArr.length
                } and saved ${modifiedCategory.length} of them.\r`
              )
            : chalk.hex(styles.colors.mint)(
                `✓ ${chalk.bold(categoryName)}: Klara checked ${
                  assetsArr.length
                } and didn't save any of them. \nYou have the latest version of all files.\r`
              );
        process.stderr.clearLine();
        process.stdout.cursorTo(0);
        console.log(confirmationMsg);

        resolve({
          category: category,
          modifiedCategory: modifiedCategory,
          fileType: fileType
        });
      } else {
        console.log(
          chalk.hex(styles.colors.mint)(
            `✓ ${chalk.bold(
              categoryName
            )}: No changes detected. You're up to date!\r`
          )
        );

        resolve({
          category: "unmodified",
          modifiedCategory: "unmodified",
          fileType: "unmodified"
        });
      }
    }).catch(error => console.error(error));
  }

  function iconFontsDispatcher(modData, forkedFontsCreator) {
    //iconFontsCreator(modData.category);
    forkedFontsCreator.send(modData.category);
    return modData;
  }

  function svgSpriterDispatcher(modData, forkedSVGSpriter) {
    forkedSVGSpriter.send(modData.category);
    return modData;
  }

  async function pngSpriterDispatcher(modData, forkedPNGSpriter) {
    const pngCategory = modData.category.replace("SVG", "PNG");
    const filesArr = await fse.readdir(pngCategory);

    if (filesArr.length > 0) {
      await forkedPNGSpriter.send(pngCategory);
      return modData;
    }
  }

  async function pngConverterDispatcher(modData, forkedPNGConverter) {
    /* Forked process */
    await forkedPNGConverter.send(modData.modifiedCategory);
    return modData;
  }

  return getFiles()
    .then(async data => await writeFiles(data))
    .then(async data => await transformFiles(data))
    .then(async modData => {
      if (modData.fileType === "svg" && CONFIG.webfontConfig.active) {
        /* Create forked process */
        const forkedFontsCreator = fork(
          `${path
            .resolve(__dirname)
            .replace("download", "")}/transformations/iconFontsCreator.js`
        );
        /* Send Process to the dispatcher */
        return await iconFontsDispatcher(modData, forkedFontsCreator);
      } else if (modData.fileType === "png" && CONFIG.pngSprite.active) {
        const forkedPNGSpriter = fork(
          `${path
            .resolve(__dirname)
            .replace("download", "")}/transformations/pngSpriter.js`
        );

        return await pngSpriterDispatcher(modData, forkedPNGSpriter);
      } else {
        return modData;
      }
    })
    .then(async modData => {
      if (modData.fileType === "svg" && CONFIG.svgSprite.active) {
        const forkedSVGSpriter = fork(
          `${path
            .resolve(__dirname)
            .replace("download", "")}/transformations/svgSpriter.js`
        );

        return await svgSpriterDispatcher(modData, forkedSVGSpriter);
      } else {
        return modData;
      }
    })
    .then(async modData => {
      if (modData.fileType === "svg" && CONFIG.pngConverter.active) {
        /* Create fork for the pngConverter */
        const forkedPNGConverter = fork(
          `${path
            .resolve(__dirname)
            .replace("download", "")}/transformations/pngConverter.js`
        );
        return await pngConverterDispatcher(modData, forkedPNGConverter);
      } else {
        return modData;
      }
    })
    .catch(error => console.error(error));
};
