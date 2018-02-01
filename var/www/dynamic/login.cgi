#!/bin/sh

BRUKER=$(echo $QUERY_STRING | cut -f1 -d '&' | cut -f2 -d '=')
PASSORD=$(echo $QUERY_STRING | cut -f2 -d '&' | cut -f2 -d '=')
PWDHASH=$(echo -n $PASSORD | md5sum | cut -f 1 -d ' ')

RESPONS=$(curl --request GET localhost:3000/brukersjekk/$BRUKER)
ERBRUKER=$(echo $RESPONS | grep -oP '(?<=Antall>)[^<]+')

#If username exists
if [ $ERBRUKER -eq 1 ]; then
    RESPONS=$(curl --request GET localhost:3000/passordsjekk/$BRUKER)
    KORREKTPWD=$(echo $RESPONS | grep -oP '(?<=passordhash>)[^<]+')
    #If password matches
    if [ "$KORREKTPWD" = "$PWDHASH" ]; then
        #Creates a session ID
        COOKIE=$(echo -n $BRUKER$PASSORD | md5sum | cut -f 1 -d ' ')
        #delete sesjon:
        deleteSession=$(curl --request DELETE -H "Content-Type: text/xml" -d "<Sesjon><sesjonsID>$COOKIE</sesjonsID><brukerID>$BRUKER</brukerID></Sesjon>" http://localhost:3000/slettsesjon/$BRUKER)
        #Saves session ID to REST-Server database
        SessionStatus=$(curl --request POST -H "Content-Type: text/xml" -d "<Sesjon><sesjonsID>$COOKIE</sesjonsID><brukerID>$BRUKER</brukerID></Sesjon>" http://localhost:3000/nysesjon)
        #Sends response to client and redirects
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/html;charset=utf-8"
        echo "Set-Cookie: sesjonsID="$COOKIE
        echo
        echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; http://localhost/dikt.html"></head><body></body></html>'
    #If password does not match
    else
        echo "HTTP/1.1 200 OK"
        echo "Content-type:text/plain;charset=utf-8"
        echo 
        echo "Incorrect Password!"
        echo "DB: "$KORREKTPWD" User: " $PWDHASH
    fi
#If username does not exist
else
    #Saves new user to database
    newUserStatus$(curl --request POST -H "Content-Type: text/xml" -d "<Bruker><brukerID>$BRUKER</brukerID><passordhash>$PWDHASH</passordhash></Bruker>" http://localhost:3000/nybruker)
    #Creates a session ID
    COOKIE=$(echo -n $BRUKER$PASSORD | md5sum | cut -f 1 -d ' ')
    #Saves session ID to REST-Server database
    SessionStatus=$(curl --request POST -H "Content-Type: text/xml" -d "<Sesjon><sesjonsID>$COOKIE</sesjonsID><brukerID>$BRUKER</brukerID></Sesjon>" http://localhost:3000/nysesjon)
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo "Set-Cookie: sesjonsID="$COOKIE
    echo
    echo '<!DOCTYPE html><html><head><meta charset="utf-8"><title>User Added</title></head><body><script> window.location.href = "dikt.html";</script></body></html>'
fi
