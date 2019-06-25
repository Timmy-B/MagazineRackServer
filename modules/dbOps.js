const crypto = require("crypto");
const Database = require('better-sqlite3');
const rackName = "Magz"
const imageOps = require('./imageOps')
const fs = require('fs');
const cReset = "\x1b[0m",
    cBright = "\x1b[1m",
    cDim = "\x1b[2m",
    cUnderscore = "\x1b[4m",
    cBlink = "\x1b[5m",
    cReverse = "\x1b[7m",
    cHidden = "\x1b[8m",
    FgBlack = "\x1b[30m",
    FgRed = "\x1b[31m",
    FgGreen = "\x1b[32m",
    FgYellow = "\x1b[33m",
    FgBlue = "\x1b[34m",
    FgMagenta = "\x1b[35m",
    FgCyan = "\x1b[36m",
    FgWhite = "\x1b[37m",
    BgBlack = "\x1b[40m",
    BgRed = "\x1b[41m",
    BgGreen = "\x1b[42m",
    BgYellow = "\x1b[43m",
    BgBlue = "\x1b[44m",
    BgMagenta = "\x1b[45m",
    BgCyan = "\x1b[46m",
    BgWhite = "\x1b[47m";


// connect to libraries database ( create if doesnt exist
const racksFolder = "./racks/"
const db = new Database(racksFolder + "libraries.db");
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
        CREATE TABLE cache (
            id INTEGER PRIMARY KEY,
            item_uid TEXT,
            data BLOB,
            date_added TEXT
        );
        `;
    db.exec(sqlInit);
}
console.log("Library exists now, if it didn't already.");

//Getters


function getRacks(callback) {
    const db = new Database(racksFolder + "libraries.db");
    const qry = db.prepare(`SELECT * FROM libraries;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No Racks Found");
    } else {
        console.log(data)
        callback(data);
    }

}

function storeCachedData(uid, data) {
    const db = new Database(racksFolder + "libraries.db");
    const qry = db.prepare(`INSERT INTO cache VALUES (NULL, @item_uid, @data, date('now'))`);
    qry.run({
        item_uid: uid,
        data: JSON.stringify(data)
    });
}

function getCachedData(uid, callback) {
    const qry = db.prepare(`SELECT * FROM cache WHERE item_uid = ? ;`);
    var data = qry.get(uid);
    if (data === undefined) {
        callback(false);
    } else {
        var json = JSON.parse(data.data);
        console.log(json)
        callback(json);
    }

}

function getRackStats(callback) {
    const start = Date.now();
    var stats = []
    getRacks(function (data) {
        for (var i = 0; i < data.length; i++) {
            stats.push({
                rack_name: data[i].name,
                count: getRackCount(data[i].name)
            })
        }
    })
    callback(stats)
    const secs = (Date.now() - start) / 1000
    console.log(stats)
    console.log(`took ${secs} secs`)
}

function getRackCount(rackName) {
    var fullPath = racksFolder + rackName;
    if (fs.existsSync(fullPath)) {
        const db = new Database(`${fullPath}/rack.db`);
        const qry = db.prepare(`SELECT count(*) as count FROM items;`);
        const info = qry.get();
        return info.count;
    } else {
        return 0;
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
    const db = new Database(racksFolder + rackName + "/rack.db");
    const qry = db.prepare(`SELECT * FROM series;`);
    var data = qry.all();
    if (data === undefined) {
        callback("No series Found");
    } else {
        callback(data);
    }
    db.close();
}

function getPubSeries(data, callback) {
    const rackName = data.rackName
    const publisher_id = data.publisher
    const db = new Database(`${racksFolder}/${rackName}/rack.db`);
    const qry = db.prepare(`Select
    series.id,
    series.name,
    publishers.id As publisher_id
From
    publishers Inner Join
    series_publishers_link On series_publishers_link.publisher_id = publishers.id Inner Join
    series On series.id = series_publishers_link.series_id
Where
    publishers.id = ${publisher_id}`);
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
function getSeriesItems(data, callback) {
    console.log("get series", data)
    const rackName = data.rackName
    const series_id = data.series
    const db = new Database(`${racksFolder}/${rackName}/rack.db`);
    const qry = db.prepare(`Select
    items.*,
    series_link.series_id
From
    series_link Inner Join
    items On series_link.item_id = items.id
Where
    series_link.series_id = ${series_id}`);
    var data = qry.all();
    if (data === undefined) {
        callback("No series Found");
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
    const data = db.prepare(`Select
    items.id,
    items.name,
    series.name As series,
    publishers.name As publisher,
    items.description,
    items.publish_date,
    items.path,
    items.added,
    items.modified,
    items.uid
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
    }
    createRackDb(fullPath);
    callback && callback("Added Rack Database!");
}


function createRackDb(path) {
    console.log(path + "/rack.db")
    const dbPath = + path + "/rack.db"
    if (!fs.existsSync(path + "/rack.db")) {
        const rackDb = new Database(path + "/rack.db");

        const sqlInit = `
        CREATE TABLE items (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            publish_date TEXT,
            path TEXT,
            added TEXT,
            modified TEXT,
            uid TEXT,
            hash_sha1 TEXT
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
        CREATE TABLE series_publishers_link (
            id INTEGER PRIMARY KEY,
            series_id INT,
            publisher_id INT
        );
        CREATE TABLE publishers_link (
            id INTEGER PRIMARY KEY,
            publisher_id INT,
            item_id INT
        );
        CREATE TABLE importing (
            id INTEGER PRIMARY KEY,
            name TEXT,
            path TEXT
        );
        CREATE TRIGGER item_delete_trg AFTER DELETE ON items BEGIN 
            DELETE FROM series_link WHERE item_id=OLD.id; 
            DELETE FROM publishers_link WHERE item_id=OLD.id; 
            DELETE FROM tags_link WHERE item_id=OLD.id; 
        END
        `;
        rackDb.exec(sqlInit);
    } else {
        console.log("found library file")
    }

}

function createPublisher(publisher, callback) {
    const db = new Database("./racks/Magz/rack.db");
    // check to see if database initialized
    const row = db.prepare(`SELECT *
    FROM publishers
    WHERE
       name= ?
    ;`).get(publisher);
    if (row === undefined) {
        console.log("Adding:", publisher);
        const qry = db.prepare(`INSERT INTO publishers VALUES (NULL, ?)`);
        var info = qry.run(publisher);
        callback && callback(info.lastInsertRowid)
    } else {
        callback && callback(row.id)
    }
    db.close();
}

function createSeries(series, publisher, callback) {
    const db = new Database("./racks/Mag/rack.db");
    // check to see if database initialized
    const row = db.prepare(`Select
    publishers.id As publisher_id,
    publishers.name As publisher_name,
    series.name As series_name,
    series.id As series_id
From
    publishers Inner Join
    series_publishers_link On series_publishers_link.publisher_id = publishers.id Inner Join
    series On series.id = series_publishers_link.series_id
Where
    series.name = @series And
    publishers.name = @publisher
    ;`).get({
        'series': series,
        'publisher': publisher
    });
    if (row === undefined) {
        console.log("Adding:", series);
        const qry = db.prepare(`INSERT INTO series VALUES (NULL, ?)`);
        const info = qry.run(series);
        console.log("looking for ", publisher)

        if (publisher != undefined) {

            const pubQry = db.prepare(`Select publishers.id FROM publishers WHERE name = ?`).get(publisher);
            console.log(pubQry)
            if (pubQry != undefined) {
                console.log("found pub link to series")
                linkSeriesToPublisher(info.lastInsertRowid, pubQry.id)
            }
        } else {
            console.log("no pub defined")
        }
        // else{
        //     console.log("create pub link to series")
        //     if (!publisher === undefined) {
        //         console.log("no publisher defined")
        //         createPublisher(publisher, function(pubid){
        //             linkSeriesToPublisher(info.lastInsertRowid, pubid)
        //         })
        //     }
        // }
        callback && callback(info.lastInsertRowid)
    } else {
        console.log("found link for pub and series")
    }
    callback && callback(row.series_id)
    db.close();
}


function createItem(params, callback) {
    const rackName = params.rackName;
    const db = new Database(`./racks/${rackName}/rack.db`);
    const data = params.itemInfo;
    const path = data.path
    const row = db.prepare(`SELECT * FROM items WHERE path = @path;`).get({
        'path': path,
    });
    if (row === undefined) {
        data.uid = crypto.randomBytes(16).toString("hex");
        const qry = db.prepare(`INSERT INTO items VALUES (NULL, @name, @description, @publish_date, @path, date('now'), date('now'), @uid, null)`);
        const info = qry.run(data);
        const itemid = info.lastInsertRowid;
        createPublisher(data.publisher, function (pubid) {
            linkItemToPublisher(itemid, pubid);

            createSeries(data.series, data.publisher, function (seriesid) {
                linkItemToSeries(itemid, seriesid);
            })
        })
        imageOps.genPDFCover(path, rackName, data.uid)
    } else {
        console.log(`[${FgGreen}INFO${cReset}] | ${path} | ${FgRed}exists in db${cReset}`);
    }
    db.close();
}



function linkItemToPublisher(item, publisher) {
    const db = new Database(racksFolder + rackName + "/rack.db");
    const row = db.prepare(`SELECT * FROM publishers_link WHERE publisher_id = @publisher AND item_id = @item;`).get({
        'item': item,
        'publisher': publisher
    });
    if (row === undefined) {
        const qry = db.prepare(`INSERT INTO publishers_link VALUES (NULL, @publisher, @item)`);
        qry.run({
            'item': item,
            'publisher': publisher
        });
    }
    db.close();
}

function linkSeriesToPublisher(series, publisher) {

    const db = new Database(racksFolder + rackName + "/rack.db");
    const row = db.prepare(`SELECT * FROM series_publishers_link WHERE publisher_id = @publisher AND series_id = @series;`).get({
        'series': series,
        'publisher': publisher
    });
    if (row === undefined) {
        console.log("linking series to publisher")
        const qry = db.prepare(`INSERT INTO series_publishers_link VALUES (NULL, @series, @publisher)`);
        qry.run({
            'series': series,
            'publisher': publisher
        });
    }
    db.close();
}

function linkItemToSeries(item, series) {
    const db = new Database(racksFolder + rackName + "/rack.db");
    const row = db.prepare(`SELECT * FROM series_link WHERE item_id = @item_id AND series_id = @series_id;`).get({
        'item_id': item,
        'series_id': series
    });
    if (row === undefined) {
        console.log('link:', item, series)
        const qry = db.prepare(`INSERT INTO series_link VALUES (NULL, @series_id, @item_id)`);
        qry.run({
            'series_id': series,
            'item_id': item
        });
    }
}

function updatePublisher(params) {

}


//does item have a publisher?

//does publisher exist?
//does series have a publisher


//removers

function removeItem(params) {
    const itemId = params.itemid;
    const rackName = params.rackName;
    const db = new Database(`${racksFolder}/${rackName}/rack.db`);
    db.prepare(`DELETE FROM items WHERE id = ${itemId};`).run();
    db.close();
}




exports.createRack = createRack;
exports.getRacks = getRacks;
exports.getPublishers = getPublishers;
exports.getSeries = getSeries;
exports.getTags = getTags;
exports.getItems = getItems;
exports.getItem = getItem;
exports.createPublisher = createPublisher;
exports.createSeries = createSeries;
exports.createItem = createItem;
exports.removeItem = removeItem;
exports.getPubSeries = getPubSeries;
exports.getSeriesItems = getSeriesItems;
exports.getRackCount = getRackCount;
exports.getRackStats = getRackStats;
exports.storeCachedData = storeCachedData;
exports.getCachedData = getCachedData;