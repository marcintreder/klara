const fse = require("fs-extra");
const delay = require("delay");

module.exports = function filesIterator(data) {
  /* Extract directory for category */
  const categoryDir = `./${data.name}`;
  // directories.push(categoryDir);
  /* Check if all assets categories have assets */

  //  console.log(data.name);
  //console.log(data.items.length);
  //console.log(data.name, data.items.length === 0);
  //const x = data.items.filter(data.items.length === 0);
  //console.log(x);

  /* Send all the files to the function responsible for download */
  const assetsArr = data.items.map(item => {
    /* Prepare object with assets data from JSON */
    const fileObj = new Object();
    fileObj.url = item.value.url;
    fileObj.name = item.name;
    fileObj.type = fileObj.url
      .substring(fileObj.url.lastIndexOf(".") + 1)
      .toLowerCase();
    fileObj.fullName = `${item.name}.${fileObj.type}`;
    fileObj.category = data.name;
    fileObj.directory = `${categoryDir}/${fileObj.type.toUpperCase()}`;
    fileObj.fullDirectory = `${fileObj.directory}/${fileObj.fullName}`;
    /* Create directory for currently transformed category of assets */
    fse.ensureDirSync(fileObj.directory);
    return fileObj;
  });
  return { categoryDir, assetsArr };
};
