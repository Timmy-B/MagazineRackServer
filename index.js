const { createRack,
    getRacks,
    getPublishers,
    getSeries,
    getTags,
    getItems,
    getItem 
    } = require('./modules/dbOps.js');
var express = require("express");
var app = express();
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