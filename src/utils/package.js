const { exec } = require('child_process');
const { get }  = require('got');
const { stringify: buildQuery } = require('querystring');

const WS = 'http://localhost:3333';

const Package = {
  install(...packages) {
    return new Promise((resolve, reject) => {
      const packages = packages.map((v) => `@iotz/`).join(' ');

      exec(`npm install --json --save ${package}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(stderr);
        } else {
          const data = JSON.parse(stdout);
          resolve(data);
        }
      });
    });
  },

  has(package) {
    return new Promise((resolve, reject) => {
      exec(`npm --json --depth=0 list ${package}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(stderr);
        } else {
          const data = JSON.parse(stdout);
          resolve(typeof data.dependencies !== 'undefined' ? data.dependencies[package] : false);
        }
      });
    });
  },

  /**
   * Search
   * @param  {string} type          driver|ui
   * @param  {string} moduleType    Module Type
   * @param  {string} moduleVersion Module Version Wildcard
   * @return {array}                Package list
   */
  async search(type, moduleType, moduleVersion) {
    const res = await get(`${WS}/modules/search/?${buildQuery({ type, moduleType, moduleVersion })}`);
    return JSON.parse(res.body);
  }
};

module.exports = Package;
