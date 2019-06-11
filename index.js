global.racksFolder = "./racks"
const dbOps = require('./modules/dbOps.js');
const glob = require('glob');
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json())
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.get('/', (req, res) => {
    return res.send('Received a GET HTTP method');
});


app.put('/newRack/:rackName', (req, res) => {
    dbOps.createRack(req.params.rackName, function(response){
        return res.send(
            response,
        );
    })
    
});
app.put('/newRack/:rackName', (req, res) => {
    dbOps.createRack(req.params.rackName, function(response){
        return res.send(
            response,
        );
    })
    
});

///temp function for testing 
app.post('/newItem/', (req, res) => {
    res.json(req.body);
    dbOps.createItem(req.body, function (response) {

        return res.send(
            response,
        );
    })
});

app.get('/api/libraries/', (req, res) => {
    console.log('requesting racks')
    dbOps.getRacks(function(data){
        return res.json(
            data
        );
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

app.get('/getPublishers/:rackName', (req, res) => {
    dbOps.getPublishers(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getItem/:rackName/:item', (req, res) => {
    
    dbOps.getItem(req.params, function (data) {
        return res.json(
            data
        );
    })

});

app.post('/rmItem/', (req, res) => {
    res.json(req.body);
    dbOps.removeItem(req.body, function (response) {
        return res.send(
            response,
        );
    })
});



dbOps.createRack("test_123")

glob("**/", {
    cwd: './racks/test_123'
}, function (er, folders) {
    folders.forEach(function (folder) {
        var folderName = folder.substring(0, folder.lastIndexOf('/'));
        if (folderName.includes('/')) {
            var publisher = folder.split('/')[0]
            var series = path.basename(folder);
            dbOps.createSeries(series,publisher)
            // filesInFolder(folderName)
            filesInFolder('test_123',folder, publisher, series)

        } else {
            console.log("publisher:", path.basename(folder))
            dbOps.createPublisher(path.basename(folder));
        }
    })
})


function filesInFolder(rackName, folder, publisher, series) {

    glob("*.*", {
        cwd: `./racks/${rackName}/${folder}`
    }, function (er, files) {
        files.forEach(function (file) {
            const path = `/${folder}${file}`
            const params = { rackName: rackName, itemInfo: { name: file, publisher: publisher, description: '', series: series, path: path, publish_date: '' } }
            dbOps.createItem(params)
        })
    })

}