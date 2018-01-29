var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database');
var xml = require('xml');
var express = require('express');
var restapi = express();
var jsontoxml = require('jsontoxml');



db.serialize(function() {
    db.run("PRAGMA foreign_keys = 1");
    db.run("CREATE TABLE IF NOT EXISTS Bruker (brukerID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,passordhash TEXT NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS Sesjon (sesjonsID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,brukerID INTEGER NOT NULL, FOREIGN KEY(brukerID) REFERENCES Bruker(brukerID))");
    db.run("CREATE TABLE IF NOT EXISTS Dikt (diktID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,dikt TEXT NOT NULL)");
});

restapi.get('/data/:id', function(req, res){
    db.get("SELECT * FROM Bruker where brukerID = ?",[req.params.id], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
 
            var xmlstring = '<bruker xsi:schemaLocation="brukereschema.xsd">' + jsontoxml(row) + '</bruker>' 
            //lage bruker xml skjema
            res.send(xmlstring);
        }
    });
});

restapi.post('/data', function(req, res){
    db.get("SELECT * FROM Bruker", function(err, row){
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
