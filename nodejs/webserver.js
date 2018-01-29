var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database');
var xml = require('xml');
var express = require('express');
var restapi = express();


db.serialize(function() {
    db.run("PRAGMA foreign_keys = 1");
    db.run("CREATE TABLE IF NOT EXISTS Bruker (brukerID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,passordhash TEXT NOT NULL)");
    db.run("CREATE TABLE IF NOT EXISTS Sesjon (sesjonsID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,brukerID INTEGER NOT NULL, FOREIGN KEY(brukerID) REFERENCES Bruker(brukerID))");
});

restapi.get('/data', function(req, res){
    db.get("SELECT * FROM Bruker", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.send(row);
        }
        
        /*var xmlString = xml([{ count: row.value }]);
		res.set('Content-Type', 'text/xml');
		res.send(xmlString);*/
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
