const a = require.resolve('aaa');
console.log(a);

// const sqlite3 = require('sqlite3').verbose();

// let query = `CREATE TABLE "modules"(
//   "id" VARCHAR(36) PRIMARY KEY NOT NULL,
//   "type" VARCHAR(32) NOT NULL,
//   "name" VARCHAR(25) NOT NULL,
//   "version" VARCHAR(11) NOT NULL,
//   "driver" VARCHAR(214) DEFAULT NULL,
//   "ui" VARCHAR(214) DEFAULT NULL,
//   "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "connected_at" DATETIME DEFAULT NULL,
//   "status" INTEGER NOT NULL DEFAULT 1,
//   CONSTRAINT "id_UNIQUE"
//     UNIQUE("id")
// );`;


// // open the database
// let db = new sqlite3.Database('./iotz.db');

// db.all(query, [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
// });

// // close the database connection
// db.close();
