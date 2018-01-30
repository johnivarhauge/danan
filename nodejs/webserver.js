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

//Login service: 
//for å sjekke om bruker finnes. 
restapi.get('/brukersjekk/:brukernavn', function(req, res){
    db.get("SELECT count(brukerID) as antall FROM Bruker where brukerID = ?",[req.params.brukernavn], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</bruker>' 
            //lage bruker xml skjemaurn:MyData
            res.send(xmlstring);
            console.log(row);
        }
    });
});
//hente ut passordhash h xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Passordhash>' 
restapi.get('/passordsjekk/:brukernavn', function(req, res){
    db.get("SELECT passordhash FROM Bruker where brukernavn = ?",[req.params.brukernavn], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Passordhash xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Passordhash>' 
            res.send(xmlstring);
        }
    });
});
//registrere ny bruker
restapi.post('/nybruker/:brukernavn/:passordhash/:passord', function(req, res){
    db.run("INSERT INTO BRUKER(brukernavn, passordhash, passord) VALUES((?),(?),(?))",[req.params.brukernavn,req.params.passordhash,req.params.passord], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('ny bruker opprettet');
        }
    });
});
 //sjekke bruker id
 restapi.get('/brukerid/:brukernavn', function(req, res){
    db.get("SELECT brukerID FROM Bruker where brukernavn = (?)",[req.params.brukernavn], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<BrukerID xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</BrukerID>' 
            res.send(xmlstring);
        }
    });
 }); 
//Opprette ny sesjon returnerer sesjonsid
 restapi.get('/nysesjon/:brukerID', function(req, res){
    db.run("INSERT INTO Sesjon(brukerID) VALUES(?)",[req.params.brukerID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('ny bruker opprettet');
        }
    });
    db.get("SELECT sesjonsID FROM Sesjon where brukernavn = (row)", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<SesjonsID xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</SesjonsID>' 
            res.send(xmlstring);
        }
    });
});
//slette en sesjon
restapi.delete('/slettsesjon/:brukerID', function(req, res){
    db.run("delete * from Sesjon where brukerID = ? ",[req.params.brukerID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
             console.log('bruker slettet');
        }
    });
});


restapi.get('/data/:id', function(req, res){
    db.get("SELECT * FROM Bruker where brukerID = ?",[req.params.id], function(err, row){
        if (err){
            console.err(err);
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
            console.err(err);
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
