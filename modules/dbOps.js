const Database = require('better-sqlite3');
// connect to libraries database ( create if doesnt exist
const db = new Database("libraries.db");

// check to see if database initialized
var qry = db.prepare(`SELECT name
    FROM sqlite_master
    WHERE
        type='table' and name='libraries'
    ;`);
var row = qry.get();
if (row === undefined) {
    console.log("WARNING: database appears empty; initializing it.");
    const sqlInit = `
        CREATE TABLE libraries (
            id   INTEGER PRIMARY KEY,
            name TEXT,
            path TEXT,
            created TEXT
        );
        `;
    db.exec(sqlInit);
}
console.log("database exists now, if it didn't already.");

getLibraries();


//Getters

// get libraries
function getLibraries() {
    var qry = db.prepare(`SELECT * FROM libraries;`);
    var data = qry.get();
    if (data === undefined) {
        console.log("No Libraries Found")
    }
}

//Setters


module.exports = dbOps;