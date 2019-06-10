global.racksFolder = "./racks"
const { createRack,
    getRacks,
    getPublishers,
    getSeries,
    getTags,
    getItems,
    getItem,
    createPublisher,
    createSeries,
    createItem
    } = require('./modules/dbOps.js');
const glob = require('glob');
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json())
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get('/', (req, res) => {
    return res.send('Received a GET HTTP method');
});


app.put('/newRack/:rackName', (req, res) => {
    createRack(req.params.rackName, function(response){
        return res.send(
            response,
        );
    })
    
});

///temp function for testing 
app.post('/newItem/', (req, res) => {
    res.json(req.body);
    console.log(req.body);
    createItem(req.params, function (response) {
        console.log(req.params)
        return res.send(
            response,
        );
    })
});

app.get('/getRacks', (req, res) => {
    getRacks(req.params.rackName, function(data){
        return res.json(
            data
        );
    })
});

app.get('/getItems/:rackName', (req, res) => {
    getItems(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getTags/:rackName', (req, res) => {
    getTags(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getSeries/:rackName', (req, res) => {
    getSeries(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getPublishers/:rackName', (req, res) => {
    getPublishers(req.params.rackName, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getItem/:rackName/:item', (req, res) => {
    getItem(req.params, function (data) {
        return res.json(
            data
        );
    })

});


glob("**/", {
    cwd: './racks/test_123'
}, function (er, folders) {
    folders.forEach(function (folder) {
        var folderName = folder.substring(0, folder.lastIndexOf('/'));
        if (folderName.includes('/')) {
            var publisher = folder.split('/')[0]
            var series = path.basename(folder);
            createSeries(series,publisher)
            console.log(publisher, series)
            filesInFolder(folderName)
        } else {
            console.log("publisher:", path.basename(folder))
            createPublisher(path.basename(folder));
        }
    })
})


function filesInFolder(folder) {


    glob("*.*", {
        cwd: './racks/test_123/' + folder
    }, function (er, files) {
        files.forEach(function (file) {
            console.log(file)
        })
    })

}