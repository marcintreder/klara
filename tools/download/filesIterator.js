const fse = require("fs-extra");

module.exports = function filesIterator(data) {
  /* Extract directory for category */
  const categoryDir = `./${data.name}`;
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
