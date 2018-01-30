var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database');
var xml = require('xml');
var express = require('express');
var restapi = express();
var jsontoxml = require('jsontoxml');
var String = require('string');

var bodyParser = require('body-parser');
restapi.use(bodyParser.text({ type: 'text/xml' }));


db.serialize(function() {
    db.run("PRAGMA foreign_keys = 1");
    db.run("CREATE TABLE IF NOT EXISTS Bruker (brukerID TEXT NOT NULL PRIMARY KEY,passordhash TEXT NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS Sesjon (sesjonsID TEXT NOT NULL PRIMARY KEY,brukerID INTEGER NOT NULL, FOREIGN KEY(brukerID) REFERENCES Bruker(brukerID))");
    db.run("CREATE TABLE IF NOT EXISTS Dikt (diktID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,dikt TEXT NOT NULL)");
});

//Login service: 
//for å sjekke om bruker finnes. 
restapi.get('/brukersjekk/:brukerID', function(req, res){
    db.get("SELECT count(brukerID) as Antall FROM Bruker where brukerID = ?",[req.params.brukerID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Bruker>'
            res.send(xmlstring);
            console.log(row);
        }
    });
});
//hente ut passordhash
restapi.get('/passordsjekk/:brukerID', function(req, res){
    db.get("SELECT passordhash FROM Bruker where brukerID = ?",[req.params.brukerID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Bruker>' 
            res.send(xmlstring);
        }
    });
});
//registrere ny bruker
restapi.post('/nybruker/:brukerID/:passordhash', function(req, res){
    db.run("INSERT INTO BRUKER(brukerID,passordhash) VALUES(?,?)",[req.params.brukerID,req.params.passordhash], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('ny bruker opprettet');
        }
    });
    db.get("Select brukerID, passordhash from Bruker where brukerID = ?",[req.params.brukerID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Bruker>' 
            res.send(xmlstring);
        }
    });    
}); 
//Opprette ny sesjon returnerer sesjonsid
 restapi.post('/nysesjon/:brukerID', function(req, res){
    db.run("INSERT INTO Sesjon(brukerID) VALUES(?)",[req.params.brukerID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('ny sesjon opprettet');
        }
    });
    db.get("SELECT sesjonsID FROM Sesjon where brukerID = ?",[req.params.brukerID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Bruker>' 
            res.send(xmlstring);
        }
    });
});
//slette en sesjon
restapi.delete('/slettsesjon/:brukerID', function(req, res){
    db.run("delete from Sesjon where brukerID = ? ",[req.params.brukerID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('bruker slettet');
        }
    });
    db.get("SELECT count(brukerID) as Antall FROM Sesjon where brukerID = ?",[req.params.brukerID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Bruker xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Bruker>'
            res.send(xmlstring);
            console.log(row);
        }
    });
});
//Legge til dikt
restapi.post('/nyttdikt/', function(req, res){
    var diktID = String(req.body).between('<diktID>','</brukerID>').s;
    var dikt = String(req.body).between('<dikt>','</dikt>').s;
    console.log(diktID+" "+dikt);
  
    db.run("INSERT INTO Dikt(diktID,dikt) VALUES(?,?)",[diktID,dikt], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('ny bruker opprettet');
        }
    });
});
     var brukerID = String(req.body).between('<brukerID>','</brukerID>').s;
     console.log(brukerID);
});





restapi.listen(3000);

console.log("Submit GET or POST to http://localhost:3000/data");
