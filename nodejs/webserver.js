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
    db.run("CREATE TABLE IF NOT EXISTS Sesjon (sesjonsID TEXT NOT NULL PRIMARY KEY,brukerID TEXT NOT NULL, FOREIGN KEY(brukerID) REFERENCES Bruker(brukerID))");
    db.run("CREATE TABLE IF NOT EXISTS Dikt (diktID TEXT NOT NULL PRIMARY KEY,dikt TEXT NOT NULL)");
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
restapi.post('/nybruker/', function(req, res){
    var brukerID = String(req.body).between('<brukerID>','</brukerID>').s;
    var passordhash = String(req.body).between('<passordhash>','</passordhash>').s;
    db.serialize(function() {
        db.run("INSERT INTO BRUKER(brukerID,passordhash) VALUES(?,?)",[brukerID,passordhash], function(err, row){
            if (err){
                console.err(err);
                res.status(500);
            }
            else {
                console.log('ny bruker opprettet');
            }
        });
        db.get("Select brukerID, passordhash from Bruker where brukerID = ?",[brukerID], function(err, row){
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
}); 
//Opprette ny sesjon returnerer sesjonsid
 restapi.post('/nysesjon/', function(req, res){
    var sesjonsID = String(req.body).between('<sesjonsID>','</sesjonsID>').s;
    var brukerID = String(req.body).between('<brukerID>','</brukerID>').s;
    db.run("INSERT INTO Sesjon(sesjonsID, brukerID) VALUES(?, ?)",[sesjonsID, brukerID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('ny sesjon opprettet');
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Sesjon xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd"> ny sesjon opprettet</Sesjon>'
            res.send(xmlstring);
        }
    });
});
//Sesjonsjekk
//Opprette ny sesjon returnerer sesjonsid
restapi.get('/sesjonssjekk/:sesjonsID', function(req, res){
    db.get("SELECT count(sesjonsID) as Antall FROM Sesjon where sesjonsID = ?",[req.params.sesjonsID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('sesjonssjekk');
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Sesjon xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Sesjon>'
            res.send(xmlstring);
        }
    });
});
//slette en sesjon vha sesjonsID
restapi.delete('/slettsesjon/:sesjonsID', function(req, res){
    db.run("delete from Sesjon where sesjonsID = ?",[req.params.sesjonsID],function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('Sesjon slettet');
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Sesjon xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd"><Status>vellykket</Status></Sesjon>'
            res.send(xmlstring);
            
        }
    });
});
//Slette alle sesjoner
restapi.delete('/slettallesesjoner/', function(req, res){
    db.run("delete from Sesjon",function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('Alle sesjoner slettet');
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Sesjon xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Sesjon>'
            res.send(xmlstring);
        }
    });
});
//Legge til dikt
restapi.post('/nyttdikt/', function(req, res){
    var diktID = String(req.body).between('<diktID>','</diktID>').s;
    var dikt = String(req.body).between('<dikt>','</dikt>').s;
    console.log(diktID+" "+dikt);
  
    db.run("INSERT INTO Dikt(diktID,dikt) VALUES(?,?)",[diktID,dikt], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('nytt dikt opprettet');
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + '<Status>endret</Status>' + '</Dikt>'
            res.send(xmlstring);
        }
    });
});
//Lese ut et dikt
restapi.get('/lesedikt/:diktID', function(req, res){
    db.get("Select * from Dikt where diktID = ?",[req.params.diktID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Dikt>'
            res.send(xmlstring);
        }
    });
});
//Lese ut alle dikt
restapi.get('/lesealledikt/', function(req, res){
    db.all("Select * from Dikt", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Dikt>'
            res.send(xmlstring);
        }
    });
});
//Finne antall dikt i tabellen
restapi.get('/antalldikt/', function(req, res){
    db.get("SELECT count(diktID) as Antall FROM Dikt", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            res.set('Content-Type', 'application/xml');
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + jsontoxml(row) + '</Dikt>'
            res.send(xmlstring);
        }
    });
});

//Endre et dikt
restapi.put('/endredikt/:diktID', function(req, res){
    var dikt = String(req.body).between('<dikt>','</dikt>').s;
    db.run("UPDATE Dikt set dikt = ? where diktID = ?",[dikt, req.params.diktID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log('dikt: '+req.params.diktID+" oppdatert")
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + '<Status>endret</Status>' + '</Dikt>'
            res.send(xmlstring);
        }
    });
});
//Slette dikt
restapi.delete('/slettedikt/:diktID', function(req, res){
    db.run("DELETE from Dikt where diktID = ?",[req.params.diktID], function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log(req.params.diktID +" slettet");
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + '<Status>endret</Status>' + '</Dikt>'
            res.send(xmlstring);
        }
    });
});
//Slette alle dikt
restapi.delete('/slettealledikt/', function(req, res){
    db.run("DELETE from Dikt", function(err, row){
        if (err){
            console.err(err);
            res.status(500);
        }
        else {
            console.log("alle dikt slettet");
            var xmlstring = '<?xml version="1.0"?>\n<Dikt xmlns="https://www.w3schools.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="brukerschema.xsd">' + '<Status>endret</Status>' + '</Dikt>'
            res.send(xmlstring);
        }
    });
});



restapi.listen(3000);

console.log("Submit GET or POST to http://localhost:3000/data");
