
const Database = require('better-sqlite3');
var fs = require('fs');
// connect to libraries database ( create if doesnt exist
const racksFolder = "./racks/"
const db = new Database(racksFolder+"libraries.db");
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
            id INTEGER PRIMARY KEY,
            name TEXT,
            path TEXT,
            created TEXT
        );
        `;
    db.exec(sqlInit);
}
console.log("database exists now, if it didn't already.");

getRacks();

createRack('test 123')
//Getters

// get Racks

function getRacks() {
    var qry = db.prepare(`SELECT * FROM libraries;`);
    var data = qry.get();
    if (data === undefined) {
        console.log("No Racks Found")
    }
}

//Creators

// Create Rack
function createRack(rackName) {
    const qry = db.prepare(`INSERT INTO libraries VALUES (NULL, @name, @path, date('now'))`);
    var rackpath = rackName.replace(/ /g, "_");
    var fullPath = racksFolder + rackpath;
    //check to see if library path exists - should also add a check for db obviously.
    if (!fs.existsSync(fullPath)) { 
        console.log("[INFO] Creating Rack folder and database");
        fs.mkdirSync(fullPath);
        qry.run({
            name: rackName,
            path: rackpath
        });
         // we dont want to create a library folder if it already exists
         // perhaps check to see if there is a db here and import it into libraries;
        createRackDb(fullPath);
    }else{
        console.log("[ERROR] Rack folder exists");
    }
}




function createRackDb(path){
    console.log(path)
    const rackDb = new Database(path+"/rack.db");
    
    const sqlInit = `
        CREATE TABLE items (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            publisher INT,
            series INT,
            tags INT,
            publish_date TEXT,
            path TEXT,
            added TEXT,
            modified TEXT
        );
        CREATE TABLE tags (
            id INTEGER PRIMARY KEY,
            name TEXT
        );
        CREATE TABLE series (
            id INTEGER PRIMARY KEY,
            name TEXT
        );
        CREATE TABLE publishers (
            id INTEGER PRIMARY KEY,
            name TEXT
        );
        `;
    rackDb.exec(sqlInit);
}




module.exports = {};