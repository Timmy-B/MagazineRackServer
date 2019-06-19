global.racksFolder = "./racks"
const dbOps = require('./modules/dbOps');
const fileOps = require('./modules/fileOps');
const imageOps = require('./modules/imageOps');
const glob = require('glob');
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json())
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// fileOps.libraryScan()

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
app.get('/', (req, res) => {
    return res.send('Received a GET HTTP method');
});


app.get('/api/stats/', (req, res) => {
    console.log('requesting rack Stats')
    dbOps.getRackStats(function (data) {
        return res.json(
            data
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

app.get('/api/readItem/:rackName/:item', (req, res) => {
    const rackName = req.params.rackName
    dbOps.getItem(req.params, function (bookInfo) {
        imageOps.renderPDF(rackName, bookInfo, function (data) {
            console.log(data.data)
            return res.json(data)
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

app.get('/getSeriesItems/:rackName/:series', (req, res) => {
    dbOps.getSeriesItems(req.params, function (data) {
        return res.json(
            data
        );
    })

});

app.get('/getPubSeries/:rackName/:publisher', (req, res) => {
    dbOps.getPubSeries(req.params, function (data) {
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

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use('/reader', express.static(path.join(__dirname, 'temp')))


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


