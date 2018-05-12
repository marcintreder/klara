const chalk = require("chalk");
const styles = require("../styles/chalkStyle");

/* Chalk functions for styling questions */
const headerChalk = text => styles.text.headerChalk(text);
const defaultChalk = text => styles.text.defaultChalk(text);

function iconFontChecker(answers) {
  return answers.assets.indexOf("Icon Fonts") > -1;
}

function svgChecker(answers) {
  return answers.assets.indexOf("SVGs") > -1;
}

function svgSpriteChecker(answers) {
  return answers.assets.indexOf("SVG Sprites") > -1;
}

function pngChecker(answers) {
  return answers.assets.indexOf("PNGs") > -1;
}

function pngSpriteChecker(answers) {
  return answers.assets.indexOf("PNG Sprites") > -1;
}

module.exports = [
  {
    type: "input",
    name: "url",
    message: `${headerChalk(
      "UXPin Design System:"
    )} Copy/Paste link to your design system in UXPin: `,
    default:
      "https://designtokens.uxpin.com/designSystems/hash/561bd39b43b4acaf6597/data/json"
  },
  {
    type: "checkbox",
    name: "assets",
    message: `${headerChalk(
      "Icons:"
    )} Which assets would you like to generate for your icons?`,
    choices: [
      { name: "SVGs" },
      { name: "PNGs" },
      { name: "Icon Fonts" },
      { name: "SVG Sprites" },
      { name: "PNG Sprites" }
    ],
    default: ["SVGs"]
  },
  {
    type: "input",
    name: "iconFont_dest",
    message: `${headerChalk(
      "Icon Fonts:"
    )} Where would you like to save your iconFonts (${defaultChalk(
      "Press <enter> to keep default"
    )})?`,
    default: function() {
      return "./IconFonts";
    },
    when: function(answers) {
      return iconFontChecker(answers);
    }
  },
  {
    type: "checkbox",
    name: "iconFont_type",
    message: `${headerChalk(
      "Icon Fonts_type:"
    )} Which types of Icon Fonts would you like to generate?`,
    choices: [
      { name: "ttf" },
      { name: "eot" },
      { name: "woff" },
      { name: "woff2" },
      { name: "svg" }
    ],
    default: ["ttf"],
    when: function(answers) {
      return iconFontChecker(answers);
    }
  },
  {
    type: "confirm",
    name: "iconFont_css",
    message: `${headerChalk(
      "Icon Fonts:"
    )} Would you like to generate CSS files for your Icon Fonts?`,
    default: "no",
    when: function(answers) {
      return iconFontChecker(answers);
    }
  },
  {
    type: "confirm",
    name: "iconFont_html",
    message: `${headerChalk(
      "Icon Fonts:"
    )} Would you like to generate HTML preview for your Icon Fonts?`,
    default: "no",
    when: function(answers) {
      return iconFontChecker(answers);
    }
  },
  {
    type: "confirm",
    name: "svgo",
    message: `${headerChalk(
      "SVG:"
    )} Would you like to optimize your SVG files with SVGO?`,
    when: function(answers) {
      return svgChecker(answers);
    }
  },
  {
    type: "input",
    name: "svg_sprite_dest",
    message: `${headerChalk(
      "SVG Sprite:"
    )} Where would you like to save your SVG Sprites (${defaultChalk(
      "Press <enter> to keep default"
    )})?`,
    default: function() {
      return "./SVGSprites";
    },
    when: function(answers) {
      return svgSpriteChecker(answers);
    }
  },
  {
    type: "checkbox",
    name: "svg_sprite_type",
    message: `${headerChalk(
      "SVG Sprite:"
    )} Which types of SVG Sprites would you like to generate?`,
    choices: [
      { name: "css" },
      { name: "view" },
      { name: "defs" },
      { name: "symbol" },
      { name: "stack" }
    ],
    default: ["css"],
    when: function(answers) {
      return svgSpriteChecker(answers);
    }
  },
  {
    type: "input",
    name: "png_dest",
    message: `${headerChalk(
      "PNG:"
    )} Where would you like to save your PNG files (${defaultChalk(
      "Press <enter> to keep default"
    )})?`,
    default: function() {
      return "./PNG";
    },
    when: function(answers) {
      return pngChecker(answers);
    }
  },
  {
    type: "input",
    name: "png_sprite_dest",
    message: `${headerChalk(
      "PNG Sprite:"
    )} Where would you like to save your PNG sprites (${defaultChalk(
      "Press <enter> to keep default"
    )})?`,
    default: function() {
      return "./PNGSprite";
    },
    when: function(answers) {
      return pngSpriteChecker(answers);
    }
  },
  {
    type: "list",
    name: "png_sprite_stylesheet",
    message: `${headerChalk(
      "PNG Sprite:"
    )} Which kind of stylesheet would you like to generate for your PNG Sprites?`,
    choices: [
      { name: "scss" },
      { name: "sass" },
      { name: "less" },
      { name: "stylus" },
      { name: "css" },
      { name: "prefixed-css" }
    ],
    default: "scss",
    when: function(answers) {
      return pngSpriteChecker(answers);
    }
  },
  {
    type: "list",
    name: "png_sprite_layout",
    message: `${headerChalk(
      "PNG Sprite:"
    )} How would you like to arrange icons in the PNG sprite?`,
    choices: [
      { name: "packed" },
      { name: "vertical" },
      { name: "horizontal" },
      { name: "diagonal" }
    ],
    default: "packed",
    when: function(answers) {
      return pngSpriteChecker(answers);
    }
  }
];
