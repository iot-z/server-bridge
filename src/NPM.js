const { exec } = require('child_process');

const NPM = {
    install(...packages) {
        return new Promise((resolve, reject) => {
            const install = packages.map((v) => '@iotz/').join(' ');

            exec(`npm install ${install}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(stderr);
                } else {
                    reject(stdout);
                }
            });
        });
    }

    list npm list --depth=0
         npm list --depth=0 | grep $name
         npm --json list sqlite3
    search,
}

module.exports = DB;
