global.racksFolder = "./racks"
const dbOps = require('./modules/dbOps');
const fileOps = require('./modules/fileOps');
const imageOps = require('./modules/imageOps');
const glob = require('glob');
const express = require("express");
const path = require("path");
const app = express();
var server;
app.use(express.json())

dbOps.initSettingsDB(function (response) {
    console.log(response)
});

startServer()
function startServer() {
    var port = dbOps.getServerPort()
    server = app.listen(port, function () {
        console.log('Listening on port:', port);
    });
}



function setServerPort(port) {
    server.close(function () {
        console.log('Server closed')
        server = app.listen(port, function () {
            console.log('Server port changed to:', port);

        });
    });

}

// fileOps.libraryScan()

app.all('/*', function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.get('/api', (req, res) => {
    return res.send('Server is running');
});

app.get('/api/switch', (req, res) => {

    setServerPort(4000)
});

app.get('/api/stats/', (req, res) => {
    console.log('requesting rack Stats')
    dbOps.getRackStats(function (data) {
        return res.json(
            data
        );
    })
});


app.post('/api/newRack/', (req, res) => {
    var newRack = req.body.rackName
    dbOps.createRack(newRack, function (response) {
        console.log(response)
    });
        return res.send(
            "added",
        );

});

app.post('/api/editRack/', (req, res) => {
    var data = req.body
    dbOps.editRack(data);
    return res.send(
        "edited",
    );

});
///temp function for testing 
app.post('/api/newItem/', (req, res) => {
    res.json(req.body);
    dbOps.createItem(req.body, function (response) {

        return res.send(
            response,
        );
    })
});

app.get('/api/libraries/', (req, res) => {
    console.log('requesting racks')
    dbOps.getRacks(function (data) {
        return res.json(
            data
        );
    })
});

app.post('/api/scanRack/', (req, res) => {
    const rackID = req.body.itemID
    fileOps.libraryScan(rackID)
    return res.send("Started Scan");
});

app.get('/api/readItem/:rackID/:itemID', (req, res) => {
    dbOps.getItem(req.params, function (bookInfo) {
        dbOps.getCachedData(bookInfo.uid, function (data) {
            if (!data) {
                imageOps.renderPDF(bookInfo, function (data) {
                    console.log(data.data)
                    return res.json(data)
                })
            } else {
                console.log(data.data)
                return res.json(data)
            }

        })

    })
});

app.get('/getItems/:rackName', (req, res) => {
    dbOps.getItems(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getTags/:rackName', (req, res) => {
    dbOps.getTags(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getSeries/:rackName', (req, res) => {
    dbOps.getSeries(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/api/getSeriesItems/:rackID/:seriesID', (req, res) => {
    dbOps.getSeriesItems(req.params, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/api/getPubSeries/:rackID/:publisherID', (req, res) => {
    dbOps.getPubSeries(req.params, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/api/getPublishers/:rackID', (req, res) => {
    dbOps.getPublishers(req.params.rackID, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/api/getItem/:rackID/:itemID', (req, res) => {

    dbOps.getItem(req.params, function (data) {
        return res.json(
            data
        );
    })

});

app.post('/api/rmRack/', (req, res) => {
    var rackID = req.body.itemID
    dbOps.removeRack(rackID, function (response) {
            console.log(response)
    })
    return res.send("removed"+rackID);
});

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/reader', express.static(path.join(__dirname, 'temp')))





