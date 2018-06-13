#!/usr/bin/env node
const fse = require("fs-extra");
const path = require("path");
/* Fetch tools */
const fetch = require("node-fetch");
/* CLI Styles */
const styles = require("../styles/chalkStyle");
const chalk = require("chalk");
const clear = require("clear");
const spinner = require("./utils/spinner");
/* Klara's utility functions */
const urlValidator = require("./utils/urlValidator.js");
const filesIterator = require("./download/filesIterator.js");
const filesDownloader = require("./download/filesDownloader.js");
/* Config generated by CLI tool */
const CONFIG = require(`${process.cwd()}/icons.config.js`);

module.exports = function assetsDownloader() {
  /* Clear terminal */
  clear();

  /* Show Klara welcome message */
  const titleChalk = text => styles.text.titleChalk(text);
  console.log(
    titleChalk(
      "Klara – The bridge between assets in UXPin based design systems and your development environment!"
    )
  );

  /* Set loader/spinner */
  const spin = spinner("Processing your asset files");
  spin.setSpinnerString(27);
  process.stderr.clearLine();
  process.stdout.cursorTo(0);
  spin.start();
  process.stderr.clearLine();
  process.stdout.cursorTo(0);

  const spin2 = spinner(
    "Double–checking whether all files were successfully downloaded."
  );
  spin2.setSpinnerString(27);

  /* Fetch JSON from UXPin servers */
  (function() {
    /* Validate url passed to config. Make sure that even if user passed
    ** url to the entire design system, the right URL to the JSON is being
    ** created.
    */
    let url = urlValidator(CONFIG.url);
    return fetch(url)
      .then(response => response.json())
      .then(json => json.find(obj => obj.type === "assets"))
      .then(async assets => {
        /* Filter-out empty categories */
        const filteredArray = assets.categories.filter(
          item => item.items.length !== 0
        );
        return await filteredArray.map(item => {
          /* Eliminate whitespace and punctuation from categories names */
          const name = item.name.replace(/[.,\s\/#!$%\^&\*;:{}=\-_`~()]/g, "");
          const files = item.items;
          const assetsObj = { name: name, items: files };
          return filesIterator(assetsObj);
        });
      })
      .then(async data => {
        const dataArr = await data.map(elem => {
          return new Promise(async (resolve, reject) => {
            await filesDownloader(elem.categoryDir, elem.assetsArr);
            return resolve(elem);
          });
        });
        return Promise.all(dataArr).catch(error => console.error(error));
      })
      .then(async data => {
        spin.stop(true);
        let dataMod = JSON.parse(JSON.stringify(data));

        spin2.start();
        function stopSpinner() {
          spin2.stop(true);
        }
        setTimeout(stopSpinner, 10000);
        await process.on("beforeExit", async () => {
          /* Check if all the files were downloaded */
          if (dataMod.length > 0) {
            const dataArr = dataMod.map(item => {
              const localAssetDir = item.assetsArr[0].directory;
              const categoryName = item.categoryDir.replace("./", "");
              const onlineFilesCount = item.assetsArr.length;

              const localFiles = fse.readdir(
                localAssetDir,
                async (err, files) => {
                  const localFilesCount = files.length;
                  if (localFilesCount !== onlineFilesCount) {
                    await filesDownloader(item.categoryDir, item.assetsArr);
                  } else {
                    dataMod = dataMod.filter(
                      elem => elem.categoryDir !== item.categoryDir
                    );
                  }
                }
              );
            });
            return await Promise.all(dataArr).catch(error =>
              console.error(error)
            );
          } else {
            process.exit(0);
            process.kill("SIGTERM");
          }
        });
        /* App exit message */
        process.on("exit", function() {
          process.stderr.clearLine();
          process.stdout.cursorTo(0);
          console.log(
            chalk.hex(
              styles.colors.green
            )(`♕ Klara's job is done! \n★ Be nice to people and don't forget about Klara Dan von Neumann – one of the very first programmers!\r
          `)
          );
        });
      })
      .catch(error => console.error(error));
  })();
};
