const sqlite3 = require('sqlite3').verbose();

class DB {
    constructor(file) {
        return new sqlite3.Database(file);
    }

    close() {
        return new Promise((resolve, reject) => {
            this._db.close(function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    configure(option, value) {
        this._db.configure(option, value);
    }

    get(sql, params) {
        return new Promise((resolve, reject) => {
            this._db.get(sql, params, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params) {
        return new Promise((resolve, reject) => {
            this._db.all(sql, params, function (err, rows) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    run(sql, params) {
        return new Promise((resolve, reject) => {
            this._db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    exec(sql) {
        return new Promise((resolve, reject) => {
            this._db.exec(sql, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = DB;
