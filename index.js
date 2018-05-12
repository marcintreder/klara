#!/usr/bin/env node
const fse = require("fs-extra");
const configTemplate = require("./templates/config.template");
/* CLI tools */
const inquirer = require("inquirer");
const clear = require("clear");
const questions = require("./templates/onboarding.questions");
const chalk = require("chalk");
const styles = require("./styles/chalkStyle");

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
      "Welcome to Klara! The bridge between UXPin based Design Systems and your development environment!"
    )}`
  );
  console.log("             ");
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
  console.log("             ");
  console.log(
    `${defaultChalk(
      `PS. Klara has been named as a tribute to Klara Dan von Neumann - one of the first programmers!`
    )}`
  );
  console.log("             ");

  inquirer
    .prompt(questions)
    .then(answers => {
      /* Modify and save config template */

      /* DS URL */
      configTemplate.url = answers.url;

      /* Icon Font Settings */
      configTemplate.webfontConfig.active =
        answers.assets.indexOf("Icon Fonts") > -1;
      configTemplate.webfontConfig.settings.dest = answers.iconFont_dest
        ? answers.iconFont_dest
        : "./IconFonts";
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
        answers.assets.indexOf("SVG Sprites") > -1;
      configTemplate.svgSprite.settings.dest = answers.svg_sprite_dest
        ? answers.svg_sprite_dest
        : "./SVGSprites";
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
      configTemplate.pngConverter.active = answers.assets.indexOf("PNGs") > -1;
      configTemplate.pngConverter.settings.dest = answers.png_dest
        ? answers.png_dest
        : "./PNGSprites";

      /* PNG Sprite Settings */
      configTemplate.pngSprite.active =
        answers.assets.indexOf("PNG Sprites") > -1;

      configTemplate.pngSprite.dest = answers.png_sprite_dest
        ? answers.png_sprite_stylesheet
        : "";

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
        "utf8"
      );
      console.log(chalk.hex(styles.colors.mint)("✓ config file created"));
    });
}
