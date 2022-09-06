const fs = require("fs");
const promisesFs = fs.promises;
const crypto = require("crypto");
const {authSalt: SALT} = require("./rbac");
const helpers = {};

helpers.checkStaticDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, 744);
  }
  return dir;
};
helpers.sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
helpers.createHashPassword = (password) => {
  return crypto.createHash("md5").update(SALT + crypto.createHash("md5").update(password).digest("hex") + crypto.createHash("md5").update(SALT).digest("hex")).digest("hex");
};
helpers.getFiles = async (path = "./") => {
  const entries = await promisesFs.readdir(path, {withFileTypes: true});
  const files = entries
    .filter(file => !file.isDirectory())
    .map(file => ({...file, path: path + file.name}));
  const folders = entries.filter(folder => folder.isDirectory());
  for (const folder of folders) {
    files.push(...await helpers.getFiles(`${path}${folder.name}/`));
  }
  return files;
};
helpers.reinitImg = (url) => {
  if (url.indexOf("http") !== -1) {
    let splitted = url.split("/upload/");
    if (splitted[1]) {
      url = "upload/" + url.split("/upload/")[1];
    }
  }
  return url;
};

helpers.reinitImgInObj = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === "object") {
      obj[key] = helpers.reinitImgInObj(obj[key]);
    } else if (key === "img" && obj[key]) {
      obj[key] = helpers.reinitImg(obj[key]);
    }
  }
  return obj;
};

module.exports = helpers;
