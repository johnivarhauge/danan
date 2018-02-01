#!/bin/sh
POEMCOMMAND=$(echo $QUERY_STRING | cut -f1 -d " ")
TITLE=$(echo $QUERY_STRING | cut -f2 -d " ")

if [ "$POEMCOMMAND" = "<updateList>" ]; then
    RESPONSE=$(curl --request GET localhost:3000/lesealledikt/ | grep -oP '(?<=diktID>)[^<]+')
    #DIKTID=($(echo $RESPONSE | grep -oP '(?<=diktID>)[^<]+'))
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    #echo $RESPONSE
    for i in $RESPONSE
    do
       echo '<option value="'$i'">'$i'</option>'
    done
fi

if [ "$POEMCOMMAND" = "<getPoem>" ]; then
    RESPONSE=$(curl --request GET localhost:3000/lesedikt/$TITLE | grep -oP '(?<=dikt>)[^<]+')
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo $RESPONSE
fi
