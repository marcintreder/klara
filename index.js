#!/usr/bin/env node
const fse = require("fs-extra");
const configTemplate = require("./templates/config.template");
/* CLI tools */
const inquirer = require("inquirer");
const clear = require("clear");
const questions = require("./templates/onboarding.questions");
const chalk = require("chalk");
const styles = require("./styles/chalkStyle");
const spinner = require("./tools//utils/spinner");

if (fse.existsSync(`${process.cwd()}/icons.config.js`)) {
  const assetsDownloader = require("./tools/assetsDownloader.js");
  assetsDownloader();
} else {
  createConfig();
}

function createConfig() {
  /* Clear terminal window */
  clear();
  /* Chalk functions for styling questions */
  const titleChalk = text => styles.text.titleChalk(text);
  const headerChalk = text => styles.text.headerChalk(text);
  const defaultChalk = text => styles.text.defaultChalk(text);

  /* Welcome Messages */
  console.log(
    `${titleChalk(
      "Welcome to Klara! The bridge between assets in UXPin based design systems and your development environment!"
    )}`
  );
  console.log("\n");
  console.log(
    `${defaultChalk(
      "To start, we have to learn a little bit about your process."
    )}`
  );
  console.log(
    `${defaultChalk(
      "Please answer the questions below, so we can generate a custom tailored config for you."
    )}`
  );
  console.log("\n");
  console.log(
    `${defaultChalk(
      `PS. Klara has been named as a tribute to Klara Dan von Neumann - one of the first programmers!`
    )}`
  );
  console.log("\n");

  inquirer
    .prompt(questions)
    .then(answers => {
      /* Modify and save config template */

      /* DS URL */
      configTemplate.url = answers.url;

      /* Icon Font Settings */
      configTemplate.webfontConfig.active =
        answers.operations.indexOf("Convert SVGs to Icon Fonts") > -1;
      configTemplate.webfontConfig.settings.types = answers.iconFont_type
        ? answers.iconFont_type
        : "";
      configTemplate.webfontConfig.settings.order = answers.iconFont_type
        ? answers.iconFont_type
        : "";
      configTemplate.webfontConfig.settings.css = answers.iconFont_css
        ? answers.iconFont_css
        : false;
      configTemplate.webfontConfig.settings.html = answers.iconFont_html
        ? answers.iconFont_html
        : false;

      /* SVG Settings */
      configTemplate.svgo.active = answers.svgo;

      /* SVG Sprite Settings */
      configTemplate.svgSprite.active =
        answers.operations.indexOf("Convert SVGs to SVG Sprites") > -1;
      svgSpriteTypes = ["css", "view", "defs", "symbol", "stack"];
      svgSpriteTypes.map(item => {
        if (answers.svg_sprite_type) {
          return (configTemplate.svgSprite.settings.mode[item] =
            answers.svg_sprite_type.indexOf(item) > -1);
        } else {
          return (configTemplate.svgSprite.settings.mode[item] = false);
        }
      });

      /* PNG Settings */
      configTemplate.pngConverter.active = answers.operations.indexOf("Convert SVGs to PNGs") > -1;
    
      /* PNG Sprite Settings */
      configTemplate.pngSprite.active =
        answers.operations.indexOf("Convert PNGs to PNG Sprites") > -1;

      configTemplate.pngSprite.settings.stylesheet = answers.png_sprite_stylesheet
        ? answers.png_sprite_stylesheet
        : "";

      configTemplate.pngSprite.settings.layout = answers.png_sprite_layout
        ? answers.png_sprite_layout
        : "";
    })
    .then(() => {
      const json = JSON.stringify(configTemplate, null, 4);
      const moduleString = `module.exports = ${json};`;
      fse.writeFileSync(
        `${process.cwd()}/icons.config.js`,
        moduleString,
        "utf8");
      console.log(chalk.hex(styles.colors.blue)("✓ config file created. Time to generate files!"));

      const spin = spinner("❊ Getting ready...");
      spin.setSpinnerString(27);
      spin.start();
    
      setTimeout(()=> {
        spin.stop(true);
        if (fse.existsSync(`${process.cwd()}/icons.config.js`)) {
          const assetsDownloader = require("./tools/assetsDownloader.js");
          assetsDownloader();
        }
      }, 4000);      
    });
}
