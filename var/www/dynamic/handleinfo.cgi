#!/bin/sh

bruker=$(echo $QUERY_STRING | cut -f1 -d '&' | cut -f2 -d '=')
passord=$(echo $QUERY_STRING | cut -f2 -d '&' | cut -f2 -d '=')
passordhash=$(echo -n $passord | md5sum | cut -f 1 -d ' ')
statustall=$(echo "select count(*) from brukere where brukernavn='$bruker';" | sqlite3 info.db)
status="bruker finnes"

if [ "$statustall" -eq "1" ]
then
    # echo Status er 1
    dbpassord=$(echo "select passordhash from brukere where brukernavn='$bruker';" | sqlite3 info.db)
    if [ "$passordhash" = "$dbpassord" ]
        then
            echo "HTTP/1.1 200 OK"
            echo "Content-type:text/plain;charset=utf-8"
            echo
            echo "login vellykket"
        else
            echo "HTTP/1.1 200 OK"
            echo "Content-type:text/plain;charset=utf-8"
            echo
            echo feil innloggingsinfo
            echo passordhash: $passordhash dbhash: $dbpassord
    fi
fi

if [ "$statustall" -eq "0" ]
then
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/plain;charset=utf-8"
    echo
    echo "insert into brukere (brukernavn,passordhash,passord) values ('$bruker','$passordhash','$passord');" | sqlite3 info.db
    echo ny bruker opprettet med brukernavn: $bruker og passord $passord
fi
# Skriver ut 'http-header' og tom linje
# echo "Content-type:text/plain;charset=utf-8"
# echo

 #Skriver ut 'http-kropp'

#pwd
