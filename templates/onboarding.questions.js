const chalk = require("chalk");
const styles = require("../styles/chalkStyle");

/* Chalk functions for styling questions */
const headerChalk = text => styles.text.headerChalk(text);
const defaultChalk = text => styles.text.defaultChalk(text);

function iconFontChecker(answers) {
  return answers.operations.indexOf("Convert SVGs to Icon Fonts") > -1;
}

function svgSpriteChecker(answers) {
  return answers.operations.indexOf("Convert SVGs to SVG Sprites") > -1;
}

function pngChecker(answers) {
  return answers.operations.indexOf("Convert SVGs to PNGs") > -1;
}

function pngSpriteChecker(answers) {
  return answers.operations.indexOf("Convert PNGs to PNG Sprites") > -1;
}

module.exports = [
  {
    type: "input",
    name: "url",
    message: `${headerChalk(
      "UXPin Design System:"
    )} Copy/Paste link to the data JSON from your design system in UXPin: `,
    default:
      "https://designtokens.uxpin.com/designSystems/hash/561bd39b43b4acaf6597/data/json"
  },
  {
    type: "checkbox",
    name: "operations",
    message: `${headerChalk(
      "Icons:"
    )} What would you like to do with your assets?`,
    choices: [
      { name: "Convert SVGs to Icon Fonts" },
      { name: "Convert SVGs to PNGs" },
      { name: "Convert SVGs to SVG Sprites" },
      { name: "Convert PNGs to PNG Sprites" }
    ],
    default: ["Convert SVGs to Icon Fonts"]
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
    )} Would you like to optimize your SVG files with SVGO?`
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
