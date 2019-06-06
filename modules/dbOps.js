
const Database = require('better-sqlite3');
var fs = require('fs');
// connect to libraries database ( create if doesnt exist
const racksFolder = "./racks/"
const db = new Database(racksFolder+"libraries.db");
// check to see if database initialized
const qry = db.prepare(`SELECT name
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
console.log("Library exists now, if it didn't already.");

//Getters


function getRacks(callback) {
    const qry = db.prepare(`SELECT * FROM libraries;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No Racks Found");
    }else{
        callback(data);
    }
    
}

function getItems(rackName, callback) {
    const db = new Database(racksFolder + rackName + "/rack.db");
    const qry = db.prepare(`SELECT * FROM items;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No Items Found");
    } else {
        callback(data);
    }
    db.close();
}

function getSeries(rackName, callback) {
    const db = new Database(racksFolder+rackName+ "/rack.db");
    const qry = db.prepare(`SELECT * FROM series;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No series Found");
    } else {
        callback(data);
    }
    db.close();
}

function getTags(rackName, callback) {
    const db = new Database(racksFolder + rackName + "/rack.db");
    const qry = db.prepare(`SELECT * FROM tags;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No tags Found");
    } else {
        callback(data);
    }
    db.close();
}

function getPublishers(rackName, callback) {
    const db = new Database(racksFolder + rackName + "/rack.db");
    const qry = db.prepare(`SELECT * FROM publishers;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No publishers Found");
    } else {
        callback(data);
    }
    db.close();
}

function getItem(params, callback) {
    const rackName = params.rackName;
    const item = params.item;
    console.log(rackName)
    const db = new Database(racksFolder + rackName + "/rack.db");
    const data = db.prepare(`SSelect
    items.id,
    items.name,
    series.name As series,
    publishers.name As publisher,
    items.description,
    items.tags,
    items.publish_date,
    items.path,
    items.added,
    items.modified
From
    items Inner Join
    publishers_link On publishers_link.item_id = items.id Inner Join
    publishers On publishers.id = publishers_link.publisher_id Inner Join
    series_link On series_link.item_id = items.id Inner Join
    series On series.id = series_link.series_id
Where
    items.id = ?;`).get(item);
    if (data === undefined) {
        callback("No Items Found");
    } else {
        callback(data);
    }
    db.close();
}


//Creators

// Create Rack
function createRack(rackName, callback) {
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
        callback && callback("Created Database!");
    }else{
        callback && callback("[ERROR] Rack folder exists");
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
        CREATE TABLE tags_link (
            id INTEGER PRIMARY KEY,
            tag_id INT,
            item_id INT
        );
        CREATE TABLE series_link (
            id INTEGER PRIMARY KEY,
            series_id INT,
            item_id INT
        );
        CREATE TABLE publishers_link (
            id INTEGER PRIMARY KEY,
            publisher_id INT,
            item_id INT
        );
        `;
    rackDb.exec(sqlInit);
}

///temp function for testing
function createItem(params, callback) {
    const rackName = params.rackName;
    const data = params.itemInfo;
    console.log(rackName)
    const db = new Database(racksFolder + rackName + "/rack.db");
    const qry = db.prepare(`INSERT INTO libraries VALUES (NULL, @name, @description, @publish_date, NULL, date('now'), date('now'))`);
    qry.run(data);
    db.close();
}


module.exports = {
    createRack, 
    getRacks,
    getPublishers,
    getSeries,
    getTags,
    getItems,
    getItem
}