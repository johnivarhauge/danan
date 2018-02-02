#!/bin/sh
POEMCOMMAND=$(echo $QUERY_STRING | cut -f1 -d " ")
TITLE=$(echo $QUERY_STRING | cut -f2 -d " ")

if [ "$POEMCOMMAND" = "<updateList>" ]; then
    ANTALLDIKT=$(curl --request GET localhost:3000/antalldikt/ | grep -oP '(?<=Antall>)[^<]+')
    RESPONSE=$(curl --request GET localhost:3000/lesealledikt/ | grep -oP '(?<=diktID>)[^<]+')
    #DIKTID=($(echo $RESPONSE | grep -oP '(?<=diktID>)[^<]+'))
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo "Hei"
    for ((i=1;i<="${ANTALLDIKT}"; i++));
    do
        CURRENTPOEM=$(echo "${RESPONSE}" | cut -f$i -d$'\n')
        echo '<option value="'$CURRENTPOEM'">'$CURRENTPOEM'</option>'
    done
fi

if [ "$POEMCOMMAND" = "<getPoem>" ]; then
    RESPONSE=$(curl --request GET localhost:3000/lesedikt/$TITLE | grep -oP '(?<=dikt>)[^<]+')
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo $RESPONSE
fi
