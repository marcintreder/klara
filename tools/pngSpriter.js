const fse = require("fs-extra");
const path = require("path");
const config = require(`${process.cwd()}/icons.config.js`);
const nsg = require("node-sprite-generator");
const chalk = require("chalk");
const styles = require("../styles/chalkStyle");

module.exports = function pngSpriter(dir) {
  const categoryName = dir.substr(dir.indexOf("./"), dir.lastIndexOf("/"));
  const pngSpriterConfig = config.pngSprite.settings;
  const upperDir = dir.substr(0, dir.lastIndexOf("/"));
  const pngSpriterSrc = upperDir;
  const pngSpriterDest = `${upperDir}/sprites`;

  fse.ensureDirSync(`${pngSpriterDest}/pngSprite`);

  const srcObj = { src: [`${dir}/*.png`] };
  const spritePathObj = {
    spritePath: `${pngSpriterDest}/pngSprite/${categoryName}Sprite.png`
  };

  const stylesSelector = () => {
    if (pngSpriterConfig.stylesheet === "scss") {
      return "scss";
    } else if (pngSpriterConfig.stylesheet === "sass") {
      return "sass";
    } else if (pngSpriterConfig.stylesheet === "css") {
      return "css";
    } else if (pngSpriterConfig.stylesheet === "prefixed-css") {
      return "css";
    } else if (pngSpriterConfig.stylesheet === "less") {
      return "less";
    } else if (pngSpriterConfig.stylesheet === "javascript") {
      return "js";
    }
  };
  const stylesheetPathObj = {
    stylesheetPath: `${pngSpriterDest}/pngSprite/${categoryName}Sprite.${stylesSelector()}`
  };

  const mergedConfig = Object.assign(
    srcObj,
    spritePathObj,
    stylesheetPathObj,
    pngSpriterConfig
  );

  nsg(mergedConfig, () => {
    process.stderr.clearLine();
    process.stdout.cursorTo(0);
    console.log(
      chalk.hex(styles.colors.mint)(
        `✓ PNG Sprite Files for ${categoryName} saved!`
      )
    );
  });
};
