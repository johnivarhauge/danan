var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database');
var xml = require('xml');
var express = require('express');
var restapi = express();
var jsontoxml = require('jsontoxml');
var bodyParser = require('body-parser');
restapi.use(bodyParser.raw());

db.serialize(function() {
    db.run("PRAGMA foreign_keys = 1");
    db.run("CREATE TABLE IF NOT EXISTS Bruker (brukerID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,passordhash TEXT NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS Sesjon (sesjonsID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,brukerID INTEGER NOT NULL, FOREIGN KEY(brukerID) REFERENCES Bruker(brukerID))");
    db.run("CREATE TABLE IF NOT EXISTS Dikt (diktID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,dikt TEXT NOT NULL)");
});

//Login service: for å registre og logge inn bruker
restapi.get('/bruker/:id', function(req, res){
    db.get("SELECT * FROM Bruker where brukerID = ?",[req.params.id], function(err, row){
        if (err){
            console.err(err);urn:MyData
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</bruker>' 
            //lage bruker xml skjemaurn:MyData
            res.send(xmlstring);
            console.log(req.body);
        }
    });
});

restapi.post('/bruker/:brukernavn:passordhash:passord', function(req, res){
    db.run("INSERT INTO BRUKER(brukernavn, passordhash, passord) VALUES(?,?,?)",[req.params.brukernavn,req.params.passordhash,req.params.passord], function(err, row){
        if (err){
            console.err(err);urn:MyData
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</bruker>' 
            //lage bruker xml skjemaurn:MyData
            res.send(xmlstring);
            console.log(req.body);
        }
    });
});

restapi.get('/data/:id', function(req, res){
    db.get("SELECT * FROM Bruker where brukerID = ?",[req.params.id], function(err, row){
        if (err){
            console.err(err);urn:MyData
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</bruker>' 
            //lage bruker xml skjemaurn:MyData
            res.send(xmlstring);
            console.log(req.body);
        }
    });
});

restapi.get('/data/', function(req, res){
    db.get("SELECT * FROM Bruker", function(err, row){
        if (err){
            console.err(err);urn:MyData
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</bruker>' 
            //lage bruker xml skjemaurn:MyData
            res.send(xmlstring);
            console.log(req.body);
        }
    });
});

restapi.put('/data/', function(req, res){
    db.get("Update   FROM Bruker", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.status(202);
        }
        res.end();
    });
});


restapi.listen(3000);

console.log("Submit GET or POST to http://localhost:3000/data");
