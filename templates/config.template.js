module.exports = {
  url:
    "https://designtokens.uxpin.com/designSystems/hash/561bd39b43b4acaf6597/data/json",
  webfontConfig: {
    active: true,
    settings: {
      dest: "./IconFont",
      css: true,
      html: true,
      types: ["woff2", "woff", "eot", "svg"],
      order: ["eot", "woff2", "woff", "ttf", "svg"]
    }
  },
  svgSprite: {
    active: true,
    settings: {
      dest: "./SVGSprites",
      mode: {
        css: true,
        view: true,
        defs: true,
        symbol: true,
        stack: true
      }
    }
  },
  pngSprite: {
    active: true,
    src: "./PNG",
    dest: "./PNGSprite",
    settings: {
      stylesheet: "scss",
      stylesheetOptions: {
        prefix: "",
        pixelRatio: 1
      },
      layout: "packed",
      layoutOptions: {
        padding: 0,
        scaling: 1
      },
      compositor: "jimp",
      compositorOptions: {
        compressionLevel: 6,
        filter: "all"
      }
    }
  },
  pngConverter: {
    active: true,
    settings: {
      dest: "./PNG",
      width: 200,
      height: 200
    }
  },
  svgo: {
    active: true,
    settings: {
      plugins: [
        {
          cleanupAttrs: true
        },
        {
          removeDoctype: true
        },
        {
          removeXMLProcInst: true
        },
        {
          removeComments: true
        },
        {
          removeMetadata: true
        },
        {
          removeTitle: true
        },
        {
          removeDesc: true
        },
        {
          removeUselessDefs: true
        },
        {
          removeEditorsNSData: true
        },
        {
          removeEmptyAttrs: true
        },
        {
          removeHiddenElems: true
        },
        {
          removeEmptyText: true
        },
        {
          removeEmptyContainers: true
        },
        {
          removeViewBox: false
        },
        {
          cleanUpEnableBackground: true
        },
        {
          convertStyleToAttrs: true
        },
        {
          convertColors: true
        },
        {
          convertPathData: true
        },
        {
          convertTransform: true
        },
        {
          removeUnknownsAndDefaults: true
        },
        {
          removeNonInheritableGroupAttrs: true
        },
        {
          removeUselessStrokeAndFill: true
        },
        {
          removeUnusedNS: true
        },
        {
          cleanupIDs: true
        },
        {
          cleanupNumericValues: true
        },
        {
          moveElemsAttrsToGroup: true
        },
        {
          moveGroupAttrsToElems: true
        },
        {
          collapseGroups: true
        },
        {
          removeRasterImages: false
        },
        {
          mergePaths: true
        },
        {
          convertShapeToPath: true
        },
        {
          sortAttrs: true
        },
        {
          transformsWithOnePath: false
        },
        {
          removeDimensions: true
        }
      ]
    }
  }
};
