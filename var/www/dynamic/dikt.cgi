#!/bin/bash
POEMCOMMAND=$(echo $QUERY_STRING | cut -f1 -d ",")
TITLE=$(echo $QUERY_STRING | cut -f2 -d ",")
POEM=$(echo $QUERY_STRING | cut -f3 -d ",")

if [ "$POEMCOMMAND" = "<updateList>" ]; then
    ANTALLDIKT=$(curl -s --request GET localhost:3000/antalldikt/ | grep -oP '(?<=Antall>)[^<]+')
    RESPONSE=$(curl -s --request GET localhost:3000/lesealledikt/ | grep -oP '(?<=diktID>)[^<]+')
    BODY=""
    
    for ((i=1;i<="${ANTALLDIKT}"; i++));
    do
        CURRENTPOEM=$(echo "${RESPONSE}" | cut -f$i -d$'\n')
        BODY+=$(echo '<option value="'$CURRENTPOEM'">'$CURRENTPOEM'</option>')
    done
    CONTENTLENGTH=$(echo ${#BODY})

    echo "HTTP/1.1 200 OK"
    echo "Content-type: text/html; charset=utf-8"
    echo "Content-Length: $CONTENTLENGTH"
    echo
    #echo "${RESPONSE}"
    echo "$BODY"
fi

if [ "$POEMCOMMAND" = "<getPoem>" ]; then
    URLTITLE=$(echo $TITLE | sed 's/ /%20/g')
    RESPONSE=$(curl --request GET localhost:3000/lesedikt/$URLTITLE | grep -oP '(?<=dikt>)[^<]+')
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo "$RESPONSE"
fi

if [ "$POEMCOMMAND" = "<editPoem>" ]; then
    URLTITLE=$(echo $TITLE | sed 's/ /%20/g')
    RESPONSE=$(curl -X PUT -H "Content-Type: text/xml" -d "<dikt>$POEM</dikt>" localhost:3000/endredikt/$URLTITLE)
    echo "HTTP/1.1 200 OK"
    echo "Content-type:text/html;charset=utf-8"
    echo
    echo $RESPONSE
fi