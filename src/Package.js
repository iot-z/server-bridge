const { exec } = require('child_process');

const Package = {
    install(...packages) {
        return new Promise((resolve, reject) => {
            const install = packages.map((v) => `@iotz/`).join(' ');

            exec(`npm install -S ${install}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

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
    }

    /**
     * Search
     * @param  {string} type          driver|ui
     * @param  {string} moduleType    Module Type
     * @param  {string} moduleVersion Module Version Wildcard
     * @return {array}                Package list
     */
    search(type, moduleType, moduleVersion) {

    }

    list npm list --depth=0
         npm list --depth=0 | grep $name
         npm --json list sqlite3
    search,
}

module.exports = Package;
